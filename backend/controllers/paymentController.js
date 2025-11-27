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
    const { eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }


    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
        customer_email: req.user.email,   // <-- REQUIRED


      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: event.description,
            },
            unit_amount: event.price * 100,
          },
          quantity: 1,
        },
      ],

      metadata: {
        eventId: event._id.toString(),
        userId: req.user.id.toString(),
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

    try {
      const ev = await Event.findById(eventId);
      if (!ev) return console.error("❌ Event not found in webhook");

      // Add the user to attendees
      if (!ev.attendees.includes(userId)) {
        ev.attendees.push(userId);
        await ev.save();
      }

      // Generate QR Code (contains ticket ID)
      const ticketId = `${ev.title.replace(/\s+/g, "_")}-${userId}`;

      const qrData = await QRCode.toDataURL(ticketId);

      // Save ticket in DB
      const ticket = await Ticket.create({
        user: userId,
        event: eventId,
        paymentId: session.id,
        qrCode: qrData,
      });

      // Send Email
     // Send Email
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
            content: qrData.split(",")[1], // remove base64 prefix
            encoding: "base64",
            cid: "ticketqr" // must match above in HTML
            }
        ]
        );



      console.log("🎟️ Ticket generated and email sent!");

    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  res.json({ received: true });
};

