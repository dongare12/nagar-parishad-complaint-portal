
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    remarks: {
  type: String,
  default: ""
},

resolution: {
  type: String,
  default: ""
},

resolvedAt: {
  type: Date,
  default: null
},

updatedBy: {
  type: String,
  default: ""
},
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true
},
    category: {
      type: String,
      required: true,
      enum: [
        "Street Light",
        "Road",
        "Water Supply",
        "Garbage",
        "Drainage",
        "Other",
      ],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

     image: {
  url: { type: String, default: "" },
  filename: { type: String, default: "" }
},
    
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },

    afterImage: {
  url: {
    type: String,
    default: ""
  },
  filename: {
    type: String,
    default: ""
  }
},
  },
  { timestamps: true }
);


const Complaint = mongoose.model(
  "Complaint",
  complaintSchema,
  "complaints"
);

module.exports = Complaint;



