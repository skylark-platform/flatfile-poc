import { graphQLClient } from "../skylark/graphqlClient";

type Types = "String" | "List" | "Int";

type Fields = {
  name: string;
  type: string;
  options?: string[];
};

const HARDCODED_OBJECT = "EpisodeInput";

const query = `
{
    __type(name: "${HARDCODED_OBJECT}") {
      name
      kind
      inputFields {
        name
        type {
          name
          kind
          description
          enumValues{
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

const getEnumTypes: string[] = (enumValues) => {
  if (!enumValues) return [];
  return enumValues?.map((value) => value?.name) || [];
};

const getFields = (fields: any) => {
  console.log("fields without filter new", fields);

  const newFields = fields?.map((field) => {
    return { name: field?.name, type: field?.type?.name };
  });

  console.log("NEW", newFields);

  return fields?.filter((field) => field?.type?.name != null);
};

const x = [
  { name: "Title", type: "string" },
  { name: "Age", type: "int" },
  { name: "Type", type: "enum", options: ["Main", "Collection"] },
];

// RENAME TO GET_FIELDS_FROM_INPUT ?
// ADD input as an argument ?
export const useInput = () => {
  const data = graphQLClient
    .request(query, {})
    .then((data) => console.log(getFields(data.__type?.inputFields)));

  console.log("final data", data);
  return data;
};
