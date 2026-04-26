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
    const { title, message, type, audience, targetEmail } = req.body;
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let emailsTo = [];
    if (audience === 'Specific Parent' && targetEmail) {
      emailsTo.push(targetEmail);
    } else if (audience === 'All Parents') {
      const parents = await User.find({ role: 'PARENT' });
      emailsTo = parents.map(p => p.email);
    }

    if (emailsTo.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailsTo.join(', '),
        subject: `[${type}] ${title}`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">${title}</h2>
            <div style="padding: 10px; background: #f3f4f6; border-left: 4px solid #4f46e5; margin: 20px 0;">
              <strong>Alert Type:</strong> ${type}
            </div>
            <p style="font-size: 16px; line-height: 1.5;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 12px; color: #999;">This is an automated message from the Smart Child Vaccine & Clinic System.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email successfully handed off to Gmail SMTP. MessageID:", info.messageId);
    }

    const newNotification = new Notification({
      title, message, type, audience, targetEmail
    });
    await newNotification.save();
    
    res.json({ status: "ok", data: newNotification });
  } catch (error) {
    console.error("Error creating notification or sending email:", error);
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

module.exports = router;
