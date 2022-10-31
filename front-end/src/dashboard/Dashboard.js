import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import useQuery from "../utils/useQuery";
import { previous, next } from "../utils/date-time";
import { useHistory } from "react-router-dom";


/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();

  const today = new Date().toJSON().slice(0,10);

  const query = useQuery();
  const dateQuery = query.get("date");
  const [dashDate, setDashDate] = useState(dateQuery ? dateQuery : today);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const reservationList = reservations.map((reservation) => {
    return( 
      <tr key={reservation.reservation_id}>
        <td>{reservation.reservation_id}</td>
        <td>{reservation.last_name}, {reservation.first_name}</td>
        <td>{reservation.mobile_number}</td>
        <td>{reservation.reservation_date}</td>
        <td>{reservation.reservation_time}</td>
        <td>{reservation.people}</td>
        <td>STATUS</td>
      </tr>
    );
  });

  const handlePrevious = (event) => {
    event.preventDefault();
    history.push(`/dashboard?date=${previous(dashDate)}`);
    setDashDate(previous(dashDate))
  };

  const handleNext = (event) => {
    event.preventDefault();
    history.push(`/dashboard?date=${next(dashDate)}`);
    setDashDate(next(dashDate))
  };

  const handleToday = (event) => {
    event.preventDefault();
    setDashDate(today);
    history.push(`/dashboard?date=${today}`);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <div>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNext}>Next</button>
      </div>
      <ErrorAlert error={reservationsError} />
      {JSON.stringify(reservations)}
    </main>
  );
}

export default Dashboard;
