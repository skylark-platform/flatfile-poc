// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from "jsonwebtoken"
import { createTemplate, createEmbed } from '../../lib/template';
import { FlatfileTemplate, FlatfileTemplateProperties } from '../../interfaces/template';
import { FLATFILE_TOKEN } from '../../constants';

// This is a public Embed ID and a private key.
// Private key should be used to sign a JWT.
// const EMBED_ID = "YOUR_EMBED_ID";
// const PRIVATE_KEY = "YOUR_PRIVATE_KEY";

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

  const body = JSON.parse(req.body)

  if(!body.template || !body.name) {
    return res.status(400).send("Invalid request body")
  }

  const name = body.name as string;
  const requestTemplate = body.template as FlatfileTemplate;

  const template = await createTemplate(FLATFILE_TOKEN, name, requestTemplate);
  const embed = await createEmbed(FLATFILE_TOKEN, name, template.id);

  const importToken = jwt.sign(
    {
      embed: embed.id,
      user: { id: 41650, name: "James Wallis", email: "james@skylarkplatform.com" },
      org: { id: 39821, name: "Skylark" },
    },
    embed.privateKey.key,
  );

  // Should return the embedID and the token

  res.status(200).json({ embedId: embed.id, token: importToken })
}
