import { gql } from "graphql-request";
import { skylarkGraphQLClient } from "./graphqlClient";

import { InputFieldGQL } from "../types/gqlTypes";

const query = gql`
  {
    __schema {
      types {
        name
      }
    }
  }
`;

const getSkylarkObjects = async (): Promise<InputFieldGQL[]> => {
  const data = await skylarkGraphQLClient.request(query, {});
  return data?.__schema?.types;
};

export const existsSkylarkObject = async (
  objectType: string
): Promise<Boolean> => {
  const objects = await getSkylarkObjects();
  return objects.map((item) => item.name).includes(objectType);
};
