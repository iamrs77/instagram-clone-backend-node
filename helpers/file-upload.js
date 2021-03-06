const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const dotenv = require('dotenv')
dotenv.config()

aws.config.update({
    secretAccessKey: process.env.AWS_SAK,
    accessKeyId: process.env.AWS_PKI,
    region: process.env.AWS_REGION
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    }else{
        cb(new Error('Invalid Mime Type, only JPEG and png'), false)
    }
}
 
const upload = multer({
    fileFilter,
    storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload
