import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true })

export function validateSchema(schema, data) {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  if (!valid) {
    return validate.errors
  } else {
    return true
  }
}

export const errorSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' }
  },
  required: ['code', 'message'],
  additionalProperties: false
}

export const bookSchema = {
  type: 'object',
  properties: {
    isbn: { type: 'string' },
    title: { type: 'string' },
    subTitle: { type: 'string' },
    author: { type: 'string' },
    publish_date: { type: 'string' },
    publisher: { type: 'string' },
    pages: { type: 'integer' },
    description: { type: 'string' },
    website: { type: 'string' }
  },
  additionalProperties: false
}

export const accountSchema = {
  authorize: {
    type: 'boolean'
  },
  deleteUser: {
    type: 'string',
    const: ''
  },
  getUser: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      username: { type: 'string' },
      books: {
        type: 'array',
        items: bookSchema
      }
    },
    required: ['userId', 'username', 'books'],
    additionalProperties: false
  }
}

export const bookstoreSchema = {
  getBook: bookSchema,
  addBooks: {
    type: 'object',
    properties: {
      books: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            isbn: { type: 'string' }
          },
          additionalProperties: false
        }
      }
    },
    required: ['books'],
    additionalProperties: false
  },
  deleteBook: {
    type: 'string',
    const: ''
  },
  updateBook: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      username: { type: 'string' },
      books: {
        type: 'array',
        items: bookSchema
      }
    },
    required: ['userId', 'username', 'books'],
    additionalProperties: false
  }
}
