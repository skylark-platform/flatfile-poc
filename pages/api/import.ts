// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import { getFinalDatabaseView } from "../../lib/flatfile/get";
import {
  createTemplate,
  createEmbed,
  updateTemplate,
  updateEmbed,
} from "../../lib/flatfile/mutations";
import { FlatfileTemplate } from "../../interfaces/template";
import { exchangeFlatfileAccessKey } from "../../lib/flatfile/auth";
import { getEmbeds, getTemplates } from "../../lib/flatfile/get";
import { SAAS_ACCOUNT_ID } from "../../constants";
import { getSkylarkProperties } from "../../hooks/useSkylarkProperties";

interface Data {
  embedId: string;
  token: string;
}

interface Row {
  id: number;
  status: string;
  valid: boolean;
  data: {
    [key: string]: string | boolean | null;
  };
  info: [];
}

const propertiesToRemove = (
  originalFields: { [key: string]: any },
  properties: string[]
) => {
  return Object.keys(originalFields).filter((property) =>
    properties.includes(property)
  );
};

export const getValidFields = (
  fields: {
    [key: string]: any;
  },
  validProperties: string[]
): { [key: string]: any } => {
  const validObjectFields = validProperties.filter((property) =>
    Object.keys(fields).includes(property)
  );

  const validFields = validObjectFields.reduce((obj, property) => {
    return {
      ...obj,
      [property]: obj[property],
    };
  }, {} as { [key: string]: string | number | boolean });

  return validFields;
};

const parseDataToImport = (rows: Row[], properties: any) => {
  const validProperties = properties.map((p) => p.name);

  const validFields = getValidFields(rows, validProperties);
  return validFields;
  // TODO get valid props
  // TODO match from rows
  // TODO insert
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method !== "POST") {
    return res.status(501).end();
  }

  if (!process.env.FLATFILE_ACCESS_KEY_ID || !process.env.FLATFILE_SECRET_KEY) {
    return res
      .status(500)
      .send("No Flatfile Access Key ID or Flatfile Secret supplied");
  }

  const org = { id: 39821, name: "Skylark" };
  let user = { id: 0, name: "", email: "" };
  let flatfileAccessToken = "";

  try {
    const data = await exchangeFlatfileAccessKey(
      process.env.FLATFILE_ACCESS_KEY_ID,
      process.env.FLATFILE_SECRET_KEY
    );

    user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    };
    flatfileAccessToken = data.accessToken;
  } catch (err) {
    if ((err as Error).message) {
      res.status(500).send((err as Error).message);
    }
    return res.status(500).send("Error exchanging Flatfile token");
  }

  // if (flatfileAccessToken) {
  console.log(" herree ####", flatfileAccessToken);
  const data = await getFinalDatabaseView(
    flatfileAccessToken,
    "2ca28f49-bc3d-41a4-b40a-06ef57cea65d"
  );

  // DEPRECATED ?
  /*  
//TODO get inputName
  const properties = await getSkylarkProperties("");

  const dataToImport = parseDataToImport(
    data?.getFinalDatabaseView?.rows,
    properties
  );
*/
  const goodRows = data?.getFinalDatabaseView?.rows.map(
    (item) => item.status === "accepted" && item.valid
  );

  // check status and valid

  // TODO dynamic name
  // MUTATION
  /*
mutation MyMutation {
    createPerson {
      bio_long
    }
  }
*/

  return res.status(200).send(`James made it work ${JSON.stringify(goodRows)}`);
}
