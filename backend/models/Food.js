const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
    // คาร์โบไฮเดรต / โปรตีน / ไขมัน / นม / ผลไม้
  },
  sub_category: {
    type: String,
    default: "-"
    // โปรตีน: ไม่มีไขมัน / ไขมันน้อย / ไขมันปานกลาง / ไขมันสูง
    // นม: ไขมันธรรมดา / พร่องไขมัน / ขาดมันเนย / ไขมันสูง
    // อื่นๆ: -
  },
  carbs: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 100
  },
  points: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Food", FoodSchema);