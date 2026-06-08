const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  if (connected) return;
  if (mongoose.connection.readyState === 1) {
    connected = true;
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
  connected = true;
}

module.exports = { connectDB };
