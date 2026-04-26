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
const vaccineRoutes         = require("./routes/VaccineRoutes");
const consultantRoutes      = require("./routes/ConsultantRoutes");
const bookingRoutes         = require("./routes/BookingRoutes");
const adminRoutes           = require("./routes/AdminRoutes");
const vaccineScheduleRoutes = require("./routes/VaccineScheduleRoutes");
const clinicalNoteRoutes    = require("./routes/clinicalNoteRoutes");
app.use("/api/vaccines",          vaccineRoutes);
app.use("/api/consultants",       consultantRoutes);
app.use("/api/bookings",          bookingRoutes);
app.use("/api/admin",             adminRoutes);
app.use("/api/vaccine-schedules", vaccineScheduleRoutes);
app.use("/api/clinical-notes",    clinicalNoteRoutes);

// MongoDB Connection
mongoose.set("strictQuery", true);
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SmartSystem";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");
    // Seed the dynamic vaccine schedule collection if it is empty (first boot)
    await vaccineScheduleRoutes.seed();

    // ✅ Seed Default Admin for Demo
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        fname: "System Administrator",
        email: "admin@smart.com",
        password: hashedPassword,
        role: "ADMIN"
      });
      console.log("👑 Demo Admin Created: admin@smart.com / admin123");
    }

    // ✅ Start cron job after successful DB connection
    // Runs daily at 8:00 AM to send vaccine reminder emails
    cron.schedule('0 8 * * *', async () => {
      console.log("⏰ Smart Reminder Engine: Daily Processing Started...");
      await runReminderEngine();
    });

    console.log("✅ Vaccine Reminder Cron Job scheduled (daily at 8:00 AM)");
  })
  .catch((e) => console.log("MongoDB connection error:", e));

// ─── Core Reminder Engine (extracted so cron + manual trigger share the same logic) ───
async function runReminderEngine() {
  try {
    // FIX: Query vaccines directly by email (babyId was never reliably stored)
    // Group unique parent emails from all pending vaccines
    const pendingVaccines = await Vaccine.find({ got: false });

    if (!pendingVaccines.length) {
      console.log("📭 No pending vaccines found.");
      return { sent: 0, skipped: 0, errors: 0 };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter config before mass send
    await transporter.verify();
    console.log(`📧 SMTP connection verified. Processing ${pendingVaccines.length} pending vaccines...`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0, skipped = 0, errors = 0;

    for (const vaccine of pendingVaccines) {
      // FIX: Use vaccine.email directly — this is always the parent email
      const parentEmail = vaccine.email;
      if (!parentEmail || parentEmail === 'No Email') { skipped++; continue; }

      const scheduledDate = new Date(vaccine.scheduleDate);
      scheduledDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((scheduledDate - today) / (1000 * 60 * 60 * 24));

      let tier = null;
      let updateField = "";

      if (diffDays < 0 && !vaccine.missedReminderSent) {
        tier = { type: "MISSED", color: '#ef4444', subject: `🚨 ACTION REQUIRED: Missed Vaccine for ${vaccine.babyName}` };
        updateField = "missedReminderSent";
      } else if (diffDays <= 1 && diffDays >= 0 && !vaccine.urgentReminderSent) {
        tier = { type: "URGENT", color: '#f59e0b', subject: `⚡ URGENT: Vaccine Due ${diffDays === 0 ? 'Today' : 'Tomorrow'} for ${vaccine.babyName}` };
        updateField = "urgentReminderSent";
      } else if (diffDays <= 7 && diffDays > 1 && !vaccine.softReminderSent) {
        tier = { type: "SOFT", color: '#5C59E8', subject: `🔔 Upcoming Vaccine Reminder for ${vaccine.babyName}` };
        updateField = "softReminderSent";
      }

      if (!tier) { skipped++; continue; }

      try {
        await transporter.sendMail({
          from: `"Smart Vaccine System" <${process.env.EMAIL_USER}>`,
          to: parentEmail,
          subject: tier.subject,
          html: `
            <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:30px;background:#f9fafb;">
              <div style="background:#fff;padding:28px;border-radius:14px;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:580px;margin:0 auto;">
                <div style="background:${tier.color};border-radius:10px;padding:16px 20px;margin-bottom:22px;">
                  <h2 style="color:#fff;margin:0;font-size:1.2rem;">💉 ${tier.type} Vaccine Reminder</h2>
                </div>
                <p style="color:#374151;margin-bottom:8px;">Dear Parent,</p>
                <p style="color:#374151;">This is a <strong>${tier.type.toLowerCase()}</strong> reminder about <strong>${vaccine.babyName}</strong>'s scheduled vaccination.</p>
                <div style="margin:20px 0;padding:18px;background:#f8fafc;border-radius:10px;border-left:4px solid ${tier.color};">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:4px 0;color:#6b7280;font-size:0.875rem;">💉 Vaccine</td><td style="padding:4px 0;font-weight:700;color:#1e293b;">${vaccine.vaccineName}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280;font-size:0.875rem;">📅 Scheduled</td><td style="padding:4px 0;font-weight:700;color:#1e293b;">${scheduledDate.toDateString()}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280;font-size:0.875rem;">⚠️ Status</td><td style="padding:4px 0;font-weight:700;color:${tier.color};">${tier.type === 'MISSED' ? 'OVERDUE – Please act immediately' : tier.type === 'URGENT' ? 'Due very soon' : 'Coming up in ' + diffDays + ' days'}</td></tr>
                  </table>
                </div>
                <p style="color:#374151;">Please visit your dashboard to view the full schedule and mark vaccines as administered.</p>
                <hr style="border:0;border-top:1px solid #e5e7eb;margin:22px 0;"/>
                <p style="font-size:0.8rem;color:#9ca3af;">This is an automated message from <strong>Smart Child Vaccine &amp; Clinic System</strong>. Do not reply to this email.</p>
              </div>
            </div>`
        });

        await Vaccine.findByIdAndUpdate(vaccine._id, { [updateField]: true });
        console.log(`✅ [${tier.type}] Sent to ${parentEmail} → ${vaccine.vaccineName}`);
        sent++;
      } catch (mailErr) {
        console.error(`❌ Mail error for ${parentEmail} (${vaccine.vaccineName}):`, mailErr.message);
        errors++;
      }
    }

    console.log(`📊 Reminder Engine Complete — Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
    return { sent, skipped, errors };
  } catch (err) {
    console.error("❌ Reminder Engine Fatal Error:", err);
    throw err;
  }
}

// Auth routes
app.post("/register", async (req, res) => {
  const { fname, email, password, role } = req.body;
  const lowerEmail = email.toLowerCase();
  try {
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(400).json({ status: "error", error: "User already exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    // Role defaults to PARENT if not explicitly provided
    const userRole = role && ['PARENT', 'ADMIN', 'CONSULTANT'].includes(role) ? role : 'PARENT';
    await User.create({ fname, email: lowerEmail, password: encryptedPassword, role: userRole });
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

    // Include role in JWT payload to avoid extra DB lookups in frontend
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
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
        // generateVaccines is now async — reads from DB instead of static file
        const generatedVaccines = await generateVaccines(savedBaby.birthDate, savedBaby.babyName, savedBaby.email);
        const vaccinesWithBabyId = generatedVaccines.map(v => ({ ...v, babyId: savedBaby._id }));
        await Vaccine.insertMany(vaccinesWithBabyId);
        console.log("💉 Vaccines generated for:", savedBaby.babyName, "(", generatedVaccines.length, "doses)");
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

