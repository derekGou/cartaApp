import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
You are a study helper. The user will input a subject, and you are to generate a question related to the subject. Ensure that the question is not worded in a manner that is vague, overly complex or difficult to understand.
Return as JSON in the form {"question": question}

The subject is:

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