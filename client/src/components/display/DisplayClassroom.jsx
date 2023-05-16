import axios from "axios";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import calendarDisplayLogic from "../home/DisplayLogic";

export default function DisplayClassroom() {
  const { id } = useParams();
  //==================================
  //REFRESH TIMER HERE -> Change to desired amount, in seconds
  const [countdown, setCountdown] = useState(120);
  //==================================
  const calDisplayLogic = calendarDisplayLogic();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
      if (countdown === 0) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, calDisplayLogic]);

  const [cohortState, setCohortState] = useState([]);

  const fetchCohort = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/cohorts`
      );
      if (response) {
        setCohortState(response);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchCohort();
  }, []);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings`
      );
      if (response) {
        setBookingsState(response);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchBooking();
  }, []);

  let classRoomUser = calDisplayLogic[id - 1]?.[0];

  let cohortStateFilter = Array.isArray(cohortState.data)
    ? cohortState.data.filter((ele) => ele.courseCode === classRoomUser)
    : [];
  let cohortStartTime = cohortStateFilter[0]?.startTime;
  let cohortEndTime = cohortStateFilter[0]?.endTime;

  const splitCurrUserArray = calDisplayLogic[id - 1]?.[0].split("/");
  console.log("SPLIT", splitCurrUserArray);

  return (
    <div className=" h-screen w-screen bg-black py-[5vh] flex flex-col">
      <div className=" h-[40vh] min-w-[50%] flex whitespace-nowrap">
        <h1 className=" text-6xl text text-white m-auto">CLASSROOM {id}</h1>
      </div>
      <div className=" flex flex-col items-center">
        {splitCurrUserArray.map((ele, index) => (
          <h2 className="text-7xl text-center text-white px-10 my-2 ">{ele}</h2>
        ))}
        {cohortStartTime && cohortEndTime && (
          <p className="text-white text-5xl text-center pt-6">
            {cohortStartTime} - {cohortEndTime}
          </p>
        )}

        <br />
        <hr className=" border-white border-2 w-[70vw] m-auto mt-20 mb-20" />
        <br />
        <a>
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
        </a>
      </div>
    </div>
  );
}
