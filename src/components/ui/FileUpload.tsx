'use client'
// any components requires interactivity then we to convert into client component 

import { uploadTos3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Inbox, Loader2 } from 'lucide-react'

import  {useDropzone} from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import React, { useState } from 'react';
import {useRouter} from 'next/navigation'


interface Props {
    
}

export const FileUpload = () => {
   
    const router = useRouter()
    const [uploading, setUploading] = React.useState(false)
    const { mutate, isPending} = useMutation({  //for hitting the backend api
      
        mutationFn: async ({  //this mutatefn will pass our data(filekey and filename) to the backend api create chat
            file_key,
            file_name
        }:
            {
                file_key: string,
                file_name: string
            }) => {
            const response = await axios.post('/api/create-chat', {
                file_key,
                file_name,
            });
            return response.data;
        },
        
    });
    

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },  // user can only upload pdf files
        maxFiles: 1,
        onDrop: async (acceptedFiles) => { //his onDrop function allows you to perform actions with the files that the user dropped onto the drop zone. For example, you might want to display a preview of the dropped files, upload them to a server, or process them in some other way.
           // console.log(acceptedFiles); //This statement logs the array of accepted files to the console
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 *1024) {
                //bigger than 10 mb
                toast.error("Please upload a smaller file")
                alert("Please upload a smaller file")
                return
            }
            try {
                setUploading(true);
                const data = await uploadTos3(file);
                if (!data?.file_key || !data.file_name) { //if files does not gets uploaded
                    toast.error("Something went wrong")
                    alert("Something went wrong");
                    return;
                }
                console.log("file upload");
                mutate(data, {   //once file are uploaded to s3 will will go to the mutate function
                    onSuccess: ([chat_id]) => {
                        //  console.log(data)
                        toast.success("chat created")
                        console.log(`Navigating to /chat/${chat_id}`);
                        router.push(`/chat/${chat_id}`);
                       
                        
                        
                    },
                    onError: (error) => {
                    //    toast.error("Error creating Chat")
                        console.error(error)
                    //    console.log("erorrrrrrrrr")
                        
                    },
                });
              
            }
            catch (error) {
                console.log(error)
            } finally {
                setUploading(false)
            }
        },
    });
    
   
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-xl cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-col"
            })}>
                <input {...getInputProps()} />
                {uploading || isPending ? (
                    <>
                        {/* Loading state*/}
                        <Loader2 className='w-10 h-10 text-blue-500 animate-spin' />
                        <p className='mt-2 text-sm text-slate-400'>
                        GPT is on it!
                        </p>
                    </>
                ) : (
 
 <>
  <Inbox className='w-10 -h-10 text-blue-500' />
  <p className='mt-2 text-sm text-slate-400'> Drop your PDF Here</p>
</>
                
)}
                
            </div>
        </div>
    )
}

export default FileUpload