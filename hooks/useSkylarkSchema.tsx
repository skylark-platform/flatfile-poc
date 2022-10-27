import { gql } from "graphql-request";
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
      inputFields: InputFieldsGQL[];
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

const getTemplateFields = (fields: InputFieldsGQL[]) => {
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

const parseInputsFromMutations = (unparsedList: MutationsListGQL) => {
  const test = unparsedList.map((item) => {
    // TODO change how access [0]
    return {
      objectType: item?.type?.name,
      inputObject: item?.args?.[0].type.name,
      inputFields: getTemplateFields(item?.args?.[0].type.inputFields),
    };
  });
  console.log("##", test);
  return test;
};

const filterCreateMutations = (mutations: MutationsListGQL) => {
  console.log("mutations without filter", mutations);
  parseInputsFromMutations(
    mutations?.filter((mutation) => mutation?.name.includes("create"))
  );
  return mutations?.filter((mutation) => mutation?.name.includes("create"));
};

export const useSkylarkSchema = () => {
  const data = graphQLClient
    .request(query, {})
    .then((data) => filterCreateMutations(data.__schema?.mutationType?.fields));
  return data;
};
