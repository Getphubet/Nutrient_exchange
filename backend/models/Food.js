const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: {
  type : String,
  required:true
  },
  category: {
  type:String,
  required:true
  },
  carbs: {
  type:Number,
  required:true
  },
  protein: {
  type:Number,
  required:true
  },
  fat: {
  type:Number,
  required:true
  },
  calories: {
  type:Number,
  required:true
  },
});

module.exports = mongoose.model("Food", FoodSchema);