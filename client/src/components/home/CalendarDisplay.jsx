import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import axios from "axios";

export default function CalendarDisplay() {
  const [dateHeaderRow, setDateHeaderRow] = useState([]);
  const [dayHeaderRow, setDayHeaderRow] = useState([]);
  const [calendar, setCalendar] = useState([[], []]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  const createDateHeaderRow = () => {
    // get dates for today and next 6 days
    const dateRow = [];
    for (let i = 0; i < 7; i++) {
      const thisDate = moment(selectedDate).startOf("day").add(i, "d");
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
    const datesString = dates.map((item) => moment(item).format("YYYY-MM-DD"));
    const calendar = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/calendar`,
      datesString
    );

    setCalendar(calendar.data);
  };

  useEffect(() => {
    const dates = createDateHeaderRow();
    createDayHeaderRow(dates);
    createClassCalendar(dates);
  }, [selectedDate]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className=" text-lg flex flex-col justify-center items-center">
        <div className="pb-1">Date</div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        ></input>
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
                    <th scope="col" className="bg-gray-300 text-lg" rowSpan={2}>
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
                  {calendar.map((row, index) => (
                    <tr key={index} className="divide-x divide-gray-300">
                      {row.map((item, idx) => {
                        if (idx === 0) {
                          return (
                            <td
                              key={Math.random()}
                              className="text-left text-sm font-semibold bg-gray-200 text-gray-900 sm:pl-6"
                            >
                              <Link to={`/display/${row[0]}`}>
                                Room {row[0]}
                              </Link>
                            </td>
                          );
                        } else {
                          return (
                            <td
                              key={Math.random()}
                              className="py-3.5 pl-4 pr-4 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              {row[idx]}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
