const express = require('express');
const router = express.Router();
const Product = require('../../models/products/Products.model');
const productCtrl = require('../../controllers/product/products.controller');
const isEmpty = require('../../utils/is-empty');
const mongodb = require('mongoose').Types;
const moment = require('moment');
const authorizePrivilege = require("../../middleware/authorizationMiddleware");
const { upload, S3Upload } = require("../../utils/image-upload");

//GET ALL PRODUCTS CREATED BY SELFF
router.get("/", authorizePrivilege("GET_ALL_PRODUCTS_OWN"), (req, res) => {
    Product.find({ created_by: req.user._id })
        .populate("created_by ", "-password")
        .populate("category brand type")
        .exec()
        .then(docs => {
            if (docs.length > 0)
                return res.json({ status: 200, data: docs, errors: false, message: "All products" });
            else
                return res.json({ status: 200, data: docs, errors: false, message: "No products found" });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting products" })
        })
})

// GET ALL PRODUCTS
router.get("/all", authorizePrivilege("GET_ALL_PRODUCTS"), (req, res) => {
    Product
        .find()
        .populate("created_by available_for", "-password")
        .populate("category brand ")
        .populate({ path: 'type', populate: { path: 'attributes' } })
        .exec()
        .then(docs => {
            if (docs.length > 0)
                return res.json({ status: 200, data: docs, errors: false, message: "All products" });
            else
                res.json({ status: 200, data: docs, errors: false, message: "No products found" });
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting products" })
        })
})
// GET ALL PRODUCTS
router.get("/bycategory/:id", authorizePrivilege("GET_ALL_PRODUCTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        Product
            .find({ category: req.params.id })
            .populate("created_by available_for", "-password")
            .populate("category brand")
            .exec()
            .then(docs => {
                if (docs.length > 0)
                    return res.json({ status: 200, data: docs, errors: false, message: "All products" });
                else
                    res.json({ status: 200, data: docs, errors: false, message: "No products found" });
            }).catch(err => {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting products" });
            })
    }
    else {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid category id" })
    }
})
// GET ALL PRODUCTS
router.get("/bybrand/:id", authorizePrivilege("GET_ALL_PRODUCTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        Product
            .find({ brand: req.params.id })
            .populate("created_by available_for", "-password")
            .populate("category brand type")
            .exec()
            .then(docs => {
                if (docs.length > 0)
                    return res.json({ status: 200, data: docs, errors: false, message: "All products" });
                else
                    res.json({ status: 200, data: docs, errors: false, message: "No products found" });
            }).catch(err => {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting products" });
            })
    }
    else {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid brand id" })
    }
})

// GET CUSTOMER PRODUCTS
router.get("/customer", authorizePrivilege("GET_ALL_CUSTOMER_PRODUCTS"), (req, res) => {
    if (!req.user.hub)
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Hub not assigned yet" })
    Product.find({ available_for: req.user.hub }).populate("created_by", "-password").populate("category brand").exec().then(docs => {
        if (docs.length > 0)
            res.json({ status: 200, data: docs, errors: false, message: "All products" });
        else
            res.json({ status: 200, data: docs, errors: false, message: "No products found" });
    }).catch(err => {
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting products" });
    })
})


// ADD NEW PRODUCT
router.post('/', authorizePrivilege("ADD_NEW_PRODUCT"), upload.fields([{ name: "primary", maxCount: 1 }, { name: "secondary", maxCount: 1 }]), async (req, res) => {
    let result = productCtrl.verifyCreate(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
    }
    result.data.created_by = req.user._id;
    let productId = "P" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
    result.data.product_id = productId;
    let newProduct = new Product(result.data);
    if (req.files) {
        let keys = Object.keys(req.files);
        result.data.images = {};
        if (keys.length) {
            newProduct.images["primary"] = (req.files["primary"] && req.files["primary"].length) ? (await S3Upload("products/" + newProduct._id, req.files["primary"][0])) : null;
            newProduct.images["secondary"] = (req.files["secondary"] && req.files["secondary"].length) ? (await S3Upload("products/" + newProduct._id, req.files["secondary"][0])) : null;
        }
    }
    newProduct
        .save()
        .then(product => {
            product
                .populate("created_by", "-password")
                .populate("category brand type")
                .execPopulate()
                .then(p => res.json({ status: 200, data: p, errors: false, message: "Product added successfully" }))
                .catch(e => {
                    console.log(e);
                    return res.json({ status: 500, data: null, errors: true, message: "Error while populating the saved product" })
                });
        })
        .catch(err => {
            console.log(err);
            return res.json({ status: 500, data: null, errors: true, message: "Error while creating new product" });
        });
});

//UPDATE A PRODUCT
router.put("/id/:id", authorizePrivilege("UPDATE_PRODUCT"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = productCtrl.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        }
        Product.findByIdAndUpdate(req.params.id, { $set: result.data }, { new: true }).populate("created_by category brand available_for", "-password").populate("category brand")
            .exec()
            .then(doc => res.status(200).json({ status: 200, data: doc, errors: false, message: "Product Updated Successfully" }))
            .catch(err => {
                console.log(err);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating product" })
            })
    }
    else {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid product id" });
    }
})

//GET products for pagination
router.get("/page/:page?", authorizePrivilege("GET_ALL_PRODUCTS"), (req, res) => {
    let page = req.params.page || 0;
    let limit = req.query.limit || 10;
    limit = Number(limit);
    let orderby = req.query.orderby || "name";
    let order = req.query.order || 'asc';
    let srt = {};
    srt[orderby] = order;
    // Product.count()
    Product.find()
        .populate("category brand type")
        .limit(limit)
        .skip(limit * page)
        .sort(srt)
        .exec(function (err, products) {
            if (err) {
                console.log(err);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
            }
            return res.json({ status: 200, data: products, errors: false, message: "Products" });
        })
})

//DELETE A PRODUCT
router.delete("/:id", authorizePrivilege("DELETE_PRODUCT"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid product id" });
    }
    else {
        Product.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the product" })
            }
            if (doc) {
                return res.json({ status: 200, data: doc, errors: false, message: "Product deleted successfully!" });
            }
        })
    }
})

// GET SPECIFIC PRODUCT
router.get("/id/:id", authorizePrivilege("GET_PRODUCT"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        Product
            .findById(req.params.id)
            .populate("created_by type", "-password")
            .populate("category brand available_for", "-password")
            .exec()
            .then(doc => {
                return res.json({ status: 200, data: doc, errors: false, message: "Product" });
            }).catch(e => {
                console.log(e);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting the product" })
            });
    } else {
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting the product" })
        return res.json({ message: "invalid data" });
    }
});


router.put("/stock", authorizePrivilege("UPDATE_PRODUCT"), async (req, res) => {
    console.log(req.body.id);
    console.log(req.body.newStock);
    if (mongodb.ObjectId.isValid(req.body.id)) {
        Product.findByIdAndUpdate(req.body.id, { $inc: { stock: req.body.newStock } }, { new: true })
            .populate('category brand created_by type')
            .exec()
            .then(doc => {
                if (!doc) {
                    return res.status(200).json({ status: 200, data: null, errors: true, message: "Error While Finding Product" })
                } else { return res.status(200).json({ status: 200, data: doc, errors: false, message: "Stock Added Successfully" }) }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while adding Stock" })
            })
    }
    else {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid product id" });
    }
})


//UPLOAD IMAGES
router.put("/images/:id", authorizePrivilege("UPDATE_PRODUCT"), upload.fields([{ name: "primary", maxCount: 1 }, { name: "secondary", maxCount: 1 }]), async (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let keys = Object.keys(req.files);
        let obj = {};
        if (keys.length) {
            obj["images.primary"] = (req.files["primary"] && req.files["primary"].length) ? (await S3Upload("varient/" + req.params.id, req.files["primary"][0])) : null;
            obj["images.secondary"] = (req.files["secondary"] && req.files["secondary"].length) ? (await S3Upload("varient/" + req.params.id, req.files["secondary"][0])) : null;
        }
        // let obj = {};
        // for (let index = 0; index < allKeys.length; index++) {
        //     let x = allKeys[index];
        //     obj[`image.${x}`] = (await S3Upload("products/" + result.data.product, req.files[x][0]));
        // }
        if (keys.length)
            Product.findByIdAndUpdate(req.params.id, { $set: obj }, { new: true })
                .populate("attributes.attribute attributes.option").exec()
                .then(_data => {
                    return res.status(200).json({ status: 200, data: _data, errors: false, message: "Product Updated Successfully" });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating Product" });
                })
        else
            return res.status(400).json({ status: 400, data: null, errors: true, message: "Please select a image" });

    } else {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid id" });
    }
})
module.exports = router;