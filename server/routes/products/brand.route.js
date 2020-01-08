const express = require('express');
const isEmpty = require("../../utils/is-empty");
const BrandController = require('../../controllers/brand.controller');
const Brand = require('../../models/brand.model');
var mongodb = require("mongodb");
const router = express.Router();
const { upload, S3Upload } = require("../../utils/image-upload");
const authorizePrivilege = require("../../middleware/authorizationMiddleware");

//GET all brands
router.get('/', authorizePrivilege("GET_ALL_BRANDS"), async (req, res) => {
  try {
    const allBrands = await Brand.find().exec();
    res.json({ status: 200, message: "All brands", errors: false, data: allBrands });
  }
  catch (err) {
    res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching brands" });
  }
})

//GET all available drivers
// router.get('/available', authorizePrivilege("GET_ALL_DRIVERS"), async (req, res) => {
//   try {
//     const allDrivers = await Brand.find({ isAvailable: true }).exec();
//     // console.log(allDrivers);
//     res.json({ status: 200, message: "All available drivers", errors: false, data: allDrivers });
//   }
//   catch (err) {
//     res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching drivers" });
//   }
// })

// GET all vehicles by type
// router.get('/type/:type',/*authorizePrivilege("GET_USER_BY_ROLE"),*/ async (req, res) => {
//   // console.log(req.body.role)
//   if (mongodb.ObjectId.isValid(req.params.type)) {
//     try {
//       const allUsers = await User.find({ role: req.params.role }).populate("role").exec()
//       if (allUsers.length > 0) {
//         res.status(200).json({ status: 200, errors: false, data: allUsers, message: "All users" })
//       } else {
//         res.json({ status: 200, errors: false, data: allUsers, message: "No User Found" });
//       }
//     } catch (err) {
//       console.log(err)
//       res.status(500).json({ status: 500, errors: true, data: null, message: "Error while searching for users associated with this role" })
//     }
//   } else {
//     res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid role id" });
//   }
// })

// DELETE a Driver
router.delete('/:id', authorizePrivilege("DELETE_BRAND"), (req, res) => {
  if (mongodb.ObjectID.isValid(req.params.id)) {
    Brand.deleteOne({ _id: req.params.id }, (err, brand) => {
      if (err) throw err;
      res.send({ status: 200, errors: false, message: "Driver deleted successfully", data: brand })
    }).catch(err => {
      console.log(err);
      res.status(500).json({ status: 500, errors: true, data: null, message: "Error while deleting the brand" });
    });
  } else {
    // console.log("ID not Found")
    res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid brand id" });
  }
});


// UPDATE A Brand
router.put('/:id', authorizePrivilege("UPDATE_BRAND"), upload.single("logo"),async (req, res) => {
  if (mongodb.ObjectID.isValid(req.params.id)) {
    const result = BrandController.verifyUpdate(req.body);
    if (!isEmpty(result.errors)) {
      return res.json(res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields Required" }))
    }
    if (req.file) {
      try {
        result.data.logo = await S3Upload("brands", req.file);
      } catch (err) {
        console.log(err);
      }
    }
    Brand.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
      if (err) {
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating brand data" });
      }
      if (!doc)
        return res.status(200).json({ status: 200, errors: true, data: doc, message: "No Brand Found" });
      else {
        res.status(200).json({ status: 200, errors: false, data: doc, message: "Updated Brand" });
      }
    })
  } else {
    return res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid Brand Id" });
  }
})

// ADD NEW Brand
router.post("/", authorizePrivilege("ADD_NEW_BRAND"), upload.single("logo"), async (req, res) => {
  let result = BrandController.verifyCreate(req.body)
  if (!isEmpty(result.errors)) {
    return res.json({ status: 500, errors: result.errors, data: null, message: "Fields required" });
  }
  if (req.file) {
    try {
      result.data.logo = await S3Upload("brands", req.file);
    } catch (err) {
      console.log(err);
    }
  }
  const newBrand = new Brand(result.data);
  newBrand.save().then(data => {
    res.status(200).json({ status: 200, errors: false, data, message: "Brand Added successfully" });
  }).catch(err => {
    res.status(500).json({ status: 500, errors: true, data: null, message: "Error while adding new brand" });
  })
})

module.exports = router;