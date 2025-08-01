const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/practiceApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ Connected to MongoDB");
})
.catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});


const paymentSchema = new mongoose.Schema({
  amount: Number,
  description: String,
  date: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: Number,
  payments: {
    type: [paymentSchema],
    default: [], // ✅ Ensure default is an empty array
  }
});

module.exports = mongoose.model("User", userSchema);
