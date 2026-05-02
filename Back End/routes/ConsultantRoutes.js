const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const nodemailer = require("nodemailer");
const Consultant = require("../models/Consultant");
const User       = require("../userDetails");

// ── Helpers ────────────────────────────────────────────────────────────────

/** Generate a secure temporary password: e.g. "Hx7@kP3!" */
const generatePassword = () => {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "@#$!";
  const pick    = (s) => s[Math.floor(Math.random() * s.length)];
  const base = [pick(upper), pick(upper), pick(lower), pick(lower),
                pick(digits), pick(digits), pick(special)];
  // Shuffle
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join('') + pick(digits); // always 8 chars
};

/** Build a username from the consultant's name: "Dr. Sarah Ali" → "sarah.ali" */
const generateUsername = (name) =>
  name.toLowerCase().replace(/^dr\.?\s*/i, '').trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');

/** Send credentials email via the hospital SMTP account */
const sendCredentialsEmail = async (email, name, username, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Smart System — Hospital Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Consultant Account Has Been Created — Smart Child Healthcare System",
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fb;padding:30px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:#4f46e5;padding:28px 32px;">
            <h1 style="color:#fff;margin:0;font-size:1.5rem;">👨‍⚕️ Welcome to Smart Child Healthcare</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Government Hospital Consultant Portal</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:1rem;color:#374151;">Dear <strong>Dr. ${name}</strong>,</p>
            <p style="color:#6b7280;line-height:1.6;">Your consultant account has been created by the hospital administration. You can now log in to the Smart System portal to manage your appointments and patient records.</p>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:0.9rem;text-transform:uppercase;letter-spacing:.5px;">🔐 Your Login Credentials</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-weight:600;width:120px;">Username:</td>
                  <td style="padding:8px 0;"><code style="background:#eef2ff;color:#4f46e5;padding:4px 10px;border-radius:6px;font-size:1rem;font-weight:700;">${username}</code></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-weight:600;">Password:</td>
                  <td style="padding:8px 0;"><code style="background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:6px;font-size:1rem;font-weight:700;">${password}</code></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-weight:600;">Portal URL:</td>
                  <td style="padding:8px 0;"><a href="http://localhost:3000/sign-in" style="color:#4f46e5;font-weight:600;">http://localhost:3000/sign-in</a></td>
                </tr>
              </table>
            </div>

            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
              <strong style="color:#ef4444;">⚠️ Security Notice:</strong>
              <span style="color:#7f1d1d;"> Please log in and change your password immediately. Do not share these credentials with anyone.</span>
            </div>

            <p style="color:#9ca3af;font-size:0.85rem;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px;">
              This is an automated message from the Smart System Hospital Administration.<br/>
              If you did not expect this email, please contact your hospital IT department immediately.
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

// ── Routes ─────────────────────────────────────────────────────────────────

// GET all consultants
router.get("/", async (req, res) => {
  try {
    const consultants = await Consultant.find();
    res.json({ status: "ok", data: consultants });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// GET consultant by ID
router.get("/:id", async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);
    if (!consultant) return res.status(404).json({ status: "error", error: "Consultant not found" });
    res.json({ status: "ok", data: consultant });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// POST — Create consultant + system user account + send credential email
router.post("/", async (req, res) => {
  const { name, email, ...rest } = req.body;

  if (!email) return res.status(400).json({ status: "error", error: "Consultant email is required." });
  if (!name)  return res.status(400).json({ status: "error", error: "Consultant name is required." });

  try {
    // 1. Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ status: "error", error: "A user with this email already exists." });

    // 2. Auto-generate credentials
    const plainPassword = generatePassword();
    const username      = generateUsername(name);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Save the Consultant profile record
    const consultant = new Consultant({ name, email: email.toLowerCase(), username, ...rest });
    await consultant.save();

    // 4. Create a system User account with CONSULTANT role
    await User.create({
      fname:    name,
      email:    email.toLowerCase(),
      password: hashedPassword,
      role:     "CONSULTANT",
    });

    // 5. Send credentials email (non-blocking — don't fail the creation if mail fails)
    try {
      await sendCredentialsEmail(email, name, username, plainPassword);
      console.log(`✅ Credentials emailed to consultant: ${email}`);
    } catch (mailErr) {
      console.error(`⚠️  Consultant created but email delivery failed for ${email}:`, mailErr.message);
    }

    res.status(201).json({
      status: "ok",
      data: consultant,
      message: `Consultant account created. Login credentials have been sent to ${email}.`,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: "error", error: "A consultant with this registration number or email already exists." });
    }
    res.status(500).json({ status: "error", error: err.message });
  }
});

// PUT — Update consultant
router.put("/:id", async (req, res) => {
  try {
    const updated = await Consultant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ status: "ok", data: updated });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// DELETE — Remove consultant + their system user account
router.delete("/:id", async (req, res) => {
  try {
    const consultant = await Consultant.findByIdAndDelete(req.params.id);
    if (consultant?.email) {
      await User.findOneAndDelete({ email: consultant.email });
    }
    res.json({ status: "ok", message: "Consultant and their system account deleted." });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
