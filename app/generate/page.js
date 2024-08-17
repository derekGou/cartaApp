"use client"

import { db } from "@/firebase"
import { useUser } from "@clerk/nextjs"
import { collection, doc, getDocs, setDoc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useEffect } from "react"
import { IoIosClose } from "react-icons/io";
import { IconContext } from "react-icons"
import { PiSidebar } from "react-icons/pi";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineLoading } from "react-icons/ai";
import { SignOutButton } from "@clerk/nextjs"

export default function Generate(){
    const [input, setInput] = useState('')
    const {isLoaded, isSignedIn, user} = useUser()
    const [page, setPage] = useState('create')
    const [sessions, setSessions] = useState([])
    const [sideBar, setSideBar] = useState('16rem')
    const [loading, setLoading] = useState(false)
    const [showQA, setShowQA] = useState('Q')
    const [showQ, setShowQ] = useState('flex')
    const [showA, setShowA] = useState('none')

    useEffect(()=>{
        if (showQA=='Q'){
            setShowQ('flex')
            setShowA('none')
        } else {
            setShowQ('none')
            setShowA('flex')
        }
    }, [showQA])

    const [subject, setSubject] = useState()
    useEffect(()=>{
        if (page!='create'){
            setSubject(sessions[page])
        }
    }, [page, sessions])

    const [card, setCard] = useState(['', ''])
    const [cardLoading, setCardLoading] = useState('none')
    const loadMaterial = async () => {
        if (isLoaded){
            if (user){
                setCardLoading('flex')
                const docRef = doc(collection(db, 'flashcard'), user.id)
                const docSnap = await getDoc(docRef)
                try {
                    var currCategories = Object.keys(docSnap.data()[subject]['topics']).sort()
                    var currCategory = currCategories[parseInt(currCategories.length*Math.random())]
                    const response = await fetch("/api/card", {
                        method: "POST",
                        headers: {
                          "Content-Type": "text/plain",
                        },
                        body: JSON.stringify(currCategory),
                    })
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    var returnedQ = ''

                    while (true){
                        const { done, value } = await reader.read()
                        if (done) break;
                        const text = decoder.decode(value, { stream: true });
                        returnedQ+=text
                    }

                    setCard([currCategory, JSON.parse(returnedQ)["question"]])
                    setCardLoading('none')
                } catch (err) {
                    
                }
                
            }
        }
    }
    useEffect(()=>{
        loadMaterial()
    }, [subject])

    const [showCreate, setShowCreate] = useState('flex')
    useEffect(() => {
        if (page!='create'){
            setShowCreate('none')
        }
    }, [page])

    const [showOtherPages, setShowOtherPages] = useState('none')
    useEffect(() => {
        if (page=='create'){
            setShowOtherPages('none')
        }
    }, [page])
    const buttonDisplayLoad = () => {
        if (loading){
            return "none"
        } else {
            return "flex"
        }
    }
    const loaderDisplayLoad = () => {
        if (!loading){
            return "none"
        } else {
            return "flex"
        }
    }
    const updateSessions = async () => {
        if (isLoaded){
            if (user){
                const docRef = doc(collection(db, 'flashcard'), user.id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()){
                    const storedSessions = docSnap.data()
                    setSessions(Object.keys(storedSessions).sort())
                }
            }
            renderPrevSessions();
        }
    }
    useEffect(()=>{
        updateSessions()
    }, [isLoaded])
    const renderPrevSessions = () => {
        let rows = []
        for (let i = 0; i<sessions.length; i++){
            rows.push(
                <div onClick={() => {
                        setPage(i)
                        setShowOtherPages('flex')
                    }} key={i} className="p-2 w-full bg-gray-200 hover:brightness-90 cursor-pointer">
                    <p className="w-full text-left text-black">{sessions[i]}</p>
                </div>
            )
        }
        if (rows.length==0){
            return (
                <div key={-1} className="p-2 w-full bg-gray-200">
                    <p className="w-full text-left text-black">No previous chats!</p>
                </div>
            )
        } return rows
    }
    const toggleSidebar = () => {
        if (sideBar=='16rem'){
            setSideBar('0rem')
            return
        } else {
            setSideBar('16rem')
            return
        }
    }
    const showIcons = () => {
        if (sideBar=='16rem'){
            return "none"
        } else {
            return "flex"
        }
    }
    const hideSidebar = () => {
        if (sideBar=='16rem'){
            return "flex"
        } else {
            return "none"
        }
    }
    const newSession = async () => {
        if (!loading){
            setLoading(true)
            if (user){
                if (user.id){
                    setSessions((prevData) => [...prevData, input])
                    const docRef = doc(collection(db, 'flashcard'), user.id)
                    const docSnap = await getDoc(docRef)
                    let prevData = {}
                    if (docSnap.exists()){
                        prevData = docSnap.data()
                    }
                    const date = new Date();
                    const response = await fetch("/api/generate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "text/plain",
                        },
                        body: JSON.stringify(input),
                    })
    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    var returnedTopics = ''
                    while (true){
                        const { done, value } = await reader.read()
                        if (done) break;
                        const text = decoder.decode(value, { stream: true });
                        returnedTopics+=text
                    }
                    returnedTopics=JSON.parse(returnedTopics)
                    returnedTopics = returnedTopics['subtopics']
                    
                    var topics = {}
                    for (let i = 0; i<returnedTopics.length; i++){
                        topics[returnedTopics[i]] = {
                            streak: 0
                        }
                    }
                    prevData[input] = {
                        date: {
                            day: date.getDate(),
                            month: date.getMonth()+1,
                            year: date.getFullYear(),
                        },
                        topics
                    }
                    await setDoc(docRef, prevData)
                    setInput('')
                }
            }
            setLoading(false)
        }
    }

    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState(['', ''])
    const onAnswer = async () => {
        setLoading(true)
        setAnswer('')
        const response = await fetch("/api/check", {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
            body: JSON.stringify(`
                Subject: ${subject}: ${card[0]}
                Question: ${card[1]}
                User answer: ${answer}
            `),
        })
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        var verified = ''

        while (true){
            const { done, value } = await reader.read()
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            verified+=text
        }
        verified=JSON.parse(verified)

        setFeedback([verified['correct'] ? "Correct" : "Incorrect", verified['improvement']])
        setShowQA('A')
        setLoading(false)
    }

    return (
        <div className="h-screen w-screen p-12 flex items-center justify-center">
            <div className=" h-full w-full bg-[#ffffff88] rounded flex flex-row items-center justify-center overflow-hidden">
                <div style={{ width: sideBar }} className="bg-gray-200 h-full flex flex-col items-center justify-start transition-all">
                    <div className="p-4 flex flex-row w-full">
                        <div className="grow flex items-center justify-start">
                            <div style={{ display: hideSidebar() }} className="rounded p-2 bg-gray-200 hover:brightness-90">
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <PiSidebar className="cursor-pointer" onClick={toggleSidebar}/>
                                </IconContext.Provider>
                            </div>
                        </div>
                        <div className="grow flex items-center justify-end">
                            <div style={{ display: hideSidebar() }} className="rounded p-2 bg-gray-200 hover:brightness-90">
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <IoCreateOutline className="cursor-pointer" onClick={() => {
                                        setShowCreate('flex')
                                        setPage('create')
                                    }}/>
                                </IconContext.Provider>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-4 pt-2">{renderPrevSessions()}</div>
                </div>
                <div className="px-0 bg-white h-full grow flex flex-col">
                    <div className="w-full p-4 border-b-2 h-20 flex flex-row items-center gap-4">
                        <div style={{ display: showIcons() }} className="rounded p-2 bg-white hover:brightness-90">
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <PiSidebar className="cursor-pointer" onClick={toggleSidebar}/>
                            </IconContext.Provider>
                        </div>
                        <a href='/'>
                            <h2 className="text-black text-[1.5rem] h-8 hover:underline cursor-pointer">carta</h2>
                        </a>
                        <SignOutButton className="border-2 p-2" redirectUrl="/"/>
                        <div className="grow"/>
                        <div style={{ display: showIcons() }} className="cursor-pointer rounded p-2 bg-white hover:brightness-90" onClick={() => {setPage('create')}}>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <IoCreateOutline/>
                            </IconContext.Provider>
                        </div>
                    </div>
                    <div className="w-full h-full flex flex-col p-12 overflow-x-hidden overflow-y-scroll">
                        <div style={{ display: showCreate }} className="flex w-full h-full box-border bg-white flex items-center justify-center flex-col gap-4">
                            <h3 className="text-center text-black">New Chat</h3>
                            <p className="text-black">Input your prompt:</p>
                            <input className="text-black border-2 focus:outline-black p-2" value={input} onChange={(e) => {setInput(e.target.value)}} placeholder="Study topic"></input>
                            <button style = {{ display: buttonDisplayLoad() }} className="border-2" onClick={() => {newSession()}}>Let's go!</button>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <AiOutlineLoading style = {{ display: loaderDisplayLoad() }} className="animate-spin"/>
                            </IconContext.Provider>
                        </div>
                        <div style={{ display: showOtherPages }} className="flex w-full h-full box-border bg-white flex items-center justify-center flex-col gap-4">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <AiOutlineLoading style = {{ display: cardLoading }} className="animate-spin"/>
                                </IconContext.Provider>
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <h3 className="text-black w-full text-center">{subject}: {card[0]}</h3>
                                    <div style={{ display: showQ }} className="p-4 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                        <div className="p-8 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                            <p className="text-black">{card[1]}</p>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <input value={answer} onChange={(e)=>{setAnswer(e.target.value)}} className="text-black border-2 focus:outline-black p-2 grow" placeholder="Your answer"></input>
                                            <button onClick={()=>{onAnswer()}} className="border-2">Check</button>
                                        </div>
                                    </div>
                                    <div style={{ display: showA }} className="p-4 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                        <div className="p-8 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                            <p className="text-black">{feedback[0]+'!'}</p>
                                            <p className="text-black">{feedback[1]}</p>
                                            <button onClick={()=>{
                                                loadMaterial()
                                                setShowQA('Q')
                                            }} className="border-2">Next</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}