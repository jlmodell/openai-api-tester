import type { NextRequest } from "next/server";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/openaistream";
import { isValidUser } from "../../utils/isValidUser";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: NextRequest): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { prompt, email } = (await req.json()) as {
    prompt?: string;
    email?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  if (!email) {
    return new Response("No email in the request", { status: 400 });
  }

  if (!isValidUser(email)) {
    return new Response("Invalid user", { status: 401 });
  }

  const payload: OpenAIStreamPayload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
