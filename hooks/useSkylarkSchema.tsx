import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { graphQLClient } from "../skylark/graphqlClient";
import {
  FlatfileTemplateProperties,
  FlatfileTemplateProperty,
  FlatfileTemplatePropertyBoolean,
  FlatfileTemplatePropertyEnum,
  FlatfileTemplatePropertyNumber,
  FlatfileTemplatePropertyString,
} from "../interfaces/template";

type InputFieldGQL = {
  name: string;
  type: {
    name: string;
    kind: string;
    description: string | null;
    enumValues: { name: string }[] | null;
  };
};

type MutationsListGQL = {
  name: string;
  args: {
    name: string;
    defaultValue: string | null;
    type: {
      name: string;
      description: string;
      kind: string | null;
      inputFields: InputFieldGQL[];
    };
  }[];
  type: {
    name: string;
    kind: string | null;
    description: string | null;
    fields: { name: string }[] | null;
  };
}[];

const query = gql`
  {
    __schema {
      mutationType {
        name
        fields {
          name
          type {
            name
            kind
            description
            fields {
              name
            }
          }
          args {
            name
            defaultValue
            type {
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
        }
      }
    }
  }
`;

const getEnumTypes = (enumValues: { name: string }[] | null) => {
  if (!enumValues) return [];
  return enumValues?.map((value) => value?.name) || [];
};

const getProperties = (field: InputFieldGQL) => {
  switch (field.type.name) {
    case "String":
      return {
        label: field?.name,
        type: "string",
      } as FlatfileTemplatePropertyString;

    case "Int":
      return {
        label: field?.name,
        type: "number",
      } as FlatfileTemplatePropertyNumber;

    case "Boolean":
      return {
        label: field?.name,
        type: "boolean",
      } as FlatfileTemplatePropertyBoolean;

    default:
      return {
        label: field?.name,
        type: "string",
        enum: getEnumTypes(field?.type?.enumValues),
      } as FlatfileTemplatePropertyEnum;
  }
};

const getTemplateFields = (fields: InputFieldGQL[]): FlatfileTemplateProperties => {
  const newFields: FlatfileTemplateProperties = fields?.reduce(
    (acc, currentValue): FlatfileTemplateProperties => {
      if (currentValue.type.kind === ("SCALAR" || "ENUM")) {
        const properties: FlatfileTemplateProperty = getProperties(currentValue);
        return {
          ...acc,
          [currentValue?.name]: properties,
        };
      }
      return acc;
    },
    {}
  );
  return newFields;
};

const parseInputsFromMutations = (unparsedList: MutationsListGQL): { objectType: string, inputObject: string, inputFields: FlatfileTemplateProperties }[] => {
  const test = unparsedList.map((item) => {
    // TODO change how access [0] getInputObject INPUT_OBJECT
    return {
      objectType: item?.type?.name,
      inputObject: item?.args?.[0].type.name,
      inputFields: getTemplateFields(item?.args?.[0].type.inputFields),
    };
  });
  console.log("##", test);
  return test;
};

const filterCreateMutations = (mutations: MutationsListGQL) =>
  mutations?.filter((mutation) => mutation?.name.includes("create"));

const parseData = (mutations: MutationsListGQL) => {
  const filterdMutations = filterCreateMutations(mutations);
  return parseInputsFromMutations(filterdMutations);
};

export const useSkylarkSchema = () => {
  const [data, setData] = useState<{ objectType: string, inputObject: string, inputFields: FlatfileTemplateProperties }[]>([]);

  useEffect(() => {
    graphQLClient
      .request(query, {})
      .then((data) => setData(parseData(data.__schema?.mutationType?.fields)));
  }, []);

  return data;
};
