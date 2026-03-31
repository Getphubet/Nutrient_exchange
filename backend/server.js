const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Food = require("./models/Food");
const { calculateExchange } = require("./utils/calculator");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nutrientDB_v2";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Connection Error:", err));

app.get('/', (req, res) => res.send("Welcome to Nutrient_exchange!"));

// ✅ รายการ nutrientType ที่อนุญาต
const ALLOWED_NUTRIENT_TYPES = ["calories", "carbs", "protein", "fat"];

app.post("/exchange-food", async (req, res) => {
  try {
    const { foodName, amount, nutrientType } = req.body;

    // ✅ เช็คว่าข้อมูลครบ
    if (!foodName || !amount || !nutrientType) {
      return res.status(400).json({ success: false, message: "กรุณาระบุข้อมูลให้ครบ" });
    }

    // ✅ validate nutrientType ป้องกัน NaN
    if (!ALLOWED_NUTRIENT_TYPES.includes(nutrientType)) {
      return res.status(400).json({ success: false, message: "nutrientType ไม่ถูกต้อง" });
    }

    const baseFood = await Food.findOne({ name: foodName }).lean();

    // ✅ เพิ่ม success: false ใน error response
    if (!baseFood) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลอาหารต้นแบบ" });
    }

    const targetFoods = await Food.find({
      category: baseFood.category,
      name: { $ne: foodName }
    }).lean();

    const exchangeResults = calculateExchange(baseFood, amount, nutrientType, targetFoods);

    const enrichedExchanges = exchangeResults.map(result => {
      const foodDetail = targetFoods.find(f => f.name === result.name);
      if (!foodDetail) return result;

      const ratio = Number(result.amount) / 100;
      return {
        ...result,
        calories: Number((Number(foodDetail.calories || 0) * ratio).toFixed(1)),
        carbs:    Number((Number(foodDetail.carbs    || 0) * ratio).toFixed(1)),
        protein:  Number((Number(foodDetail.protein  || 0) * ratio).toFixed(1)),
        fat:      Number((Number(foodDetail.fat      || 0) * ratio).toFixed(1))
      };
    });

    res.json({
      success: true,
      original: {
        name:          baseFood.name,
        category:      baseFood.category,
        inputAmount:   Number(amount),
        totalNutrient: Number(((baseFood[nutrientType] / 100) * amount).toFixed(2)),
        nutrientType:  nutrientType
      },
      exchanges: enrichedExchanges
    });

  } catch (error) {
    console.error("Server Error:", error);
    // ✅ เพิ่ม success: false ใน 500 error ด้วย
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

app.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().lean();
    res.json(foods);
  } catch (error) {
    // ✅ เพิ่ม error handling ให้ /foods ด้วย
    res.status(500).json({ success: false, message: "โหลดข้อมูลอาหารไม่สำเร็จ" });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(8000, () => console.log(`Server running on http://localhost:8000`));
}