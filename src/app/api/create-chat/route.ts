// /api/create-chat

import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json()
        const {file_key ,file_name } = body //these file key and file name will come from s3 bucket fileupload file where we have defined it
        console.log(file_key, file_name)
        return NextResponse.json({ message: "sucess" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 })
    
   }
}