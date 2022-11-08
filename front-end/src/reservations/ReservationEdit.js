import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { updateReservation, readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import formatReservationDate from "../utils/format-reservation-date";
import ReservationForm from "./ReservationForm";

function ReservationEdit() {
  const history = useHistory();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  function mobileDashes(f) {
    f.value = f.value.split("-").join("");
    f.value = f.value.replace(/[^0-9-]/g, "");
    f.value = f.value.replace(
      /(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)/,
      "$1$2$3-$4$5$6-$7$8$9$10"
    );
  }

  const [formData, setFormData] = useState({ ...initialFormState });
  const [formErrors, setFormErrors] = useState([]);

  const { reservation_id } = useParams();

  useEffect(() => {
    async function loadReservation() {
      const abortController = new AbortController();
      const reservation = await readReservation(
        reservation_id,
        abortController.signal
      );
      setFormData({ ...formatReservationDate(reservation) });

      return () => abortController.abort();
    }
    loadReservation();
  }, [reservation_id]);

  const handleChange = ({ target }) => {
    if (target.name === "mobile_number") mobileDashes(target);
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = [];
    const abortController = new AbortController();

  // formats the people in the reservation so that it is a number
  const formattedReservation = {...formData, people: Number(formData.people)}
  
  //formats the time so it includes the :00 at the end
  const [hours, minutes] = formattedReservation.reservation_time.split(":")
  const reservationTime = `${hours}:${minutes}:00`
  formattedReservation.reservation_time = reservationTime

  const UTCHours = Number(hours) + 5
  const reservationDate = new Date(
    `${formattedReservation.reservation_date}T${UTCHours}:${minutes}:00.000Z`
  );
    if (Date.now() > Date.parse(reservationDate)) {
      errors.push({ message: `The reservation cannot be in the past` });
    }

    const reservationDay = new Date(`${formattedReservation.reservation_date}T${formattedReservation.reservation_time}`)
    if (reservationDay.getDay() === 2) {
      errors.push({ message: `The restaurant is closed on Tuesdays` });
    }

    if ((hours <= 10 && minutes < 30) || hours <= 9) {
      errors.push({ message: `We open at 10:30am` });
    }
    if ((hours >= 21 && minutes > 30) || hours >= 22) {
      errors.push({ message: `We stop accepting reservations after 9:30pm` });
    }
    if (formattedReservation.people < 1) {
      errors.push({ message: `Reservations must have at least 1 person` });
    }

    setFormErrors(errors);

    !errors.length &&
    updateReservation(formattedReservation, reservation_id, abortController.signal)
      .then(() =>
        history.push(`/dashboard?date=${formattedReservation.reservation_date}`)
      )
      .catch(setFormErrors);
    return () => abortController.abort();
  };


  // checks if there are any errors, and if there are, it shows them above the reservations form
  let displayErrors = formErrors.map((error) => (
    <ErrorAlert key={error.message} error={error} />
  ));


  return (
    <>
      <div className="text-center mt-3 mb-5">
        <h1>Edit Reservation</h1>
      </div>
      {displayErrors}
      <ReservationForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </>
  );
}

export default ReservationEdit;