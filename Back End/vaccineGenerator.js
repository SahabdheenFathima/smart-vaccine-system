const vaccineSchedule = require('./vaccineSchedule');

const generateVaccines = (birthDate, babyName, email) => {
  return vaccineSchedule.map((v) => {
    const vaccineDate = new Date(birthDate);
    vaccineDate.setDate(vaccineDate.getDate() + v.daysAfterBirth);
    return {
      babyName: babyName || "Unknown Baby",
      email: email || "No Email",
      vaccineName: v.name,
      scheduleDate: vaccineDate,
    };
  });
};

module.exports = generateVaccines;
