# PROJECT_CONTEXT.md
## ระบบแลกเปลี่ยนอาหาร (Nutrient Exchange System)

---

## ข้อมูล Deployment

| ส่วน | URL |
|------|-----|
| Frontend | https://nutrient-exchange-front.vercel.app |
| Backend  | https://nutrient-exchange.vercel.app |
| MongoDB  | mongodb+srv://getphubet2548_db_user:TpEYpNJAyPDWZYxH@cluster0.zbn2sxc.mongodb.net/?appName=Cluster0 |

---

## ข้อมูล Credentials

| ชื่อ | ค่า |
|------|-----|
| ADD_FOOD_PASSWORD | capstoneG24 |
| Unsplash Access Key | 3jtUCCNAF83XN-EMs-UN3ct3NVwZENaqLgW_NQUf8dU |

---

## โครงสร้าง Project

```
Nutrient_exchange/
├── frontend/
│   ├── index.html      ← หน้าหลัก (แลกเปลี่ยน + เพิ่มอาหาร)
│   └── plate.html      ← หน้าแสดงรูปอาหาร + สัดส่วนจาน
└── backend/
    ├── server.js        ← Express server
    ├── utils/
    │   └── calculator.js ← คำนวณการแลกเปลี่ยน
    ├── models/
    │   └── Food.js      ← MongoDB model
    ├── vercel.json      ← config สำหรับ deploy บน Vercel
    └── .env             ← environment variables (ไม่ push ขึ้น GitHub)
```

---

## Backend API Endpoints

| Method | Path | หน้าที่ |
|--------|------|---------|
| GET  | /foods | ดึงรายการอาหารทั้งหมด |
| POST | /exchange-food | คำนวณการแลกเปลี่ยนอาหาร |
| POST | /add-food | เพิ่มอาหารใหม่ (ต้องใช้รหัสผ่าน) |

### Request body ของ /exchange-food
```json
{
  "foodName": "ข้าวขาวหุงสุก",
  "amount": 100,
  "nutrientType": "calories"
}
```

### Request body ของ /add-food
```json
{
  "password": "capstoneG24",
  "name": "ข้าวกล้องหุงสุก",
  "category": "คาร์โบไฮเดรต",
  "calories": 152,
  "carbs": 34,
  "protein": 2.8,
  "fat": 0.3
}
```

---

## Frontend Features

### index.html
- **Tab 1: แลกเปลี่ยนอาหาร**
  - เลือกอาหารต้นแบบ (datalist จาก /foods)
  - กรอกปริมาณ + เลือกหน่วย (g, ช้อนชา, ช้อนโต๊ะ, ทัพพี, ถ้วยตวง)
  - เลือก nutrient ที่ต้องการแลกเปลี่ยน (calories, carbs, protein, fat)
  - เลือกหน่วยที่ต้องการแสดงผล (เลือกได้หลายหน่วย)
  - แสดง % สัดส่วนจาน (จาน 600g มาตรฐานนักโภชนาการ) พร้อม progress bar
  - แต่ละ exchange item มีปุ่ม "ดูรูปจาน" → เปิด plate.html
  - Search/filter รายการแลกเปลี่ยน

- **Tab 2: เพิ่มอาหาร**
  - กรอกชื่อ, หมวด (คาร์บ/โปรตีน/ไขมัน), สารอาหาร 4 ตัว
  - กดเพิ่ม → popup ถามรหัสผ่าน → ส่งไป backend

### plate.html
- รับข้อมูลจาก localStorage (key: "plateData")
- แสดงรูปอาหารจริงจาก Unsplash API (keyword mapping ไทย→อังกฤษ)
- แสดง progress bar % ของจาน
- แสดงตารางข้อมูล (ชื่อ, ปริมาณ, สัดส่วน, เหลือพื้นที่, สถานะ)

---

## Logic สำคัญ

### การแลกเปลี่ยนอาหาร (calculator.js)
```
baseNutrientValue = (baseFood[nutrientType] / 100) * amount
exchangeAmount = baseNutrientValue / (target[nutrientType] / 100)
```
เรียงผลลัพธ์จากน้อยไปมาก

### % สัดส่วนจาน
```
percent = (amountInGrams / 600) * 100
≤75%  → สีเขียว ✅ พอดี
76-100% → สีส้ม 🟡 ใกล้เต็ม
>100% → สีแดง ⚠️ เกินจาน
```

### การส่งข้อมูลไป plate.html
ใช้ localStorage แทน URL parameter เพราะ Vercel serve ตัด query string
```javascript
localStorage.setItem("plateData", JSON.stringify({ name, amount, percent }));
window.open("/plate.html", "_blank");
```

### Unsplash keyword mapping
ชื่ออาหารไทย → ค้นหาเป็นภาษาอังกฤษ
เช่น "ข้าว" → "steamed white rice bowl"
เรียงจาก keyword ยาวไปสั้นเพื่อให้ได้คำที่ specific กว่าก่อน

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

## สิ่งที่แก้ไขตลอดบทสนทนา

1. แก้ backend_uri ให้ชี้ถูก
2. เพิ่ม success: false ใน error response ทุกตัว
3. เพิ่ม validate nutrientType
4. เพิ่ม sort ผลลัพธ์ใน calculator.js
5. เพิ่ม error handling ใน /foods
6. เพิ่ม tab เพิ่มอาหาร + modal รหัสผ่าน
7. เพิ่ม % สัดส่วนจาน + progress bar
8. เพิ่มปุ่มดูรูปจานในทุก item
9. เพิ่ม search/filter รายการ
10. เพิ่มรูปอาหารจริงจาก Unsplash ใน plate.html
11. แก้การส่งข้อมูลจาก URL parameter → localStorage

---

## วิธีรัน Local
```bash
# Backend
cd backend
node server.js  # รันที่ localhost:8000

# Frontend
cd frontend
npx serve .     # รันที่ localhost:3000
```

---
*สร้างเมื่อ April 2026 — ใช้วาง context ให้ Claude ในแชทใหม่*