import { FlatfileTemplateProperties } from "../interfaces/template";

export type ParsedGQLObjects = {
  objectType: string;
  input: {
    name: string;
    fields: FlatfileTemplateProperties;
    requiredFields: string[];
  };
}[];
