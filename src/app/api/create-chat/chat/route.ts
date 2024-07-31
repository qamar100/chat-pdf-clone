import { Configuration, OpenAIApi } from 'openai-edge'
import {OpenAIStream, StreamingTextResponse} from 'ai'
import { eq } from 'drizzle-orm'
import {  chats , messages as _messages } from '@/lib/db/schema'
import {db} from '@/lib/db'
import { NextResponse } from 'next/server'
import { getContext } from '@/lib/context'
import  {Message} from 'ai/react'

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function POST(req: Request ) {
    try {

        const { messages ,chatId } = await req.json()
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if (_chats.length != 1) {
            return NextResponse.json({ error: "chat not found" }, { status: 404 });
          }
          const fileKey = _chats[0].fileKey;

        const lastMessages = messages[messages.length - 1]
        const context = await getContext(lastMessages.content, fileKey)
       
        const prompt = {
            role: "system",
            content: `You are AI assistant, a powerful, human-like artificial intelligence designed to assist students in efficiently reading and retrieving information from research papers. 
            Your traits include expert knowledge, helpfulness, cleverness, and articulateness. You are always friendly, kind, and inspiring, eager to provide vivid and thoughtful responses to the user. 
            You possess extensive knowledge and can accurately answer nearly any question about any topic in conversation. 
          
            As an AI assistant, you are particularly enthusiastic about technologies like Pinecone and Vercel.
          
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
          
            When provided with a CONTEXT BLOCK, you will take it into account to provide accurate and relevant responses. If the context does not provide the answer to a question, you will say, "I'm sorry, but I don't know the answer to that question."
          
            You will not apologize for previous responses, but instead, indicate that new information was gained. You will not invent anything that is not drawn directly from the context.
          
            Additionally, you will use a Chain-of-Thought (CoT) approach to reasoning. This means you will break down complex problems into simpler steps and solve them step-by-step to ensure clarity and accuracy.
          
            Remember, your goal is to help the user effectively comprehend and retrieve information from the provided research papers. Always aim to be as clear and detailed as possible in your explanations.
            `,
          };
      

       // console.log(JSON.stringify(prompt, null, 2));
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === "user"), // only showing the user messages and filtering the system message
            ],
            stream: true  //to create a streaming effect ie autoregressive completion
        })

        const stream = OpenAIStream(response, {
            onStart: async () => {
              // save user message into db
              await db.insert(_messages).values({
                chatId,
                content: lastMessages.content,
                role: "user",
              });
            },
            onCompletion: async (completion) => {
              // save ai message into db
              await db.insert(_messages).values({
                chatId,
                content: completion,
                role: "system",
              });
            },
          });
          return new StreamingTextResponse(stream);
        } catch (error) {}
      }

console.error( "OpenAI error error")