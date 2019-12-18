const VendorReview = require("../../models/review/vendor.review.model");
const VendorReviewController = require("../../controllers/review/vendor.review.controller");
const router = require("express").Router();
const isEmpty = require('../../utils/is-empty');
const mongodb = require('mongoose').Types;
const authorizePrivilege = require("../../middleware/authorizationMiddleware");

// GET ALL REVIEWS
router.get("/all", authorizePrivilege("GET_ALL_USERS"), (req, res) => {
    VendorReview
        .find()
        .populate('vendor customer')
        .exec()
        .then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "All Vendor Review" });
            else
                res.json({ status: 200, data: docs, errors: true, message: "No Vendor Review found" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting Vendor Review" })
        })
})


// GET ALL REVIEWS BY ROLE
router.get("/", authorizePrivilege("GET_ALL_USERS"), (req, res) => {
    let filter = {};
    switch (String(req.user.role._id)) {
        case process.env.VENDOR_ROLE:
            filter = { vendor: String(req.user._id) }
            break;
        case process.env.CUSTOMER_ROLE:
            filter = { customer: String(req.user._id) }
            break;
        default:
            console.log(req.user.role);
            filter = {}
            break;
    }
    console.log(filter)
    VendorReview
        .find(filter)
        .populate('vendor customer')
        .exec()
        .then(docs => {
            if (docs.length > 0)
                return res.json({ status: 200, data: docs, errors: false, message: "All Vendor Review" });
            else
                return res.json({ status: 200, data: docs, errors: true, message: "No Vendor Review found" });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting Vendor Review" })
        })
})

// GET ALL REVIEWS BY VENDOR
router.get("/:id", authorizePrivilege("GET_ALL_USERS"), (req, res) => {
    VendorReview
        .find({ vendor: req.params.id })
        .populate('vendor customer')
        .exec()
        .then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "All Vendor Review" });
            else
                res.json({ status: 200, data: docs, errors: true, message: "No Vendor Review found" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting Vendor Review" })
        })
})

//ADD REVIEW
router.post('/', authorizePrivilege("ADD_NEW_USER"), async (req, res) => {
    if (String(req.user.role._id) !== process.env.VENDOR_ROLE) {
        req.body.customer = String(req.user._id);
        VendorReview.findOne({ vendor: req.body.vendor, customer: req.body.customer })
            .then(review => {
                if (review) {
                    return res.json({ status: 200, data: null, errors: true, message: "Already Reviewed" });
                } else {
                    let result = VendorReviewController.verifyCreate(req.body);
                    if (!isEmpty(result.errors)) {
                        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
                    }
                    let newState = new VendorReview(result.data);
                    newState
                        .save()
                        .then(area => {
                            area
                                .populate('vendor customer')
                                .execPopulate()
                                .then(_vendorReview => {
                                    res.json({ status: 200, data: _vendorReview, errors: false, message: "Review Add Successfully" })
                                }).catch((err) => {
                                    res.json({ status: 200, data: null, errors: true, message: "Error while populating" })
                                })
                        })
                        .catch(e => {
                            console.log(e);
                            res.status(500).json({ status: 500, data: null, errors: true, message: "Internal Server Error" })
                        });
                }
            })
    } else {
        return res.json({ status: 403, data: null, errors: true, message: "You Cannot Comment" });
    }
});

//Update a city
router.put("/:id", authorizePrivilege("UPDATE_AREA"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = AreaController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        }
        Area.findByIdAndUpdate(req.params.id, result.data, { new: true }).populate("hub", "-password").populate({ path: "city", populate: { path: "state" } }).exec()
            .then(area => {
                res.status(200).json({ status: 200, data: area, errors: false, message: "Area Updated Successfully" });
            }).catch(err => {
                console.log(err);
                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating area" })
            })
    }
    else {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid area id" });
    }
})

//DELETE A area
router.delete("/:id", authorizePrivilege("DELETE_AREA"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid area id" });
    }
    else {
        Area.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the area" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Area deleted successfully!" });
            }
        })
    }
})

module.exports = router;