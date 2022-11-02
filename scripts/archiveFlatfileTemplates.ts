import dotenv from "dotenv";
dotenv.config();
import { FLATFILE_ENV, FLATFILE_TEAM } from "../constants";
import { exchangeFlatfileAccessKey } from "../lib/flatfile/auth";

import 'isomorphic-fetch';
import { gql } from "graphql-request";
import { createGraphQLClient } from "../lib/flatfile/create";

const flatfileEnvironment: "PROD" | "TEST" = "TEST";
const environmentId = FLATFILE_ENV[flatfileEnvironment];

const searchQuery = "";

const getEmbedsQuery = gql`
  query {
    getEmbeds(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${environmentId}"
      archived: false,
      search: "${searchQuery}"
    ) {
      pagination {
        nextOffset
        offset
        onPage
        previousOffset
      }
      data {
          id
          name
          schemas {
            id
            name
          }
      }
    }
  }
`

const getTemplatesQuery = gql`
  query {
    getSchemas(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${environmentId}"
      archived: false,
      search: "${searchQuery}"
    ) {
      pagination {
        nextOffset
        offset
        onPage
        previousOffset
      }
      data {
          id
          name
      }
    }
  }
`

const archiveEmbedMutation = gql`
  mutation(
    $embedId: UUID!
    $schemaIds: [ID!]!
  ) {
    updateEmbed(embedId: $embedId, schemaIds: $schemaIds, archived: true) {
      name
      archived
    }
  }
`

const archiveSchemaMutation = gql`
  mutation(
    $schemaId: ID!
  ) {
    updateSchema(schemaId: $schemaId, archived: true) {
      name
      archived
    }
  }
`

const getEmbeds = async(token: string) => {
  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ getEmbeds: { data: { name: string, id: string, schemas: { id: string, name: string }[] }[] } }>(getEmbedsQuery)
  return data.getEmbeds.data;

}

const getTemplates = async(token: string) => {
  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ getSchemas: { data: { name: string, id: string }[] } }>(getTemplatesQuery)
  return data.getSchemas.data;
}

const archiveEmbed = async(token: string, embedId: string, schemaIds: string[]) => {
  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ updateEmbed: { name: string, archived: boolean } }>(archiveEmbedMutation, {
    embedId,
    schemaIds,
  })
  return data.updateEmbed;
}

const archiveTemplate = async(token: string, schemaId: string) => {
  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ updateSchema: { name: string, archived: boolean } }>(archiveSchemaMutation, {
    schemaId
  })
  return data.updateSchema;
}

const main = async() => {
  if (searchQuery) {
    console.log(`Deleting Flatfile Portals and Templates matching the search: "${searchQuery}"`);
  } else {
    console.log("Deleting all Flatfile Portals and Templates");
  }

  if(!process.env.FLATFILE_ACCESS_KEY_ID || !process.env.FLATFILE_SECRET_KEY) {
    throw new Error("Missing Flatfile login info")
  }

  const { accessToken } = await exchangeFlatfileAccessKey(process.env.FLATFILE_ACCESS_KEY_ID, process.env.FLATFILE_SECRET_KEY);

  console.log("Fetching...")
  const embeds = await getEmbeds(accessToken);
  console.log(`Found ${embeds.length} Portals`)

  const templates = await getTemplates(accessToken)
  console.log(`Found ${templates.length} Templates`)

  console.log("Archiving...")

  const archivedEmbeds = await Promise.all(embeds.map(({ id: embedId, schemas }) => {
    const schemaIds = schemas.map(({ id: schemaId }) => schemaId);
    return archiveEmbed(accessToken, embedId, schemaIds);
  }))
  console.log(`Archived ${archivedEmbeds.filter(({ archived }) => !!archived).length} Portals`)

  const archivedTemplates = await Promise.all(templates.map(({ id: templateId }) => archiveTemplate(accessToken, templateId)));
  console.log(`Archived ${archivedTemplates.filter(({ archived }) => !!archived).length} Templates`)

  console.log("great success")
}

main().catch(console.error);
