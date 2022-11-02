import dotenv from "dotenv";
dotenv.config();
import { exchangeFlatfileAccessKey } from "../lib/flatfile/auth";
import 'isomorphic-fetch';
import { getEmbeds, getTemplates } from "../lib/flatfile/get";
import { archiveEmbed, archiveTemplate } from "../lib/flatfile/mutations";

const SEARCH_QUERY = "";

const main = async() => {
  if (SEARCH_QUERY) {
    console.log(`Deleting Flatfile Portals and Templates matching the search: "${SEARCH_QUERY}"`);
  } else {
    console.log("Deleting all Flatfile Portals and Templates");
  }

  if(!process.env.FLATFILE_ACCESS_KEY_ID || !process.env.FLATFILE_SECRET_KEY) {
    throw new Error("Missing Flatfile login info")
  }

  const { accessToken } = await exchangeFlatfileAccessKey(process.env.FLATFILE_ACCESS_KEY_ID, process.env.FLATFILE_SECRET_KEY);

  console.log("Fetching...")
  const embeds = await getEmbeds(accessToken, SEARCH_QUERY);
  console.log(`Found ${embeds.length} Portals`)

  const templates = await getTemplates(accessToken, SEARCH_QUERY)
  console.log(`Found ${templates.length} Templates`)

  if (embeds.length > 0 || templates.length > 0) {
    console.log("Archiving...")

    const archivedEmbeds = await Promise.all(embeds.map(({ id: embedId, schemas }) => {
      const schemaIds = schemas.map(({ id: schemaId }) => schemaId);
      return archiveEmbed(accessToken, embedId, schemaIds);
    }))
    console.log(`Archived ${archivedEmbeds.filter(({ archived }) => !!archived).length} Portals`)

    const archivedTemplates = await Promise.all(templates.map(({ id: templateId }) => archiveTemplate(accessToken, templateId)));
    console.log(`Archived ${archivedTemplates.filter(({ archived }) => !!archived).length} Templates`)
  }

  console.log("great success")
}

main().catch(console.error);
