"use client"

import { db } from "@/firebase"
import { useUser, SignOutButton, UserButton } from "@clerk/nextjs"
import { collection, doc, getDocs, setDoc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState, useEffect, useLayoutEffect } from "react"
import { IoIosClose } from "react-icons/io";
import { IconContext } from "react-icons"
import { PiSidebar } from "react-icons/pi";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineLoading } from "react-icons/ai";
import { LuMenuSquare } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import MarkdownView from 'react-showdown';
import pdfToText from "react-pdftotext";

export default function Generate(){
    const [input, setInput] = useState('')
    const {isLoaded, isSignedIn, user} = useUser()
    const [page, setPage] = useState('create')
    const [sessions, setSessions] = useState([])
    const [sideBar, setSideBar] = useState('256px')
    const [loading, setLoading] = useState(false)
    const [showQA, setShowQA] = useState('Q')
    const [showQ, setShowQ] = useState('flex')
    const [showA, setShowA] = useState('none')
    const [screenType, setScreenType] = useState('')
    const [promptError, setPromptError] = useState('')

    useEffect(()=>{
        if (showQA=='Q'){
            setShowQ('flex')
            setShowA('none')
        } else {
            setShowQ('none')
            setShowA('flex')
        }
    }, [showQA])

    useEffect(()=>{
        if (isLoaded){
            if (!user){
                window.location.href="/"
            }
        }
    }, [isLoaded])

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

    const deleteSessions = async (currKey) => {
        if (isLoaded){
            if (user){
                const docRef = doc(collection(db, 'flashcard'), user.id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()){
                    var storedSessions = docSnap.data()
                    if (Object.keys(storedSessions).includes(currKey)){
                        delete storedSessions[currKey];
                        console.log(storedSessions)
                        setDoc(docRef, storedSessions)
                        setSessions(Object.keys(storedSessions).sort())
                    }
                }
            }
            renderPrevSessions();
        }
    }

    const renderPrevSessions = () => {
        let rows = []
        for (let i = 0; i<sessions.length; i++){
            rows.push(
                <div onClick={() => {
                        setPage(i)
                        setShowOtherPages('flex')
                    }} key={sessions[i]} className="flex wrap gap-1 flex-row p-2 w-full bg-gray-200 hover:brightness-90 cursor-pointer">
                    <p className="w-full text-left text-black">{sessions[i]}</p>
                    <div className="grow"/>
                    <div className="h-full flex items-center align-center">
                        <div className="rounded-full hover:bg-white p-1" onClick={()=>{deleteSessions(sessions[i])}}>
                            <IconContext.Provider value={{ color: 'black', size: '1rem' }}>
                                <IoMdClose/>
                            </IconContext.Provider>
                        </div>
                    </div>
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
        if (sideBar=='256px'){
            setSideBar('0px')
            return
        } else {
            setSideBar('256px')
            return
        }
    }
    const showIcons = () => {
        if (sideBar=='256px'){
            return "none"
        } else {
            if (screenType=="computer"){
                return "flex"
            } else {
                return "none"
            }
        }
    }
    const hideSidebar = () => {
        if (sideBar=='256px'){
            if (screenType=="computer"){
                return "flex"
            } else {
                return "none"
            }
        } else {
            return "none"
        }
    }
    const showMenuButton = () => {
        if (screenType=="computer"){
            return "none"
        } else {
            return "flex"
        }
    }
    const newSession = async () => {
        if (!loading){
            setLoading(true)
            if (user){
                if (user.id){
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
                    if (returnedTopics[0]=='inputError'){
                        setLoading(false)
                        setInput('')
                        setPromptError('Please input a legitimate topic')
                        return
                    }

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
                        curriculum: {

                        },
                        topics
                    }
                    await setDoc(docRef, prevData)
                    setInput('')
                    setSessions((prevData) => [...prevData, input])
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

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onAnswer();
        }
    };
    const handleNewTopics = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            newSession();
        }
    };

    const [mobileMenu, setMobileMenu] = useState('none')
    useLayoutEffect(() => {
        function updateSize() {
            if (window.innerWidth>768){
                setScreenType('computer')
                setMobileMenu('none')
                return
            } else {
                setScreenType('mobile')
                toggleSidebar()
                return
            }
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (screenType=='computer'){
            setSideBar('256px')
        } else {
            setSideBar('0px')
        }
    }, [screenType])
    
    const handleMenuToggle = () => {
        if (mobileMenu=="none"){
            setMobileMenu('flex')
            return
        } else {
            setMobileMenu('none')
            return
        }
    }

    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setSelectedFile(file);
        setDragOver(false);
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };
    const handleUpload = async () => {
        var currFile = selectedFile
        var newFile = ''
        pdfToText(currFile).then((text) => {console.log(text)})
        console.log(newFile)
        setSelectedFile(null)
    };

    return (
        <div className="h-screen w-screen md:p-12 p-0 flex items-center justify-center">
            <div className=" h-full w-full bg-[#ffffff88] md-rounded flex flex-row items-center justify-center overflow-hidden">
                <div style={{ width: sideBar }} className="bg-gray-200 h-full flex flex-col items-center justify-start transition-all">
                    <div className="p-4 flex flex-row w-full">
                        <div className="grow flex items-center justify-start">
                            <div style={{ display: hideSidebar() }} className="cursor-pointer rounded p-2 bg-gray-200 hover:brightness-90" onClick={toggleSidebar}>
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <PiSidebar/>
                                </IconContext.Provider>
                            </div>
                        </div>
                        <div className="grow flex items-center justify-end">
                            <div style={{ display: hideSidebar() }} className="cursor-pointer rounded p-2 bg-gray-200 hover:brightness-90" onClick={() => {
                                setShowCreate('flex')
                                setPage('create')
                            }}>
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <IoCreateOutline/>
                                </IconContext.Provider>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-4 pt-2">
                        <p className="p-2 text-black font-bold text-[0.8rem] w-full text-left ">Previous Sessions</p>
                        <hr className="px-2 bg-black h-px mb-2"/>
                        {renderPrevSessions()}
                    </div>
                </div>
                <div className="px-0 bg-white h-full grow flex flex-col">
                    <div className="z-10 bg-white w-full p-4 border-b-2 h-20 flex flex-row items-center gap-8">
                        <div style={{ display: showIcons() }} className="cursor-pointer rounded p-2 bg-white hover:brightness-90" onClick={toggleSidebar}>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <PiSidebar/>
                            </IconContext.Provider>
                        </div>
                        <div style={{ display: showMenuButton() }} onClick={() => {handleMenuToggle()}} className="cursor-pointer rounded p-2 bg-white hover:brightness-90">
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <LuMenuSquare/>
                            </IconContext.Provider>
                        </div>
                        <a href='/'>
                            <h2 className="text-black text-[1.5rem] h-8 hover:underline cursor-pointer">carta</h2>
                        </a>
                        <div className="grow"/>
                        <div style={{ display: showIcons() }} className="cursor-pointer rounded p-2 bg-white hover:brightness-90" onClick={() => {setPage('create')}}>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <IoCreateOutline/>
                            </IconContext.Provider>
                        </div>
                        <div style={{ display: showMenuButton() }} className="cursor-pointer rounded p-2 bg-white hover:brightness-90" onClick={() => {setPage('create')}}>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <IoCreateOutline/>
                            </IconContext.Provider>
                        </div>
                        <UserButton/>
                    </div>
                    <div className="w-full h-full flex flex-col p-12 overflow-x-hidden overflow-y-scroll">
                        <div style={{ display: showCreate }} className="flex w-full h-full box-border bg-white flex items-center justify-center flex-col gap-4">
                            <h3 className="text-center text-black">New Chat</h3>
                            <p className="text-black">Input your prompt:</p>
                            <input className="text-black border-2 focus:outline-black p-2" value={input} onChange={(e) => {
                                setInput(e.target.value)
                                handleNewTopics(e)
                            }} placeholder="Study topic"/>
                            <button style = {{ display: buttonDisplayLoad() }} className="border-2" onClick={() => {newSession()}}>Let's go!</button>
                            <p className="text-black">OR</p>
                            <div
                                className={dragOver ? "bg-white" : ""}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <button style={{display: selectedFile ? "none" : "flex"}} className="border-2" onClick={() => document.querySelector('#curriculum').click()}>Upload a curriculum (pdf)</button>
                                <input style={{display: 'none'}} type="file" id="curriculum" onChange={handleFileChange}/>
                                {selectedFile && (
                                    <div className="gap-4 flex flex-col items-center justify-center">
                                        <p className="text-black">{selectedFile.name}</p>
                                        <button className="border-2" onClick={handleUpload}>
                                            Upload File
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="font-light text-red-600 text-[0.8em]">{promptError}</p>
                            <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                <AiOutlineLoading style = {{ display: loaderDisplayLoad() }} className="animate-spin"/>
                            </IconContext.Provider>
                        </div>
                        <div style={{ display: showOtherPages }} className="flex w-full h-full box-border bg-white flex items-center justify-center flex-col gap-4">
                            <div className="flex grow flex-col items-center justify-center gap-4 w-full">
                                <IconContext.Provider value={{ color: 'black', size: '2rem' }}>
                                    <AiOutlineLoading style = {{ display: cardLoading }} className="animate-spin"/>
                                </IconContext.Provider>
                                <div className="grow flex flex-col items-center justify-center gap-4 w-full">
                                    <h3 className="text-black w-full text-center">{subject}: {card[0]}</h3>
                                    <div style={{ display: showQ }} className="w-full grow p-4 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                        <div className="grow p-8 w-full border-2 flex flex-col gap-4 items-center justify-center rounded">
                                            <p className="text-center text-black">{card[1]}</p>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <input value={answer} onChange={(e)=>{
                                                setAnswer(e.target.value)
                                                handleKeyPress()
                                            }} className="text-black border-2 focus:outline-black p-2 grow" placeholder="Your answer"></input>
                                            <button onClick={()=>{onAnswer()}} className="border-2">Check</button>
                                        </div>
                                    </div>
                                    <div style={{ display: showA }} className="w-full grow p-4 border-2 flex flex-col gap-4 items-center justify-center rounded">
                                        <div className="grow p-8 w-full border-2 flex flex-col gap-4 items-center justify-center rounded">
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
                        <div style={{ display: mobileMenu }} className="pt-20 absolute flex w-screen h-screen top-0 left-0 box-border bg-gray-200 flex items-center justify-center flex-col gap-4">
                            <div className="p-8 h-full w-full">
                                <div className="w-full flex flex-col p-4 pt-2">{renderPrevSessions()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}