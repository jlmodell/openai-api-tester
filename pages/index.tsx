import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const LoginComponent = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="w-1/2 p-4 bg-white border-0 ring-0 outline-none shadow-md text-lg rounded-md absolute top-2 mx-auto">
        Signed in as {session?.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="w-1/2 p-4 bg-white border-0 ring-0 outline-none shadow-md text-lg">
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
};

const isValidUser = (email: string) =>
  [
    "jacquescousteau@gmail.com",
    "meagan.modell@gmail.com",
    "hmenjivar87@gmail.com",
  ].includes(email.toLowerCase());

const Home: NextPage = () => {
  const { data: session } = useSession();

  const [prompt, setPrompt] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [output, setOutput] = useState("");

  const generateBio = async (e: any) => {
    e.preventDefault();

    if (!prompt) {
      alert("Please enter a prompt");
      return;
    }

    if (!isValidUser(session?.user?.email ?? "")) {
      alert("You are not authorized to use this application.");
      return;
    }

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

    setOutput(prompt);
    setPrompt("");

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
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-slate-200">
      <Head>
        <title>Testing OpenAI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-around px-4 md:px-20 text-center mt-12">
        <LoginComponent />

        {session && (
          <>
            {generatedResponse && (
              <div className="mt-8 w-full md:w-2/3 bg-slate-700 text-white py-8 rounded-md flex flex-col space-4">
                <div className="bg-stone-800 p-2">
                  <p className="text-lg font-semibold text-left">
                    {session?.user?.email}'s prompt
                  </p>
                  <p className="text-xs md:text-lg mt-4 text-left">{output}</p>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-semibold text-right px-2">
                    Generated Response
                  </p>
                  <p className="text-xs md:text-lg mt-4 text-right px-2">
                    {generatedResponse}
                  </p>
                </div>
              </div>
            )}

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
                {loading ? "..." : "Generate Response"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
