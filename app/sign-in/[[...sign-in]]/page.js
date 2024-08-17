"use client"
import { SignIn } from "@clerk/nextjs"
import { useEffect } from "react"

export default function(){
    return (
        <>
        <div className="w-screen min-h-screen flex flex-col items-center justify-center p-12 gap-12">
            <SignIn signUpUrl="/sign-up"/>
        </div>
        </>
    )
}