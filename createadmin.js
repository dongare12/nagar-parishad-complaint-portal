
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");




async function createAdmin() {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/nagarparishad"
    );

    // Change these to your preferred credentials
    const username = "counciladmin";
    const password = "MyNewAdmin@2026";

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.findOneAndUpdate(
      {},
      {
        username,
        password: hashedPassword
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    console.log("Admin credentials saved successfully.");
    console.log("Username:", username);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
