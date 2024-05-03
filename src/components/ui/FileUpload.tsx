'use client' // any components requires interactivity then we to convert into client component 

import { uploadTos3 } from '@/lib/s3'
import { Inbox } from 'lucide-react'
import { Input } from 'postcss'
import React from 'react'
import  {useDropzone} from 'react-dropzone'


interface Props {
    
}

export const FileUpload = () => {
    
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },  // user can only upload pdf files
        maxFiles: 1,
        onDrop: async (acceptedFiles) => { //his onDrop function allows you to perform actions with the files that the user dropped onto the drop zone. For example, you might want to display a preview of the dropped files, upload them to a server, or process them in some other way.
            console.log(acceptedFiles); //This statement logs the array of accepted files to the console
            const file = acceptedFiles[0]
            if (file.size > 10 * 1024 *1024) {
                //bigger than 10 mb
                alert("Please upload a smaller file")
                return
            }
            try {
                const data = await uploadTos3(file)
                console.log("data", data);
            }
            catch (error) {
                console.log(error)
            }
        },
    });
    
   
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-xl cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-col"
            })}>
                <input {...getInputProps()} />
                <>
                    <Inbox className='w-10 -h-10 text-blue-500' />
                    <p className='mt-2 text-sm text-slate-400'> Drop your PDF Here</p>
                </>
            </div>
        </div>
    )
}

export default FileUpload