import sendEmail from "./Utils/sendEmail.js";

sendEmail(
  "az23official@gmail.com",
  "Test Email from Smart Tourism",
  "<h2>✅ It finally works!</h2>"
)
  .then(() => console.log("✅ Test Success"))
  .catch((err) => console.error("❌ Test Failed:", err.message));
