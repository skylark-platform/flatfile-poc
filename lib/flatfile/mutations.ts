import { gql } from "graphql-request";
import { ACTIVE_FLATFILE_ENV, FLATFILE_TEAM } from "../../constants";
import { FlatfileTemplate } from "../../interfaces/template";
import { createFlatfileGraphQLClient } from "../graphqlClient";

const createSchemaMutation = gql`
  mutation(
    $name: String!
    $schema: JsonSchemaDto!
  ) {
    createSchema(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${ACTIVE_FLATFILE_ENV}"
      jsonSchema: $schema
      name: $name
    ) {
      name
      id
    }
  }
`

const createEmbedMutation = gql`
  mutation(
    $name: String!
    $schemaId: ID!
  ) {
    createEmbed(
      teamId: ${FLATFILE_TEAM}
      # Test environment UUID
      environmentId: "${ACTIVE_FLATFILE_ENV}"
      schemaIds: [$schemaId]
      name: $name
    ) {
      embed {
        name
        id
        privateKey {
          id
          scope
          key
        }
        privateKeyId
      }
    }
  }
`

const updateEmbedMutation = gql`
  mutation(
    $embedId: UUID!
    $schemaIds: [ID!]!
  ) {
    updateEmbed(embedId: $embedId, schemaIds: $schemaIds) {
      name
      id
      privateKey {
        id
        scope
        key
      }
      privateKeyId
    }
  }
`

const updateSchemaMutation = gql`
  mutation(
    $schemaId: ID!
    $schema: JsonSchemaDto!
  ) {
    updateSchema(schemaId: $schemaId, jsonSchema: $schema) {
      name
      id
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

export const createTemplate = async(token: string, name: string, schema: FlatfileTemplate) => {
  const variables = {
    name,
    schema: {
      schema,
    }
  }

  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ createSchema: { name: string, id: string } }>(createSchemaMutation, variables)
  console.log(JSON.stringify(data, undefined, 2))

  return data.createSchema;

}

export const createEmbed = async(token: string, name: string, schemaId: string) => {
  const variables = {
    name,
    schemaId
  }

  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ createEmbed: { embed: { name: string, id: string, privateKey: { id: string, scope: string, key: string } } } }>(createEmbedMutation, variables)
  console.log(JSON.stringify(data, undefined, 2))

  return data.createEmbed.embed;
}

export const updateEmbed = async(token: string, embedId: string, schemaIds: string[]) => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ updateEmbed: { name: string, id: string, privateKey: { id: string, scope: string, key: string } } }>(updateEmbedMutation, {
    embedId,
    schemaIds,
  })
  return data.updateEmbed;
}

export const updateTemplate = async(token: string, schemaId: string, schema: FlatfileTemplate) => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ updateSchema: { name: string, id: string } }>(updateSchemaMutation, {
    schemaId,
    schema: {
      schema,
    }
  })
  return data.updateSchema;
}

export const archiveEmbed = async(token: string, embedId: string, schemaIds: string[]) => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ updateEmbed: { name: string, archived: boolean } }>(archiveEmbedMutation, {
    embedId,
    schemaIds,
  })
  return data.updateEmbed;
}

export const archiveTemplate = async(token: string, schemaId: string) => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{ updateSchema: { name: string, archived: boolean } }>(archiveSchemaMutation, {
    schemaId
  })
  return data.updateSchema;
}
