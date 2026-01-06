// backend/controllers/paymentController.js
import Stripe from "stripe";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import QRCode from "qrcode";
import sendEmail from "../Utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, ticketTypeId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    let selectedTicket = null;
    if (event.ticketTypes?.length) {
      if (!ticketTypeId) {
        return res.status(400).json({ message: "ticketTypeId requis pour cet événement" });
      }

      selectedTicket = event.ticketTypes.id(ticketTypeId);
      if (!selectedTicket) {
        return res.status(404).json({ message: "Type de billet introuvable" });
      }

      const remaining = (selectedTicket.quantity || 0) - (selectedTicket.sold || 0);
      if (remaining <= 0) {
        return res.status(400).json({ message: "Ce type de billet est épuisé." });
      }
    }

    if (!event.ticketTypes?.length && event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: "Cet événement est complet." });
    }

    const priceInCents = Math.round((selectedTicket?.price ?? event.price) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${event.title} – ${selectedTicket?.label || "Billet"}`,
              description: selectedTicket?.description || event.description,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],

      metadata: {
        eventId: event._id.toString(),
        userId: req.user.id.toString(),
        ticketTypeId: selectedTicket?._id?.toString() || "",
      },

      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ message: "Payment error" });
  }
};

// Fallback endpoint to finalize purchase if webhook does not reach local dev
export const confirmCheckoutSession = async (req, res) => {
  const { session_id: sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: "session_id requis" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["customer_details"] });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Paiement non confirmé" });
    }

    const eventId = session.metadata?.eventId;
    const userId = session.metadata?.userId;
    const ticketTypeId = session.metadata?.ticketTypeId;
    if (!eventId || !userId) return res.status(400).json({ message: "Métadonnées manquantes" });

    // Idempotency: skip if ticket already issued for this session
    const existing = await Ticket.findOne({ paymentId: session.id });
    if (existing) return res.json({ message: "Billet déjà généré" });

    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ message: "Événement introuvable" });

    let selectedTicket = null;
    if (ev.ticketTypes?.length) {
      if (!ticketTypeId) return res.status(400).json({ message: "Type de billet manquant" });
      selectedTicket = ev.ticketTypes.id(ticketTypeId);
      if (!selectedTicket) return res.status(404).json({ message: "Type de billet introuvable" });

      const remaining = (selectedTicket.quantity || 0) - (selectedTicket.sold || 0);
      if (remaining <= 0) return res.status(400).json({ message: "Stock épuisé" });
      selectedTicket.sold = (selectedTicket.sold || 0) + 1;
    }

    if (!ev.attendees.includes(userId)) {
      ev.attendees.push(userId);
    }

    await ev.save();

    const ticketId = `${ev.title.replace(/\s+/g, "_")}-${selectedTicket?._id || "general"}-${userId}`;
    const qrData = await QRCode.toDataURL(ticketId);
    const pricePaid = selectedTicket?.price ?? ev.price;

    await Ticket.create({
      user: userId,
      event: eventId,
      paymentId: session.id,
      ticketTypeId: selectedTicket?._id?.toString(),
      ticketTypeLabel: selectedTicket?.label,
      pricePaid,
      qrCode: qrData,
    });

    await sendEmail(
      session.customer_email || session.customer_details?.email,
      "🎟️ Votre Billet d'Événement",
      `
        <h2>Merci pour votre achat ! 🎉</h2>
        <p>Voici votre billet pour l'événement : <strong>${ev.title}</strong></p>

        <p>📍 Ville : ${ev.location.city}</p>
        <p>📅 Date : ${new Date(ev.date).toLocaleString()}</p>

        <p><strong>Votre QR Code :</strong></p>
        <img src="cid:ticketqr" alt="QR Code" />

        <p>Présentez ce QR code à l'entrée.</p>
      `,
      [
        {
          filename: "ticket_qr.png",
          content: qrData.split(",")[1],
          encoding: "base64",
          cid: "ticketqr",
        },
      ]
    );

    return res.json({ message: "Billet généré et email envoyé" });
  } catch (err) {
    console.error("confirmCheckoutSession error:", err.message);
    return res.status(500).json({ message: "Erreur de confirmation" });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const eventId = session.metadata.eventId;
    const userId = session.metadata.userId;
    const ticketTypeId = session.metadata.ticketTypeId;

    try {
      const ev = await Event.findById(eventId);
      if (!ev) return console.error("❌ Event not found in webhook");

      let selectedTicket = null;
      if (ev.ticketTypes?.length) {
        selectedTicket = ev.ticketTypes.id(ticketTypeId);
        if (!selectedTicket) return console.error("❌ Ticket type not found");

        const remaining = (selectedTicket.quantity || 0) - (selectedTicket.sold || 0);
        if (remaining <= 0) return console.error("❌ Ticket type sold out");
        selectedTicket.sold = (selectedTicket.sold || 0) + 1;
      }

      // Add the user to attendees
      if (!ev.attendees.includes(userId)) {
        ev.attendees.push(userId);
      }

      await ev.save();

      // Generate QR Code (contains ticket ID)
      const ticketId = `${ev.title.replace(/\s+/g, "_")}-${selectedTicket?._id || "general"}-${userId}`;

      const qrData = await QRCode.toDataURL(ticketId);
      const pricePaid = selectedTicket?.price ?? ev.price;

      // Save ticket in DB
      const ticket = await Ticket.create({
        user: userId,
        event: eventId,
        paymentId: session.id,
        ticketTypeId: selectedTicket?._id?.toString(),
        ticketTypeLabel: selectedTicket?.label,
        pricePaid,
        qrCode: qrData,
      });

      await sendEmail(
        session.customer_email || session.customer_details?.email,
        "🎟️ Votre Billet d'Événement",
        `
        <h2>Merci pour votre achat ! 🎉</h2>
        <p>Voici votre billet pour l'événement : <strong>${ev.title}</strong></p>

        <p>📍 Ville : ${ev.location.city}</p>
        <p>📅 Date : ${new Date(ev.date).toLocaleString()}</p>

        <p><strong>Votre QR Code :</strong></p>
        <img src="cid:ticketqr" alt="QR Code" />

        <p>Présentez ce QR code à l'entrée.</p>
        `,
        [
          {
            filename: "ticket_qr.png",
            content: qrData.split(",")[1],
            encoding: "base64",
            cid: "ticketqr",
          },
        ]
      );

      console.log("🎟️ Ticket generated and email sent!");

    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  res.json({ received: true });
};

