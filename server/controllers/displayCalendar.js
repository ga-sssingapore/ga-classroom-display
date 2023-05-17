const express = require("express");
const router = express.Router();

const moment = require("moment");
const Cohort = require("../models/cohort");
const Booking = require("../models/booking");

router.post("/", async (req, res) => {
  const datesString = req.body;
  const dates = datesString.map((item) => moment(item));

  const classes = [
    ["1", "", "", "", "", "", "", ""],
    ["2", "", "", "", "", "", "", ""],
    ["3", "", "", "", "", "", "", ""],
    ["4", "", "", "", "", "", "", ""],
    ["5", "", "", "", "", "", "", ""],
    ["6", "", "", "", "", "", "", ""],
  ];

  // cohorts
  const cohorts = await Cohort.find();

  for (const item of cohorts) {
    const daysOnCampus = [];
    if (item.daysOnCampus.monday) daysOnCampus.push(1);
    if (item.daysOnCampus.tuesday) daysOnCampus.push(2);
    if (item.daysOnCampus.wednesday) daysOnCampus.push(3);
    if (item.daysOnCampus.thursday) daysOnCampus.push(4);
    if (item.daysOnCampus.friday) daysOnCampus.push(5);

    for (let i = 0; i < dates.length; i++) {
      const startDate = moment(item.startDate);
      const endDate = moment(item.endDate);

      if (dates[i].isBetween(startDate, endDate, "day", "[]")) {
        if (item.courseSchedule === "PartTime") {
          if (dates[i].isSame(startDate) || dates[i].isSame(endDate)) {
            classes[item.classRoom - 1][6] = item.courseCode;
          } else {
            let calculatedDate = dates[i].clone();
            let weekCount = 1;

            while (calculatedDate.isAfter(startDate)) {
              weekCount++;
              calculatedDate.subtract(7, "days");
            }

            if (dates[i].day() === 6) {
              if (weekCount % 2 && item.altSaturdays === "odd") {
                classes[item.classRoom - 1][i + 1] = item.courseCode;
              } else if (!(weekCount % 2) && item.altSaturdays === "even") {
                classes[item.classRoom - 1][i + 1] = item.courseCode;
              }
            }
          }
        } else if (daysOnCampus.includes(dates[i].day())) {
          classes[item.classRoom - 1][i + 1] = item.courseCode;
        }
      }
    }
  }

  // bookings
  const bookings = await Booking.find();

  for (const item of bookings) {
    for (let i = 0; i < dates.length; i++) {
      if (
        dates[i].isBetween(
          moment(item.bookingStart),
          moment(item.bookingEnd),
          "day",
          "[]"
        )
      ) {
        classes[item.classRoom][i + 1] = item.roomUseBy;
      }
    }
  }

  res.json(classes);
});

module.exports = router;
