const Banner = require("../models/banner.model");
const router = require("express").Router();
const mongodb = require('mongoose').Types;
const upload = require("multer")({ storage: require("multer").memoryStorage() });
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION
});
// Get all banners
router.get("/", authorizePrivilege("GET_ALL_BANNERS"), (req, res) => {
    Banner
        .find()
        .exec()
        .then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "All banners" });
            else
                res.json({ status: 200, data: docs, errors: true, message: "No banner found" });
        }).catch(err => {
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting banners" })
        })
})

//Add new area
router.post('/', authorizePrivilege("ADD_NEW_BANNER"), upload.any(), async (req, res) => {
    if (!req.files.length) {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Select at least one image" });
    }
    let pr = [], obj = [];
    for (let i = 0; i < req.files.length; i++) {
        let key = `banners/${uuid()}.${req.files[i].originalname.split('.').pop()}`;
        pr.push(S3.upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: req.files[i].buffer
        }).promise());
        obj.push({ image: key });
    }
    Promise.all(pr).then(docs => {
        Banner.insertMany(obj).then(d => {
            res.json({ status: 200, data: d, errors: false, message: "Banners uploaded successfully" })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while uploading images" })
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while uploading images" })
    })
});

//Update a city
// router.put("/:id", authorizePrivilege("UPDATE_AREA"), (req, res) => {
//     if (mongodb.ObjectId.isValid(req.params.id)) {
//         let result = AreaController.verifyUpdate(req.body);
//         if (!isEmpty(result.errors)) {
//             return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
//         }
//         Banner.findByIdAndUpdate(req.params.id, result.data, { new: true }).populate("hub", "-password").populate({ path: "city", populate: { path: "state" } }).exec()
//             .then(area => {
//                 res.status(200).json({ status: 200, data: area, errors: false, message: "Area Updated Successfully" });
//             }).catch(err => {
//                 console.log(err);
//                 res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating area" })
//             })
//     }
//     else {
//         res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid area id" });
//     }
// })

//DELETE BANNER
router.delete("/:id", authorizePrivilege("DELETE_BANNER"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid banner id" });
    }
    else {
        Banner.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the banner" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Banner deleted successfully!" });
            }
        })
    }
})

module.exports = router;