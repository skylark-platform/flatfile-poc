import { ITheme } from "@flatfile/sdk";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

import { useSkylarkSchema } from "../hooks/useSkylarkSchema";
import { FlatfileTemplate } from "../interfaces/template";

const importToSkylark = async (batchId: string, objectType: string) => {
  const res = await fetch("/api/import", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      batchId,
      objectType,
    }),
  });

  const data = await res.json();

  console.log(data);
};

const openFlatfile = async (
  embedId: string,
  importToken: string,
  objectType: string
) => {
  const theme: ITheme = {
    loadingText: "Creating your records in Skylark...",
    displayName: "Skylark",
    logo: "https://assets.website-files.com/5f108589f5a3742f55bcf61c/602e8d596dd9ee3bef0846f6_Skylark%20Logo%20H%20Text.svg",
  };

  // Have to import flatfile on the clientside otherwise we error
  const Flatfile = (await import("@flatfile/sdk")).Flatfile;
  Flatfile.requestDataFromUser({
    embedId,
    token: importToken,
    theme,
    onData(chunk, next) {
      /* handle submitted data here */
      console.log("chunk", chunk);
      next();
    },
    onComplete(payload) {
      const { batchId } = payload;
      console.log("complete ---", payload);

      if (batchId) {
        console.log("batch", batchId);
        // TODO improve how the import callback is called
        void importToSkylark(batchId, objectType);
      }
    },
  });
};

const startFlatfileImport = async (
  name: string,
  template: FlatfileTemplate,
  objectType: string,
  options: { language?: boolean }
) => {
  const res = await fetch("/api/template", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name,
      template,
      options,
    }),
  });

  const data = (await res.json()) as {
    embedId: string;
    token: string;
  };

  console.log(data);

  await openFlatfile(data.embedId, data.token, objectType);
};

const Template: NextPage = () => {
  const schemaObjects = useSkylarkSchema();

  const options = schemaObjects.map(({ objectType }) => objectType).sort();

  const [objectType, setObjectType] = useState("");
  const objectInput = schemaObjects.find(
    (obj) => objectType === obj.objectType
  )?.input;

  const flatfileTemplate: FlatfileTemplate = {
    type: "object",
    properties: objectInput?.fields || {},
    required: objectInput?.requiredFields || [],
    unique: [],
  };

  console.log(flatfileTemplate);
  return (
    <div className="flex justify-center">
      <Head>
        <title>FlatFile</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-screen mt-10  flex justify-center flex-col max-w-4xl">
        <div className="flex flex-row justify-between gap-4 items-center">
          <div>
            <p>Select your Skylark object type.</p>
            <p>When you press import, it will:</p>
            <ol className="list-decimal	list-outside ml-5 mt-2 text-sm">
              <li>Create a new template in Flatfile</li>
              <li>
                Create a new embed (Portal) in Flatfile, linking the template
              </li>
              <li>Open the Flatfile importer</li>
            </ol>
          </div>
          <div className="w-48">
            <select
              id="type"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => setObjectType(e.target.value)}
            >
              <option value="" defaultChecked>{`Select Skylark object`}</option>
              {options.map((objectType) => (
                <option key={objectType} value={objectType}>
                  {objectType}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-start gap-4 w-48 flex-col">
            <button
              className="p-2 px-2 text-white bg-[#226dff] rounded disabled:bg-gray-300 w-full"
              disabled={objectType === "" || !objectInput}
              onClick={() =>
                objectInput &&
                startFlatfileImport(
                  objectType,
                  flatfileTemplate,
                  objectType,
                  {}
                )
              }
            >
              {`Import`}
            </button>
            <button
              className="p-2 px-2 bg-white border-2 border-[#226dff] text-[#226dff] rounded w-full disabled:border-gray-300 disabled:text-gray-300"
              disabled={objectType === "" || !objectInput}
              onClick={() =>
                objectInput &&
                startFlatfileImport(objectType, flatfileTemplate, objectType, {
                  language: true,
                })
              }
            >
              {`Import with language`}
            </button>
          </div>
        </div>
      </main>

      <footer></footer>
    </div>
  );
};

export default Template;
