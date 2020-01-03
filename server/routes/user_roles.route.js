const express = require('express');
const router = express.Router();
const userRole = require('../models/userRole.model');
const UserRoleController = require('.././controllers/userrole.controller');
const isEmpty = require('../utils/is-empty');
const mongodb = require('mongoose').Types;
const privileges = require("../utils/privilege.template");


// @route   GET api/userrole
// @desc    Return all userRoles
// @access  Private

//GET ALL ROLES
router.get("/", (req, res) => {
    userRole
        .find()
        .exec()
        .then(data => {
            return res.status(200).json({ status: 200, message: "All Roles", errors: false, data });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while fetching the user roles" });
        })
})

//GET ALL ROLES EXCEPT CUSTOMER ROLE
router.get("/notcustomer", (req, res) => {
    userRole
        .find({ _id: { $ne: process.env.CUSTOMER_ROLE } })
        .exec()
        .then(data => {
            return res.status(200).json({ status: 200, message: "All Roles", errors: false, data });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while fetching the user roles" });
        })
})


router.post('/', (req, res) => {
    console.log("Data is", req.body)
    let result = UserRoleController.verifyCreate(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, message: "Fields required", errors: result.errors, data: null })
    }
    console.log("Result is", result.data)
    let role = new userRole(result.data);
    role.save().then(Role => res.status(200).json({ status: 200, message: "Role added successfully", errors: false, data: Role })).catch(err => {
        console.log(err)
        res.status(500).json({ status: 500, message: "Error while adding role", errors: true, data: null })
    });
}
);

//Generate all Roles
router.post('/genall', (req, res) => {
    let all_roles = ["Super Admin", "Farm", "Hub", "Customer", "Driver", "Sales", "Support", "Delivery Boy"];
    let priv = privileges(true);
    let all = [];
    for (let role of all_roles) {
        all.push(userRole.findOneAndUpdate({ name: role }, { privileges: priv }, { new: true, upsert: true }))
    }
    Promise.all(all).then(data => {
        res.json({ status: 200, data: null, errors: false, message: "All roles generated successfully" })
    }).catch(e => {
        console.log(e);
        res.status(500).json({ status: 500, data: null, errors: true, message: "An error occured while generating roles" })
    })
});


//Update a role
router.put("/:id", (req, res) => {
    console.log(req.params.id);
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = UserRoleController.verifyUpdate(req.body);
        console.log(req.body)
        if (!isEmpty(result.errors)) {
            console.log(result.errors);
            return res.status(400).json({ status: 400, message: "Fields required", errors: result.errors, data: null });
        }
        else {
            userRole.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating the role" })
                }
                if (doc) {

                    return res.status(200).json({ status: 200, errors: false, data: doc, message: "Role updated successfully" })
                }
            })
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Invalid role id", errors: false, data: null })
    }
})

// Delete a role
router.delete("/:id", (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        userRole.deleteOne({ _id: req.params.id }, (err, doc) => {
            if (err)
                res.status(500).json({ status: 500, errors: true, data: null, message: "Error while deleting the role" })
            if (doc)
                res.json({ status: 200, errors: false, data: doc, message: "Role deleted successfully" });
        })
    } else {
        res.status(400).json({ status: 400, errors: false, data: null, message: "Invalid data" });
    }
})


module.exports = router;

