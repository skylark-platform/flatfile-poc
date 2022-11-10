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

import {
  InputFieldGQL,
  InputValue,
  Kind,
  MutationsListGQL,
} from "../types/gqlTypes";
import { ParsedGQLObjects } from "../types/types";

const supportedKinds: Kind[] = ["ENUM", "SCALAR", "NON_NULL"];

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
  if (field.type.kind === "ENUM") {
    const enumValues = getEnumTypes(field?.type?.enumValues);
    return {
      label: field?.name,
      type: "string",
      enum: enumValues,
      enumLabel: enumValues,
    } as FlatfileTemplatePropertyEnum;
  }

  // When the type is NON_NULL, the type name is in ofType
  const fieldName =
    field.type.kind === "NON_NULL" && field.type.ofType
      ? field.type.ofType.name
      : field.type.name;

  switch (fieldName) {
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
      } as FlatfileTemplatePropertyString;
  }
};

const getTemplateFields = (
  fields: InputFieldGQL[]
): FlatfileTemplateProperties => {
  const newFields: FlatfileTemplateProperties = fields?.reduce(
    (acc, currentValue): FlatfileTemplateProperties => {
      if (
        currentValue.type.kind &&
        supportedKinds.includes(currentValue.type.kind)
      ) {
        const properties: FlatfileTemplateProperty =
          getProperties(currentValue);
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

const getRequiredFields = (fields: InputFieldGQL[]): string[] => {
  const nonNullFields = fields
    .filter(({ type }) => type.kind === "NON_NULL")
    .map(({ name }) => name);
  return nonNullFields;
};

const getObjectInput = (args: InputValue[]) => {
  const [first] = args;
  return args.find((input) => input.type.kind === "INPUT_OBJECT") || first;
};

const hasObjectInput = (args: InputValue[]) => {
  const [first] = args;
  return args.some((input) => input.type.kind === "INPUT_OBJECT");
};

const parseInputsFromMutations = (
  unparsedList: MutationsListGQL
): ParsedGQLObjects => {
  return unparsedList.map(({ type, args }) => {
    const inputValue = getObjectInput(args);
    return {
      objectType: type?.name,
      input: {
        name: inputValue.type.name,
        fields: getTemplateFields(inputValue.type.inputFields),
        requiredFields: getRequiredFields(inputValue.type.inputFields),
      },
    };
  });
};

const filterCreateMutations = (mutations: MutationsListGQL) =>
  mutations?.filter(
    (mutation) =>
      mutation?.name.includes("create") && hasObjectInput(mutation?.args)
  );

const filterUpdateMutations = (mutations: MutationsListGQL) =>
  mutations?.filter(
    (mutation) =>
      mutation?.name.includes("update") && hasObjectInput(mutation?.args)
  );

const parseData = (mutations: MutationsListGQL) => {
  const filteredMutations = filterCreateMutations(mutations);
  return parseInputsFromMutations(filteredMutations);
};

export const useSkylarkSchema = () => {
  const [data, setData] = useState<ParsedGQLObjects>([]);

  useEffect(() => {
    skylarkGraphQLClient
      .request(query, {})
      .then((data) => setData(parseData(data.__schema?.mutationType?.fields)));
  }, []);

  return data;
};
