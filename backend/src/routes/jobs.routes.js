const express = require("express");
const router = express.Router();
const controller = require("../controllers/jobs.controller");
const { check } = require("express-validator");

router.get("/import-gmail", controller.importJobsFromGmail);

router.get("/", controller.getAllJobs);
router.get("/:id", controller.getJobById);

router.post(
  "/",
  [
    check("company")
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-Z0-9\s\-’']+$/)
      .trim()
      .withMessage("Le nom de l'entreprise contient des caractères invalides"),
    check("position")
      .isLength({ min: 5, max: 100 })
      .matches(/^[a-zA-Z0-9\s\-’']+$/)
      .trim()
      .withMessage("Le nom du poste contient des caractères invalides"),
    check("status")
      .isIn(["Postulé", "Entretien", "Offre", "Refus", "Archivé"])
      .withMessage("Le statut est invalide"),
    check("status").isURL().withMessage("Le lien du poste doit être valide"),
    check("appliedDate")
      .isISO8601()
      .custom((value) => new Date(value) <= new Date())
      .withMessage("La date ne peut pas être dans le futur"),
  ],
  controller.createJob
);

router.post("/bulk", controller.createManyJobs);

router.put(
  "/:id",
  [
    check("company")
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-Z0-9\s\-’']+$/)
      .trim()
      .withMessage("Le nom de l'entreprise contient des caractères invalides"),
    check("position")
      .isLength({ min: 5, max: 100 })
      .matches(/^[a-zA-Z0-9\s\-’']+$/)
      .trim()
      .withMessage("Le nom du poste contient des caractères invalides"),
    check("status")
      .isIn(["Postulé", "Entretien", "Offre", "Refus", "Archivé"])
      .withMessage("Le statut est invalide"),
    check("status").isURL().withMessage("Le lien du poste doit être valide"),
    check("appliedDate")
      .isISO8601()
      .custom((value) => new Date(value) <= new Date())
      .withMessage("La date ne peut pas être dans le futur"),
  ],
  controller.updateJob
);
router.delete("/:id", controller.deleteJob);

module.exports = router;
