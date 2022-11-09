import { FlatfileTemplateProperties } from "../interfaces/template";

export type Kind = "SCALAR" | "LIST" | "NON_NULL" | "ENUM" | "INPUT_OBJECT";

type TypeGQL = {
  kind: Kind | null;
  name: string;
  description: string | null;
  enumValues: { name: string }[] | null;
  inputFields: InputFieldGQL[];
  ofType: Pick<TypeGQL, "name" | "kind"> | null;
};

export type InputValue = {
  name: string;
  description: string;
  type: Pick<TypeGQL, "name" | "kind" | "inputFields" | "description">;
  defaultValue: string;
};

export type InputFieldGQL = {
  name: string;
  type: Pick<
    TypeGQL,
    "name" | "kind" | "enumValues" | "description" | "ofType"
  >;
};

export type MutationsListGQL = {
  name: string;
  args: InputValue[];
  type: {
    name: string;
    kind: Kind | null;
    description: string | null;
    fields: { name: string }[] | null;
    ofType: string;
  };
}[];

export type ParsedGQLObjects = {
  objectType: string;
  input: {
    name: string;
    fields: FlatfileTemplateProperties;
    requiredFields: string[];
  };
}[];
