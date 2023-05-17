const express = require("express");
const router = express.Router();
const Cohort = require("../models/cohort");
const Booking = require("../models/booking");

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

router.post("/", async (req, res) => {
  const currDate = dayjs().startOf("date");
  const deleteCohorts = await Cohort.find();
  for (const item of deleteCohorts) {
    if (currDate.isAfter(item.endDate, "date")) await item.delete();
  }

  const deleteBookings = await Booking.find();
  for (const item of deleteBookings) {
    if (currDate.isAfter(item.bookingEnd, "date")) await item.delete();
  }

  const datesString = req.body;
  const dates = datesString.map((item) => dayjs(item));

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
      const startDate = dayjs(item.startDate);
      const endDate = dayjs(item.endDate);

      if (dates[i].isBetween(startDate, endDate, "date", "[]")) {
        // since only fulltime has days on campus. check fulltime first
        if (daysOnCampus.includes(dates[i].day())) {
          classes[item.classRoom - 1][i + 1] = item.courseCode;
          // if the date to query is a sat and schedule is parttime
        } else if (dates[i].day() === 6 && item.courseSchedule === "PartTime") {
          if (
            dates[i].isSame(startDate, "date") ||
            dates[i].isSame(endDate, "date")
          ) {
            classes[item.classRoom - 1][i + 1] = item.courseCode;
          } else {
            let calculatedDate = dates[i].clone();
            let weekCount = 1;

            console.log(calculatedDate);

            while (calculatedDate.isAfter(startDate)) {
              weekCount++;
              calculatedDate = calculatedDate.subtract(7, "day");
            }

            if (weekCount % 2 && item.altSaturdays === "odd") {
              classes[item.classRoom - 1][i + 1] = item.courseCode;
            } else if (!(weekCount % 2) && item.altSaturdays === "even") {
              classes[item.classRoom - 1][i + 1] = item.courseCode;
            }
          }
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
          dayjs(item.bookingStart),
          dayjs(item.bookingEnd),
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
