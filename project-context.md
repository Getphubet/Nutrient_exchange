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
| Unsplash Access Key | 3jtUCCNAF83XN-EMs-UN3ct3NVwZENaqLgW_NQUf8dU (ไม่ได้ใช้แล้ว) |

---

## โครงสร้าง Project

```
Nutrient_exchange/
├── project-context.md   ← ไฟล์นี้
├── frontend/
│   ├── index.html       ← หน้าหลัก
│   └── plate.html       ← หน้าแสดงสัดส่วนจาน (SVG)
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

### /exchange-food body
```json
{ "foodName": "ข้าวขาวหุงสุก", "amount": 100, "nutrientType": "calories" }
```

### /add-food body
```json
{
  "password": "capstoneG24",
  "name": "ข้าวกล้องหุงสุก",
  "category": "คาร์โบไฮเดรต",
  "calories": 152, "carbs": 34, "protein": 2.8, "fat": 0.3
}
```

---

## .env (backend)
```
MONGODB_URI=mongodb+srv://getphubet2548_db_user:TpEYpNJAyPDWZYxH@cluster0.zbn2sxc.mongodb.net/?appName=Cluster0
NODE_ENV=development
PORT=8000
ADD_FOOD_PASSWORD=capstoneG24
```

## Vercel Environment Variables (backend)
- MONGODB_URI
- ADD_FOOD_PASSWORD

---

## Features ทั้งหมดใน index.html

### Tab 1: แลกเปลี่ยนอาหาร
- datalist ดึงจาก /foods
- เลือกปริมาณ + หน่วย (g, ช้อนชา 5g, ช้อนโต๊ะ 15g, ทัพพี 60g, ถ้วยตวง 240g)
- เลือก nutrient (calories, carbs, protein, fat)
- เลือกหน่วยแสดงผลได้หลายหน่วย
- แสดง % สัดส่วนจาน 600g พร้อม progress bar (สีเขียว/ส้ม/แดง)
- ปุ่ม "ดูรูปจานอาหาร" → เปิด plate.html (ส่งข้อมูลผ่าน localStorage)
- แต่ละ exchange item มีปุ่ม "ดูรูปจาน" เล็กๆ
- Search/filter รายการ

### Tab 2: เพิ่มอาหาร
- กรอกชื่อ, หมวด (คาร์โบไฮเดรต/โปรตีน/ไขมัน), สารอาหาร 4 ตัว
- กดเพิ่ม → popup modal ถามรหัสผ่าน
- ถ้ารหัสผิดขึ้น error ใน modal
- ถ้าถูกส่งไป /add-food แล้ว reload datalist

---

## plate.html (version ปัจจุบัน — SVG จาน)
- **ไม่ใช้ Unsplash แล้ว** (ทดลองแล้วรูปไม่สื่อปริมาณ)
- รับข้อมูลจาก localStorage key "plateData"
- แสดง SVG จานกลม sector ตามสัดส่วน % จริง
- สี: เขียว ≤75%, ส้ม 76-100%, แดง >100%
- แสดงตาราง: ชื่ออาหาร, ปริมาณ, จานมาตรฐาน, สัดส่วน, เหลือพื้นที่, สถานะ
- ปุ่มกลับหน้าหลัก → window.close()

---

## Logic สำคัญ

### calculator.js
```
baseNutrientValue = (baseFood[nutrientType] / 100) * amount
exchangeAmount = baseNutrientValue / (target[nutrientType] / 100)
sort จากน้อยไปมาก
```

### % สัดส่วนจาน
```
percent = (amountInGrams / 600) * 100
≤75%    → ok  → สีเขียว ✅
76-100% → warn → สีส้ม  🟡
>100%   → over → สีแดง  ⚠️
```

### การส่งข้อมูล index → plate
```javascript
// ใช้ localStorage เพราะ Vercel/serve ตัด query string
localStorage.setItem("plateData", JSON.stringify({ name, amount, percent }));
window.open("/plate.html", "_blank");
```

---

## วิธีรัน Local
```bash
# Backend
cd backend
node server.js       # localhost:8000

# Frontend
cd frontend
npx serve .          # localhost:3000
```

---

## สิ่งที่ทดลองแล้วไม่ใช้

### Unsplash API (ทดลองแล้วยกเลิก)
- ลอง integrate แล้วแต่รูปไม่สื่อปริมาณ
- 100g กับ 200g ดูเหมือนกัน
- ตัดสินใจกลับมาใช้ SVG จานแทน

### วิธีอื่นที่พิจารณาแล้วไม่ทำ
- ถ่ายรูปเอง → ต้องถ่ายหลายพันรูป ไม่ practical
- AI Image Generation → ค่า API สูง, รูปไม่แม่นยำ, อาหารไทยไม่ accurate

---

## แผนงานที่ยังค้างอยู่
- ทำ Poster A0 (Portrait) สำหรับนำเสนอโปรเจกต์ (รอข้อมูลจาก user)
- เขียนสคริปต์พรีเซนต์

---

## หมายเหตุสำหรับ Claude
- user เป็นนักศึกษา ทำโปรเจกต์ capstone
- ใช้ภาษาไทยตลอด
- โปรเจกต์ deploy บน Vercel ทั้ง frontend และ backend
- backend เป็น Express + MongoDB Atlas
- frontend เป็น HTML/CSS/JS ล้วน (ไม่มี framework)
- เวลาแก้โค้ดให้ทำไฟล์ใหม่มาให้เลย user ชอบแบบนั้น