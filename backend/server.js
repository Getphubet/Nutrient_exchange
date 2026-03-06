const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Food = require("./models/Food");
const { calculateExchange } = require("./utils/calculator");

const app = express();

// --- [จุดที่ 1: Middleware] ---
app.use(cors());
app.use(express.json());

// --- [จุดที่ 2: การเชื่อมต่อ MongoDB] ---
// บน Vercel ห้ามใช้ localhost (127.0.0.1) เพราะมันไม่มีฐานข้อมูลในตัว 
// คุณต้องเปลี่ยนไปใช้ MongoDB Atlas (Cloud) และใส่ URL ใน Environment Variable
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nutrientDB_v2";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Connection Error:", err));

// --- [Routes เดิมของคุณ] ---
app.post("/exchange-food", async (req, res) => {
  try {
    const { foodName, amount, nutrientType } = req.body;
    if (!foodName || !amount || !nutrientType) {
      return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบ" });
    }

    const baseFood = await Food.findOne({ name: foodName });
    if (!baseFood) {
      return res.status(404).json({ message: "ไม่พบข้อมูลอาหารต้นแบบในระบบ" });
    }

    const targetFoods = await Food.find({
      category: baseFood.category,
      name: { $ne: foodName }
    });

    const exchangeResults = calculateExchange(baseFood, amount, nutrientType, targetFoods);

    res.json({
      success: true,
      original: {
        name: baseFood.name,
        category: baseFood.category,
        inputAmount: Number(amount.toFixed(2)),
        totalNutrient: Number(((baseFood[nutrientType] / 100) * amount).toFixed(2)),
        unit: "g",
        nutrientType: nutrientType
      },
      exchanges: exchangeResults
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

app.get("/foods", async (req, res) => {
    const foods = await Food.find();
    res.json(foods);
});

// --- [จุดที่ 3: ส่วนสำคัญสำหรับการ Deploy บน Vercel] ---

// 1. Export app ออกไปเพื่อให้ Vercel เรียกใช้งาน (Serverless Function)
module.exports = app;

// 2. รัน Listen เฉพาะตอนที่ทดสอบในเครื่องตัวเอง (Local)
if (process.env.NODE_ENV !== 'production') {
    const PORT = 8000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}