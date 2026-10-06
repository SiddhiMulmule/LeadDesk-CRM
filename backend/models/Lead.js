const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "created",
        "status",
        "priority",
        "source",
        "followup",
        "note",
        "project",
        "budget",
        "updated",
      ],
      default: "updated",
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    oldValue: {
      type: String,
      default: "",
    },

    newValue: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },

    budget: {
      type: String,
      required: [true, "Budget is required"],
      trim: true,
    },

    projectType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Other",
    },

    message: {
      type: String,
      required: [true, "Project requirement is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Closed"],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    source: {
      type: String,
      enum: [
        "Website",
        "Referral",
        "Instagram",
        "LinkedIn",
        "Google",
        "Facebook",
        "WhatsApp",
        "Other",
      ],
      default: "Website",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    activities: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/* =========================================================
   BUDGET INTELLIGENCE
========================================================= */

leadSchema.virtual("budgetLevel").get(function () {
  const budget = String(this.budget || "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "");

  if (
    budget.includes("5,00,000+") ||
    budget.includes("500000+")
  ) {
    return "Enterprise";
  }

  if (
    budget.includes("2,50,000") ||
    budget.includes("250000")
  ) {
    return "Premium";
  }

  if (
    budget.includes("1,00,000") ||
    budget.includes("100000")
  ) {
    return "Growth";
  }

  if (
    budget.includes("50,000") ||
    budget.includes("50000")
  ) {
    return "Standard";
  }

  return "Custom";
});

/* =========================================================
   LEAD SCORE
========================================================= */

leadSchema.virtual("leadScore").get(function () {
  let score = 30;

  const budget = String(this.budget || "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "");

  if (
    budget.includes("5,00,000") ||
    budget.includes("500000")
  ) {
    score += 35;
  } else if (
    budget.includes("2,50,000") ||
    budget.includes("250000")
  ) {
    score += 30;
  } else if (
    budget.includes("1,00,000") ||
    budget.includes("100000")
  ) {
    score += 22;
  } else if (
    budget.includes("50,000") ||
    budget.includes("50000")
  ) {
    score += 15;
  }

  if (this.priority === "High") {
    score += 20;
  } else if (this.priority === "Medium") {
    score += 10;
  }

  if (this.status === "Contacted") {
    score += 10;
  }

  if (this.status === "Closed") {
    score += 15;
  }

  if (this.followUpDate) {
    const today = new Date();
    const followUp = new Date(this.followUpDate);

    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);

    if (followUp <= today) {
      score += 10;
    }
  }

  if ((this.message || "").length >= 150) {
    score += 5;
  }

  return Math.min(score, 100);
});

/* =========================================================
   LEAD TEMPERATURE
========================================================= */

leadSchema.virtual("leadTemperature").get(function () {
  const score = this.leadScore;

  if (score >= 70) {
    return "Hot";
  }

  if (score >= 45) {
    return "Warm";
  }

  return "Cold";
});

/* =========================================================
   FOLLOW-UP STATUS
========================================================= */

leadSchema.virtual("followUpStatus").get(function () {
  if (!this.followUpDate) {
    return "Not Scheduled";
  }

  const today = new Date();
  const followUp = new Date(this.followUpDate);

  today.setHours(0, 0, 0, 0);
  followUp.setHours(0, 0, 0, 0);

  if (followUp < today) {
    return "Overdue";
  }

  if (followUp.getTime() === today.getTime()) {
    return "Due Today";
  }

  return "Upcoming";
});

/* =========================================================
   SEARCH INDEXES
========================================================= */

leadSchema.index({
  name: "text",
  email: "text",
  projectType: "text",
  message: "text",
  notes: "text",
});

leadSchema.index({
  status: 1,
  priority: 1,
});

leadSchema.index({
  source: 1,
});

leadSchema.index({
  projectType: 1,
});

leadSchema.index({
  followUpDate: 1,
});

leadSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model("Lead", leadSchema); 