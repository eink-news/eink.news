import fs from 'fs'
import AWS from 'aws-sdk'
import Promise from 'bluebird'

const uploadToS3 = (ebookPath, params) => {
  const { name, bundleType } = params
  const promise = new Promise((resolve, reject) => {
    AWS.config.update({ region: process.env.AWS_REGION });
    var s3 = new AWS.S3({ signatureVersion: 'v4', params: { Bucket: process.env.S3_BUCKET } });
    fs.readFile(ebookPath, function (err, data){
      if (err) return reject(err)
      s3.putObject({
        Key: `${bundleType}/${name}.${bundleType}`,
        Body: data
      }, function(err) {
        if (err) {
          return reject(err)
        } else {
          console.log('Uploaded to S3 successfully');
          return resolve(true)
        }
      })
    })
  })

  return promise
}

export default uploadToS3
