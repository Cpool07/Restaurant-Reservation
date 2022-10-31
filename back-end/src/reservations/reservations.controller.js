const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProps = require("../utils/hasProps");

const REQUIRED_PROPS = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const today = new Date().toLocaleDateString().replaceAll("/", "-");
  const { date = today } = req.query;
  const reservations = await service.list(date);
  res.json({
    data: [...reservations],
  });
}

async function create(req, res) {
  const data = await service.create(res.locals.reservation);
  res.status(201).json({ data });
}

async function read(req, res) {
  res.json({
    data: [],
  });
}

async function validateProp(req, res, next) {
  const {
    reservation: { reservation_date, reservation_time, people },
  } = res.locals;
  try {
    if (!validateDate(reservation_date)) {
      const error = new Error(
        `'${reservation_date}' is invalid 'reservation_date' format. Use YYYY-MM-DD`
      );
      error.status = 400;
      throw error;
    }
    if (!validateTime(reservation_time)) {
      const error = new Error(
        `'${reservation_time}' is invalid 'reservation_time' format. Use HH:MM:SS`
      );
      error.status = 400;
      throw error;
    }
    if (typeof people !== "number") {
      const error = new Error(`'people must be a number`);
      error.status = 400;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}


function validateDate(testdate) {
  let dateReg = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
  return dateReg.test(testdate);
}

function validateTime(time) {
  let timeReg = /^(2[0-3]|[01][0-9]):[0-5][0-9]$/;
  return timeReg.test(time);
}

function validateResDate(req, res, next) {
  const {
    reservation: { reservation_date, reservation_time },
  } = res.locals;

  const reservationDate = new Date(
    `${reservation_date}T${reservation_time}:00`
  );

  try {
    if (Date.now() > Date.parse(reservationDate)) {
      const error = new Error(`Reservation must be for a future date or time.`);
      error.status = 400;
      throw error;
    }
    if (reservationDate.getDay() == 2) {
      const error = new Error(`The restaurant is closed on Tuesdays. Sorry!`);
      error.status = 400;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}

function validateResTime(req, res, next) {
  const {
    reservation: { reservation_time },
  } = res.locals;

  const [hours, minutes] = reservation_time.split(":");

  try {
    if ((hours <= 10 && minutes < 30) || hours <= 9) {
      const error = new Error(`The restauraunt opens at 10:30 AM.`);
      error.status = 400;
      throw error;
    }
    if ((hours >= 21 && minutes > 30) || hours >= 22) {
      const error = new Error(
        `The restauraunt stops accepting reservations at 9:30 PM.`
      );
      error.status = 400;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProps(...REQUIRED_PROPS),
    asyncErrorBoundary(validateProp),
    validateResDate,
    validateResTime,
    asyncErrorBoundary(create),
  ],
  read: asyncErrorBoundary(read),
};