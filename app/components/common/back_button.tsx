"use client"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function BackButton({children,className}:{children:React.ReactNode,className?:string}){
    const router = useRouter()
    return(
        <div onClick={()=> router.back()} className={cn(className)}    >
            {children}
        </div>
    )
}