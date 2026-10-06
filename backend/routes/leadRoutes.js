const express = require("express");

const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadAnalytics,
} = require("../controllers/leadController");

const auth = require("../middleware/auth");

const router = express.Router();

/* =========================================================
   PUBLIC
========================================================= */

// Public lead enquiry form
router.post("/", createLead);

/* =========================================================
   PROTECTED ADMIN ROUTES
========================================================= */

// Analytics must come before /:id
router.get(
  "/analytics",
  auth,
  getLeadAnalytics
);

// Get all leads
router.get(
  "/",
  auth,
  getLeads
);

// Get single lead
router.get(
  "/:id",
  auth,
  getLead
);

// Update lead
router.patch(
  "/:id",
  auth,
  updateLead
);

// Delete lead
router.delete(
  "/:id",
  auth,
  deleteLead
);

module.exports = router; 