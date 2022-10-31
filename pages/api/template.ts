// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from "jsonwebtoken"
import { createTemplate, createEmbed } from '../../lib/flatfile/template';
import { FlatfileTemplate } from '../../interfaces/template';
import { exchangeFlatfileAccessKey } from '../../lib/flatfile/auth';

interface Data {
  embedId: string
  token: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method !== 'POST') {
    return res.status(501).end();
  }

  if(!process.env.FLATFILE_ACCESS_KEY_ID || !process.env.FLATFILE_SECRET_KEY) {
    return res.status(500).send("No Flatfile Access Key ID or Flatfile Secret supplied");
  }

  if(!req.body) {
    return res.status(400).send("Invalid request body")
  }

  const body = JSON.parse(req.body)

  if(!body || !body.template || !body.name) {
    return res.status(400).send("Invalid request body")
  }

  const org = { id: 39821, name: "Skylark" };
  let user = { id: 0, name: "", email: "" };
  let flatfileAccessToken = "";

  try {
    const data = await exchangeFlatfileAccessKey(process.env.FLATFILE_ACCESS_KEY_ID, process.env.FLATFILE_SECRET_KEY)

    user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    }
    flatfileAccessToken = data.accessToken

  } catch(err) {
    if((err as Error).message) {
      res.status(500).send((err as Error).message)
    }
    return res.status(500).send("Error exchanging Flatfile token")
  }

  const name = body.name as string;
  const requestTemplate = body.template as FlatfileTemplate;

  const template = await createTemplate(flatfileAccessToken, name, requestTemplate);
  const embed = await createEmbed(flatfileAccessToken, name, template.id);

  const importToken = jwt.sign(
    {
      embed: embed.id,
      user,
      org,
    },
    embed.privateKey.key,
  );

  res.status(200).json({ embedId: embed.id, token: importToken })
}
