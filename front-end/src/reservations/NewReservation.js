import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";


function NewReservation() {
  const history = useHistory();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
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

  const handleChange = ({ target }) => {
    if (target.name === "mobile_number") mobileDashes(target)
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setFormErrors([]);
    const reservationDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00`
    );

    const [hours, minutes] = formData.reservation_time.split(":");

    const errors = [];

    if (!event.target.checkValidity())
      event.target.classList.add("was-validated");

    if (Date.now() > Date.parse(reservationDate)) {
      errors.push({
        message: `Reservation cannot be in the past.`,
      });
    }

    if (reservationDate.getDay() === 2) {
      errors.push({
        message: `Periodic Tables is closed on Tuesdays. Sorry!`,
      });
    }

    if ((hours <= 10 && minutes < 30) || hours <= 9) {
      errors.push({
        message: `Periodic Tables opens at 10:30 AM.`,
      });
    }

    if ((hours >= 21 && minutes > 30) || hours >= 22) {
      errors.push({
        message: `Periodic Tables stops accepting reservations at 9:30 PM.`,
      });
    }

    formData.people = Number(formData.people);

    if (formData.people < 1) {
      errors.push({
        message: `Bookings must include at least 1 guest`,
      });
    }

    setFormErrors(errors);

    !errors.length &&
      createReservation(formData, abortController.signal)
        .then((_) => {
          history.push(`/dashboard?date=${formData.reservation_date}`);
        })
        .catch((e) => console.log(e));

    return () => abortController.abort();
  };

  let displayErrors = formErrors.map((error) => (
    <ErrorAlert key={error.message} error={error} />
  ));

  return (
    <>
      <div className="text-center mt-3 mb-5">
        <h1>Create New Reservation</h1>
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

export default NewReservation;