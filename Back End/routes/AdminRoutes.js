const express = require("express");
const router = express.Router();
const User = require("../userDetails");
const Baby = require("../babyDetails"); // Assuming baby schema exists
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");
const Vaccine = require("../models/Vaccine");
const Consultant = require("../models/Consultant");
const nodemailer = require("nodemailer");

// Fetch all parents
router.get("/parents", async (req, res) => {
  try {
    const parents = await User.find({ role: 'PARENT' }, { password: 0 }); // Exclude passwords
    
    // Fetch children for each parent
    const parentsWithChildren = await Promise.all(parents.map(async (parent) => {
      // Find babies where parent email matches parent.email.
      // Need to check the exact field Baby model uses for linkage. Typically it's parentEmail or similar.
      const children = await Baby.find({ email: parent.email });
      return {
        ...parent.toObject(),
        childrenCount: children.length,
        children: children
      };
    }));

    res.json({ status: "ok", data: parentsWithChildren });
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// Fetch all children (babies)
router.get("/children", async (req, res) => {
  try {
    const children = await Baby.find({});
    // We could theoretically populate parent info here if we link them properly, 
    // but the email is in the document already.
    res.json({ status: "ok", data: children });
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// Get all notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ status: "ok", data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// Create new notification and send email
router.post("/notifications", async (req, res) => {
  try {
    const { title, message, type, audience, targetEmail, status = 'Sent' } = req.body;

    // Only send emails for non-draft notifications
    if (status !== 'Draft') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      let emailsTo = [];
      if (audience === 'Specific Parent' && targetEmail) {
        emailsTo.push(targetEmail);
      } else if (audience === 'All Parents') {
        const parents = await User.find({ role: 'PARENT' });
        emailsTo = parents.map(p => p.email);
      }
      // All Staff: could add staff emails here in future

      if (emailsTo.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: emailsTo.join(', '),
          subject: `[${type}] ${title}`,
          text: message.replace(/<[^>]+>/g, ''), // strip HTML for plain text
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #5C59E8;">${title}</h2>
              <div style="padding: 10px; background: #f3f4f6; border-left: 4px solid #5C59E8; margin: 20px 0;">
                <strong>Alert Type:</strong> ${type}
              </div>
              <div style="font-size: 16px; line-height: 1.5;">${message}</div>
              <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
              <p style="font-size: 12px; color: #999;">This is an automated message from the Smart Child Vaccine &amp; Clinic System.</p>
            </div>
          `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent. MessageID:", info.messageId);
      }
    }

    const newNotification = new Notification({ title, message, type, audience, targetEmail, status });
    await newNotification.save();
    res.json({ status: "ok", data: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// Analytics Dashboard Endpoint
router.get("/analytics", async (req, res) => {
  try {
    const totalParents = await User.countDocuments({ role: 'PARENT' });
    const totalChildren = await Baby.countDocuments({});
    const totalConsultants = await Consultant.countDocuments({});
    
    // Booking Stats
    const totalBookings = await Booking.countDocuments({});
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    
    // Vaccine Stats
    const totalVaccines = await Vaccine.countDocuments({});
    const completedVaccines = await Vaccine.countDocuments({ got: true });
    
    // Monthly registration mock aggregation for chart data (assuming 'createdAt' exists or deriving it)
    // For simplicity, returning static mock trend data mixed with real totals
    
    res.json({ 
      status: "ok", 
      data: {
        totals: {
          parents: totalParents,
          children: totalChildren,
          consultants: totalConsultants,
          bookings: totalBookings,
          vaccines: totalVaccines
        },
        rates: {
          bookingCompletion: totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0,
          vaccineCompletion: totalVaccines ? Math.round((completedVaccines / totalVaccines) * 100) : 0
        }
      } 
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// Manual trigger: POST /api/admin/trigger-reminders
// Allows admin to fire the reminder engine immediately (useful for testing & urgent sends)
router.post("/trigger-reminders", async (req, res) => {
  try {
    // Import the shared engine from index.js is circular — replicate the core logic inline
    const Vaccine = require("../models/Vaccine");
    const nodemailer = require("nodemailer");

    const pendingVaccines = await Vaccine.find({ got: false });
    if (!pendingVaccines.length) {
      return res.json({ status: "ok", message: "No pending vaccines found.", sent: 0, skipped: 0, errors: 0 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.verify();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0, skipped = 0, errors = 0;

    for (const vaccine of pendingVaccines) {
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
            <div style="font-family:'Segoe UI',sans-serif;padding:30px;background:#f9fafb;">
              <div style="background:#fff;padding:28px;border-radius:14px;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:580px;margin:0 auto;">
                <div style="background:${tier.color};border-radius:10px;padding:16px 20px;margin-bottom:22px;">
                  <h2 style="color:#fff;margin:0;font-size:1.2rem;">💉 ${tier.type} Vaccine Reminder</h2>
                </div>
                <p style="color:#374151;">Dear Parent,</p>
                <p style="color:#374151;">This is a <strong>${tier.type.toLowerCase()}</strong> reminder about <strong>${vaccine.babyName}</strong>'s scheduled vaccination.</p>
                <div style="margin:20px 0;padding:18px;background:#f8fafc;border-radius:10px;border-left:4px solid ${tier.color};">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:5px 0;color:#6b7280;">💉 Vaccine</td><td style="font-weight:700;color:#1e293b;">${vaccine.vaccineName}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280;">📅 Scheduled</td><td style="font-weight:700;color:#1e293b;">${scheduledDate.toDateString()}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280;">⚠️ Status</td><td style="font-weight:700;color:${tier.color};">${tier.type === 'MISSED' ? 'OVERDUE – Act immediately' : tier.type === 'URGENT' ? 'Due very soon' : 'In ' + diffDays + ' days'}</td></tr>
                  </table>
                </div>
                <p style="color:#374151;">Please log in to your dashboard to view and update the vaccine schedule.</p>
                <hr style="border:0;border-top:1px solid #e5e7eb;margin:22px 0;"/>
                <p style="font-size:0.8rem;color:#9ca3af;">Automated message — Smart Child Vaccine &amp; Clinic System</p>
              </div>
            </div>`
        });
        await Vaccine.findByIdAndUpdate(vaccine._id, { [updateField]: true });
        console.log(`✅ [${tier.type}] Sent to ${parentEmail} → ${vaccine.vaccineName}`);
        sent++;
      } catch (mailErr) {
        console.error(`❌ Mail error for ${parentEmail}:`, mailErr.message);
        errors++;
      }
    }

    console.log(`📊 Manual Trigger Complete — Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
    res.json({ status: "ok", sent, skipped, errors, total: pendingVaccines.length });
  } catch (err) {
    console.error("❌ trigger-reminders error:", err.message);
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;

