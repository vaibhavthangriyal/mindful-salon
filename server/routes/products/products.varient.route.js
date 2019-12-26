const express = require('express');
const router = express.Router();
const ProductVarient = require('../../models/products/product.varient.model');
const Product = require('../../models/products/Products.model');
const ProductCategory = require('../../models/products/product.category.model');
const ProductVarientController = require('../../controllers/product/product.varient.controller');
const isEmpty = require('../../utils/is-empty');
const mongodb = require('mongoose').Types;
const { upload, S3Upload } = require("../../utils/image-upload");
const authorizePrivilege = require("../../middleware/authorizationMiddleware");
//  *************** GET APIS *********************** //
// GET ALL PRODUCT VARIENTS
// router.get("/all", authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), (req, res) => {
//     ProductVarient
//         .find()
//         // .populate('attributes.value product')
//         .exec()
//         .then(docs => {
//             if (docs.length > 0)
//                 res.json({ status: 200, data: docs, errors: false, message: "All PRODUCT VARIENTS" });
//             else
//                 res.json({ status: 200, data: docs, errors: false, message: "NO PRODUCT VARIENTS FOUND" });
//         }).catch(err => {
//             console.log(err);
//             res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR WHILE GETTING PRODUCT VARIENTS" })
//         })
// })

// GET SPECIFIC PRODUCT VARIENTS 
router.get("/", authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), (req, res) => {
    // if (mongodb.ObjectId.isValid(req.params.id)) {
    // ProductVarient.aggregate([
    //     { $group: { _id: "$product", varients: { $push: "$attributes" } } }
    // ]).exec()
    //     .then(docs => {
    ProductVarient
        .find({})
        .populate({path:"product attributes.attribute attributes.option",populate:{path:"created_by",select:"-password"}})
        .then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "ALL PRODUCT VARIENTS " });
            else
                res.json({ status: 200, data: docs, errors: true, message: "NO PRODUCT VARIENTS FOUND" });
        })
    // }).catch(err => {
    //     res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR WHILE FETCHING PRODUCT VARIENTS" });
    // })
    // } else {
    //     res.status(500).json({ status: 404, data: null, errors: true, message: "INVALID ID" })
    // }
})
router.get("/bycategory/:id", authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        ProductCategory.aggregate([
            { $match: { _id: mongodb.ObjectId(req.params.id) } },
            {
                $graphLookup: {
                    from: "product_categories",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parent",
                    as: "subcategory"
                }
            },
            { $addFields: { all: { $concatArrays: [["$_id"], "$subcategory._id"] } } },
            { $lookup: { from: "products", let: { category: "$all" }, pipeline: [{ $match: { $expr: { $in: ["$category", "$$category"] } } }], as: "prods" } },
            { $lookup: { from: "product_varients", let: { product: "$prods._id" }, pipeline: [{ $match: { $expr: { $in: ["$product", "$$product"] } } }], as: "products" } },
            { $unwind: "$products" },
            { $replaceRoot: { newRoot: "$products" } }
        ]).exec()
            .then(docs => {
                ProductVarient.populate(docs, [{ path: "attributes.attribute attributes.option" }, { path: "product", populate: { path: "brand category", select: "name" } }]).then(docs => {
                    if (docs.length > 0)
                        res.json({ status: 200, data: docs, errors: false, message: "ALL PRODUCT VARIENTS " });
                    else
                        res.json({ status: 200, data: docs, errors: true, message: "NO PRODUCT VARIENTS FOUND" });
                })
            }).catch(err => {
                console.log(err);
                res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR WHILE FETCHING PRODUCT VARIENTS" });
            })
    } else {
        res.status(500).json({ status: 404, data: null, errors: true, message: "INVALID ID" })
    }
})

// GET VAIRNETS BY BRAND
router.get('/bybrand/:id', authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), async (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid product id" });
    }
    try {
        const varients = await Product.aggregate([
            { $match: { brand: mongodb.ObjectId(req.params.id) } },
            { $group: { _id: null, prods: { $push: "$_id" } } },
            { $lookup: { from: "product_varients", let: { prods: "$prods" }, pipeline: [{ $match: { $expr: { $in: ["$product", "$$prods"] } } }], as: "Products" } },
            { $unwind: "$Products" },
            { $replaceRoot: { newRoot: "$Products" } }
        ]).exec()
        ProductVarient.populate(varients, "product attributes.attribute attributes.option").then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "ALL PRODUCT VARIENTS " });
            else
                res.json({ status: 200, data: docs, errors: true, message: "NO PRODUCT VARIENTS FOUND" });
        })
        //.find({ isAvailable: true }).exec();
        // console.log(allDrivers);
        // res.json({ status: 200, message: "Product Varients", errors: false, data: varients });
    }
    catch (err) {
        res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching drivers" });
    }
})

// GET SPECIFIC PRODUCT VARIENTS 
router.get("/VARIENTS/:id", authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        ProductVarient
            .findById(req.params.id)
            .exec()
            .then(docs => {
                if (docs.length > 0)
                    res.json({ status: 200, data: docs, errors: false, message: "ALL PRODUCT VARIENTS " });
                else
                    res.json({ status: 200, data: docs, errors: true, message: "NO PRODUCT VARIENTS FOUND" });
            }).catch(err => {
                res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR WHILE FETCHING PRODUCT VARIENTS" });
            })
    } else {
        res.status(400).json({ status: 400, data: null, errors: true, message: "INVALID ID" })
    }
})

// ************************* POST API ***********************
// ADD NEW PRODUCT CATEGORY
router.post('/add', authorizePrivilege("ADD_NEW_PRODUCT_VARIENTS"), async (req, res) => {
    console.log(req.body);
    let result = ProductVarientController.verifyCreate(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "FIELDS REQUIRED" });
    }
    let newProductVARIENTS = new ProductVarient(result.data);
    newProductVARIENTS
        .save()
        .then((_ProductVARIENTS) => {
            _ProductVARIENTS.populate(
                [{ path: "attributes.attribute", model: "product_attribute" },
                { path: "attributes.option", model: "product_option" }])
                .execPopulate()
                .then(_data => {
                    res.json({ status: 200, data: _data, errors: false, message: "NEW PRODUCT VARIENT ADDED SUCCESSFULLY " });
                })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR OCCURED WHILE ADDING PRODUCT VARIENT" });
        })
});

//UPDATE A PRODUCT
router.put("/update/:id", authorizePrivilege("UPDATE_PRODUCT_VARIENTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = ProductVarientController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        }
        ProductVarient.findByIdAndUpdate(req.params.id, { $set: result.data }, { new: true }, (err, doc) => {
            if (err)
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating ProductVARIENTS" });
            else {
                if (doc)
                    ProductVarient.find({ product: doc.product }).populate("attributes.attribute attributes.option").exec().then(_data => {
                        return res.status(200).json({ status: 200, data: _data, errors: false, message: "ProductVARIENTS Updated Successfully" });
                    }).catch(err => {
                        console.log(err);
                        res.json({ status: 200, data: null, errors: true, message: "Error while getting varients" });
                    })
                else {
                    return res.status(200).json({ status: 200, data: [], errors: false, message: "No vairants found" });
                }
            }
        })
    } else {
        res.json({ status: 200, data: null, errors: true, message: "Invalid ProductVARIENTS id" });
    }
})

// DELETE AN ProductVARIENTS
router.delete("/delete/:id", authorizePrivilege("DELETE_PRODUCT_VARIENTS"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid category id" });
    } else {
        ProductVarient.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the category" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Category deleted successfully!" });
            }
        })
    }
})

router.get("/byproduct/:id", authorizePrivilege("GET_ALL_PRODUCT_VARIENTS"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        // ProductVarient.aggregate([
        //     { $group: { _id: "$product", varients: { $push: "$attributes" } } }
        // ]).exec()
        //     .then(docs => {
        ProductVarient.find({ product: req.params.id })
            .populate([
                { path: "attributes.attribute", model: "product_attribute" },
                { path: "attributes.option", model: "product_option" }
            ])
            .then(docs => {
                if (docs.length > 0)
                    res.json({ status: 200, data: docs, errors: false, message: "ALL PRODUCT VARIENTS " });
                else
                    res.json({ status: 200, data: docs, errors: true, message: "NO PRODUCT VARIENTS FOUND" });
            })
        // }).catch(err => {
        //     res.status(500).json({ status: 500, data: null, errors: true, message: "ERROR WHILE FETCHING PRODUCT VARIENTS" });
        // })
    } else {
        res.status(400).json({ status: 400, data: null, errors: true, message: "INVALID ID" })
    }
})

//UPLOAD IMAGES
router.put("/images/:id", authorizePrivilege("UPDATE_PRODUCT_VARIENTS"), upload.array("images", 4), async (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        console.log(req.files)
        let arr = [];
        try {
            req.files.forEach(e => {
                arr.push(S3Upload('products/' + req.params.id, e));
            })
            Promise.all(arr).then(data => {
                ProductVarient
                    .findByIdAndUpdate(req.params.id, { $push: { images: { $each: data } } }, { new: true }, (err, doc) => {
                        if (err)
                            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating ProductVARIENTS" });
                        else {
                            if (doc)
                                ProductVarient.find({ product: doc.product }).populate("attributes.attribute attributes.option").exec().then(_data => {
                                    return res.status(200).json({ status: 200, data: _data, errors: false, message: "ProductVARIENTS Updated Successfully" });
                                }).catch(err => {
                                    console.log(err);
                                    res.json({ status: 200, data: null, errors: true, message: "Error while getting varients" });
                                })
                            else {
                                return res.status(200).json({ status: 200, data: [], errors: false, message: "No vairants found" });
                            }
                        }
                    })
            })
        } catch (err) {
            console.log(err);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Something went wrong" });
        }
    } else {
        res.json({ status: 200, data: null, errors: true, message: "Invalid ProductVARIENTS id" });
    }
})
module.exports = router;