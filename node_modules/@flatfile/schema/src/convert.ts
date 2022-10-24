import {
  SchemaILModel,
  SchemaILField,
  LinkedSheetField,
} from './types/SchemaIL'
import { IJsonSchema, IJsonSchemaProperty } from './types/JsonSchema'
import {
  filter,
  fromPairs,
  isTruthy,
  map,
  mapValues,
  pick,
  pipe,
  values,
} from 'remeda'

//note the second any is for properties that should be contributed to
//the larger schema outside of just this field
export const compileEnum = (inputField: SchemaILField): IJsonSchemaProperty => {
  // return the field if it is not an enum type

  if (inputField.type !== 'enum') {
    return inputField
  }

  return {
    type: 'string',
    label: inputField.label,
    ...(inputField.required ? { required: inputField.required } : {}),
    enum: map(Object.keys(inputField.labelEnum), (key) => key),
    enumLabel: map(Object.values(inputField.labelEnum), (key) => key),
  }
}

export const SchemaILToJsonSchema = (ddl: SchemaILModel): IJsonSchema => {
  const fields = pipe(
    ddl.fields,
    mapValues(
      (value, field): SchemaILField =>
        ({
          field,
          ...compileEnum(value),
        } as SchemaILField)
    ),
    values
  )

  const required = pipe(
    fields,
    filter((f) => isTruthy(f.required)),
    map((f) => f.field)
  )

  const unique = pipe(
    fields,
    filter((f) => isTruthy(f.unique)),
    map((f) => f.field)
  )

  const pks = pipe(
    fields,
    filter((f) => isTruthy(f.primary)),
    map((f) => f.field)
  )

  const properties = pipe(
    fields,
    map((f) =>
      tuple(f.field, {
        ...pick(f as IJsonSchemaProperty, [
          'type',
          'label',
          'field',
          'enum',
          'enumLabel',
          'description',
        ]),
        visibility: f.stageVisibility,
        ...(f.type === 'schema_ref' ? { $schemaId: f.sheetName } : {}),
      })
    ),
    (v) => fromPairs(v)
  )

  return {
    properties,
    type: 'object',
    required: required,
    unique: unique,
    primary: pks[0],
    allowCustomFields: ddl.allowCustomFields,
  }
}

export const compileToJsonSchema = SchemaILToJsonSchema

function tuple<A, B>(a: A, b: B): [A, B] {
  return [a, b]
}
