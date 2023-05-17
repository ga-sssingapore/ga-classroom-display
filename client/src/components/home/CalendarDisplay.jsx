import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelectedDate } from "../../context/SelectedDateContext";
import moment from "moment";
import axios from "axios";

export default function CalendarDisplay() {
  const [dateHeaderRow, setDateHeaderRow] = useState([]);
  const [dayHeaderRow, setDayHeaderRow] = useState([]);
  const [displayClasses, setDisplayClasses] = useState([[], []]);

  const createDateHeaderRow = (datesRow) => {
    // get dates for today and next 6 days
    const dateRow = [];
    for (let i = 0; i < 7; i++) {
      const thisDate = moment().startOf("day").add(i, "d");
      dateRow.push(thisDate);
    }

    setDateHeaderRow(dateRow);
    return dateRow;
  };

  const createDayHeaderRow = (dates) => {
    // get the day of the week depending on the dateHeaderRow
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayRow = [];
    for (let i = 0; i < 7; i++) {
      const wordDay = days[dates[i].day()];
      dayRow.push(wordDay);
    }

    setDayHeaderRow(dayRow);
  };

  const createClassCalendar = async (dates) => {
    const classes = [
      ["1", "", "", "", "", "", "", ""],
      ["2", "", "", "", "", "", "", ""],
      ["3", "", "", "", "", "", "", ""],
      ["4", "", "", "", "", "", "", ""],
      ["5", "", "", "", "", "", "", ""],
      ["6", "", "", "", "", "", "", ""],
    ];

    // cohorts
    const cohorts = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/cohorts`
    );

    for (const item of cohorts.data) {
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
    const bookings = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/bookings`
    );

    for (const item of bookings.data) {
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

    setDisplayClasses(classes);
  };

  useEffect(() => {
    const dates = createDateHeaderRow();
    createDayHeaderRow(dates);
    createClassCalendar(dates);
  }, []);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className=" text-lg flex flex-col justify-center items-center">
          <div className="pb-1">Date</div>

          {/* <input
            type="date"
            defaultValue={DateTime.now().toFormat("yyyy-MM-dd")}
            onChange={(e) => useSelectedDate.setSelectedDate(e.target.value)}
          ></input> */}
        </div>
        <div className="mt-8 flex flex-col items-center">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr className=" bg-gray-400">
                      <th scope="colgroup" colSpan={8}>
                        Timetable
                      </th>
                    </tr>

                    <tr className="divide-x divide-gray-300">
                      <th
                        scope="col"
                        className="bg-gray-300 text-lg"
                        rowSpan={2}
                      >
                        Classroom
                      </th>

                      {dateHeaderRow.map((item) => (
                        <th
                          key={item.format("DDMMMYYYY")}
                          scope="col"
                          className=" bg-gray-200 py-1.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {item.format("DD MMM YYYY")}
                        </th>
                      ))}
                    </tr>
                    <tr className="divide-x divide-gray-300">
                      {dayHeaderRow.map((item) => (
                        <th
                          key={item}
                          scope="col"
                          className="text-center py-1.5 pl-4 pr-4 text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-x divide-gray-300 bg-white">
                    {displayClasses.map((row, index) => (
                      <tr key={index} className="divide-x divide-gray-300">
                        <td
                          key={Math.random()}
                          className="text-left text-sm font-semibold bg-gray-200 text-gray-900 sm:pl-6"
                        >
                          <Link to={`/display/${row[0]}`}>Room {row[0]}</Link>
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[1]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[2]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[3]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[4]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[5]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[6]}
                        </td>
                        <td
                          key={Math.random()}
                          className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {row[7]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
