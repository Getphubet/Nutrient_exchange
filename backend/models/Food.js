const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
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
  // ปริมาตร (ml) ต่อ 100g — ใช้แปลงหน่วยช้อนชา/ช้อนโต๊ะ/ทัพพี/ถ้วยตวง
  // ถ้าไม่มีข้อมูล ให้ใช้ค่า default = 100 (สมมติ density = 1 g/ml เหมือนน้ำ)
  volume: {
    type: Number,
    default: 100
  },
  // คะแนนจาก user กด 👍 — ใช้เรียงอันดับในผลลัพธ์
  points: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Food", FoodSchema);