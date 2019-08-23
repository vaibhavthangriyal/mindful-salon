const express = require('express');
const isEmpty = require("../utils/is-empty");
const OrderController = require('../controllers/order.controller');
const Order = require('../models/order.model');
const ChallanController = require('../controllers/challan.controller');
const Challan = require('../models/challan.model');
var mongodb = require("mongodb");
const moment = require('moment');
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const router = express.Router();

//GET all orders placed by self
router.get("/", authorizePrivilege("GET_ALL_ORDERS_OWN"), (req, res) => {
    Order.find({ placed_by: req.user._id }).populate("placed_by status products.product placed_to").exec().then(doc => {
        return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
    });
})

//GET all orders
router.get("/all", authorizePrivilege("GET_ALL_ORDERS"), (req, res) => {
    Order.find().populate("placed_by status products.product placed_to").exec().then(doc => {
        return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
    }).catch(err => {
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
    });
})

// Create an order
router.post("/", authorizePrivilege("ADD_NEW_ORDER"), (req, res) => {
    let result = OrderController.verifyCreate(req.body);
    if (!isEmpty(result.errors))
        return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
    result.data.placed_by = req.user._id;
    result.data.order_id = "ORD" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
    let newOrder = new Order(result.data);
    newOrder.save().then(order => {
        Order.findById(order._id).populate("placed_by products.product status placed_to").exec().then(doc => {
            res.json({ status: 200, data: doc, errors: false, message: "Order created successfully" });
        })
    }).catch(e => {
        console.log(e);
        res.status(500).json({ status: 500, errors: true, data: null, message: "Error while creating the order" });
    })
})

router.put("/accept/:id", authorizePrivilege("ACCEPT_ORDER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        Order.findById(req.params.id).exec().then(_ord => {
            if (!_ord.accepted) {
                let result = OrderController.verifyAccept(req.body);
                if (!isEmpty(result.errors))
                    return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
                let pr = [];
                result.data.products.forEach(element => {
                    console.log("Accepted : ", element.accepted, " Id : ", element.product);
                    pr.push(Order.findOneAndUpdate({ _id: req.params.id, 'products.product': element.product }, {
                        $set: { 'products.$.accepted': element.accepted, accepted: true }
                    }, { new: true }))
                })
                Promise.all(pr).then(d => {
                    console.log("D is :",d);
                    // res.json({msg:"ok"})
                    Order.findById(d[d.length - 1]._id).populate("status products.product").exec().then(_or=>{
                        res.json({ status: 200, data: _or, errors: false, message: "Order accepted successfully" });
                    }).catch(_e=>{
                        res.status(500).json({ status: 500, errors: true, data: null, message: "Error while getting order" });
                    })
                }).catch(e => {
                    console.log(e);
                    res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating accepted values" });
                })
            } else {
                return res.status(400).json({ status: 400, errors: true, data: null, message: "Order already accepted" });
            }
        })
    }
})

//Generate Challan for order
router.post("/gchallan/:oid", authorizePrivilege("GENERATE_ORDER_CHALLAN"), async (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.oid)) {
        let result = ChallanController.verifyCreateFromOrder(req.body);
        if (!isEmpty(result.errors))
            return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
        Order.findById(req.params.oid).lean().exec().then(_ord => {
            if (_ord.accepted) {
                if (_ord.challan_generated) {
                    return res.status(400).json({ status: 400, errors: true, data: null, message: "Challan already generated for this order" });
                } else {
                    let pr = [];
                    result.data.products.forEach(element => {
                        pr.push(
                            Order.findOneAndUpdate({ _id: _ord._id, 'products.product': element.product }, {
                            $set: { 'products.$.dispatched': element.dispatched }
                        }, { new: true })
                        )
                    })
                    Promise.all(pr).then(d => {
                        delete result.data.products;
                        result.data.processing_unit_incharge = req.user._id;
                        result.data.order = _ord._id;
                        result.data.order_type = "order";
                        result.data.challan_id = "CHLN" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
                        let newChallan = new Challan(result.data);
                        newChallan.save()
                            .then(challan => {
                                challan.populate([{path:"processing_unit_incharge vehicle driver status",select:"-password"},{ path: "order", model: "order", populate: { path: "products.product" } }])
                                    .execPopulate()
                                    .then(doc => {
                                        Order.findByIdAndUpdate(_ord._id, { $set: { challan_generated: true } }, { new: true }).lean()
                                            .then(_o => {
                                                doc.order = _o;
                                                res.json({ status: 200, data: doc, errors: false, message: "Challan generated successfully" });
                                            })
                                    })
                            }).catch(e => {
                                console.log(e);
                                res.status(500).json({ status: 500, errors: true, data: null, message: "Error while generating the challan" });
                            })
                    }).catch(e => {
                        console.log(e);
                        res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating accepted values" });
                    })
                }
            } else {
                return res.status(400).json({ status: 400, errors: true, data: null, message: "Accept the order first" })
            }
        })
    } else {
        res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid order id" });
    }
})

// Delete a order
router.delete("/:id", authorizePrivilege("DELETE_ORDER"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Order id" });
    }
    else {
        Order.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the order" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Order deleted successfully!" });
            }
        })
    }
})


// Update order
router.put("/setstatus/:id", authorizePrivilege("UPDATE_ORDER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        console.log(req.body);
        let result = OrderController.verifyUpdateStatus(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, errors: false, data: null, message: result.errors });
        }
        Order.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
            if (err)
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating order status" });
            if (doc) {
                doc.populate("placed_by products.product status placed_to","-password")
                    .execPopulate()
                    .then(d => {
                        return res.status(200).json({ status: 200, errors: false, data: d, message: "Order updated successfully" });
                    })
                    .catch(e => {
                        return res.status(500).json({ status: 500, errors: true, data: null, message: "Order updated but error occured while populating" });
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
router.get("/id/:id", authorizePrivilege("GET_ORDER"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        Order.findById(req.params.id)
            .populate("placed_by products.product placed_to")
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