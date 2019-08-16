const express = require('express');
const isEmpty = require("../utils/is-empty");
const CustomerController = require('../controllers/customer.controller');
const User = require('../models/user.model');
var mongodb = require("mongodb");
const moment = require('moment');
const router = express.Router();
const bcrypt = require("bcryptjs");
const authorizePrivilege = require("../middleware/authorizationMiddleware");


//GET all users
// router.get('/',authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
//   try {
//     const allUsers = await User.find({_id:{$ne:req.user._id}}).populate("role").exec();
//     // console.log(allUsers);
//     res.json({ status: 200, message: "All users", errors: false, data: allUsers });
//   }
//   catch (err) {
//     res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
//   }
// })

// //GET all users except self
// router.get('/u',authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
//   try {
//     const allUsers = await User.find({_id:{$ne:req.user._id}}).populate("role").exec();
//     // console.log(allUsers);
//     res.json({ status: 200, message: "All users", errors: false, data: allUsers });
//   }
//   catch (err) {
//     res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
//   }
// })

// GET all users by role
// router.get('/role/:role',authorizePrivilege("GET_USER_BY_ROLE"), async (req, res) => {
//   console.log(req.body.role)
//   if (mongodb.ObjectId.isValid(req.params.role)) {
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

// DELETE a user
// router.delete('/:id',authorizePrivilege("DELETE_USER"), (req, res) => {
//   if (mongodb.ObjectID.isValid(req.params.id)) {
//     User.deleteOne({ _id: req.params.id }, (err, user) => {
//       if (err) throw err;
//       res.send({ status: 200, errors: false, message: "User deleted successfully", data: user })
//     }).catch(err => {
//       console.log(err);
//       res.status(500).json({ status: 500, errors: true, data: null, message: "Error while deleting the user" });
//     });
//   } else {
//     console.log("ID not Found")
//     res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
//   }
// });
//GET current logged in customer details
// router.get('/',authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
//   try {
//     const allUsers = await User.find({_id:{$ne:req.user._id}}).populate("role").exec();
//     // console.log(allUsers);
//     res.json({ status: 200, message: "All users", errors: false, data: allUsers });
//   }
//   catch (err) {
//     res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
//   }
// })

// UPDATE Profile 
router.put('/:id', authorizePrivilege("UPDATE_CUSTOMER"), (req, res) => {
    let result;
    if (mongodb.ObjectID.isValid(req.params.id)) {
        if (req.user.role === process.env.CUSTOMER_ROLE) { //Check if logged in user is customer or not
            result = CustomerController.verifyProfileUpdateSelf(req.body);
            if (!isEmpty(result.errors)) {
                return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
            }
        }
        else {
            result = CustomerController.verifyProfileUpdate(req.body);
            if (!isEmpty(result.errors)) {
                return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
            }
        }
        User.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating Customer data" });
            }
            else {
                doc.populate("role").execPopulate().then(d => {
                    if (!d)
                        return res.status(200).json({ status: 200, errors: true, data: doc, message: "No Customer Found" });
                    else {
                        d = d.toObject();
                        delete d.password;
                        console.log("Updated User", d);
                        res.status(200).json({ status: 200, errors: false, data: d, message: "Updated Customer" });
                    }
                }
                ).catch(e => {
                    console.log(e);
                    return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating customer details" });
                });
            }
        })
    } else {
        return res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
    }
})

// ADD NEW USER
// router.post("/", authorizePrivilege("ADD_NEW_USER"), (req, res) => {
//     // let result = userCtrl.insert(req.body);
//     // let user = (({ full_name, email, password, role }) => ({ full_name, email, password, role }))(req.body);
//     let result = userCtrl.verifyCreate(req.body)
//     if (isEmpty(result.errors)) {
//         User.findOne({ email: result.data.email }, (err, doc) => {
//             if (err)
//                 return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while verifying the email" })
//         })
//         result.data.user_id = "USR" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
//         // console.log(user);
//         bcrypt.genSalt(10, function (err, salt) {
//             bcrypt.hash(result.data.password, salt, function (err, hash) {
//                 result.data.password = hash;
//                 const newuser = new User(result.data);
//                 newuser.save().then(data => {
//                     data = data.toObject();
//                     delete data.password;
//                     res.status(200).json({ status: 200, errors: false, data, message: "User Added successfully" });
//                 }).catch(err => {
//                     res.status(500).json({ status: 500, errors: true, data: null, message: "Error while creating new user" });
//                 })
//             });
//         });
//     }
//     else {
//         res.json(result.errors);
//     }
// })


module.exports = router;
