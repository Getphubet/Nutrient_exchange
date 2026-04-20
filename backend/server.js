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

const ALLOWED_NUTRIENT_TYPES = ["calories", "carbs", "protein", "fat"];

// ─────────────────────────────────────────
// GET /foods — ดึงรายการอาหารทั้งหมด
// ─────────────────────────────────────────
app.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().lean();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ success: false, message: "โหลดข้อมูลอาหารไม่สำเร็จ" });
  }
});

// ─────────────────────────────────────────
// POST /exchange-food — คำนวณการแลกเปลี่ยน
// ─────────────────────────────────────────
app.post("/exchange-food", async (req, res) => {
  try {
    const { foodName, amount, nutrientType } = req.body;

    if (!foodName || !amount || !nutrientType) {
      return res.status(400).json({ success: false, message: "กรุณาระบุข้อมูลให้ครบ" });
    }
    if (!ALLOWED_NUTRIENT_TYPES.includes(nutrientType)) {
      return res.status(400).json({ success: false, message: "nutrientType ไม่ถูกต้อง" });
    }

    const baseFood = await Food.findOne({ name: foodName }).lean();
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
        calories:     Number((Number(foodDetail.calories     || 0) * ratio).toFixed(1)),
        carbs:        Number((Number(foodDetail.carbs        || 0) * ratio).toFixed(1)),
        protein:      Number((Number(foodDetail.protein      || 0) * ratio).toFixed(1)),
        fat:          Number((Number(foodDetail.fat          || 0) * ratio).toFixed(1)),
        sub_category: foodDetail.sub_category || "-"
      };
    });

    const baseVolumePer100g = Number(baseFood.volume) || 100;
    const baseVolumeML      = (baseVolumePer100g / 100) * amount;

    res.json({
      success: true,
      original: {
        name:          baseFood.name,
        category:      baseFood.category,
        sub_category:  baseFood.sub_category || "-",
        inputAmount:   Number(amount),
        totalNutrient: Number(((baseFood[nutrientType] / 100) * amount).toFixed(2)),
        nutrientType:  nutrientType,
        volumeML:      Number(baseVolumeML.toFixed(2))
      },
      exchanges: enrichedExchanges
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

// ─────────────────────────────────────────
// POST /add-food — เพิ่มอาหาร (ต้องใช้รหัสผ่าน)
// ─────────────────────────────────────────
app.post("/add-food", async (req, res) => {
  try {
    const { password, name, category, sub_category, calories, carbs, protein, fat, volume } = req.body;

    if (password !== process.env.ADD_FOOD_PASSWORD) {
      return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
    }

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "กรุณากรอกชื่อและหมวดหมู่" });
    }

    const existing = await Food.findOne({ name: name.trim() }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: "มีอาหารชื่อนี้ในฐานข้อมูลแล้ว" });
    }

    const newFood = new Food({
      name:         name.trim(),
      category:     category.trim(),
      sub_category: sub_category ? sub_category.trim() : "-",
      calories:     Number(calories) || 0,
      carbs:        Number(carbs)    || 0,
      protein:      Number(protein)  || 0,
      fat:          Number(fat)      || 0,
      volume:       Number(volume)   || 100,
      points:       0
    });

    await newFood.save();
    res.json({ success: true, message: "เพิ่มอาหารสำเร็จ", food: newFood });

  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

// ─────────────────────────────────────────
// POST /rate-food — กด 👍 +1 คะแนน
// ─────────────────────────────────────────
app.post("/rate-food", async (req, res) => {
  try {
    const { foodName } = req.body;
    if (!foodName) {
      return res.status(400).json({ success: false, message: "กรุณาระบุชื่ออาหาร" });
    }
    const food = await Food.findOneAndUpdate(
      { name: foodName },
      { $inc: { points: 1 } },
      { new: true }
    );
    if (!food) {
      return res.status(404).json({ success: false, message: "ไม่พบอาหารนี้ในฐานข้อมูล" });
    }
    res.json({ success: true, foodName: food.name, points: food.points });
  } catch (error) {
    console.error("Rate Food Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

// ─────────────────────────────────────────
// POST /unrate-food — กด 👎 -1 คะแนน
// ─────────────────────────────────────────
app.post("/unrate-food", async (req, res) => {
  try {
    const { foodName } = req.body;
    if (!foodName) {
      return res.status(400).json({ success: false, message: "กรุณาระบุชื่ออาหาร" });
    }
    const food = await Food.findOneAndUpdate(
      { name: foodName },
      { $inc: { points: -1 } },
      { new: true }
    );
    if (!food) {
      return res.status(404).json({ success: false, message: "ไม่พบอาหารนี้ในฐานข้อมูล" });
    }
    res.json({ success: true, foodName: food.name, points: food.points });
  } catch (error) {
    console.error("Unrate Food Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(8000, () => console.log(`Server running on http://localhost:8000`));
}