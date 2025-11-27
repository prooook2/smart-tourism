import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
    type: String,
    required: function () {
        // Password is required only for normal (non-Google) users
        return !this.googleId;
        },
    },
    googleId: { type: String },
    
    interests: {
      type: [String],
      default: []
    },


    role: {
      type: String,
      enum: ["admin", "organisateur", "visiteur"],
      default: "visiteur",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
},


  },

  
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);


const User = mongoose.model("User", userSchema);
export default User;
