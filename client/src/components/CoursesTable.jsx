import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { DataContext } from "../App";
import PropTypes from "prop-types";

function CoursesTable({ refresh, setRefresh }) {
  CoursesTable.propTypes = {
    refresh: PropTypes.bool,
    setRefresh: PropTypes.func,
  };
  const { isLoggedIn } = useContext(DataContext);
  const [courses, setCourses] = useState([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    console.log("selectedClassRoom", selectedClassRoom);
  }, [selectedClassRoom]);

  useEffect(() => {
    fetch("/api/cohorts/")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        setRefresh(false); // Reset refresh to false
      });
  }, [refresh]);

  const handleDelete = (id) => () => {
    fetch(`/api/cohorts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      // eslint-disable-next-line
      .then((data) => {
        setCourses(courses.filter((h) => h._id !== id));
      });
  };

  const filteredCourses = courses.filter(
    (course) =>
      searchQuery === "" ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("1st courses check", courses);
  console.log("1st filteredCourses check", filteredCourses);

  return (
    <>
      <label htmlFor="search">
        Search by Course:
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={handleSearch}
        />
      </label>

      <table border="1">
        <div>
          <select
            value={selectedClassRoom}
            onChange={(event) => setSelectedClassRoom(event.target.value)}
          >
            Show Classrooms:
            <option value="">Show all</option>
            <option value="1">Classroom 1</option>
            <option value="2">Classroom 2</option>
            <option value="3">Classroom 3</option>
            <option value="4">Classroom 4</option>
            <option value="5">Classroom 5</option>
            <option value="6">Classroom 6</option>
          </select>
        </div>

        {/* <caption>Courses</caption> */}

        <thead>
          <tr>
            <th>Cohort</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Sat on Campus</th>
            <th>Classroom</th>
            {/* <th>Weeks</th> */}
            {isLoggedIn ? <th>Edit / Delete</th> : null}
          </tr>
        </thead>
        <tbody>
          {/* {courses.map((course, i) => ( */}
          {filteredCourses
            .filter(
              (course) =>
                selectedClassRoom === "" ||
                (course.classRoom && course.classRoom == selectedClassRoom)
            ) //Filter courses based on classroom
            .filter(
              (course) =>
                DateTime.fromISO(course.endDate).startOf("day") >=
                DateTime.local().startOf("day")
            ) //Filter courses based on end date
            .map((course, i) => (
              <>
                {" "}
                {console.log("Filtered ", filteredCourses)}
                {console.log("Filter and map", courses)}
                {console.log("course.classRoom", course.classRoom)}
                <tr key={i}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseSchedule}</td>
                  <td>
                    {DateTime.fromISO(course.startDate).toLocaleString(
                      DateTime.DATE_MED_WITH_WEEKDAY
                    )}
                  </td>
                  <td>
                    {DateTime.fromISO(course.endDate).toLocaleString(
                      DateTime.DATE_MED_WITH_WEEKDAY
                    )}
                  </td>
                  <td>
                    {Object.entries(course.daysOnCampus)
                      .map(([day, isOnCampus]) =>
                        isOnCampus
                          ? day.slice(0, 1).toUpperCase() + day.slice(1, 3)
                          : null
                      )
                      .filter((day) => day !== null)
                      .join(", ")}
                  </td>
                  <td>{course.startTime}</td>
                  <td>{course.endTime}</td>
                  <td>{course.altSaturdays}</td>
                  <td>{course.classRoom}</td>
                  {/* <td>{course.weeks}</td> */}
                  {isLoggedIn ? (
                    <td>
                      <Link to={`/editcourse/${course._id}`}>📝</Link>
                      <button onClick={handleDelete(course._id, i)}>X</button>
                    </td>
                  ) : null}
                </tr>
              </>
            ))}
        </tbody>
      </table>
    </>
  );
}

export default CoursesTable;
