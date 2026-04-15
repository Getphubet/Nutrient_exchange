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
├── project-context.md   ← ไฟล์นี้
├── frontend/
│   └── index.html       ← หน้าหลัก (plate.html ถูกลบออกแล้ว)
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
หมายเหตุ: `amount` เป็นกรัมเสมอ frontend แปลงหน่วยก่อนส่ง

### /add-food body
```json
{
  "password": "capstoneG24",
  "name": "ข้าวกล้องหุงสุก",
  "category": "คาร์โบไฮเดรต",
  "calories": 152, "carbs": 34, "protein": 2.8, "fat": 0.3,
  "volume": 163
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
  name:     String,   // ชื่ออาหาร
  category: String,   // คาร์โบไฮเดรต / โปรตีน / ไขมัน
  calories: Number,   // kcal ต่อ 100g
  carbs:    Number,   // g ต่อ 100g
  protein:  Number,   // g ต่อ 100g
  fat:      Number,   // g ต่อ 100g
  volume:   Number,   // ml ต่อ 100g (default 100) ← ใหม่
  points:   Number,   // คะแนน rating (default 0) ← ใหม่
}
```

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

**การเรียงลำดับ:** points มากขึ้นก่อน → ถ้า points เท่ากันเรียงตามชื่อ (localeCompare th)

### การแปลงหน่วย (frontend)
```
ช้อนชา  = 5 ml
ช้อนโต๊ะ = 15 ml
ทัพพี   = 60 ml
ถ้วยตวง = 240 ml

// แปลง ml-based unit → กรัม
mlInput = amountRaw * unitToML[inputUnit]
amountInGrams = (mlInput / food.volume) * 100
```

### volumeRatio และรูปชาม
- `volumeRatio` = ปริมาตรของอาหารที่แลกได้ หารด้วย ปริมาตรต้นแบบ
- แสดงเป็นรูปชามข้าว SVG จำนวนชามตาม ratio เช่น 2.5x = ชามเต็ม 2 + ชามครึ่ง 1
- ชามทรงปากกว้าง โค้งด้วย quadratic bezier มีฐานสี่เหลี่ยมเตี้ย
- ระดับอาหารในชามใช้ physics จริง (width ไม่ linear ตามความสูง)
- สีชาม: เขียว (ratio ≤ 1.5x), ส้ม (ratio > 1.5x), ฟ้า (ratio < 0.7x)

---

## Features ใน index.html

### Tab 1: แลกเปลี่ยนอาหาร
- datalist ดึงจาก /foods
- ค่า default: 100 กรัม
- เลือกปริมาณ + หน่วย (g, ช้อนชา 5ml, ช้อนโต๊ะ 15ml, ทัพพี 60ml, ถ้วยตวง 240ml)
- เลือก nutrient (calories, carbs, protein, fat)
- เลือกหน่วยแสดงผลได้หลายหน่วย (default: กรัม)
- แสดงรูปชาม SVG ตาม volumeRatio
- ปุ่ม 👍 👎 rating พร้อมแสดงคะแนน (toggle กัน)

### Tab 2: เพิ่มอาหาร
- กรอกชื่อ, หมวด, สารอาหาร 4 ตัว, **volume (ml/100g)**
- กดเพิ่ม → popup modal ถามรหัสผ่าน

---

## Rating System
- กด 👍 → POST /rate-food → points +1
- กด 👎 → POST /unrate-food → points -1 (ติดลบได้ ไม่มีขีดจำกัด)
- กดปุ่มใดปุ่มหนึ่ง อีกปุ่มจะ reset สีกลับ (toggle)
- อาหารที่ points มากจะแสดงขึ้นก่อนในผลลัพธ์

---

## วิธีรัน Local
```bash
# Backend
cd backend
node server.js       # localhost:8000

# Frontend
เปิดผ่าน Live Server ใน VS Code (localhost หรือ 127.0.0.1)
```

### การตรวจสอบ backend_uri (frontend)
```javascript
var _host = window.location.hostname;
var backend_uri = (_host === "localhost" || _host === "127.0.0.1")
    ? "http://localhost:8000"
    : "https://nutrient-exchange.vercel.app";
```

---

## สิ่งที่ทำแล้ว (April 2026)
- เพิ่ม `volume` และ `points` field ใน Food schema
- แก้ calculator.js คำนวณ volumeRatio และเรียงตาม points
- เพิ่ม `/rate-food` และ `/unrate-food` endpoint
- แก้ `/add-food` รับ volume ด้วย
- ลบ plate.html ออก ไม่ใช้แล้ว
- เปลี่ยน UI แสดงชาม SVG แทนจาน
- ระบบ rating 👍 👎 toggle กัน

---

## แผนงานที่ยังค้างอยู่
- ทำ Poster A0 (Portrait) สำหรับนำเสนอโปรเจกต์
- เขียนสคริปต์พรีเซนต์

---

## หมายเหตุสำหรับ Claude
- user เป็นนักศึกษา ทำโปรเจกต์ capstone
- ใช้ภาษาไทยตลอด
- โปรเจกต์ deploy บน Vercel ทั้ง frontend และ backend
- backend เป็น Express + MongoDB Atlas
- frontend เป็น HTML/CSS/JS ล้วน (ไม่มี framework)
- เวลาแก้โค้ดให้ทำไฟล์ใหม่มาให้เลย user ชอบแบบนั้น
- อย่าลืมว่า plate.html ถูกลบออกแล้ว ไม่มีในโปรเจกต์