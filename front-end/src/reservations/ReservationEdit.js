import ReservationEditForm from "./ReservationEditForm";
import { readReservation } from "../utils/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import formatReservationDate from "../utils/format-reservation-date";

function ReservationEdit() {
  const [reservation, setReservation] = useState(null);

  const { reservation_id } = useParams();

  useEffect(loadReservation, [reservation_id]);

  function loadReservation() {
    const abortController = new AbortController();
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch((err) => console.err(err));
    return () => abortController.abort();
  }

  return (
    <>
      <h1>Edit Reservation</h1>
      {reservation && (
        <ReservationEditForm
          reservation={formatReservationDate(reservation)}
          reservation_id={reservation_id}
        />
      )}
    </>
  );
}

export default ReservationEdit;