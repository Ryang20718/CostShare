const express = require("express");
const router = express.Router();
const upload = require('../config/file-upload');

const singleUpload = upload.single('image')

router.post('/image-upload', function(req, res) {
  singleUpload(req, res, function(err, some) {
    if (err) {
      return res.status(423).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }

    return res.json(req.file.location);
  });
})

module.exports = router;
