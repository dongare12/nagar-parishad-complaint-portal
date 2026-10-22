
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/nagarparishad"
    );

    const username = "counciladmin";
    const password = "MyNewAdmin@2026";

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.findOneAndUpdate(
      { username: username },
      {
        $set: {
          username: username,
          password: hashedPassword
        }
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true
      }
    );

    console.log("Admin account created or updated!");
    console.log("Username:", admin.username);
    console.log("You can now try logging in.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
