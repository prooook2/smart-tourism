import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";


// 🟢 GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password, city, interests, budgetMin, budgetMax, coords } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (city !== undefined) user.city = city;
    if (interests !== undefined) user.interests = interests;
    if (budgetMin !== undefined) user.budgetMin = budgetMin;
    if (budgetMax !== undefined) user.budgetMax = budgetMax;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      user.coords = { lat: coords.lat, lng: coords.lng };
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        city: updatedUser.city,
        interests: updatedUser.interests,
        coords: updatedUser.coords,
        budgetMin: updatedUser.budgetMin,
        budgetMax: updatedUser.budgetMax,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 ADMIN: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 ADMIN: Update a user’s role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "organisateur", "visiteur"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 ADMIN: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfileAvatar = async (req, res) => {
  try {
    console.log("FILE RECEIVED FROM MULTER:", req.file);

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = req.file.path; // Cloudinary URL
    await user.save();

    res.json({ message: "Avatar updated!", avatar: user.avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const organized = await Event.find({ organizer: userId }).sort({ date: 1 });
    const registered = await Event.find({ attendees: userId }).sort({ date: 1 });

    res.json({ organized, registered });
  } catch (err) {
    console.error("getMyEvents error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get dashboard metrics for organizer
export const getOrganizerMetrics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // Get all events organized by this user
    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map((e) => e._id);

    // Get all tickets sold for these events
    const tickets = await Ticket.find({ event: { $in: eventIds } });

    // Calculate metrics
    const ticketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.pricePaid || 0), 0);
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
    const participationRate = totalCapacity > 0 ? ((totalAttendees / totalCapacity) * 100).toFixed(1) : 0;

    res.json({
      ticketsSold,
      totalRevenue,
      participationRate,
      totalEvents: events.length,
      totalCapacity,
      totalAttendees,
    });
  } catch (err) {
    console.error("getOrganizerMetrics error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get platform-wide metrics for admin
export const getAdminMetrics = async (req, res) => {
  try {
    const allEvents = await Event.find();
    const allTickets = await Ticket.find();
    const allUsers = await User.find();

    const ticketsSold = allTickets.length;
    const totalRevenue = allTickets.reduce((sum, t) => sum + (t.pricePaid || 0), 0);
    const totalCapacity = allEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const totalAttendees = allEvents.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
    const participationRate = totalCapacity > 0 ? ((totalAttendees / totalCapacity) * 100).toFixed(1) : 0;

    res.json({
      ticketsSold,
      totalRevenue,
      participationRate,
      totalEvents: allEvents.length,
      totalUsers: allUsers.length,
      totalAttendees,
    });
  } catch (err) {
    console.error("getAdminMetrics error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

