/**
 * ⚠️  DEPRECATED — DO NOT USE
 *
 * This file has been replaced by the dynamic database-driven
 * Vaccine Schedule Management System.
 *
 * All schedule rules are now stored in the MongoDB collection:
 *   → Collection: VaccineScheduleRule
 *   → Managed via: Admin Dashboard → Vaccine Schedules (🗓️)
 *   → API: GET /api/vaccine-schedules
 *   → Model: Back End/models/VaccineScheduleRule.js
 *
 * DO NOT re-introduce hardcoded schedule values here.
 * Any changes to vaccine schedules must be made through the Admin Dashboard.
 */
throw new Error(
  "[DEPRECATED] vaccineSchedule.js has been replaced by the database-driven VaccineScheduleRule collection. " +
  "Use '/api/vaccine-schedules' or require('./models/VaccineScheduleRule') instead."
);
