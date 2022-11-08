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

interface Data {
  embedId: string;
  token: string;
}

const rowsParser = (rows: any) => {
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

  return res.status(200).send(`James made it work ${JSON.stringify(data)}`);
  // }

  /// TODO

  return res.status(200).send(`James made it work - second`);
}
