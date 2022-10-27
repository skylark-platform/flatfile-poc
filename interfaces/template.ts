export type FlatfileTemplatePropertyTypes = "string" | "number" | "boolean" | "enum";

interface FlatfileTemplatePropertyValue {
  type: FlatfileTemplatePropertyTypes
  label: string;
  // required?: boolean; // Breaks Flatfile
  // unique?: boolean; // Breaks Flatfile
  default?: string,
  description?: string
}

interface FlatfileTemplatePropertyString extends FlatfileTemplatePropertyValue {
  type: "string";
  regexp?: {
    pattern: "regex",
    flags: string,
    ignoreBlanks: boolean
  },
}

interface FlatfileTemplatePropertyNumber extends FlatfileTemplatePropertyValue {
  type: "number";
  minimum: number;
  maxiumum: number;
}

interface FlatfileTemplatePropertyBoolean extends FlatfileTemplatePropertyValue {
  type: "boolean";
  default?: "true" | "false";
}

interface FlatfileTemplatePropertyEnum extends FlatfileTemplatePropertyValue {
  type: "string";
  enum: string[];
  enumLabel?: string[];
}

interface FlatfileTemplatePropertyEmail extends FlatfileTemplatePropertyValue {
  type: "string";
  format: "email";
}

interface FlatfileTemplatePropertyPhone extends FlatfileTemplatePropertyValue {
  type: "string";
  format: "phone";
}

export interface FlatfileTemplateProperties {
  [key: string]:
    | FlatfileTemplatePropertyString
    | FlatfileTemplatePropertyNumber
    | FlatfileTemplatePropertyBoolean
    | FlatfileTemplatePropertyEnum
    | FlatfileTemplatePropertyEmail
    | FlatfileTemplatePropertyPhone
}

export interface FlatfileTemplate {
  type: "object";
  properties: FlatfileTemplateProperties;
  required: string[];
  unique: string[];
}
