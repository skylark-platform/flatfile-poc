import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { skylarkGraphQLClient } from "../lib/graphqlClient";
import {
  FlatfileTemplateProperties,
  FlatfileTemplateProperty,
  FlatfileTemplatePropertyBoolean,
  FlatfileTemplatePropertyEnum,
  FlatfileTemplatePropertyNumber,
  FlatfileTemplatePropertyString,
} from "../interfaces/template";

type Kind = "SCALAR" | "LIST" | "NON_NULL" | "ENUM" | "INPUT_OBJECT";

type TypeGQL = {
  kind: Kind | null;
  name: string;
  description: string | null;
  enumValues: { name: string }[] | null;
  inputFields: InputFieldGQL[];
  ofType: Pick<TypeGQL, "name" | "kind"> | null;
};

type InputValue = {
  name: string;
  description: string;
  type: Pick<TypeGQL, "name" | "kind" | "inputFields" | "description">;
  defaultValue: string;
};

type InputFieldGQL = {
  name: string;
  type: Pick<
    TypeGQL,
    "name" | "kind" | "enumValues" | "description" | "ofType"
  >;
};

type MutationsListGQL = {
  name: string;
  args: InputValue[];
  type: {
    name: string;
    kind: Kind | null;
    description: string | null;
    fields: { name: string }[] | null;
    ofType: string;
  };
}[];

type ParsedGQLObjects = {
  objectType: string;
  input: {
    name: string;
    fields: FlatfileTemplateProperties;
    requiredFields: string[];
  };
}[];

const query = gql`
  {
    __type(name: "EpisodeInput") {
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

export const useSkylarkProperties = () => {
  const [data, setData] = useState<ParsedGQLObjects>([]);

  useEffect(() => {
    skylarkGraphQLClient
      .request(query, {})
      .then((data) => setData(data.__schema?.mutationType?.fields));
  }, []);

  return data;
};
