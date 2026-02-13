const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  propertyId:String,
  createdAt:{
    type:Date,
    default:Date.now
  }
});

module.exports =
mongoose.model("Favorite", favoriteSchema);
