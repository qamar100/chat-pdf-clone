import {  PineconeRecord , Pinecone} from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {Document, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter"
import { getEmbedding } from './embedding';
import md5 from 'md5';
import { metadata } from '@/app/layout';
import { text } from 'stream/consumers';
import { convertToAscci } from './utils';
//import {chunkedUpsert} from "@pinecone-database/pinecone"
//import {PineconeClient} from '@pinecone-database/pinecone'


let pinecone: Pinecone | null = null;

// export const getPineconeClinet = async () => {
//     try {
//         if (!pinecone) {
//             pinecone = new PineconeClient();
//             await pinecone.init({
//                 environment: process.env.PINECONE_ENVIROMENT!,
//                 apiKey: process.env.PINECONE_API_KEY!
                
//             });
//             console.log('PINECONE_ENVIROMENT:', process.env.PINECONE_ENVIROMENT);
//             console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);

            
//         }
     
//         return pinecone;
//     } catch (error) {
//         console.error("Error initializing pinecone client", error)
//         throw error
//     }
// }
export const getPinecone = async () => {
    try {
        const pc = new Pinecone({
          
            apiKey: process.env.PINECONE_API_KEY!,
        });
        console.log('PINECONE_ENVIROMENT:', process.env.PINECONE_ENVIROMENT);
        console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);
        return pc;
    } catch (error) {
        console.error("Error initializing pinecone client", error)
        throw error
    }
   

}


type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number }
    }
}



export async function loadS3IntoPinecone(file_key: string) {
    // obtain the pdf -> download and read from it
console.log ('downloading s3 into file system...')
    const file_name = await downloadFromS3(file_key);
    if (!file_name) {
       throw new Error('Could not download file from S3')
   }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];
    
    
    // step 2: split and segmenting the pdf into pages
    const documents = await Promise.all(pages.map(prepareDocument)) //further slpitting the pdf resulting the bigger array
    
    
    // step 3 : vectorize and embed the individual documents/pdfs
    
    const vectors = await Promise.all(documents.flat().map(embedDocument))
    
    // step 4: upload the vectors to pinecone

    const client = await getPinecone();
    const pineconeIndex = client.Index("chatpdf");

    console.log('Uploading  vectors to pinecone...')
    const namespace = convertToAscci(file_key)
    //PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10)
    await pineconeIndex.upsert(vectors)
    return documents;
} 

async function embedDocument(doc: Document) {
    try {

        const embeddings = await getEmbedding(doc.pageContent)
        const hash = md5(doc.pageContent)  
        
        return {
           id : hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
           }
        } as PineconeRecord //Vector is invoked??
    
    }
    catch (error) {
        console.log("Error embedding document", error)
        throw error
    }

}



//text can be to long for pinecone to handle so we need to truncate it
export const trancateStringBytes = (str: string, bytes: number) => {

    const enc = new TextEncoder();
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
}

async function prepareDocument(page: PDFPage)
{ 
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, " ")

    //splitting the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: trancateStringBytes(pageContent, 36000)
            }
        })
    ])
    return docs;

}

