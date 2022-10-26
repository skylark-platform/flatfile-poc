import { Sheet, Workbook, TextField, NumberField, Message, DateField, OptionField, BooleanField } from "@flatfile/configure";
import { GraphQLClient, gql } from "graphql-request";
import { FlatfileTemplateProperties } from "../interfaces/template";
// import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
// import fetch from 'node-fetch'

const token = process.env.NEXT_PUBLIC_FLATFILE_AUTH_TOKEN as string;
const team = process.env.NEXT_PUBLIC_FLATFILE_TEAM_ID as string;

const graphQLClient = new GraphQLClient("https://api.us.flatfile.io/graphql", {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

const getSchemasQuery = gql`
  query getSchemas {
    getSchemas(teamId: ${team}) {
      pagination {
        totalCount
        nextOffset
        limit
      }
      data {
          name
      }
    }
  }
`;

const createSchemaMutation = gql`
  mutation(
    $name: String!
    $schema: JsonSchemaDto!
  ) {
    createSchema(
      teamId: ${team}
      jsonSchema: $schema
      name: $name
    ) {
      name
      id
    }
  }
`

export const getTemplates = async() => {
  const data = await graphQLClient.request(getSchemasQuery)
  console.log(JSON.stringify(data, undefined, 2))

  return JSON.stringify(data, undefined, 2);
}

export const createTemplate = async() => {
  console.log({ token, team })
  // 2a . Define a 'Sheet' (shown as a 'template' in your Flatfile interface)
  const Employees = new Sheet(
    "Employees",
    {
      fullName: TextField({
        required: true,
        unique: true,
        description: "Given name",
      }),
      salary: NumberField({
        label: "Salary",
        description: "Annual Salary in USD",
        required: true,
        validate: (salary: number) => {
          const minSalary = 30_000;
          if (salary < minSalary) {
            return [new Message(`${salary} is less than minimum wage ${minSalary}`, "warn", "validate")];
          }
        },
      }),
      date: DateField({
        required: true,
        description: "hire date",
      }),
      department: OptionField({
        label: "Department",
        options: {
          engineering: { label: "Engineering" },
          hr: "People Ops",
          sales: "Revenue",
        },
      }),
      likesMovies: BooleanField({
        required: false,
        description: "Like to watch movies?",
      }),
    },
    {
      // Define Sheet options.
      allowCustomFields: true,
    },
  );

  console.log("sheet", Employees)



  const workbook = new Workbook({
    name: "Your Workbook Name",
    namespace: "Your namespace",
  
    // One or more Sheets you defined
    sheets: {
      Employees,
    },
  
    // One or more Portals you defined that belong to a Sheet
    // portals: [EmployeesPortal],
  });

  console.log("workbook", workbook)

  const properties: FlatfileTemplateProperties = {
    sku: {
      label: "SKU",
      type: "string",
      required: true,
      unique: true,
    },
    productName: {
      label: "Product Name",
      type: "string"
    },
    Size: {
      label: "Size",
      type: "enum",
      enum: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      enumLabel: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ]
    },
    color: {
      "label": "Color",
      "type": "string"
    },
    available_after: {
      "label": "Available After",
      "type": "string"
    },
    available_before: {
      "label": "Available Before",
      "type": "string"
    },
    featured: {
      "label": "Featured",
      "type": "boolean"
    },
    image: {
      "label": "Image",
      "type": "string"
    },
    currency: {
      "label": "Currency",
      "type": "string"
    },
    price: {
      "label": "Price",
      "type": "number",
      "minimum": 0,
      validate: (salary: number) => {
        const minSalary = 30_000;
        if (salary < minSalary) {
          return [new Message(`${salary} is less than minimum wage ${minSalary}`, "warn", "validate")];
        }
      },
    },
    Cost: {
      "type": "number",
      "label": "Cost",
      "minimum": 0
    }
  };


  const variables = {
    name: "Products4",
    schema: {
      schema: {
        properties,
        type: "object",
        // required: [
        //   "sku"
        // ],
        // unique: [
        //   "sku"
        // ],
        // primary: "sku"
      }
    }
  }

  const data = await graphQLClient.request(createSchemaMutation, variables)
  console.log(JSON.stringify(data, undefined, 2))

  return JSON.stringify(data, undefined, 2);

}
