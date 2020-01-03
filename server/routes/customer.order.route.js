const express = require('express');
const isEmpty = require("../utils/is-empty");
const CustomerOrderController = require('../controllers/customer.order.controller');
const CustomerOrder = require('../models/customer.order.model');
const User = require("../models/user.model");
const Route = require("../models/route.model");
var mongodb = require("mongodb");
const moment = require('moment');
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const router = express.Router();

//GET all orders placed by self
router.get("/", authorizePrivilege("GET_ALL_CUSTOMER_ORDERS_OWN"), (req, res) => {
    CustomerOrder.find({ $or: [{ placed_by: req.user._id }, { placed_to: req.user._id }] })
        .sort({'order_date': -1})
        // .populate(" placed_to")
        .populate({
            path: "products.product",
            populate: {
                path: "product attributes.attribute attributes.option category brand"
            }
        })
        .exec().then(doc => {
            return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
        }).catch(err => {
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
        });
})

//GET all orders placed by a specific User
router.get("/customer/:id", authorizePrivilege("GET_ALL_CUSTOMER_ORDERS"), (req, res) => {
    CustomerOrder.find({ placed_by: req.params.id }).populate("placed_by placed_to")
        .populate({
            path: "products.product",
            populate: {
                path: "product attributes.attribute attributes.option"
            }
        })
        .exec().then(doc => {
            return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
        }).catch(err => {
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
        });
})

//GET all orders
router.get("/all", authorizePrivilege("GET_ALL_CUSTOMER_ORDERS"), (req, res) => {
    CustomerOrder
        .find()
        .sort({ 'order_date': -1 })
        .populate({ path: "placed_by placed_to", populate: { path: "role" } })
        .populate({
            path: "products.product",
            populate: {
                path: "product attributes.attribute attributes.option category brand"
            }
        }).exec().then(doc => {
            return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
        }).catch(err => {
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
        });
})

// Create an order
// router.post("/", authorizePrivilege("ADD_NEW_CUSTOMER_ORDER"), (req, res) => {
//     let result = CustomerOrderController.verifyCreate(req.body);
//     if (!isEmpty(result.errors))
//         return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
//     result.data.placed_by = req.user._id;
//     result.data.order_id = "C_ORD" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
//     result.data.status = "Placed";
//     let newOrder = new CustomerOrder(result.data);
//     newOrder.save().then(order => {
//         CustomerOrder.findById(order._id).populate("placed_by products.product placed_to").exec().then(doc => {
//             res.json({ status: 200, data: doc, errors: false, message: "Order created successfully" });
//         })
//     }).catch(e => {
//         console.log(e);
//         res.status(500).json({ status: 500, errors: true, data: null, message: "Error while creating the order" });
//     })
// })

// Delete a order
router.delete("/:id", authorizePrivilege("DELETE_CUSTOMER_ORDER"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Order id" });
    }
    else {
        CustomerOrder.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the order" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Order deleted successfully!" });
            }
        })
    }
})

//Accept an order
router.put("/accept/:id", authorizePrivilege("ACCEPT_CUSTOMER_ORDER"), (req, res) => {
    console.log(req.body);
    if (mongodb.ObjectID.isValid(req.params.id)) {
        CustomerOrder.findById(req.params.id)
            .exec()
            .then(_ord => {
                if (_ord) {
                    // if (!_ord.declined) {
                    if (!_ord.accepted) {
                        let result = CustomerOrderController.verifyAccept(req.body);
                        if (!isEmpty(result.errors)) {
                            return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
                        }
                        let upd = {}, arrfilter = [];
                        result.data.products.forEach((ele, index) => {
                            upd["products.$[e" + index + "].accepted"] = ele.accepted;
                            let x = {};
                            x["e" + index + ".product"] = ele.product;
                            arrfilter.push(x);
                        })
                        upd.accepted = true;
                        upd.status = req.body.orderStatus;
                        CustomerOrder.findByIdAndUpdate(req.params.id, { $set: upd }, { upsert: false, arrayFilters: arrfilter, new: true })
                            .populate([{
                                path: "products.product",
                                populate: {
                                    path: "created_by category brand available_for", select: "-password"
                                }
                            }, { path: "placed_by", select: "-password" }]).lean().exec()
                            .then(d => {
                                res.json({ status: 200, data: d, errors: false, message: "Order accepted successfully" });
                            }).catch(e => {
                                console.log(e);
                                res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating accepted values" });
                            })
                    } else {
                        return res.status(400).json({ status: 400, errors: true, data: null, message: "Order already accepted" });
                    }
                    // } else {
                    //     return res.status(400).json({ status: 400, errors: true, data: null, message: "Order is declined, can't accept!" });
                    // }
                } else {
                    return res.status(400).json({ status: 400, errors: true, data: null, message: "No order exist with the given id" });
                }
            })
    }
})

// Cancel a order
router.post("/assigned", authorizePrivilege("GET_CUSTOMER_ORDER_ASSIGNED"), (req, res) => {
    let result = CustomerOrderController.verifyDateForDboy(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
    }
    Route.findOne({ delivery_boy: req.user._id }).exec().then(_route => {
        if (!_route) {
            return res.status(400).json({ status: 400, data: null, errors: true, message: "No route has been assigned" });
        }
        User.aggregate([
            {
                $match: { route: _route._id }
            },
            {
                $group: { _id: null, id: { $push: "$_id" } }
            },
            {
                $lookup:
                {
                    from: "customer_orders",
                    let: { "customers": "$id" },
                    pipeline: [
                        {
                            $match: { $expr: { $in: ["$placed_by", "$$customers"] }, order_date: { $gte: moment(req.body.date).startOf('day').toDate(), $lte: moment(req.body.date).endOf('day').toDate() } }
                        }
                    ],
                    as: "orders"
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $replaceRoot: { newRoot: "$orders" }
            }
        ]).exec().then(data => {
            User.populate(data, [{ path: "placed_by", select: "-password" }, { path: "products.product", model: "product", populate: { path: "brand category created_by available_for", select: "-password" } }]).then(_ord => {
                res.json({ status: 200, data: _ord, errors: false, message: "All orders" });
            }).catch(err => {
                console.log(err);
                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating the order" });
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" });
        })
    })
})

// Canel a order
router.post("/cancel/:id", authorizePrivilege("CANCEL_CUSTOMER_ORDER"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Order id" });
    }
    else {
        // let result = CustomerOrderController.verifyCancelByDboy(req.body);
        // if (isEmpty(result.errors)) {
        CustomerOrder.findById(req.params.id).exec()
            .then(_cord => {
                if (_cord.isCancelled) {
                    return res.status(400).json({ status: 400, data: null, errors: true, message: "Order already cancelled" });
                } else if (_cord.isDelivered) {
                    return res.status(400).json({ status: 400, data: null, errors: true, message: "Delivered Order cannot be cancelled" });
                } else {
                    CustomerOrder.findByIdAndUpdate(req.params.id, { $set: { status: "Cancelled", isCancelled: true } }, { new: true }, (err, doc) => {
                        if (err) {
                            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while cancelling the order" });
                        }
                        if (doc) {
                            res.json({ status: 200, data: doc, errors: false, message: "Order cancelled successfully!" });
                        }
                    }).populate({
                        path: "placed_by products.product", select: "-apassword",
                        populate: {
                            path: "created_by category brand available_for", select: "-password"
                        }
                    })
                }
            })
        // } else {
        //     return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        // }

    }
})

// Deliver a order
router.post("/deliver/:id", authorizePrivilege("DELIVER_CUSTOMER_ORDER"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Order id" });
    }
    else {
        CustomerOrder.findById(req.params.id).exec().then(_cord => {
            if (_cord.isCancelled) {
                return res.status(400).json({ status: 400, data: null, errors: true, message: "Cancelled order can't be delivered" });
            } else if (_cord.isDelivered) {
                return res.status(400).json({ status: 400, data: null, errors: true, message: "Order already delivered" });
            } else {
                CustomerOrder.findByIdAndUpdate(req.params.id, { $set: { status: "Delivered", isDelivered: true } }, { new: true }, (err, doc) => {
                    if (err) {
                        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating the order status" })
                    }
                    if (doc) {
                        res.json({ status: 200, data: doc, errors: false, message: "Order delivered successfully!" });
                    }
                }).populate({
                    path: "placed_by products.product", select: "-apassword",
                    populate: {
                        path: "created_by category brand available_for", select: "-password"
                    }
                })
            }
        })
    }
})

// Update order
router.put("/:id", authorizePrivilege("UPDATE_CUSTOMER_ORDER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        console.log(req.body);
        let result = CustomerOrderController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, errors: false, data: null, message: result.errors });
        }
        CustomerOrder.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
            if (err)
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating order status" });
            if (doc) {
                doc.populate("placed_by placed_to").populate({
                    path: "products.product",
                    populate: {
                        path: "created_by category brand available_for", select: "-password"
                    }
                }).execPopulate()
                    .then(d => {
                        return res.status(200).json({ status: 200, errors: false, data: d, message: "Order updated successfully" });
                    })
                    .catch(e => {
                        return res.status(500).json({ status: 500, errors: true, data: d, message: "Order updated but error occured while populating" });
                    })
            } else {
                return res.status(200).json({ status: 200, errors: false, data: null, message: "No records updated" });
            }
        })
    } else {
        res.status(400).json({ status: 400, errors: false, data: null, message: "Invalid order id" });
    }
})

//GET specific order
router.get("/id/:id", authorizePrivilege("GET_CUSTOMER_ORDER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        CustomerOrder.findById(req.params.id)
            .populate("placed_by placed_to")
            .populate({
                path: "products.product",
                populate: {
                    path: "created_by category brand available_for", select: "-password"
                }
            })
            .exec()
            .then(doc => {
                if (doc)
                    res.json({ status: 200, data: doc, errors: false, message: "Order created successfully" });
                else
                    res.json({ status: 200, data: doc, errors: false, message: "No orders found" });
            }).catch(e => {
                res.status(500).json({ status: 500, errors: true, data: null, message: "Error while getting the order" });
            })
    } else {
        res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid order id" });
    }
})

module.exports = router;