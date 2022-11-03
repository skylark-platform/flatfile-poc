// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from "jsonwebtoken"
import { createTemplate, createEmbed, updateTemplate, updateEmbed } from '../../lib/flatfile/mutations';
import { FlatfileTemplate, FlatfileTemplatePropertyEnum } from '../../interfaces/template';
import { exchangeFlatfileAccessKey } from '../../lib/flatfile/auth';
import { getEmbeds, getTemplates } from '../../lib/flatfile/get';
import { SAAS_ACCOUNT_ID } from '../../constants';
import { languageCodes } from '../../languageCodes';

interface Data {
  embedId: string
  token: string
}

const languageChoice: FlatfileTemplatePropertyEnum = {
  type: "string",
  label: "Language",
  default: "en-gb",
  description: "The language code",
  enum: languageCodes,
  enumLabel: languageCodes
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

  const options = (body.options || {}) as { language?: boolean }

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

  const name = `${body.name as string}-${SAAS_ACCOUNT_ID}`.toLowerCase();
  const bodyTemplate = body.template as FlatfileTemplate;

  // When language is enabled, it should be the first column in Flatfile
  const templateWithLanguage = { ...bodyTemplate, properties: { language: languageChoice, ...bodyTemplate.properties }, required: ["language", ...bodyTemplate.required] };
  const requestTemplate: FlatfileTemplate = options.language ? templateWithLanguage : bodyTemplate;

  const foundTemplates = await getTemplates(flatfileAccessToken, name);
  const foundEmbeds = await getEmbeds(flatfileAccessToken, name);

  let template;
  if(foundTemplates.length > 0) {
    template = await updateTemplate(flatfileAccessToken, foundTemplates[0].id, requestTemplate);
  } else {
    template = await createTemplate(flatfileAccessToken, name, requestTemplate);
  }

  let embed;
  if(foundEmbeds.length > 0) {
    embed = await updateEmbed(flatfileAccessToken, foundEmbeds[0].id, [template.id]);
  } else {
    embed = await createEmbed(flatfileAccessToken, name, template.id);
  }

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
