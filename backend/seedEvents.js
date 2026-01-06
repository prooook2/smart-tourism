import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config({ path: "./backend/.env" });

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 DB connected, dropping seeds like confetti…");

    const images = [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", // crowd
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980", // stage lights
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef", // city night
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429", // festival
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad", // music
      "https://images.unsplash.com/photo-1500534312376-3d817d2a89f2", // travel
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", // crowd 2
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", // crowd 3
      "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f", // outdoors
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3"  // sunset city
    ];

    const sample = [];
    for (let i = 1; i <= 10; i++) {
      sample.push({
        title: `User${i}-Cultural Fest`,
        description: `Auto-generated event #${i}`,
        date: new Date(Date.now() + i * 86400000),
        location: { city: "Tunis", coords: { lat: 36.8, lng: 10.18 }},
        organizer: "6910b18c79ec2e4d73d06177",
        capacity: 100 + i * 10,
        isPublished: true,
        price: 15 + i,
        image: images[(i - 1) % images.length]
      });
    }

    await Event.insertMany(sample); // 👈 now inserted AFTER connection
    console.log("🎊 10 Events inserted!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDB();
