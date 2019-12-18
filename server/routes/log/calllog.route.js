const CallLog = require("../../models/log/calllog.model");
const CallLogController = require("../../controllers/log/calllog.controller");
const router = require("express").Router();
const isEmpty = require('../../utils/is-empty');
const mongodb = require('mongoose').Types;
const authorizePrivilege = require("../../middleware/authorizationMiddleware");
// Get all areas
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
    CallLog
        .find(filter)
        .populate('vendor customer')
        .exec()
        .then(docs => {
            res.json({ status: 200, data: docs, errors: false, message: "All Call Logs" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting areas" })
        })
})

//Add new area
router.post('/', authorizePrivilege("ADD_NEW_USER"), async (req, res) => {
    req.body.customer = String(req.user._id);
    let result = CallLogController.verifyCreate(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
    }
    let newState = new CallLog(result.data);
    newState
        .save()
        .then(area => {
            res.json({ status: 200, data: area, errors: false, message: "Call Logged Successfully" })
        })
        .catch(e => {
            console.log(e);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating" })
        });
});

//Update a city
router.put("/:id", authorizePrivilege("UPDATE_USER"), (req, res) => {
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
router.delete("/:id", authorizePrivilege("DELETE_USER"), (req, res) => {
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