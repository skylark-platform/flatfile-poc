import { gql } from "graphql-request";
import { skylarkGraphQLClient } from "./graphqlClient";

import { InputFieldGQL } from "../types/gqlTypes";

const query = gql`
  query ($objectTypeInput: String!) {
    __type(name: $objectTypeInput) {
      name
      kind
      description
      inputFields {
        name
        type {
          name
          kind
          description
          enumValues {
            name
          }
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

export const getSkylarkProperties = async (
  objectType: string
): Promise<InputFieldGQL[]> => {
  const objectTypeInput = `${objectType}Input`;
  const data = await skylarkGraphQLClient.request(query, { objectTypeInput });
  return data?.__type?.inputFields;
};
