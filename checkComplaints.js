
const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/nagarparishad";

async function checkComplaints() {
  try {
    await mongoose.connect(MONGO_URL);

    console.log("Connected host:", mongoose.connection.host);
    console.log("Connected port:", mongoose.connection.port);
    console.log("Connected database:", mongoose.connection.name);

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();

    console.log(
      "Collections:",
      collections.map((collection) => collection.name)
    );

    const names = collections.map((collection) => collection.name);

    if (names.includes("complaints")) {
      const count = await db.collection("complaints").countDocuments();
      console.log("Raw complaints collection count:", count);

      const sample = await db.collection("complaints").findOne();
      console.log("One existing record:", sample);
    } else {
      console.log("No collection named complaints in this database.");
    }
  } catch (error) {
    console.error("Diagnostic error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkComplaints();
