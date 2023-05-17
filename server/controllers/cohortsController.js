const express = require("express");
const router = express.Router();
const Cohort = require("../models/cohort");
const moment = require("moment");
const Booking = require("../models/booking");

router.get("/", async (req, res) => {
  try {
    console.log(req);
    const cohorts = await Cohort.find().exec();
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/bookings/:classroom", async (req, res) => {
  const currDate = moment().startOf("day");
  // const currDate = moment("2023-5-20").startOf("day");

  // check for expired bookings and delete
  // since dates are stored as strings, conversion is needed to compare
  // const deleteBookings = await Booking.find();
  // for (const item of deleteBookings) {
  //   if (currDate.isAfter(item.bookingEnd)) {
  //     await item.delete();
  //   }
  // }

  // const deleteCohorts = await Cohort.find();
  // for (const item of deleteCohorts) {
  //   if (currDate.isAfter(item.endDate)) {
  //     await item.delete();
  //   }
  // }

  // ignore on Sunday
  if (currDate.day() === 0) {
    return res.json({
      classroom: "",
      courseCode: "",
      roomUseBy: "",
      bookingPurpose: "",
      startTime: "",
      endTime: "",
    });
  }

  // get bookings first, if found then return the booking
  // since booking overrides courses
  const bookingsClassroom = await Booking.find({
    classRoom: req.params.classroom,
  });

  let returnValue = undefined;
  for (const item of bookingsClassroom) {
    if (
      currDate.isBetween(
        moment(item.bookingStart),
        moment(item.bookingEnd),
        "day",
        "[]"
      )
    ) {
      returnValue = {
        classroom: item.classRoom,
        courseCode: "",
        roomUseBy: item.roomUseBy,
        bookingPurpose: item.bookingPurpose,
        startTime: "",
        endTime: "",
      };

      break;
    }
  }

  // return booking
  if (returnValue) {
    return res.json(returnValue);
  }

  // do cohorts (courses) if not bookings found
  const dayOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  if (currDate.day() === 6) {
    const temp = await Cohort.find({
      courseSchedule: "PartTime",
      classRoom: req.params.classroom,
    });

    for (const item of temp) {
      const startDate = moment(item.startDate).startOf("day");
      const endDate = moment(item.endDate).startOf("day");

      if (currDate.isSame(startDate) || currDate.isSame(endDate)) {
        returnValue = {
          classroom: item.classRoom,
          courseCode: item.courseCode,
          roomUseBy: "",
          bookingPurpose: "",
          startTime: item.startTime,
          endTime: item.endTime,
        };
      } else if (currDate.isBetween(startDate, endDate, "day")) {
        let calculatedDate = currDate.clone();
        let weekCount = 1;

        while (calculatedDate.isAfter(startDate)) {
          weekCount++;
          calculatedDate.subtract(7, "days");
        }

        if (weekCount % 2 && item.altSaturdays === "odd") {
          returnValue = {
            classroom: item.classRoom,
            courseCode: item.courseCode,
            roomUseBy: "",
            bookingPurpose: "",
            startTime: item.startTime,
            endTime: item.endTime,
          };
        } else if (!(weekCount % 2) && item.altSaturdays === "even") {
          returnValue = {
            classroom: item.classRoom,
            courseCode: item.courseCode,
            roomUseBy: "",
            bookingPurpose: "",
            startTime: item.startTime,
            endTime: item.endTime,
          };
        }
      }
    }
  } else {
    const searchKey = `daysOnCampus.${dayOfWeek[currDate.day()]}`;

    const cohortsClassroom = await Cohort.find({
      classRoom: req.params.classroom,
      [searchKey]: true,
    });

    for (const item of cohortsClassroom) {
      if (
        currDate.isBetween(
          moment(item.startDate),
          moment(item.endDate),
          "day",
          "[]"
        )
      ) {
        returnValue = {
          classroom: item.classRoom,
          courseCode: item.courseCode,
          roomUseBy: "",
          bookingPurpose: "",
          startTime: item.startTime,
          endTime: item.endTime,
        };
        break;
      }
    }
  }

  if (!returnValue) {
    returnValue = {
      classroom: "",
      courseCode: "",
      roomUseBy: "",
      bookingPurpose: "",
      startTime: "",
      endTime: "",
    };
  }

  console.log(returnValue);
  res.json(returnValue);
});

router.post("/", async (req, res) => {
  try {
    const cohort = await Cohort.create(req.body);
    res.status(201).json(cohort);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCohort = await Cohort.findByIdAndRemove(id);
    res.status(200).send(deletedCohort);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cohort = await Cohort.findById(id);
    res.json(cohort);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCohort = await Cohort.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send(updatedCohort);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
