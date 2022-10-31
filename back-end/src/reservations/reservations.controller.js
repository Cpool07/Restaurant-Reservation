const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");

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
  console.log(res.locals.reservation);
  res.json({
    data: [],
  });
}

async function read(req, res) {
  res.json({
    data: [],
  });
}

async function validateProp(req, res, next) {
  const {
    reservation: { reservation_date, reservation_time, people }
  } = res.locals;
  try {
    if (!validateDate(reservation_date)) {
      const error = new Error(
        `'${reservation_date}' format is invalid. Use YYYY-MM-DD`
      );
      error.status = 400;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}

// put in utils
function validateDate(testdate) {
  let dateReg = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
  return dateReg.test(testdate);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProperties(...REQUIRED_PROPS),
    asyncErrorBoundary(validateProp),
    asyncErrorBoundary(create),
  ],
  read: asyncErrorBoundary(read),
};