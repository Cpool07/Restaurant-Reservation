import { useHistory } from "react-router-dom";
import { cancelReservation } from "../utils/api";


function Reservation({ reservation }) {
  const {
    reservation_id,
    first_name,
    last_name,
    reservation_time,
    people,
    mobile_number,
    status,
  } = reservation;

  const history = useHistory();

  function handleClick() {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();

      cancelReservation(reservation_id, abortController.signal)
        .then(() => history.go(0))
        .catch((error) => console.log("error", error));
      return () => abortController.abort();
    }
  }

  return (
    <div className="card">
      <h5 className="card-header">
        {first_name} {last_name}
      </h5>
      <div className="card-body">
        <h5 className="card-title">Time: {reservation_time}</h5>
        <p className="card-text">People: {people}</p>
        <p className="card-text">Phone: {mobile_number}</p>
        <p
          data-reservation-id-status={reservation.reservation_id}
          className="card-text"
        >
          Status: {status}
        </p>
        {status === "booked" && (
          <a
            href={`/reservations/${reservation_id}/seat`}
            className="btn btn-primary"
          >
            Seat
          </a>
        )}
        <a href={`/reservations/${reservation_id}/edit`}>
          <button className="btn btn-secondary">Edit</button>
        </a>
        <button
          className="btn btn-danger"
          data-reservation-id-cancel={reservation.reservation_id}
          onClick={handleClick}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Reservation;