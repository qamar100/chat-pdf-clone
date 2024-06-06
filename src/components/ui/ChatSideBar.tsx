'use client'

import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React from 'react'
import { Button } from './button'
import { PlusCircle } from 'lucide-react'

interface Props {

    chats: DrizzleChat[],
    chatId: number,
    
}

const ChatSideBar = (props: Props) => {
    return (
        <div className='w-full h-screen p-4 text-gray-200 bg-gray-900'>
            <Link href= "/">
              
                    <Button className='m-full border-dashed border-white'>
                        <PlusCircle className=' mr-2 m-4 h-4' />
                        New Chat</Button>
           
            
            </Link>  
            <div className='flex flex-col '>

            </div>
        </div>
    )
}

export default ChatSideBar
