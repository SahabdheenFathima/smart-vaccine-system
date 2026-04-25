// server.js
if (typeof SlowBuffer === 'undefined') {
  global.SlowBuffer = global.Buffer;
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Models
const User = require('./userDetails');
const Baby = require("./babyDetails");
const Vaccine = require("./models/Vaccine");
const Growth = require("./models/Growth");

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";
const generateVaccines = require("./vaccineGenerator");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const vaccineRoutes = require("./routes/VaccineRoutes");
app.use("/api/vaccines", vaccineRoutes);

// MongoDB Connection
mongoose.set("strictQuery", true);
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SmartSystem";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");

    // ✅ Start cron job after successful DB connection
    // Changed to daily at midnight (0 0 * * *) to avoid spam and save resources
    cron.schedule('0 0 * * *', async () => {
      try {
        console.log("⏰ Daily Vaccine Reminder Cron Job started...");
        const babies = await Baby.find();
        if (!babies.length) return;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        for (const baby of babies) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const birthDate = new Date(baby.birthDate);
          const daysSinceBirth = Math.floor((tomorrow - birthDate) / (1000 * 60 * 60 * 24));
          
          const vaccineSchedule = require('./vaccineSchedule');
          const dueVaccines = vaccineSchedule.filter(v => v.daysAfterBirth === daysSinceBirth);

          if (dueVaccines.length === 0) continue;

          for (const vaccine of dueVaccines) {
            const alreadySent = await Vaccine.findOne({
              babyId: baby._id,
              vaccineName: vaccine.name,
              sent: true
            });

            if (alreadySent) continue;

            const mailOptions = {
              from: `"Vaccine Reminder" <${process.env.EMAIL_USER}>`,
              to: baby.email,
              subject: `Vaccine Reminder for ${baby.babyName}`,
              html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                      <h2>Vaccine Reminder</h2>
                      <p>Dear Parent,</p>
                      <p>This is a reminder that <strong>${baby.babyName}</strong> is scheduled to receive the <strong>"${vaccine.name}"</strong> vaccine tomorrow.</p>
                      <hr/>
                      <p style="font-size: 0.8em; color: #777;">Regards,<br/>Child Health Development Team</p>
                    </div>`
            };

            transporter.sendMail(mailOptions, async (error, info) => {
              if (!error) {
                await Vaccine.updateOne(
                  { babyId: baby._id, vaccineName: vaccine.name },
                  { sent: true },
                  { upsert: true }
                );
                console.log(`Reminder sent to ${baby.email} for ${vaccine.name}`);
              }
            });
          }
        }
      } catch (err) {
        console.error("Cron Error:", err);
      }
    });
  })
  .catch((e) => console.log("MongoDB connection error:", e));

// Auth routes
app.post("/register", async (req, res) => {
  const { fname, email, password } = req.body;
  const lowerEmail = email.toLowerCase();
  try {
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(400).json({ status: "error", error: "User already exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.create({ fname, email: lowerEmail, password: encryptedPassword });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();
  try {
    const user = await User.findOne({ email: lowerEmail });
    if (!user) return res.status(404).json({ error: "User Not Found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: "error", error: "Invalid Password" });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ status: "ok", data: token });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    res.json({ status: "ok", data: user });
  } catch (error) {
    res.status(401).json({ status: "error", data: "Token expired or invalid" });
  }
});

// Baby routes
app.post("/submit-form", async (req, res) => {
  try {
    console.log("📥 Received Baby Registration Payload:", req.body);
    
    // Ensure birthDate is a valid Date object if provided
    if (req.body.birthDate) {
      const bDate = new Date(req.body.birthDate);
      if (isNaN(bDate.getTime())) {
          return res.status(400).json({ status: "error", error: "Invalid birth date provided" });
      }
      req.body.birthDate = bDate;
    }

    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }

    const baby = new Baby(req.body);
    const savedBaby = await baby.save();
    console.log("✅ Baby successfully stored in database:", savedBaby._id);
    
    if (savedBaby.birthDate && savedBaby.babyName && savedBaby.email) {
      try {
        const generatedVaccines = generateVaccines(savedBaby.birthDate, savedBaby.babyName, savedBaby.email);
        const vaccinesWithBabyId = generatedVaccines.map(v => ({ ...v, babyId: savedBaby._id }));
        await Vaccine.insertMany(vaccinesWithBabyId);
        console.log("💉 Vaccines generated for:", savedBaby.babyName);
      } catch (vaccineErr) {
        console.error("❌ Vaccine Generation Error:", vaccineErr.message);
        // We still return success for the baby registration even if vaccines fail
      }
    }
    
    res.status(201).json({ status: "ok", message: "Baby data saved successfully" });
  } catch (err) {
    console.error("❌ Registration Database Error:", err.message);
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get("/babies", async (req, res) => {
  try {
    const babies = await Baby.find();
    res.json(babies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/baby-details/:email", async (req, res) => {
  try {
    const baby = await Baby.findOne({ email: req.params.email }).sort({ _id: -1 });
    if (baby) res.json(baby);
    else res.status(404).json({ message: "No baby record found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all babies for a specific user
app.get("/api/user-babies/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const babies = await Baby.find({ email }).sort({ birthDate: -1 });
    res.json({ status: "ok", data: babies });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Delete a baby profile and all associated health records
app.delete("/api/baby/:id", async (req, res) => {
  try {
    const babyId = req.params.id;
    
    // 1. Delete the baby record
    await Baby.findByIdAndDelete(babyId);
    
    // 2. Cascade delete associated vaccines
    await Vaccine.deleteMany({ babyId });
    
    // 3. Cascade delete associated growth analytics
    await Growth.deleteMany({ babyId });

    console.log(`🗑️ Record deleted: ${babyId}`);
    res.json({ status: "ok", message: "Baby profile and all associated data deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Error:", err.message);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// --- Growth Analytics Routes ---
app.post("/api/growth", async (req, res) => {
  try {
    const { email, age, height } = req.body;
    // Find babyId if possible to link
    const baby = await Baby.findOne({ email }).sort({ _id: -1 });
    const growth = new Growth({
      email,
      age: parseInt(age),
      height: parseFloat(height),
      babyId: baby ? baby._id : null
    });
    await growth.save();
    res.status(201).json({ status: "ok", data: growth });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get("/api/growth/:email", async (req, res) => {
  try {
    const growthData = await Growth.find({ email: req.params.email }).sort({ age: 1 });
    res.json({ status: "ok", data: growthData });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get("/api/growth/baby/:babyId", async (req, res) => {
  try {
    const growthData = await Growth.find({ babyId: req.params.babyId }).sort({ age: 1 });
    res.json({ status: "ok", data: growthData });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.delete("/api/growth/:id", async (req, res) => {
  try {
    await Growth.findByIdAndDelete(req.params.id);
    res.json({ status: "ok", message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

