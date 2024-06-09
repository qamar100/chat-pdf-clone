import { Configuration, OpenAIApi } from 'openai-edge'
import {OpenAIStream, StreamingTextResponse} from 'ai'


export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function POST(req: Request) {
    try {

        const { messages } = await req.json()
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5',
            messages,
            stream: true  //to create a streaming effect ie autoregressive completion
        })

        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    }catch (error) {
        console.error( "OPen AI error error")
    }
}    