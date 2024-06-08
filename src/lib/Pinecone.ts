import { Pinecone } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";


let pinecone: Pinecone | null = null;

export const getPinecone = async () => {
 
        if (!pinecone) {
            pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY!
            });
          }
          return pinecone;
    }
export async function loadS3IntoPinecone(file_key: string) {
    // obtain the pdf -> download and read from it
console.log ('downloading s3 into file system...')
    const file_name = await downloadFromS3(file_key);
    if (!file_name) {
       throw new Error('Could not download file from S3')
   }
    const loader = new PDFLoader(file_name);
    const pages = await loader.load();
    return pages;

}

