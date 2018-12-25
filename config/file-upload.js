const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require("aws-sdk");


var s3 = new AWS.S3({accessKeyId: process.env.aws_access_key_id, secretAccessKey: process.env.aws_secret_access_key, region: "us-west-1"});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'pengyou',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload;