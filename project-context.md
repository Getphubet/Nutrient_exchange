# project-context.md
## ระบบแลกเปลี่ยนอาหาร (Nutrient Exchange System)
*อัปเดตล่าสุด: April 2026*

---

## ข้อมูล Deployment

| ส่วน | URL |
|------|-----|
| Frontend | https://nutrient-exchange-front.vercel.app |
| Backend  | https://nutrient-exchange.vercel.app |
| MongoDB  | mongodb+srv://getphubet2548_db_user:TpEYpNJAyPDWZYxH@cluster0.zbn2sxc.mongodb.net/?appName=Cluster0 |

---

## Credentials

| ชื่อ | ค่า |
|------|-----|
| ADD_FOOD_PASSWORD | capstoneG24 |

---

## โครงสร้าง Project

```
Nutrient_exchange/
├── project-context.md
├── frontend/
│   └── index.html
└── backend/
    ├── server.js
    ├── utils/
    │   └── calculator.js
    ├── models/
    │   └── Food.js
    ├── vercel.json
    └── .env
```

---

## Backend API

| Method | Path | หน้าที่ |
|--------|------|---------|
| GET  | /foods | ดึงรายการอาหารทั้งหมด |
| POST | /exchange-food | คำนวณการแลกเปลี่ยน |
| POST | /add-food | เพิ่มอาหาร (ต้องใช้รหัสผ่าน) |
| POST | /rate-food | กด 👍 +1 point |
| POST | /unrate-food | กด 👎 -1 point (ติดลบได้) |

### /exchange-food body
```json
{ "foodName": "ข้าวขาวหุงสุก", "amount": 100, "nutrientType": "calories" }
```
`amount` เป็นกรัมเสมอ frontend แปลงหน่วยก่อนส่ง

### /add-food body
```json
{
  "password": "capstoneG24",
  "name": "ไก่อกสุก",
  "category": "โปรตีน",
  "sub_category": "ไม่มีไขมัน",
  "calories": 165, "carbs": 0, "protein": 31, "fat": 3.6,
  "volume": 100
}
```

### /rate-food และ /unrate-food body
```json
{ "foodName": "ข้าวขาวหุงสุก" }
```

---

## .env (backend)
```
MONGODB_URI=mongodb+srv://getphubet2548_db_user:TpEYpNJAyPDWZYxH@cluster0.zbn2sxc.mongodb.net/?appName=Cluster0
NODE_ENV=development
PORT=8000
ADD_FOOD_PASSWORD=capstoneG24
```

---

## Food Schema (MongoDB)

```javascript
{
  name:         String,   // ชื่ออาหาร
  category:     String,   // คาร์โบไฮเดรต / โปรตีน / ไขมัน / นม / ผลไม้
  sub_category: String,   // ดูตารางด้านล่าง (default "-")
  calories:     Number,   // kcal ต่อ 100g
  carbs:        Number,   // g ต่อ 100g
  protein:      Number,   // g ต่อ 100g
  fat:          Number,   // g ต่อ 100g
  volume:       Number,   // ml ต่อ 100g (default 100)
  points:       Number,   // คะแนน rating (default 0)
}
```

### sub_category ที่ใช้

| category | sub_category |
|----------|-------------|
| โปรตีน | ไม่มีไขมัน / ไขมันน้อย / ไขมันปานกลาง / ไขมันสูง |
| นม | ไขมันธรรมดา / พร่องไขมัน / ขาดมันเนย |
| คาร์โบไฮเดรต, ไขมัน, ผลไม้ | - |

อ้างอิงจาก: รายการอาหารแลกเปลี่ยน โรงพยาบาลธัญญารักษ์ปัตตานี (American Dietetic Association / American Diabetes Association)

---

## Logic สำคัญ

### calculator.js
```
baseNutrientValue = (baseFood[nutrientType] / 100) * amount
exchangeGrams = baseNutrientValue / (target[nutrientType] / 100)
baseVolumeML = (baseFood.volume / 100) * amount
targetVolumeML = (target.volume / 100) * exchangeGrams
volumeRatio = targetVolumeML / baseVolumeML
```
เรียงลำดับ: points มากขึ้นก่อน → ถ้าเท่ากันเรียงตามชื่อ (localeCompare th)

### การแปลงหน่วย (frontend)
```
ช้อนชา  = 5 ml
ช้อนโต๊ะ = 15 ml
ทัพพี   = 60 ml
ถ้วยตวง = 240 ml

amountInGrams = (amountRaw * unitToML[unit] / food.volume) * 100
```

### Lock nutrient ตาม category
```javascript
var ALLOWED_NUTRIENTS = {
    "คาร์โบไฮเดรต": ["calories", "carbs"],
    "โปรตีน":        ["calories", "protein"],
    "ไขมัน":         ["calories", "fat"],
    "นม":            ["calories"],
    "ผลไม้":         ["calories"]
};
```
nutrient ที่ไม่อยู่ใน allowed จะ disabled (สีเทา กดไม่ได้)

### volumeRatio และรูปชาม
- แสดงชามข้าว SVG จำนวนตาม ratio (2.5x = ชามเต็ม 2 + ครึ่ง 1)
- ขอบชามสีดำ (`#1a1a1a`) ฐานสีเขียวอ่อน (`#d0ead8`)
- ระดับอาหารใช้ physics จริง (width ไม่ linear)
- padding: `PX=10`, `PT=4`
- **สีชามตาม category:**
  - 🔵 `#42a5f5` → คาร์โบไฮเดรต
  - 🔴 `#ef5350` → โปรตีน
  - 🟡 `#ffca28` → ไขมัน
  - 🟣 `#ab47bc` → นม
  - 🟠 `#ff7043` → ผลไม้

### sub_category tag สี
| sub_category | class | สี |
|---|---|---|
| ไม่มีไขมัน | fat-none | น้ำเงินอ่อน |
| ไขมันน้อย | fat-low | เขียวอ่อน |
| ไขมันปานกลาง | fat-mid | ส้ม |
| ไขมันสูง | fat-high | แดง |
| ไขมันธรรมดา | milk-full | เหลือง |
| พร่องไขมัน | milk-low | ม่วงอ่อน |
| ขาดมันเนย | milk-skim | น้ำเงินเข้ม |

---

## Features ใน index.html

### Tab 1: แลกเปลี่ยนอาหาร
- datalist ดึงจาก /foods
- ค่า default: 100 กรัม
- เลือกปริมาณ + หน่วย (g, ช้อนชา, ช้อนโต๊ะ, ทัพพี, ถ้วยตวง)
- **preview หมวด + tag sub_category** ทันทีที่เลือกอาหาร (ก่อนกดคำนวณ)
- **lock nutrient dropdown** ตาม category อัตโนมัติ
- **filter sub_category chips** แสดงเฉพาะโปรตีนและนม
- แสดงรูปชาม SVG ตาม volumeRatio สีตาม category
- **tag sub_category** บนชื่ออาหารแต่ละอัน
- ปุ่ม 👍 👎 rating toggle กัน
- ปุ่ม "+ ลงรายการ"

### Tab 2: รายการอาหาร 🧺 ⚠️ optional
- เพิ่มอาหาร 2 ทาง: กด "+ ลงรายการ" หรือเลือกเองใน tab
- สรุป calories/carbs/protein/fat รวม
- เก็บใน memory เท่านั้น (หายเมื่อ refresh)

### Tab 3: เพิ่มอาหาร
- dropdown category มี 5 หมวด: คาร์โบไฮเดรต / โปรตีน / ไขมัน / นม / ผลไม้
- dropdown sub_category จะปรากฏเฉพาะเมื่อเลือกโปรตีนหรือนม
- กรอก volume (ml/100g)

---

## Rating System
- กด 👍 → +1 point, กด 👎 → -1 point (ติดลบได้)
- toggle กัน — กดปุ่มใด อีกปุ่มจะ reset
- points มาก → แสดงก่อน

---

## วิธีรัน Local
```bash
cd backend && node server.js   # localhost:8000
# เปิด frontend ผ่าน Live Server ใน VS Code
```

```javascript
var _host = window.location.hostname;
var backend_uri = (_host === "localhost" || _host === "127.0.0.1")
    ? "http://localhost:8000"
    : "https://nutrient-exchange.vercel.app";
```

---

## สิ่งที่ทำแล้ว (April 2026)

### อาจารย์ขอ
- เพิ่ม `volume`, `points`, `sub_category` field ใน Food schema
- calculator.js คำนวณ volumeRatio เรียงตาม points
- `/rate-food`, `/unrate-food`, `/add-food` รับ sub_category
- ลบ plate.html ออก
- ชาม SVG สีตาม category ขอบดำ
- Lock nutrient ตาม category
- Filter sub_category (โปรตีน 4 แบบ, นม 3 แบบ)
- Preview tag ก่อนกดคำนวณ
- หมวดใหม่: นม, ผลไม้

### Optional (อาจารย์ไม่ได้ขอ)
- Tab รายการอาหาร 🧺 — ตะกร้า สรุป macronutrient เก็บใน memory

---

## แผนงานที่ยังค้างอยู่
- Poster A0 (Portrait)
- สคริปต์พรีเซนต์

---

## หมายเหตุสำหรับ Claude
- user เป็นนักศึกษา capstone ใช้ภาษาไทยตลอด
- backend: Express + MongoDB Atlas, frontend: HTML/CSS/JS ล้วน
- เวลาแก้โค้ดทำไฟล์ใหม่ให้เลย
- plate.html ถูกลบแล้ว
- Tab รายการอาหาร เป็น optional
- window._allFoods = cache ข้อมูลอาหารทั้งหมด
- categoryColor() แปลง category → hex
- subcatTagClass() แปลง sub_category → CSS class
- ALLOWED_NUTRIENTS กำหนด nutrient ที่ lock ตาม category