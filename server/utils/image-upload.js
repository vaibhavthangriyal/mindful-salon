const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const path = require("path");
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION
});

module.exports.upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 4
    }
})

module.exports.S3Upload = (folder, file) => {
    let key = `${folder}/${uuid()}.${file.originalname.split('.').pop()}`
    return new Promise((resolve, reject) => {
        S3.upload({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: file.buffer }).promise().then(_data => {
            resolve(key);
        }).catch(err => {
            reject(err);
        })
    });
}