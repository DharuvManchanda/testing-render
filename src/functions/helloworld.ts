import { GSContext, PlainObject, GSStatus } from "@godspeedsystems/core";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function(ctx: GSContext, args: PlainObject) {
    const {
        inputs: {
            data: {
                query,
                body
            }
        },
    } = ctx;

    if (!body || !body.question) {
        return new GSStatus(false, 400, 'Bad Request: The "question" field is missing from the request body.', undefined, undefined);
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return new GSStatus(false, 500, 'Internal Server Error: GEMINI_API_KEY is not configured.', undefined, undefined);
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = body.question;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new GSStatus(true, 200, undefined, {
            answer: text,
            name: query.name
        }, undefined);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return new GSStatus(false, 502, 'Bad Gateway: The Gemini API is currently unavailable or returned an error.', undefined, undefined);
    }
}