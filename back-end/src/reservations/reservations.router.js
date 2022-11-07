/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */


 const router = require("express").Router();
 const controller = require("./reservations.controller");
 const methodNotAllowed = require("../errors/methodNotAllowed");
 


// PUT/UPDATESTATUS
router.route("/:reservation_id/status")
      .put(controller.updateStatus)
      .all(methodNotAllowed);
 
// GET/READ | PUT/UPDATE
 router.route("/:reservation_id")
       .get(controller.read)
       .put(controller.update)
       .all(methodNotAllowed);

      // GET/LIST | POST/CREATE
 router.route("/")
 .get(controller.list)
 .post(controller.create)
 .all(methodNotAllowed);
 

      
 module.exports = router;
