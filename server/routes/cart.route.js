const express = require('express');
const isEmpty = require("../utils/is-empty");
const CartController = require('../controllers/cart.controller');
const Cart = require('../models/cart.model');
const mongodb = require("mongodb");
const CustomerOrder = require("../models/customer.order.model");
const moment = require('moment');
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const router = express.Router();
const Product = require("../models/products/Products.model");

//GET own cart
router.get("/", authorizePrivilege("GET_CART"), (req, res) => {
    Cart.aggregate([
        { $match: { user: req.user._id } },
        { $unwind: "$products" },
        { $lookup: { "from": 'product_varients', "localField": 'products.product', "foreignField": '_id', "as": 'prod' } },
        {
            $project: {
                _id: null, products: 1, quantity: 1, price: { $arrayElemAt: ["$prod.price", 0] }
            }
        },
        { $group: { _id: null, products: { $push: "$products" }, total: { $sum: { $multiply: ["$price", "$products.quantity"] } } } },
        { $project: { _id: 0, c_id: 1, products: 1, total: 1 } }
    ], (err, doc) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while aggregate" })
        }
        if (doc) {
            Cart.populate(doc, [{ path: "products.product", populate: { path: "product attributes.option attributes.attribute", populate: { path: "category brand" } } }], (err, doc) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting cart" })
                } else {
                    // console.log("DOC : ",doc);
                    if (doc.length)
                        return res.json({ status: 200, data: doc[0], errors: false, message: "Your Cart" });
                    else
                        return res.json({ status: 200, data: { products: [], total: 0 }, errors: false, message: "Your Cart" });

                }
            })
            // .then(doc => {
            //     console.log("DOC IS : ", doc)
            //     if (doc)
            //         return res.json({ status: 200, data: doc.products, errors: false, message: "Your Cart" });
            //     else
            //         return res.json({ status: 200, data: [], errors: false, message: "Your Cart" });
            // }).catch(err => {
            //     return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting cart" })
            // });
        }
    })
})

// //GET all orders
// router.get("/", authorizePrivilege("GET_ALL_CUSTOMER_ORDERS"), (req, res) => {
//     CustomerOrder.find().populate("placed_by products.product placed_to").exec().then(doc => {
//         return res.json({ status: 200, data: doc, errors: false, message: "All Orders" });
//     }).catch(err => {
//         return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
//     });
// })

// Add product to cart
router.post("/", authorizePrivilege("ADD_PRODUCT_TO_CART"), (req, res) => {
    let result = CartController.verifyAdd(req.body);
    if (!isEmpty(result.errors))
        return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
    Cart.findOneAndUpdate({ user: req.user._id }, { $push: { products: result.data } }, { upsert: true, new: true }).exec().then(d => {
        Cart.aggregate([
            { $match: { user: req.user._id } },
            { $unwind: "$products" },
            { $lookup: { "from": 'product_varients', "localField": 'products.product', "foreignField": '_id', "as": 'prod' } },
            {
                $project: {
                    _id: null, products: 1, quantity: 1, price: { $arrayElemAt: ["$prod.price", 0] }
                }
            },
            { $group: { _id: null, products: { $push: "$products" }, total: { $sum: { $multiply: ["$price", "$products.quantity"] } } } },
            { $project: { _id: 0, c_id: 1, products: 1, total: 1 } }
        ], (err, doc) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while aggregate" })
            }
            if (doc) {
                Cart.populate(doc, [{ path: "products.product", populate: { path: "product attributes.option attributes.attribute", populate: { path: "category brand" } } }], (err, doc) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting cart" })
                    } else {
                        return res.json({ status: 200, data: doc[0], errors: false, message: "Item added to cart" });
                    }
                })
            }
        })
    }).catch(e => {
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while adding item to cart" });
    })
})

// Delete a order
router.delete("/:id", authorizePrivilege("DELETE_PRODUCT_FROM_CART"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Product Id" });
    }
    else {
        Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { products: { product: req.params.id } } }, { new: true }, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the product" })
            }
            if (doc) {
                console.log("doc: ", doc);
                if (doc.products.length == 0) {
                    res.json({ status: 200, data: { products: [], total: 0 }, errors: false, message: "Item deleted successfully!" });
                    return doc.delete();
                }
                Cart.aggregate([
                    { $match: { user: req.user._id } },
                    { $unwind: "$products" },
                    { $lookup: { "from": 'product_varients', "localField": 'products.product', "foreignField": '_id', "as": 'prod' } },
                    {
                        $project: {
                            _id: null, products: 1, quantity: 1, price: { $arrayElemAt: ["$prod.price", 0] }
                        }
                    },
                    { $group: { _id: null, products: { $push: "$products" }, total: { $sum: { $multiply: ["$price", "$products.quantity"] } } } },
                    { $project: { _id: 0, c_id: 1, products: 1, total: 1 } }
                ], (err, doc) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while aggregate" })
                    }
                    if (doc) {
                        Cart.populate(doc, { path: "products.product", populate: { path: "category created_by brand available_for", select: "-password" } }, (err, doc) => {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting cart" })
                            } else {
                                return res.json({ status: 200, data: doc[0], errors: false, message: "Item deleted successfully!" });
                            }
                        })
                    }
                })
            }
        });
    }
})


// Update cart
router.put("/:id", authorizePrivilege("UPDATE_QUANTITY_IN_CART"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        // console.log(req.body);
        let result = CartController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, errors: false, data: null, message: result.errors });
        }
        Cart.findOneAndUpdate({ user: req.user._id, 'products.product': req.params.id }, { $set: { 'products.$.quantity': req.body.quantity } }, { new: true }).populate('products.product').exec()
            .then(doc => {
                Cart.aggregate([
                    { $match: { user: req.user._id } },
                    { $unwind: "$products" },
                    { $lookup: { "from": 'product_varients', "localField": 'products.product', "foreignField": '_id', "as": 'prod' } },
                    {
                        $project: {
                            _id: null, products: 1, quantity: 1, price: { $arrayElemAt: ["$prod.price", 0] }
                        }
                    },
                    { $group: { _id: null, products: { $push: "$products" }, total: { $sum: { $multiply: ["$price", "$products.quantity"] } } } },
                    { $project: { _id: 0, c_id: 1, products: 1, total: 1 } }
                ], (err, doc) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while aggregate" })
                    }
                    if (doc) {
                        Cart.populate(doc, { path: "products.product", populate: { path: "category created_by brand available_for", select: "-password" } }, (err, doc) => {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting cart" })
                            } else {
                                return res.status(200).json({ status: 200, errors: false, data: doc[0], message: "Cart updated successfully" });
                            }
                        })
                    }
                })
            }).catch(e => {
                console.log(e);
                return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating cart" });
            })
    } else {
        res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid order id" });
    }
})

//Place Order
router.post("/placeorder", authorizePrivilege("PLACE_ORDER"), (req, res) => {
    Cart.findOne({ user: req.user._id })
        .exec().then(cart => {
            Cart.aggregate([
                { $match: { user: req.user._id } },
                { $unwind: "$products" },
                { $lookup: { "from": 'product_varients', "localField": 'products.product', "foreignField": '_id', "as": 'prod' } },
                {
                    $project: {
                        _id: null, products: 1, quantity: 1, price: { $arrayElemAt: ["$prod.price", 0] }
                    }
                },
                { $group: { _id: null, products: { $push: "$products" }, total: { $sum: { $multiply: ["$price", "$products.quantity"] } } } },
                { $project: { _id: 0, c_id: 1, products: 1, total: 1 } }
            ], (err, doc) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while aggregate" })
                }
                if (doc.length) {
                    doc = doc[0];
                    if (doc.products.length) {
                        let order = {};
                        order.placed_to = req.body.customer_id;
                        order.products = doc.products;
                        order.placed_by = req.user._id;
                        order.order_id = "C_ORD" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
                        console.log("DOC>TOTAL : ", doc.total);
                        order.amount = doc.total;
                        order.status = "Placed";
                        let newOrder = new CustomerOrder(order);
                        newOrder.save().then(order => {
                            CustomerOrder.findById(order._id).populate([{
                                path: "products.product",
                                populate: {
                                    path: "product attributes.attribute attributes.option"
                                }
                            }]).exec().then(d => {
                                cart.delete();
                                return res.json({ status: 200, data: d, errors: false, message: "Order placed successfully" });
                            })
                        }).catch(e => {
                            console.log(e);
                            return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while placing the order" });
                        })
                    }
                    else
                        return res.status(400).json({ status: 400, errors: true, data: null, message: "Your cart is empty" });
                } else {
                    return res.status(400).json({ status: 400, errors: true, data: doc, message: "No Orders" });
                }
            })
        }).catch(e => {
            console.log(e);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Something went wrong" })
        })


    // Cart.findOne({ user: req.user._id }).exec().then(doc => {
    //     if (doc) {
    //         if (doc.products.length) {
    //             let order = {};
    //             order.products = doc.products;
    //             order.placed_by = req.user._id;
    //             order.order_id = "C_ORD" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
    //             order.amount = doc.total;
    //             order.status = "Placed";
    //             let newOrder = new CustomerOrder(order);
    //             newOrder.save().then(order => {
    //                 CustomerOrder.findById(order._id).populate("placed_by products.product placed_to").exec().then(d => {
    //                     doc.delete();
    //                     return res.json({ status: 200, data: d, errors: false, message: "Order placed successfully" });
    //                 })
    //             }).catch(e => {
    //                 console.log(e);
    //                 return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while placing the order" });
    //             })
    //         }
    //         else
    //             return res.status(400).json({ status: 400, errors: true, data: null, message: "Your cart is empty" });
    //     } else {
    //         return res.status(400).json({ status: 400, errors: true, data: doc, message: "Your cart is empty" });
    //     }
    // })
})

router.get("/products", (req, res) => {
    Product.aggregate([
        //     { $unwind: "$products" },
        {
            $lookup: {
                from: "carts",
                // let: { name: "$name" },
                pipeline: [
                    // { $match: { _id: { $nin: [] } } }
                ],
                as: "prods"
            }
        },
        { $project: { isincart: { prods: { $elemMatch: { product: "$_id" } } } } }
        // {qty:{$cond:{}}}
        //         $group:{
        //             _id:{prods2:{id:"$prods._id"},inCart:{$expr:{"prods":{"$elemMatch":{"_id":"$products.product"}}}}}
        //         }
        //     },
        //     //  {$group:{_id:null,cart_items:{$push:"$products.product"},prods:"$pro"}},

        //     // {$project:{}


    ], (err, doc) => {
        if (err) {
            console.log(err);
            res.send("Error");
        } else {
            res.json(doc);
        }
    })
});

//GET specific order
// router.get("/id/:id", authorizePrivilege("GET_CUSTOMER_ORDER"), (req, res) => {
//     if (mongodb.ObjectID.isValid(req.params.id)) {
//         CustomerOrder.findById(req.params.id)
//             .populate("placed_by products.product placed_to")
//             .exec()
//             .then(doc => {
//                 if (doc)
//                     res.json({ status: 200, data: doc, errors: false, message: "Order created successfully" });
//                 else
//                     res.json({ status: 200, data: doc, errors: false, message: "No orders found" });
//             }).catch(e => {
//                 res.status(500).json({ status: 500, errors: true, data: null, message: "Error while getting the order" });
//             })
//     } else {
//         res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid order id" });
//     }
// })

module.exports = router;