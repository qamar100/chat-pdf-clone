import AWS from "aws-sdk"

export async function uploadTos3(file: File) {
    
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECERT_ACESS_KEY_ID,
        });
        //now we will get the s3 object
        const s3 = new AWS.S3({
            params: {  //params allow us to configure our bucket
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            },
            region: 'us-east-1'
        })
        
        //generates a unique key for the file using the current timestamp
        const file_key = 'uploads/' +Date.now().toString() + file.name.replace(' ','-')
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }

        //s3.putObject(params)uploads the specified object (file) to the Amazon S3 bucket
        //.on('httpUploadProgress', evt => { ... }) this  event is triggered during the upload process and provides information about the progress of the upload
        // initiates the upload of a file to an Amazon S3 bucket and logs the upload progress to the console in real-time. It provides a way to track the progress of the upload operation
        const upload = s3.putObject(params).on('httpUploadProgress', evt => {
        console.log('uploading to s3....', parseInt(((evt.loaded*100)/evt.total).toString()))
        }).promise()
        
        //waits for the upload to complete and logs a success message to the console.
        await upload.then(date => {
            console.log('successfully uploaded to S3!',file_key)
        })

        return Promise.resolve({
            file_key,
            file_name: file.name,


        })
    } catch (error) {}
}

// that generates the URL of the uploaded file in the S3 bucket.
export function getS3Url(file_key: string) {
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
    return url;
  }