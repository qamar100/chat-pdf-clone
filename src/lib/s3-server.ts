import AWS from "aws-sdk"
import fs from 'fs';

export async function downloadFromS3(file_key: string) {
    // download the file from s3
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
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        };

        const obj = await s3.getObject(params).promise()
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        fs.writeFileSync(file_name, obj.Body as Buffer)
        return file_name
        
    } catch (error) {
        console.error(error);
        return null
    }
}