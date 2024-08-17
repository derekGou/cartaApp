import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
Your job is to take the user's prompt and generate a JSON object of 10 subtopics of the subject for the user to study.
return as: {subtopics: [ListOfItems]}
`

export async function POST(req){
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const data = await req.text(); // Get the prompt

    let response = await model.generateContentStream(systemPrompt+data)
    const stream = new ReadableStream({
        async start(controller){
            try {
                const encoder = new TextEncoder()
                for await (const chunk of response.stream){
                    const content = chunk.text();
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err){
                console.log(err) 
            } finally {
                controller.close()
            }
        }
    })
    return new NextResponse(stream)
}