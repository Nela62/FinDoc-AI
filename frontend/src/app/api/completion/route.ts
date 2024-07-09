// import OpenAI from 'openai';
// import { OpenAIStream, StreamingTextResponse } from 'ai';

// // Create an OpenAI API client (that's edge friendly!)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Set the runtime to edge for best performance
// export const runtime = 'edge';

// // def get_completion(prompt, model="gpt-3.5-turbo"):
// //     messages = [{"role": "user", "content": prompt}]
// //     response = openai.ChatCompletion.create(
// //         model=model,
// //         messages=messages,
// //         temperature=0, # this is the degree of randomness of the model's output
// //     )
// //     return response.choices[0].message["content"]

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   // Ask OpenAI for a streaming chat completion given the prompt
//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     stream: true,
//     messages,
//   });

//   // Convert the response into a friendly text-stream
//   const stream = OpenAIStream(response);
//   // Respond with the stream
//   return new StreamingTextResponse(stream);
// }

export async function GET(req: Request) {
  return Response.json({ success: 'true' });
}
