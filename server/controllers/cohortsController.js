const express = require("express");
const router = express.Router();
const Cohort = require("../models/cohort");
const Booking = require("../models/booking");

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

router.get("/", async (req, res) => {
  try {
    const cohorts = await Cohort.find().exec();
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/bookings/:classroom", async (req, res) => {
  const currDate = dayjs().startOf("date");
  console.log({ currDate });

  // ignore on Sunday
  if (currDate.get("day") === 0) {
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
        dayjs(item.bookingStart),
        dayjs(item.bookingEnd),
        "date",
        []
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
      courseSchedule: { $ne: "none" },
      classRoom: req.params.classroom,
    });

    for (const item of temp) {
      const startDate = dayjs(item.startDate).startOf("date");
      const endDate = dayjs(item.endDate).startOf("date");

      if (currDate.isSame(startDate) || currDate.isSame(endDate)) {
        returnValue = {
          classroom: item.classRoom,
          courseCode: item.courseCode,
          roomUseBy: "",
          bookingPurpose: "",
          startTime: item.startTime,
          endTime: item.endTime,
        };
      } else if (currDate.isBetween(startDate, endDate, "date")) {
        let calculatedDate = currDate.clone();
        let weekCount = 1;

        while (calculatedDate.isAfter(startDate)) {
          weekCount++;
          calculatedDate.subtract(7, "day");
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
          dayjs(item.startDate),
          dayjs(item.endDate),
          "date",
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
