import { graphQLClient } from "../skylark/graphqlClient";
import { FlatfileTemplateProperties } from "../interfaces/template";

type InputFieldsGQL = {
  name: string;
  type: {
    name: string;
    kind: string;
    description: string | null;
    enumValues: { name: string }[] | null;
  };
}[];

const HARDCODED_OBJECT = "AssetInput";

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

//TODO deprecated ?
const getFields = (fields: any) => {
  return fields?.map((field) => {
    return { name: field?.name, type: field?.type?.name, options: [] };
  });
};

const getEnumTypes = (enumValues: { name: string }[] | null) => {
  if (!enumValues) return [];
  return enumValues?.map((value) => value?.name) || [];
};

const getTemplateFields = (fields: InputFieldsGQL) => {
  console.log("fields without filter new", fields);

  const newFields: FlatfileTemplateProperties = fields?.reduce(
    (acc, currentValue) => ({
      ...acc,
      [currentValue?.name]: {
        label: currentValue?.name,
        type: currentValue?.type?.name,
        enum:
          currentValue?.type?.kind === "ENUM"
            ? getEnumTypes(currentValue?.type?.enumValues)
            : [],
        enumLabel:
          currentValue?.type?.kind === "ENUM"
            ? getEnumTypes(currentValue?.type?.enumValues)
            : [],
      },
    }),
    {}
  );

  console.log("good new ##", newFields);

  return newFields;
};

// RENAME TO GET_FIELDS_FROM_INPUT ?
// ADD input as an argument ?
export const useInput = () => {
  const data = graphQLClient
    .request(query, {})
    .then((data) => getTemplateFields(data.__type?.inputFields));

  console.log("final data", data);
  return data;
};
