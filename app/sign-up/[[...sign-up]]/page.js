"use client"
import { SignUp } from "@clerk/nextjs"
import { useEffect } from "react"

export default function Signup(){
    return (
        <>
            <div className="w-screen min-h-screen flex flex-col items-center justify-center p-12 gap-12">
                <SignUp signInUrl="/sign-in"/>
            </div>
        </>
    )
}