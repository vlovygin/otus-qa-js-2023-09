import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'

export function generateCredentials() {
  return {
    userName: `Lg${uuidv4()}`,
    password: `Ps!${uuidv4()}`
  }
}

export function randomGuid() {
  return uuidv4()
}

export function randomISBN() {
  return faker.commerce.isbn({ variant: 13, separator: '' })
}
