import { IJsonSchema } from './types/JsonSchema'
import { SchemaILModel } from './types/SchemaIL'
import { compileEnum, compileToJsonSchema } from './convert'

const jsonSchema: IJsonSchema = {
  properties: {
    first_name: { type: 'string', label: 'First Name', field: 'first_name' },
    id: { type: 'number', label: 'Id', field: 'id' },
    is_admin: { type: 'boolean', label: 'Is Admin', field: 'is_admin' },
    color: {
      type: 'string',
      label: 'Color',
      field: 'color',

      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    },
  },
  type: 'object',
  required: ['first_name', 'id'],
  unique: ['id'],
  primary: 'id',
  allowCustomFields: false,
}

const ddlSchema: SchemaILModel = {
  fields: {
    first_name: {
      type: 'string',
      label: 'First Name',
      required: true,
      annotations: {},
      field: 'first_name',
    },
    id: {
      type: 'number',
      label: 'Id',
      required: true,
      primary: true,
      unique: true,
      annotations: {},
      field: 'id',
    },
    is_admin: {
      type: 'boolean',
      label: 'Is Admin',
      required: false,
      annotations: {},
      field: 'is_admin',
    },
    color: {
      field: 'color',
      label: 'Color',
      type: 'enum',
      annotations: {},
      labelEnum: { red: 'Red', blue: 'Blue', green: 'Green' },
      required: false,
    },
  },
  name: 'testSchema',
  slug: 'test',
  namespace: 'testspace',
  allowCustomFields: false,
}

describe('compiler tests', () => {
  it('checks enum compile function', () => {
    expect(
      compileEnum({
        type: 'enum',
        label: 'Color',
        field: 'color',
        annotations: {},
        labelEnum: { red: 'Red', blue: 'Blue', green: 'Green' },
      })
    ).toMatchObject({
      type: 'string',
      label: 'Color',
      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    })
  })

  it('tests a records validity on import', () => {
    expect(compileToJsonSchema(ddlSchema)).toMatchObject(jsonSchema)
  })
  it('tests no allowCustomFields', () => {
    const noCustom: SchemaILModel = {
      fields: {
        first_name: {
          type: 'string',
          label: 'First Name',
          required: true,
          annotations: {},
          field: 'first_name',
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: false,
    }

    const noCustomJSS: IJsonSchema = {
      properties: {
        first_name: {
          type: 'string',
          label: 'First Name',
          field: 'first_name',
        },
      },
      type: 'object',
      allowCustomFields: false,
    }
    expect(compileToJsonSchema(noCustom)).toMatchObject(noCustomJSS)
  })
  it('tests allowCustomFields', () => {
    const withCustom: SchemaILModel = {
      fields: {
        first_name: {
          type: 'string',
          label: 'First Name',
          required: true,
          annotations: {},
          field: 'first_name',
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: true,
    }

    const withCustomJSS: IJsonSchema = {
      properties: {
        first_name: {
          type: 'string',
          label: 'First Name',
          field: 'first_name',
        },
      },
      type: 'object',
      allowCustomFields: true,
    }
    expect(compileToJsonSchema(withCustom)).toMatchObject(withCustomJSS)
  })
})
