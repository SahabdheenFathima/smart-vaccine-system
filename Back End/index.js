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
        console.log("⏰ Smart Reminder Engine: Daily Processing Started...");
        const babies = await Baby.find();
        if (!babies.length) return;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const baby of babies) {
          const babyVaccines = await Vaccine.find({ babyId: baby._id, got: false });
          
          for (const vaccine of babyVaccines) {
            const scheduledDate = new Date(vaccine.scheduleDate);
            scheduledDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((scheduledDate - today) / (1000 * 60 * 60 * 24));

            let tier = null;
            let updateField = "";

            if (diffDays < 0 && !vaccine.missedReminderSent) {
              tier = { type: "MISSED", subject: `🚨 ACTION REQUIRED: Missed Vaccine for ${baby.babyName}` };
              updateField = "missedReminderSent";
            } else if ((diffDays === 1 || diffDays === 0) && !vaccine.urgentReminderSent) {
              tier = { type: "URGENT", subject: `⚡ URGENT: Vaccine Due Tomorrow for ${baby.babyName}` };
              updateField = "urgentReminderSent";
            } else if (diffDays <= 7 && diffDays > 1 && !vaccine.softReminderSent) {
              tier = { type: "SOFT", subject: `🔔 Upcoming Vaccine Reminder: ${baby.babyName}` };
              updateField = "softReminderSent";
            }

            if (tier) {
              const mailOptions = {
                from: `"Smart Vaccine System" <${process.env.EMAIL_USER}>`,
                to: baby.email,
                subject: tier.subject,
                html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; background: #f9fafb; border-radius: 15px;">
                        <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                          <h2 style="color: ${tier.type === 'MISSED' ? '#ef4444' : tier.type === 'URGENT' ? '#f59e0b' : '#4F46E5'}; margin-top: 0;">${tier.type} Notification</h2>
                          <p>Dear Parent,</p>
                          <p>This is a <strong>${tier.type.toLowerCase()}</strong> reminder regarding <strong>${baby.babyName}'s</strong> health schedule.</p>
                          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid ${tier.type === 'MISSED' ? '#ef4444' : tier.type === 'URGENT' ? '#f59e0b' : '#4F46E5'};">
                            <strong>Vaccine:</strong> ${vaccine.vaccineName}<br/>
                            <strong>Status:</strong> ${tier.type === 'MISSED' ? 'OVERDUE' : 'Scheduled'}<br/>
                            <strong>Date:</strong> ${scheduledDate.toDateString()}
                          </div>
                          <p>Please log in to your dashboard to view full details and mark as administered once complete.</p>
                          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                          <p style="font-size: 0.85em; color: #6b7280; line-height: 1.5;">
                            Regards,<br/>
                            <strong>Smart System Health Team</strong><br/>
                            Professional Healthcare Management
                          </p>
                        </div>
                      </div>`
              };

              // Note: In real production, you'd handle mail errors gracefully per recipient
              try {
                await transporter.sendMail(mailOptions);
                await Vaccine.findByIdAndUpdate(vaccine._id, { [updateField]: true });
                console.log(`✅ [${tier.type}] Email sent to ${baby.email} for ${vaccine.vaccineName}`);
              } catch (mailErr) {
                console.error(`❌ Mail send error for ${baby.email}:`, mailErr.message);
              }
            }
          }
        }
      } catch (err) {
        console.error("❌ Cron Engine Error:", err);
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

