import { ITheme } from "@flatfile/sdk";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { FlatfileTemplate } from "../interfaces/template";

const template: FlatfileTemplate = {
  type: "object",
  properties: {
    name: {
      label: "Name",
      type: "string",
    },
    slug: {
      label: "Slug",
      type: "string",
    },
    skylarkers: {
      label: "Skylarkers",
      type: "boolean"
    }
  },
  required: ["name"],
  unique: [],
}

const openFlatfile = async(embedId: string, importToken: string) => {
  const theme: ITheme = {
    loadingText: "Creating your records in Skylark...",
    displayName: "Skylark",
    logo: "https://assets.website-files.com/5f108589f5a3742f55bcf61c/602e8d596dd9ee3bef0846f6_Skylark%20Logo%20H%20Text.svg"
  }

  // Have to import flatfile on the clientside otherwise we error
  const Flatfile = (await import('@flatfile/sdk')).Flatfile
  Flatfile.requestDataFromUser({
    embedId,
    token: importToken,
    theme,
    onData(chunk, next) {
      /* handle submitted data here */
      console.log("chunk", chunk)
      next();
    },
    onComplete(payload) {
      console.log("complete", payload)
    },
  });
}

const startFlatfileImport = async() => {
  const res = await fetch("/api/template", {
    method: "POST",
    body: JSON.stringify({
      name: "RuiTest",
      template
    })
  })

  const data = await res.json() as {
    embedId: string
    token: string
  };

  console.log(data)

  await openFlatfile(data.embedId, data.token);
}

const options = [
  { label: "Select Skylark object", value: "" },
  { label: "Episode", value: "episode" },
  { label: "Themes", value: "themes" },
  { label: "People", value: "people" },
]

const Template: NextPage = () => {
  const [objectType, setObjectType] = useState(options[0].value);

  const disableImport = objectType === "";
  console.log(objectType, disableImport)


  return (
    <div className="flex justify-center">
      <Head>
        <title>FlatFile</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-screen mt-10  flex justify-center flex-col max-w-3xl">
        <div className="flex flex-row justify-between gap-4 items-center">
          <div>
            <p>Select your Skylark object type.</p>
            <p>When you press import, it will:</p>
            <ol className="list-decimal	list-outside ml-5 mt-2 text-sm">
              <li>Create a new template in Flatfile</li>
              <li>Create a new embed (Portal) in Flatfile, linking the template</li>
              <li>Open the Flatfile importer</li>
            </ol>
          </div>
          <div className="w-48">
            {/* <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900">Select an option</label> */}
            <select
              id="type"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => setObjectType(e.target.value)}
            >
              {options.map(({ label, value }) => (
                <option key={`${label}-${value}`} value={value} selected={value === ""}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-start gap-4 w-20">
            <button
              className="p-2 px-5 text-white bg-[#226dff] rounded disabled:bg-gray-300"
              disabled={objectType === ""}
              onClick={startFlatfileImport}
            >
              {`Import`}
            </button>
          </div>
        </div>
      </main>

      <footer></footer>
    </div>
  );
};

export default Template;