import { Sheet, Workbook, TextField } from "@flatfile/configure";
// import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
// import fetch from 'node-fetch'

export const createTemplate = () => {
  // 2a . Define a 'Sheet' (shown as a 'template' in your Flatfile interface)
  const Employees = new Sheet(
    "Employees",
    {
      // Define Fields
    },
    {
      // Define Sheet options.
    },
  );
}
