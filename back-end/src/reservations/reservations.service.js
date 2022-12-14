const knex = require("../db/connection");
  



function list(reservation_date){
  return knex("reservations")
  .select("*")
  .where({reservation_date})
  .whereNot({status: "finished"})
  .whereNot({status: "cancelled"})
  .orderBy("reservation_time")
}


function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}


function create(reservation) {
   return knex("reservations")
     .insert(reservation)
     .returning("*")
     .then((createdRecords) => createdRecords[0]);
}


function read(reservation_id) {
   return knex("reservations")
      .select()
      .where({ reservation_id })
      .first();
 }


function update(reservation_id, data) {
  const { status } = data;
  return knex("reservations")
    .select()
    .where({ reservation_id })
    .update(data, "*")
    .returning("*")
    .then((reservationData) => reservationData[0]);
}


function updateStatus(reservation_id, data) {
  const { status } = data;
  return knex("reservations")
    .select()
    .where({ reservation_id })
    .update({ status })
    .returning("*")
    .then((reservationData) => reservationData[0]);
}



module.exports = {
  list,
  search,
  create,
  read,
  update,
  updateStatus,
};
