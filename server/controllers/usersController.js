const express = require("express");
<<<<<<< HEAD
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/seed", async (req, res) => {
  const users = [
    {
      username: "grapefruit",
      email: "pink@fruits.com",
      password: bcrypt.hashSync("fruitbasket", 10),
      admin: false,
    },
    {
      username: "testingt",
      email: "admin@test.com",
      password: bcrypt.hashSync("password123", 10),
      admin: true,
    },
  ];
  try {
    await User.deleteMany({}); //* delete all users
    const newUsers = await User.create(users);
    res.json(newUsers);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
=======
// const session = require("express-session");
const router = express.Router();
const Booking = require("../models/booking");
const seed = require("../seed/seedBooking");

// session

// router.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     // cookie: { secure: true },
//   })
// );

router.get("/seed", seed); // DELETE!

router.get("/", async (req, res) => {
  //? return [ list of bookings]
  try {
    const bookings = await Booking.find().exec();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/", async (req, res) => {
>>>>>>> 1b8a445 (Init in root directory, preparing for deployment)
  // Check for the presence of session data
  if (!req.session.username) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
<<<<<<< HEAD
    const users = await User.find({}).exec();
    console.log(users);
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
=======
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
  // Check for the presence of session data
  if (!req.session.username) {
    res.status(401).send("Unauthorized");
    return;
  }
  const { id } = req.params;
  try {
    const deletedBooking = await Booking.findByIdAndRemove(id);
    res.status(200).send(deletedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
>>>>>>> 1b8a445 (Init in root directory, preparing for deployment)
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
<<<<<<< HEAD
    const user = await User.findById(id);
    res.json(user);
=======
    const booking = await Booking.findById(id);
    res.json(booking);
>>>>>>> 1b8a445 (Init in root directory, preparing for deployment)
  } catch (error) {
    res.status(500).json({ error });
  }
});

<<<<<<< HEAD
=======
router.put("/:id", async (req, res) => {
  // Check for the presence of session data
  if (!req.session.username) {
    res.status(401).send("Unauthorized");
    return;
  }
  const { id } = req.params;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

>>>>>>> 1b8a445 (Init in root directory, preparing for deployment)
module.exports = router;
