import { Configuration, OpenAIApi } from 'openai-edge'
import {OpenAIStream, StreamingTextResponse} from 'ai'
import { eq } from 'drizzle-orm'
import {  chats } from '@/lib/db/schema'
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
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
          };
      

          console.log(JSON.stringify(prompt, null, 2));
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === "user"), // only showing the user messages and filtering the system message
            ],
            stream: true  //to create a streaming effect ie autoregressive completion
        })

        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    }catch (error) {
        console.error( "OPen AI error error")
    }
}    