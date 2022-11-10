import { gql } from "graphql-request";
import { skylarkGraphQLClient } from "../lib/graphqlClient";

import { InputFieldGQL } from "../types/types";

const query = gql`
  {
    __type(name: "PersonInput") {
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
  input: string
): Promise<InputFieldGQL[]> => {
  const data = await skylarkGraphQLClient.request(query, {});

  console.log("coool", data?.__type?.inputFields);
  return data?.__type?.inputFields;
};
