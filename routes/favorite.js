const express = require("express");
const router = express.Router();

const Favorite = require("../models/favorite");
const Property = require("../models/property");

/* SAVE FAVORITE */
router.post("/", async (req,res)=>{
  try{
    const fav = new Favorite(req.body);
    await fav.save();
    res.json({success:true});
  }catch(err){
    res.status(500).json({message:"Save failed"});
  }
});

/* GET FAVORITES WITH PROPERTY NAME */
router.get("/", async (req,res)=>{

  const favorites = await Favorite.find()
    .sort({createdAt:-1});

  const result = [];

  for(const f of favorites){

    const property =
      await Property.findById(f.propertyId);

    result.push({
      _id:f._id,
      propertyName:property?.title || "Unknown",
      propertyId:f.propertyId,
      createdAt:f.createdAt
    });
  }

  res.json(result);
});

/* DELETE */
router.delete("/:id", async(req,res)=>{
  await Favorite.findByIdAndDelete(req.params.id);
  res.json({success:true});
});

module.exports = router;
