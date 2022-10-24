import { FieldVisibilityTypes } from './JsonSchema'
export type BaseFieldTypes = 'string' | 'number' | 'boolean' | 'composite'

interface BaseField {
  label: string
  field: string
  description?: string
  required?: boolean
  primary?: boolean
  unique?: boolean
  stageVisibility?: FieldVisibilityTypes
  annotations: {
    default?: boolean
    defaultMessage?: string
    compute?: boolean
    computeMessage?: string
  }
}

export interface BaseSchemaILField extends BaseField {
  type: BaseFieldTypes
}
export interface SchemaILEnumField extends BaseField {
  type: 'enum'
  labelEnum: Record<string, string>
}

export interface LinkedSheetField extends BaseField {
  type: 'schema_ref'
  sheetName: string
}

export type SchemaILField =
  | BaseSchemaILField
  | SchemaILEnumField
  | LinkedSheetField

export interface SchemaILModel<
  Fields extends Record<string, SchemaILField> = Record<string, SchemaILField>
> {
  name: string
  slug: string
  namespace: string
  fields: Fields
  required?: Array<keyof Fields | Array<keyof Fields>>
  unique?: Array<keyof Fields | Array<keyof Fields>>
  primary?: keyof Fields
  allowCustomFields: boolean
}
