import { GraphQLClient, gql } from "graphql-request";
import { FLATFILE_ENV, FLATFILE_GRAPHQL_URL, FLATFILE_TEAM } from "../../constants";
import { FlatfileTemplate } from "../../interfaces/template";

const environmentId = FLATFILE_ENV.TEST;

export const createGraphQLClient = (token: string) => new GraphQLClient(FLATFILE_GRAPHQL_URL, {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

const createSchemaMutation = gql`
  mutation(
    $name: String!
    $schema: JsonSchemaDto!
  ) {
    createSchema(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${environmentId}"
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
      environmentId: "${environmentId}"
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

export const createTemplate = async(token: string, name: string, schema: FlatfileTemplate) => {
  const variables = {
    name,
    schema: {
      schema,
    }
  }

  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ createSchema: { name: string, id: string } }>(createSchemaMutation, variables)
  console.log(JSON.stringify(data, undefined, 2))

  return data.createSchema;

}

export const createEmbed = async(token: string, name: string, schemaId: string) => {
  const variables = {
    name,
    schemaId
  }

  const graphQLClient = createGraphQLClient(token);
  const data = await graphQLClient.request<{ createEmbed: { embed: { name: string, id: string, privateKey: { id: string, scope: string, key: string } } } }>(createEmbedMutation, variables)
  console.log(JSON.stringify(data, undefined, 2))

  return data.createEmbed.embed;

}
