import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Event from "../models/Event.js";


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
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

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
        avatar: updatedUser.avatar,  // ADD THIS

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

    const validRoles = ["tourist", "guide", "partner", "admin"];
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

