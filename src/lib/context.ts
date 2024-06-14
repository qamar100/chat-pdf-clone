import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscci } from "./utils";
import { getEmbedding } from './embedding';

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("chatpdf");
    const namespace = pineconeIndex.namespace(convertToAscci(fileKey));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbedding(query);
  //console.log("Query Embeddings:", queryEmbeddings); //debugging line
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  console.log("Matches:", matches); //debugging line
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.9
  );

  console.log("Qualifying Docs:", qualifyingDocs);

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  const context = docs.join("\n").substring(0, 3000);
  console.log("Context:", context); // debugg
  console.log("Docs:", docs);
  return context;
  
}