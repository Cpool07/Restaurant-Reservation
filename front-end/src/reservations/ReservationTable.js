import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationForm() {
  const [errors, setErrors] = useState([]);
  const history = useHistory();
  const [formFields, setFormFields] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

  const validateReservation = () => {
    const errorsArr = [];
    const today = new Date();
    const resDate = new Date(`${formFields.reservation_date}T${formFields.reservation_time}`);
    const resTime = formFields.reservation_time;

    if (resDate < today) {
      errorsArr.push({ message: "Please pick a future date" });
    }

    if (resDate.getDay() === 2) {
      errorsArr.push({ message: "The restaraunt is closed on Tuesdays!" });
    }

    if (resTime < "10:30" || resTime > "17:30") {
      errorsArr.push({
        message:
          "Please select a reservation time between 10:30 AM and 9:30 PM",
      });
    }

    setErrors(errorsArr);
    if (errorsArr.length > 0) {
      return false;
    }
    return true;
  };

  const errorList = () => {
    return errors.map((err, index) => <ErrorAlert key={index} error={err} />);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateReservation()) {
      await createReservation(formFields)
        .then((output) =>
          history.push(`/dashboard?date=${formFields.people}`)
        )
        .catch(errors);
    }
  };

  function handleCancel() {
    alert("Are you sure you want to cancel?")
    history.push("/dashboard");
  }

  return (
    <div className="bootstrap-iso">
      <div className="container-fluid">
        <h2 className="pt-5 libreFont">New Reservation</h2>
        <div className="row">
          <div className="col-md-6 col-sm-6 col-xs-12">
            <form onSubmit={handleSubmit} method="post">
              {errorList()}
              <div className="form-group">
                <label className="control-label requiredField" htmlFor="name">
                  First Name
                  <span className="asteriskField">*</span>
                </label>
                <input
                  className="form-control"
                  id="first_name"
                  name="name"
                  type="text"
                  onChange={(e) =>
                    setFormFields({ ...formFields, first_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group ">
                <label className="control-label requiredField" htmlFor="name1">
                  Last Name
                  <span className="asteriskField">*</span>
                </label>
                <input
                  className="form-control"
                  id="last_name"
                  name="name1"
                  type="text"
                  onChange={(e) =>
                    setFormFields({ ...formFields, last_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group ">
                <label className="control-label requiredField" htmlFor="tel">
                  Telephone #<span className="asteriskField">*</span>
                </label>
                <input
                  className="form-control"
                  id="mobile_number"
                  name="tel"
                  placeholder="XXX-XXX-XXXX"
                  type="text"
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      mobile_number: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group ">
                <label className="control-label requiredField" htmlFor="date">
                  Date
                  <span className="asteriskField">*</span>
                </label>
                <input
                  className="form-control"
                  id="reservation_date"
                  name="date"
                  placeholder="MM-DD-YYYY"
                  type="date"
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      reservation_date: e.target.value,
                    })
                  }
                />
                <i className="fas fa-calendar input-prefix"></i>
              </div>
              <div className="form-group">
                <label
                  className="control-label requiredField"
                  htmlFor="inputMDEx1"
                >
                  Time
                  <span className="asteriskField">*</span>
                </label>
                <input
                  type="time"
                  id="reservation_time"
                  className="form-control"
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      reservation_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group ">
                <label className="control-label requiredField" htmlFor="number">
                  Party Size
                  <span className="asteriskField">*</span>
                </label>
                <input
                  className="form-control"
                  id="people"
                  name="number"
                  type="number"
                  onChange={(e) =>
                    setFormFields({ ...formFields, people: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <div>
                  <button
                    className="btn btn-primary mr-4"
                    name="submit"
                    type="submit"
                  >
                    <span className="oi oi-check mr-2"></span>
                    Submit
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-danger"
                    type="button"
                  >
                    <span className="oi oi-circle-x mr-2"></span>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationForm;