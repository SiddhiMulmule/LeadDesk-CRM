const Lead = require("../models/Lead");

/* =========================================================
   CONSTANTS
========================================================= */

const ALLOWED_STATUS = [
  "New",
  "Contacted",
  "Closed",
];

const ALLOWED_PRIORITY = [
  "Low",
  "Medium",
  "High",
];

const ALLOWED_SOURCE = [
  "Website",
  "Referral",
  "Instagram",
  "LinkedIn",
  "Google",
  "Facebook",
  "WhatsApp",
  "Other",
];

/* =========================================================
   HELPERS
========================================================= */

const createActivity = (
  type,
  message,
  oldValue = "",
  newValue = ""
) => ({
  type,
  message,
  oldValue: String(oldValue ?? ""),
  newValue: String(newValue ?? ""),
  createdAt: new Date(),
});

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/* =========================================================
   CREATE LEAD
========================================================= */

const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      budget,
      projectType,
      message,
      source,
    } = req.body;

    if (!name || !email || !budget || !message) {
      return res.status(400).json({
        message:
          "Name, email, budget and project requirement are required.",
      });
    }

    const existingLead = await Lead.findOne({
      email: String(email).trim().toLowerCase(),
      status: {
        $ne: "Closed",
      },
    });

    if (existingLead) {
      return res.status(409).json({
        message:
          "An active lead with this email already exists.",
        leadId: existingLead._id,
      });
    }

    const lead = await Lead.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      budget: String(budget).trim(),
      projectType:
        projectType?.trim() || "Other",
      message: String(message).trim(),
      source:
        ALLOWED_SOURCE.includes(source)
          ? source
          : "Website",

      activities: [
        createActivity(
          "created",
          "Lead created through the LeadDesk enquiry form."
        ),
      ],
    });

    return res.status(201).json({
      message: "Lead created successfully.",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return res.status(500).json({
      message: "Unable to create lead.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET ALL LEADS
========================================================= */

const getLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      source,
      projectType,
      followUp,
      sort,
      page = 1,
      limit = 100,
    } = req.query;

    const filter = {};

    /* SEARCH */

    if (search?.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { projectType: regex },
        { message: regex },
        { notes: regex },
        { source: regex },
        { budget: regex },
      ];
    }

    /* STATUS */

    if (
      status &&
      status !== "All" &&
      ALLOWED_STATUS.includes(status)
    ) {
      filter.status = status;
    }

    /* PRIORITY */

    if (
      priority &&
      priority !== "All" &&
      ALLOWED_PRIORITY.includes(priority)
    ) {
      filter.priority = priority;
    }

    /* SOURCE */

    if (
      source &&
      source !== "All" &&
      ALLOWED_SOURCE.includes(source)
    ) {
      filter.source = source;
    }

    /* PROJECT */

    if (
      projectType &&
      projectType !== "All"
    ) {
      filter.projectType = projectType;
    }

    /* FOLLOW-UP */

    if (followUp === "overdue") {
      filter.followUpDate = {
        $lt: new Date(),
      };
    }

    if (followUp === "upcoming") {
      filter.followUpDate = {
        $gte: new Date(),
      };
    }

    /* SORT */

    let sortObject = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortObject = { createdAt: 1 };
        break;

      case "name":
        sortObject = { name: 1 };
        break;

      case "followup":
        sortObject = {
          followUpDate: 1,
        };
        break;

      default:
        sortObject = {
          createdAt: -1,
        };
    }

    const safePage = Math.max(
      Number(page) || 1,
      1
    );

    const safeLimit = Math.min(
      Math.max(Number(limit) || 100, 1),
      200
    );

    const skip =
      (safePage - 1) * safeLimit;

    const [leads, total] =
      await Promise.all([
        Lead.find(filter)
          .sort(sortObject)
          .skip(skip)
          .limit(safeLimit),

        Lead.countDocuments(filter),
      ]);

    return res.status(200).json({
      leads,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(
          total / safeLimit
        ),
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return res.status(500).json({
      message: "Unable to fetch leads.",
      error: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE LEAD
========================================================= */

const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(
      req.params.id
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    return res.status(200).json({
      lead,
    });
  } catch (error) {
    console.error("Get lead error:", error);

    return res.status(500).json({
      message: "Unable to fetch lead.",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE LEAD
========================================================= */

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(
      req.params.id
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    const {
      name,
      email,
      phone,
      budget,
      projectType,
      message,
      status,
      priority,
      source,
      followUpDate,
      notes,
    } = req.body;

    const activities = [];

    /* NAME */

    if (
      name !== undefined &&
      String(name).trim() !== lead.name
    ) {
      activities.push(
        createActivity(
          "updated",
          "Lead name updated.",
          lead.name,
          String(name).trim()
        )
      );

      lead.name = String(name).trim();
    }

    /* EMAIL */

    if (
      email !== undefined &&
      String(email)
        .trim()
        .toLowerCase() !== lead.email
    ) {
      activities.push(
        createActivity(
          "updated",
          "Lead email updated.",
          lead.email,
          String(email).trim().toLowerCase()
        )
      );

      lead.email = String(email)
        .trim()
        .toLowerCase();
    }

    /* PHONE */

    if (phone !== undefined) {
      lead.phone = String(phone).trim();
    }

    /* BUDGET */

    if (
      budget !== undefined &&
      String(budget) !== lead.budget
    ) {
      activities.push(
        createActivity(
          "budget",
          "Budget information updated.",
          lead.budget,
          String(budget)
        )
      );

      lead.budget = String(budget).trim();
    }

    /* PROJECT */

    if (
      projectType !== undefined &&
      String(projectType).trim() !==
        lead.projectType
    ) {
      activities.push(
        createActivity(
          "project",
          "Project type updated.",
          lead.projectType,
          String(projectType)
        )
      );

      lead.projectType =
        String(projectType).trim();
    }

    /* MESSAGE */

    if (message !== undefined) {
      lead.message = String(message).trim();
    }

    /* STATUS */

    if (
      status !== undefined &&
      ALLOWED_STATUS.includes(status) &&
      status !== lead.status
    ) {
      activities.push(
        createActivity(
          "status",
          `Status changed from ${lead.status} to ${status}.`,
          lead.status,
          status
        )
      );

      lead.status = status;
    }

    /* PRIORITY */

    if (
      priority !== undefined &&
      ALLOWED_PRIORITY.includes(priority) &&
      priority !== lead.priority
    ) {
      activities.push(
        createActivity(
          "priority",
          `Priority changed from ${lead.priority} to ${priority}.`,
          lead.priority,
          priority
        )
      );

      lead.priority = priority;
    }

    /* SOURCE */

    if (
      source !== undefined &&
      ALLOWED_SOURCE.includes(source) &&
      source !== lead.source
    ) {
      activities.push(
        createActivity(
          "source",
          `Lead source changed from ${lead.source} to ${source}.`,
          lead.source,
          source
        )
      );

      lead.source = source;
    }

    /* FOLLOW-UP */

    if (followUpDate !== undefined) {
      const oldDate = lead.followUpDate
        ? new Date(
            lead.followUpDate
          ).toISOString()
        : "";

      let newDate = null;

      if (followUpDate) {
        const parsed = new Date(
          followUpDate
        );

        if (
          Number.isNaN(parsed.getTime())
        ) {
          return res.status(400).json({
            message:
              "Invalid follow-up date.",
          });
        }

        newDate = parsed;
      }

      const newDateString = newDate
        ? newDate.toISOString()
        : "";

      if (oldDate !== newDateString) {
        activities.push(
          createActivity(
            "followup",
            newDate
              ? "Follow-up date scheduled."
              : "Follow-up date removed.",
            oldDate,
            newDateString
          )
        );
      }

      lead.followUpDate = newDate;
    }

    /* NOTES */

    if (
      notes !== undefined &&
      String(notes) !== lead.notes
    ) {
      activities.push(
        createActivity(
          "note",
          "Lead notes updated.",
          lead.notes,
          String(notes)
        )
      );

      lead.notes = String(notes).trim();
    }

    if (activities.length > 0) {
      lead.activities.push(
        ...activities
      );
    }

    await lead.save();

    return res.status(200).json({
      message: "Lead updated successfully.",
      lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return res.status(500).json({
      message: "Unable to update lead.",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE LEAD
========================================================= */

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(
      req.params.id
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    await Lead.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    return res.status(500).json({
      message: "Unable to delete lead.",
      error: error.message,
    });
  }
};

/* =========================================================
   ANALYTICS
========================================================= */

const getLeadAnalytics = async (
  req,
  res
) => {
  try {
    const leads = await Lead.find({});

    const total = leads.length;

    const statusStats = {
      New: 0,
      Contacted: 0,
      Closed: 0,
    };

    const priorityStats = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    const temperatureStats = {
      Hot: 0,
      Warm: 0,
      Cold: 0,
    };

    const sourceStats = {};
    const projectTypeStats = {};
    const budgetStats = {};

    let totalScore = 0;

    let overdueFollowUps = 0;
    let upcomingFollowUps = 0;
    let todayFollowUps = 0;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    leads.forEach((lead) => {
      /* STATUS */

      if (statusStats[lead.status] !== undefined) {
        statusStats[lead.status] += 1;
      }

      /* PRIORITY */

      if (
        priorityStats[lead.priority] !==
        undefined
      ) {
        priorityStats[lead.priority] += 1;
      }

      /* TEMPERATURE */

      const temperature =
        lead.leadTemperature;

      if (
        temperatureStats[temperature] !==
        undefined
      ) {
        temperatureStats[temperature] += 1;
      }

      /* SOURCE */

      const source =
        lead.source || "Other";

      sourceStats[source] =
        (sourceStats[source] || 0) + 1;

      /* PROJECT */

      const project =
        lead.projectType || "Other";

      projectTypeStats[project] =
        (projectTypeStats[project] || 0) +
        1;

      /* BUDGET */

      const budget =
        lead.budget || "Unknown";

      budgetStats[budget] =
        (budgetStats[budget] || 0) + 1;

      /* SCORE */

      totalScore += lead.leadScore;

      /* FOLLOW-UP */

      if (lead.followUpDate) {
        const followUp = new Date(
          lead.followUpDate
        );

        followUp.setHours(0, 0, 0, 0);

        if (followUp < today) {
          overdueFollowUps += 1;
        } else if (
          followUp.getTime() ===
          today.getTime()
        ) {
          todayFollowUps += 1;
        } else {
          upcomingFollowUps += 1;
        }
      }
    });

    const conversion =
      total > 0
        ? Math.round(
            (statusStats.Closed / total) *
              100
          )
        : 0;

    const averageLeadScore =
      total > 0
        ? Math.round(totalScore / total)
        : 0;

    const topProjectType =
      Object.entries(projectTypeStats).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "N/A";

    const topSource =
      Object.entries(sourceStats).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "N/A";

    return res.status(200).json({
      analytics: {
        total,
        conversion,

        statusStats,
        priorityStats,
        temperatureStats,

        sourceStats,
        projectTypeStats,
        budgetStats,

        followUps: {
          overdue: overdueFollowUps,
          today: todayFollowUps,
          upcoming: upcomingFollowUps,
          total:
            overdueFollowUps +
            todayFollowUps +
            upcomingFollowUps,
        },

        intelligence: {
          averageLeadScore,
          topProjectType,
          topSource,
          hotLeads:
            temperatureStats.Hot,
          warmLeads:
            temperatureStats.Warm,
          coldLeads:
            temperatureStats.Cold,
        },
      },
    });
  } catch (error) {
    console.error(
      "Lead analytics error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate lead analytics.",
      error: error.message,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadAnalytics,
}; 