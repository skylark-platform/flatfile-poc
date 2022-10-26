export type FlatfileTemplatePropertyTypes = "string" | "number" | "boolean" | "enum";

interface FlatfileTemplatePropertyValue {
  type: FlatfileTemplatePropertyTypes
  label: string;
  required?: boolean;
  unique?: boolean;
  primary?: boolean;
  validate?: any;
}

interface FlatfileTemplatePropertyString extends FlatfileTemplatePropertyValue {
  type: "string";
}

interface FlatfileTemplatePropertyNumber extends FlatfileTemplatePropertyValue {
  type: "number";
  minimum: number;
}

interface FlatfileTemplatePropertyBoolean extends FlatfileTemplatePropertyValue {
  type: "boolean";
}

interface FlatfileTemplatePropertyEnum extends FlatfileTemplatePropertyValue {
  type: "enum";
  enum: string[];
  enumLabel?: string[];
}

export interface FlatfileTemplateProperties {
  [key: string]: FlatfileTemplatePropertyString | FlatfileTemplatePropertyNumber | FlatfileTemplatePropertyBoolean | FlatfileTemplatePropertyEnum
}
