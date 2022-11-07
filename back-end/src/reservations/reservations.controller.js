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

// LIST/CREASTE/READ/UPDATE functions
async function list(req, res) {
  const { date, mobile_number } = req.query;
  const reservation = await (mobile_number
    ? service.search(mobile_number)
    : service.list(date));
  res.json({ data: reservation });
}

async function create(req, res) {
  const data = await service.create(res.locals.data);
  res.status(201).json({ data });
}

async function read(req, res) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);
  res.json({
    data,
  });
}

async function update(req, res) {
  const data = await service.update(req.params.reservation_id, req.body.data);
  res.json({
    data,
  });
}
async function updateStatus(req, res) {
  const data = await service.updateStatus(
    req.params.reservation_id,
    req.body.data
  );
  res.json({
    data,
  });
}

// VALIDATIONS: DATES/TIMES/STATUS/EXISTS
async function validateProp(req, res, next) {
  const {
    data: { reservation_date, reservation_time, people, status },
  } = res.locals;
  
  const [hours, minutes] = reservation_time.split(":");
  const newResTime=`${hours}:${minutes}`;

  try {
    if (!validateDate(reservation_date)) {
      const error = new Error(
        `'${reservation_date}' is invalid 'reservation_date' format. Use YYYY-MM-DD`
      );
      error.status = 400;
      throw error;
    }
    if (!validateTime(newResTime)) {
      const error = new Error(
        `'${reservation_time}' is invalid 'reservation_time' format. Use HH:MM:SS`
      );
      error.status = 400;
      throw error;
    }
    if (people < 1) {
      const error = new Error(`people must be at least 1`);
      error.status = 400;
      throw error;
    }
    if (typeof people !== "number") {
      const error = new Error(`people must be a number`);
      error.status = 400;
      throw error;
    }
    if (status && status !== "booked") {
      const error = new Error(`status must be "booked", received: ${status}`);
      error.status = 400;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}

function validateDate(date) {
  let dateReg = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
  return dateReg.test(date);
}

function validateTime(time) {
  let timeReg = /^(2[0-3]|[01][0-9]):[0-5][0-9]$/;
  return timeReg.test(time);
}

function validateResDate(req, res, next) {
  const {
    data: { reservation_date, reservation_time },
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
    data: { reservation_time },
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

async function resExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `Reservation cannot be found : ${req.params.reservation_id}`,
  });
}

async function validStatus(req, res, next) {
  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  const { status } = req.body.data;

  if (status && validStatuses.includes(status)) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Invalid Status: ${status}`,
    });
  }
}

async function inProgress(req, res, next) {
  const { status } = res.locals.reservation;
  
  if (status === "finished") {
    return next({
      status: 400,
      message: `A finished reservation cannot be updated`,
    });
  }
  next();
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
  read: [
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(resExists),
    hasProps(...REQUIRED_PROPS),
    asyncErrorBoundary(validateProp),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(inProgress),
    asyncErrorBoundary(validStatus),
    asyncErrorBoundary(updateStatus),
  ],
};