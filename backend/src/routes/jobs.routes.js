const express = require("express");
const router = express.Router();
const controller = require("../controllers/jobs.controller");

router.get("/import-gmail", controller.importJobsFromGmail);

router.get("/", controller.getAllJobs);
router.get("/:id", controller.getJobById);

router.post("/", controller.createJob);
router.post("/bulk", controller.createManyJobs);

router.put("/:id", controller.updateJob);
router.delete("/:id", controller.deleteJob);

module.exports = router;
