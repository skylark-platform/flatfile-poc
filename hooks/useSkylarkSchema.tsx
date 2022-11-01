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

type TypeGQL = {
  kind: string | null;
  name: string;
  description: string | null;
  enumValues: { name: string }[] | null;
  inputFields: InputFieldGQL[];
};

type InputValue = {
  name: string;
  description: string;
  type: Pick<TypeGQL, "name" | "kind" | "inputFields" | "description">;
  defaultValue: string;
};

type InputFieldGQL = {
  name: string;
  type: Pick<TypeGQL, "name" | "kind" | "enumValues" | "description">;
};

type MutationsListGQL = {
  name: string;
  args: InputValue[];
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
  if (field.type.kind === "ENUM") {
    const enumValues = getEnumTypes(field?.type?.enumValues);
    return {
      label: field?.name,
      type: "string",
      enum: enumValues,
      enumLabel: enumValues,
    } as FlatfileTemplatePropertyEnum;
  }

  switch (field.type.name) {
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
        ["SCALAR", "ENUM"].includes(currentValue.type.kind)
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
): {
  objectType: string;
  inputObject: string;
  inputFields: FlatfileTemplateProperties;
}[] => {
  return unparsedList.map(({ type, args }) => {
    const inputValue = getObjectInput(args);
    return {
      objectType: type?.name,
      inputObject: inputValue.type.name,
      inputFields: getTemplateFields(inputValue.type.inputFields),
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
  const filterdMutations = filterCreateMutations(mutations);
  return parseInputsFromMutations(filterdMutations);
};

export const useSkylarkSchema = () => {
  const [data, setData] = useState<
    {
      objectType: string;
      inputObject: string;
      inputFields: FlatfileTemplateProperties;
    }[]
  >([]);

  useEffect(() => {
    graphQLClient
      .request(query, {})
      .then((data) => setData(parseData(data.__schema?.mutationType?.fields)));
  }, []);

  return data;
};
