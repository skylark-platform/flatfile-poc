import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { skylarkGraphQLClient } from "../lib/graphqlClient";

import { InputFieldGQL } from "./types";

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

export const getSkylarkProperties = async (input: string) => {
  const data = await skylarkGraphQLClient.request(query, {});
  return data?.__type?.inputFields;
};

export const useSkylarkProperties = () => {
  const [data, setData] = useState<InputFieldGQL[]>([]);

  console.log("coool", data);

  useEffect(() => {
    skylarkGraphQLClient
      .request(query, {})
      .then((data) => setData(data?.__type?.inputFields));
  }, []);

  return data;
};
