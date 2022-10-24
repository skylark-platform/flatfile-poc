import {
  Sheet,
  TextField,
  DateField,
  NumberField,
  Workbook,
} from "@flatfile/configure";

// find this in your Flatfile dashboard after creating a new Embed
const EMBED_ID = "45211";

const ExampleSheet = new Sheet("ExampleSheet", {
  firstName: TextField({
    unique: true,
    primary: true,
  }),
  middleName: TextField("Middle"),
  lastName: TextField(),
  age: NumberField(),
  birthdate: DateField(),
});

// 2a . Define a 'Sheet' (shown as a 'template' in your Flatfile interface)
const Employees = new Sheet(
  "Employees",
  {
    // Define Fields
  },
  {
    // Define Sheet options.
  }
);

export const flatfileImporter = () => {
  const test = new Workbook({
    name: "Example Workbook",
    namespace: "example",
    sheets: {
      ExampleSheet,
    },
  });

  test.processRecords;
  console.log("---- FLATFILE STUFF  ----");

  const test2 = new Workbook({
    name: "Employees",
    namespace: "employee",
    sheets: {
      Employees,
    },
    // portals: [EmployeesPortal],
  });
};
