import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
The user is answering a question. Your job is to judge if their answer is correct or not

If an answer is correct, return true. The answer must be factually correct and complete to be true.

If not, then return false.

You should also return a tip for them to improve their answer.

Return as {
    'correct': return_value,
    'improvement': improvement
}

The subject, question, and user answer are provided down below: 

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