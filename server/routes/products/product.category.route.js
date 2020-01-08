const express = require('express');
const router = express.Router();
const ProductCategory = require('../../models/products/product.category.model');
const ProductCategoryController = require('../../controllers/product/product.category.controller');
const isEmpty = require('../../utils/is-empty');
const mongodb = require('mongoose').Types;
const { upload, S3Upload } = require('../../utils/image-upload');
const authorizePrivilege = require("../../middleware/authorizationMiddleware");

router.get("/id/:id", authorizePrivilege("GET_PRODUCT_CATEGORY"), (req, res) => {
    ProductCategory.aggregate([
        {
            $match: { _id: mongodb.ObjectId(req.params.id) }
        },
        {
            $graphLookup: {
                from: "product_categories",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "parent",
                maxDepth: 0,
                as: "subcategory"
            }
        }
    ]).exec().then(docs => {
        if (docs.length > 0)
            res.json({ status: 200, data: docs, errors: false, message: "Category" });
        else
            res.json({ status: 200, data: docs, errors: true, message: "No category found" });
    }).catch(err => {
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting category" })
    })
})

// GET ALL PRODUCT CATEGORY
router.get("/subcat/all/:id", authorizePrivilege("GET_ALL_PRODUCT_CATEGORY"), (req, res) => {
    let id = req.params.id;
    ProductCategory.find({ parent: id })
        .populate("parent")
        .exec()
        .then(docs => {
            if (docs.length > 0)
                res.json({ status: 200, data: docs, errors: false, message: "All Categories" });
            else
                res.json({ status: 200, data: docs, errors: true, message: "No Categories found" });
        })
        .catch(err => {
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting routes" })
        })
})

router.get("/all", authorizePrivilege("GET_ALL_PRODUCT_CATEGORY"), (req, res) => {
    ProductCategory.aggregate([
        {
            $graphLookup: {
                from: "product_categories",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "parent",
                maxDepth: 0,
                as: "subcategory"
            }
        },
        {
            $match: { parent: { $exists: false } }
        }
    ]).exec().then(docs => {
        if (docs.length > 0)
            res.json({ status: 200, data: docs, errors: false, message: "All categories" });
        else
            res.json({ status: 200, data: docs, errors: true, message: "No categories found" });
    }).catch(err => {
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting categories" })
    })
})

// ADD NEW PRODUCT CATEGORY
router.post('/', authorizePrivilege("ADD_NEW_PRODUCT_CATEGORY"), upload.single("image"), async (req, res) => {
    let result
    console.log(req.body)
    if (req.body.type === 'category') {
        result = ProductCategoryController.verifyCreate(req.body);
    } else {
        result = ProductCategoryController.verifyCreateSubcateogry(req.body);
    }
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
    }
    let newProductCategory = new ProductCategory(result.data);
    if (req.file) {
        try {
            newProductCategory.image = await S3Upload("product-category/" + newProductCategory._id, req.file);
        } catch (err) {
            console.log("Error while uploading image : ", err);
        }
    }
    newProductCategory
        .save()
        .then(product => {
            product.populate("parent parent.parent")
                .execPopulate()
                .then(_d => {
                    res.json({ status: 200, data: _d, errors: false, message: "Category added successfully" })
                })
        })
        .catch(err => {
            console.log(err);
            res.json({ status: 500, data: null, errors: true, message: "Error while creating new category" });
        });
});

//UPDATE A PRODUCT
router.put("/:id", authorizePrivilege("UPDATE_PRODUCT_CATEGORY"), upload.single("image"), async (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = ProductCategoryController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        }
        if (req.file) {
            try {
                result.data.image = await S3Upload("product-category/" + req.params.id, req.file);
            } catch (err) {
                console.log("Error while uploading image : ", err);
            }
        }
        ProductCategory.findByIdAndUpdate(req.params.id, result.data, { new: true }, (err, doc) => {
            if (err)
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating category" });
            else {
                return res.status(200).json({ status: 200, data: doc, errors: false, message: "Category Updated Successfully" });
            }
        })
    }
    else {
        res.json({ status: 200, data: null, errors: true, message: "Invalid category id" });
    }
})


//GET product category for pagination
// router.get("/page/:page?", authorizePrivilege("GET_ALL_PRODUCTS"), (req, res) => {
//     let page = req.params.page || 0;
//     let limit = req.query.limit || 10;
//     limit = Number(limit);
//     let orderby = req.query.orderby || "name";
//     let order = req.query.order || 'asc';
//     let srt = {};
//     srt[orderby] = order;
//     ProductCategory.find().limit(limit).skip(limit * page).sort(srt)
//         .exec(function (err, products) {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
//             }
//             res.json({ status: 200, data: products, errors: false, message: "Products" });
//         })
// })

//DELETE A PRODUCT CATEGORY
router.delete("/:id", authorizePrivilege("DELETE_PRODUCT_CATEGORY"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid category id" });
    }
    else {
        ProductCategory.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the category" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Category deleted successfully!" });
            }
        })
    }
})

// GET SPECIFIC PRODUCT CATEGORY
// router.get("/id/:id", authorizePrivilege("GET_PRODUCT_CATEGORY"), (req, res) => {
//     if (mongodb.ObjectId.isValid(req.params.id)) {
//         ProductCategory.findById(req.params.id).exec().then(doc => {
//             res.json({ status: 200, data: doc, errors: false, message: "Category" });
//         }).catch(e => {
//             console.log(e);
//             res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting the category" })
//         });
//     } else {
//         res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid category id" });
//     }
// });


module.exports = router;


// router.post('/import', function (req, res, next) {
//     var product = req.body;
//     product.forEach(element => {
//         randomNumber = Math.round(Math.random() * (999 - 1) + 1);
//         var id = "PROD" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + randomNumber;
//         let newProduct = new Product({
//             brand: element.brand,
//             sku_id: id,
//             is_active: element.is_active.toLowerCase(),
//             cif_price: element.cif_price,
//             business_unit: element.business_unit,
//             business_unit_id: element.business_unit_id,
//             distirbutor: element.distirbutor,
//             form: element.form,
//             notes: element.notes,
//             pack_size: element.pack_size,
//             promoted: element.promoted.toLowerCase(),
//             registered: element.registered.toLowerCase(),
//             range: element.range,
//             strength: element.strength,
//             therapy_line: element.therapy_line,
//             therapy_line_id: element.therapy_line_id,
//             whole_price: element.whole_price,
//             sku_id: element.sku_id
//         });
//         newProduct.save()
//             .then(BU => {
//                 res.send(BU);
//             })
//             .catch(err => console.log(err));
//     });
//     res.send({ res: "DONE" })
// })
