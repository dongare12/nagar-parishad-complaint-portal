const multer = require("multer");
const fs = require("fs");
const express = require("express");
const app = express();




const { sendComplaintEmail } = require("./emailService");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "intropage.html")
    );
});
app.use(express.static(path.join(__dirname, "public")));
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET || "nagar-parishad-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 1000
  }
}));

const Admin = require("./models/Admin");

const Complaint = require("./module/cpmldata");

//  upload image 

const uploadDir = path.join(__dirname, "uploads");

// Create uploads folder automatically
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG, and WebP images are allowed."));
  }
});

app.use("/uploads", express.static(uploadDir));




// Serve frontend CSS and JavaScript files
app.use(express.static(
    path.join(__dirname, "../public")
));

// Open the introduction page at the home URL
app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../public/intropage.html"
        )
    );
});





app.post("/complaints", (req, res) => {
  upload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }

    try {
      const newComplaint = new Complaint({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        category: req.body.category,
        location: req.body.location,
        description: req.body.description,
        image: req.file
          ? {
              url: "/uploads/" + req.file.filename,
              filename: req.file.filename
            }
          : undefined
      });

      await newComplaint.save();

      try {
  await sendComplaintEmail({
    email: newComplaint.email,
    name: newComplaint.name,
    complaintId: newComplaint._id.toString(),
    category: newComplaint.category
  });

  console.log("Confirmation email sent successfully");
} catch (emailError) {
  console.error("Email sending failed:", emailError.message);
}

      res.status(201).json({
        success: true,
        message: "Complaint registered successfully!",
        complaint: newComplaint
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });
});





require("dotenv").config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to local MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

main();

// Register a new complaint
app.post("/complaints", async (req, res) => {

  try {
    const newComplaint = new Complaint({
      name: req.body.name,
      phone: req.body.phone,
      category: req.body.category,
      location: req.body.location,
      description: req.body.description
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully!",
      complaint: newComplaint
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter username and password."
      });
    }

    const admin = await Admin.findOne({
      username: username.trim()
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    req.session.adminId = admin._id.toString();

    req.session.save((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Could not create login session."
        });
      }

      return res.json({
        success: true,
        message: "Login successful."
      });
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
});

// Get all complaints
app.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});




app.post("/complaints/track", async (req, res) => {
  try {
    const { complaintId, phone } = req.body;

    if (!complaintId || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please enter complaint ID and phone number."
      });
    }

    if (!mongoose.isValidObjectId(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID."
      });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      phone: phone.trim()
    }).select(
      "category status location remarks resolution updatedAt image afterImage"
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found. Check your complaint ID and phone number."
      });
    }

    const isResolved = complaint.status === "Resolved";

    return res.status(200).json({
      success: true,
      complaint: {
        complaintId: complaint._id.toString(),
        category: complaint.category,
        status: complaint.status,
        location: complaint.location,
        remarks: complaint.remarks || "",
        resolution: complaint.resolution || "",
        updatedAt: complaint.updatedAt,

        // Return photos only for resolved complaints
        image: isResolved ? complaint.image || null : null,
        afterImage: isResolved ? complaint.afterImage || null : null
      }
    });

  } catch (error) {
    console.error("Track complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to track complaint. Please try again."
    });
  }
});



app.patch("/complaints/:id/status", (req, res) => {
  // Accept an optional after-resolution image
  upload.single("afterImage")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }

    try {
      console.log("Uploaded file:", req.file);
      const { status, remarks, resolution } = req.body;

      const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Rejected"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint status."
        });
      }

      if (
        status === "Resolved" &&
        (!resolution || resolution.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter resolution details."
        });
      }

      const updateData = {
        status,
        remarks:
          typeof remarks === "string" ? remarks.trim() : undefined,
        resolution:
          typeof resolution === "string" ? resolution.trim() : undefined
      };

      if (status === "Resolved") {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }

      // Save the after-resolution image separately.
      if (req.file) {
        updateData.afterImage = {
          url: "/uploads/" + req.file.filename,
          filename: req.file.filename
        };
      }

      // Remove undefined fields so existing values aren't overwritten.
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        {
          new: true,
          runValidators: true
        }
      );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Complaint updated successfully!",
        complaint
      });
    } catch (error) {
      console.error("Update complaint error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });
});






// for delete the complaint 

app.delete("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found."
      });
    }

    res.json({
      success: true,
      message: "Complaint deleted successfully!"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
// app.listen("8080",() => {
//     console.log("server is listening to port 8080 ");
// });