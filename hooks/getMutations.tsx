import { graphQLClient } from "../skylark/graphqlClient";

type MutationsListGQL = {
  name: string;
  args: {
    name: string;
    defaultValue: string | null;
    type: { name: string; description: string; kind: string | null };
  }[];
  type: {
    name: string;
    kind: string | null;
    description: string | null;
    fields: { name: string }[] | null;
  };
}[];

const query = `
{
  __schema {
    mutationType {
      name
      fields {
        name
        type {
          name
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
            description
          }
        }
      }
    }
  }
  }
  `;

const parseInputsFromMutations = (unparsedList: MutationsListGQL) => {
  const test = unparsedList.map((item) => {
    // TODO change access to [0]
    return {
      objectType: item?.args?.[0].name,
      inputObject: item?.args?.[0].type.name,
    };
  });
  console.log("##", test);
  return test;
};

const filterCreateMutations = (mutations) => {
  console.log("mutations without filter", mutations);
  parseInputsFromMutations(
    mutations?.filter((field) => field?.name.includes("create"))
  );
  return mutations?.filter((field) => field?.name.includes("create"));
};

export const getMutations = () => {
  const data = graphQLClient
    .request(query, {})
    .then((data) => filterCreateMutations(data.__schema?.mutationType?.fields));
  return data;
};
