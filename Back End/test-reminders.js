/**
 * test-reminders.js
 * Run: node test-reminders.js
 * Connects to MongoDB and fires the vaccine reminder engine immediately.
 * Use this to verify emails are sent without waiting for the daily cron.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Vaccine = require('./models/Vaccine');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/SmartSystem';

async function runTest() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected to MongoDB');

  const pendingVaccines = await Vaccine.find({ got: false });
  console.log(`📋 Found ${pendingVaccines.length} pending (un-administered) vaccines`);

  if (!pendingVaccines.length) {
    console.log('📭 Nothing to process. All vaccines are marked as administered.');
    await mongoose.disconnect();
    return;
  }

  // Show summary of what will be processed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('\n📊 Vaccine eligibility scan:');
  let eligibleCount = 0;
  for (const v of pendingVaccines) {
    const scheduled = new Date(v.scheduleDate);
    scheduled.setHours(0, 0, 0, 0);
    const diff = Math.round((scheduled - today) / (1000 * 60 * 60 * 24));
    const eligibleFor =
      diff < 0 && !v.missedReminderSent ? 'MISSED' :
      diff <= 1 && diff >= 0 && !v.urgentReminderSent ? 'URGENT' :
      diff <= 7 && diff > 1 && !v.softReminderSent ? 'SOFT' : null;

    if (eligibleFor) {
      console.log(`  ➡ [${eligibleFor}] ${v.babyName} | ${v.vaccineName} | ${scheduled.toDateString()} (${diff}d) → ${v.email}`);
      eligibleCount++;
    }
  }

  if (!eligibleCount) {
    console.log('  ℹ️  No vaccines are in a reminder window right now (all already sent or not yet within 7 days).');
    await mongoose.disconnect();
    return;
  }

  // Confirm before sending
  console.log(`\n📧 Ready to send ${eligibleCount} reminder email(s)`);
  console.log('🚀 Firing reminder engine...\n');

  // Setup transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP verified — email credentials are working\n');
  } catch (smtpErr) {
    console.error('❌ SMTP verification failed:', smtpErr.message);
    console.error('   → Check EMAIL_USER and EMAIL_PASS in .env');
    await mongoose.disconnect();
    return;
  }

  let sent = 0, skipped = 0, errors = 0;

  for (const vaccine of pendingVaccines) {
    const parentEmail = vaccine.email;
    if (!parentEmail || parentEmail === 'No Email') { skipped++; continue; }

    const scheduledDate = new Date(vaccine.scheduleDate);
    scheduledDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((scheduledDate - today) / (1000 * 60 * 60 * 24));

    let tier = null, updateField = '';

    if (diffDays < 0 && !vaccine.missedReminderSent) {
      tier = { type: 'MISSED', color: '#ef4444', subject: `🚨 Missed Vaccine for ${vaccine.babyName}` };
      updateField = 'missedReminderSent';
    } else if (diffDays <= 1 && diffDays >= 0 && !vaccine.urgentReminderSent) {
      tier = { type: 'URGENT', color: '#f59e0b', subject: `⚡ Vaccine Due ${diffDays === 0 ? 'Today' : 'Tomorrow'} for ${vaccine.babyName}` };
      updateField = 'urgentReminderSent';
    } else if (diffDays <= 7 && diffDays > 1 && !vaccine.softReminderSent) {
      tier = { type: 'SOFT', color: '#5C59E8', subject: `🔔 Upcoming Vaccine for ${vaccine.babyName} in ${diffDays} days` };
      updateField = 'softReminderSent';
    }

    if (!tier) { skipped++; continue; }

    try {
      await transporter.sendMail({
        from: `"Smart Vaccine System" <${process.env.EMAIL_USER}>`,
        to: parentEmail,
        subject: tier.subject,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;padding:30px;background:#f9fafb;">
            <div style="background:#fff;padding:28px;border-radius:14px;border:1px solid #e5e7eb;max-width:560px;margin:0 auto;">
              <div style="background:${tier.color};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
                <h2 style="color:#fff;margin:0;">💉 ${tier.type} Vaccine Reminder</h2>
              </div>
              <p style="color:#374151;">Dear Parent,</p>
              <p style="color:#374151;">This is a <strong>${tier.type.toLowerCase()}</strong> reminder for <strong>${vaccine.babyName}</strong>'s vaccination.</p>
              <div style="margin:18px 0;padding:16px;background:#f8fafc;border-left:4px solid ${tier.color};border-radius:8px;">
                <b>💉 Vaccine:</b> ${vaccine.vaccineName}<br/>
                <b>📅 Date:</b> ${scheduledDate.toDateString()}<br/>
                <b>⚠️ Status:</b> <span style="color:${tier.color};">${tier.type === 'MISSED' ? 'OVERDUE' : tier.type === 'URGENT' ? 'Due very soon' : 'In ' + diffDays + ' days'}</span>
              </div>
              <p style="color:#374151;">Please visit your dashboard to view the full schedule.</p>
              <p style="font-size:0.8rem;color:#9ca3af;margin-top:20px;">— Smart Child Vaccine &amp; Clinic System</p>
            </div>
          </div>`
      });

      await Vaccine.findByIdAndUpdate(vaccine._id, { [updateField]: true });
      console.log(`✅ [${tier.type}] Sent → ${parentEmail} (${vaccine.vaccineName})`);
      sent++;
    } catch (err) {
      console.error(`❌ Failed → ${parentEmail} (${vaccine.vaccineName}): ${err.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Done — Sent: ${sent} | Skipped: ${skipped} | Errors: ${errors}`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

runTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
