import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const Home: NextPage = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBio = async (e: any) => {
    e.preventDefault();

    setGeneratedResponse("");
    setLoading(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      setLoading(false);
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedResponse((prev) => prev + chunkValue);
    }

    setLoading(false);
    setPrompt("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-slate-200">
      <Head>
        <title>Testing OpenAI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-around px-4 md:px-20 text-center mt-12">
        <div className="flex w-full flex-col items-center justify-center">
          <p className="text-2xl md:text-4xl font-bold">
            Generate a response to a prompt
          </p>
          <textarea
            rows={8}
            className="w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-0 focus:ring-0 my-5 bg-slate-700 focus:bg-slate-800 text-white p-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            className="bg-slate-500 hover:bg-slate-600 text-white shadow-md px-4 py-2 rounded-md"
            onClick={generateBio}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Response"}
          </button>
        </div>

        {generatedResponse && (
          <div className="mt-8 w-full md:w-2/3 bg-slate-700 text-white px-4 py-8 rounded-md">
            <p className="text-xl font-bold">Generated Response</p>
            <p className="text-xs md:text-md mt-4">{generatedResponse}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
