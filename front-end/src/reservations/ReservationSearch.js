import { useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservation from "../dashboard/Reservation";

function Search() {
  const initialFormState = {
    mobile_number: "",
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [formErrors, setFormErrors] = useState([]);

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState([]);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setFormErrors([]);

    const errors = [];

    setFormErrors(errors);

    const mobileNumberQuery = { mobile_number: formData.mobile_number };

    // Call API to list reservations
    listReservations(mobileNumberQuery, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  };

  let displayErrors = formErrors.map((error) => (
    <ErrorAlert key={error} error={error} />
  ));

  let displayResErrors = reservationsError.map((error) => (
    <ErrorAlert key={error} error={error} />
  ));

  const reservationList = reservations.map((reservation) => (
    <Reservation reservation={reservation} />
  ));

  const content = reservations.length ? (
    <div className="container mt-3">
      <div className="row">
        <div className="col-sm">{reservationList}</div>
      </div>
    </div>
  ) : (
    <p>No reservations found</p>
  );

  return (
    <>
      {formErrors.length ? displayErrors : null}
      {reservationsError.length ? displayResErrors : null}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="mobile_number">
            Mobile Number:
          </label>
          <input
            required
            type="text"
            placeholder="Enter a customer's phone number"
            onChange={handleChange}
            value={formData.mobile_number}
            className="form-control"
            name="mobile_number"
          ></input>
        </div>
        <button className="btn btn-primary mx-2" type="submit">
          Find
        </button>
      </form>
      {content}
    </>
  );
}

export default Search;