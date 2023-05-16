import axios from "axios";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import calendarDisplayLogic from "../home/DisplayLogic";

export default function DisplayClassroom() {
  const { classroom } = useParams();
  //==================================
  //REFRESH TIMER HERE -> Change to desired amount, in seconds
  const [countdown, setCountdown] = useState(import.meta.env.VITE_COUNTDOWN);
  //==================================
  //   const calDisplayLogic = calendarDisplayLogic();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
      if (countdown === 0) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const [display, setDisplay] = useState({
    classroom: "",
    courseCode: "",
    roomUseBy: "",
    bookingPurpose: "",
    startTime: "",
    endTime: "",
  });

  const getDisplay = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/cohorts/bookings/${classroom}`
      );
      if (response) {
        console.log(response);
        setDisplay(response.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    console.log("run");
    getDisplay();
  }, []);

  return (
    <div className=" h-screen w-screen bg-black py-[5vh] flex flex-col">
      {JSON.stringify(display)}
      <div className=" h-[40vh] min-w-[50%] flex whitespace-nowrap">
        <h1 className=" text-6xl text text-white m-auto">
          CLASSROOM {display.classroom}
        </h1>
      </div>
      <div className=" flex flex-col items-center">
        {display.courseCode && (
          <h2 className="text-7xl text-center text-white px-10 my-2 ">
            {display.courseCode}
          </h2>
        )}
        {display.roomUseBy && (
          <h2 className="text-7xl text-center text-white px-10 my-2 ">
            {display.roomUseBy}
          </h2>
        )}
        {display.bookingPurpose && (
          <h2 className="text-7xl text-center text-white px-10 my-2 ">
            {display.bookingPurpose}
          </h2>
        )}
        {display.startTime && display.endTime && (
          <p className="text-white text-5xl text-center pt-6">
            {display.startTime} - {display.endTime}
          </p>
        )}

        <br />
        <hr className=" border-white border-2 w-[70vw] m-auto mt-20 mb-20" />
        <br />
        <Link to="/">
          <img
            src={"/CMYK-White-Red_Small_GeneralAssembly-Horizontal.png"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackLogo;
            }}
            className=" h-auto w-[60vw]"
            alt="GENERAL ASSEMBLY"
          />
        </Link>
      </div>
    </div>
  );
}
