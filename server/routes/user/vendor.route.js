const express = require('express');
const bcrypt = require("bcryptjs");
const isEmpty = require("../../utils/is-empty");
const moment = require('moment');
const mongodb = require("mongodb");
const router = express.Router();

const authorizePrivilege = require("../../middleware/authorizationMiddleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uuid = require("uuid/v1");
const AWS = require("aws-sdk");
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION
});

const vendorController = require('../../controllers/user/vendor.controller');
const User = require('../../models/user.model');


//GET all users
router.get('/', authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
    try {
        const allUsers = await User
            .find()
            .populate({ path: "role", select: "name" })
            .exec();
        // console.log(allUsers);
        return res.json({ status: 200, message: "ALL VENDORS", errors: false, data: allUsers });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
    }
})

// DELETE A VENDOR
router.delete('/:id', authorizePrivilege("DELETE_USER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        User.deleteOne({ _id: req.params.id }, (err, user) => {
            if (err) throw err;
            res.send({ status: 200, errors: false, message: "VENDOR DELETED SUCCESSFULLY", data: user })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, errors: true, data: null, message: "Error while deleting the user" });
        });
    } else {
        console.log("ID not Found")
        res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
    }
});


// UPDATE A VENDOR
router.put('/id/:id', authorizePrivilege("UPDATE_USER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        // let user = (({ full_name, email, role }) => ({ full_name, email, role }))(req.body);
        const result = vendorController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
        }
        User.findByIdAndUpdate(req.params.id, { $set: result.data }, { new: true }, (err, doc) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user data" });
            }
            else {
                doc.populate("").execPopulate().then(d => {
                    if (!d)
                        return res.status(200).json({ status: 200, errors: true, data: doc, message: "No User Found" });
                    else {
                        d = d.toObject();
                        delete d.password;
                        console.log("Updated User", d);
                        res.status(200).json({ status: 200, errors: false, data: d, message: "Updated User" });
                    }
                }
                ).catch(e => {
                    console.log(e);
                    return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user details" });
                });
            }
        })
    } else {
        return res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
        // return res.status(404).send("ID NOT FOUND");
    }
})

// UPDATE USER OWN
router.put('/me', authorizePrivilege("UPDATE_USER_OWN"), (req, res) => {
    let result;
    if (req.user.role._id == process.env.DELIVERY_BOY_ROLE) {
        result = userCtrl.verifyDBoyProfileUpdateOwn(req.body)
    } else {
        result = userCtrl.verifyUpdate(req.body)
    }
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
    }
    User.findByIdAndUpdate(req.user._id, { $set: result.data }, { new: true }, (err, doc) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user data" });
        }
        else {
            doc.populate("role route").execPopulate().then(d => {
                if (!d)
                    return res.status(200).json({ status: 200, errors: true, data: doc, message: "No User Found" });
                else {
                    d = d.toObject();
                    delete d.password;
                    console.log("Updated User", d);
                    res.status(200).json({ status: 200, errors: false, data: d, message: "Updated User" });
                }
            }
            ).catch(e => {
                console.log(e);
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user details" });
            });
        }
    })
})


// ADD NEW USER
router.post("/", authorizePrivilege("ADD_NEW_USER"), (req, res) => {
    let result = vendorController.verifyCreate(req.body);
    if (isEmpty(result.errors)) {
        User.findOne({ email: result.data.email }, (err, doc) => {
            if (err)
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while verifying the email" });
            if (doc)
                return res.json({ status: 400, errors: true, data: null, message: "Email already registered" });
            result.data.vendor_id = "VEN" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
            // console.log(user);
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(result.data.password, salt, function (err, hash) {
                    result.data.password = hash;
                    const newVendor = new Vendor(result.data);
                    newVendor
                        .save()
                        .then(data => {
                            data
                                .populate("")
                                .execPopulate()
                                .then(data => {
                                    data = data.toObject();
                                    delete data.password;
                                    res.status(200).json({ status: 200, errors: false, data, message: "Vendor Added successfully" });
                                })
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({ status: 500, errors: true, data: null, message: "Error while creating new user" });
                        })
                });
            });
        })
    }
    else {
        res.status(500).json({ status: 500, errors: result.errors, data: null, message: "Fields Required" });
    }
})


router.post('/login', async (req, res) => {
    if (req.headers.token != undefined) {
        if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
            console.log("HAS TOKEN");
            jwt.verify(req.headers.token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid token" })
                } else {
                    Vendor.findById(payload._id, (err, doc) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while validating your token details" })
                        }
                        if (doc) {
                            let u = doc.toObject();
                            delete u.password;
                            req.user = u;
                            res.json({ status: 200, data: u, errors: false, message: "You are already logged in!" });
                        } else {
                            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while validating your token details" })
                        }
                    }).populate('role')
                    // next();
                }
            })
        } else {
            res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
        }
    } else {
        let result = vendorController.verifyLogin(req.body);
        // console.log("NO TOKEN");
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" });
        }
        if (req.body.email && req.body.password) {
            let email = req.body.email.trim();
            User.findOne({ email: email }, (err, user) => {
                // console.log(user)
                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while finding the user" });
                }
                if (user) {
                    // console.log("USER FOUND")
                    bcrypt.compare(req.body.password, user.password, function (er, isMatched) {
                        if (er) {
                            console.log(er);
                            return res.status(401).json({ status: 401, data: null, errors: true, message: "Error in validating Credentials" });
                        }
                        if (isMatched) {
                            const u = user.toObject();
                            delete u.password;
                            req.user = u;
                            jwt.sign({ _id: u._id }, process.env.JWT_SECRET, function (err, token) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({ status: 500, errors: true, data: null, message: "Error while generating token" })
                                }
                                else {
                                    user = user.toObject();
                                    delete user.password;
                                    req.user = user;
                                    res.json({ status: 200, data: { token, user }, errors: false, message: "Login successfull" })
                                }
                            });
                        } else {
                            return res.status(401).json({ status: 401, data: null, errors: true, notmessage: "Invalid Credentials" });
                        }
                    });
                } else {
                    res.status(404).json({ status: 404, data: null, errors: true, message: "User not exist" });
                }
            }).populate('role')
        }
    }
});
module.exports = router;
