import { v4 as uuidv4 } from 'uuid'

export function generateCredentials() {
  return {
    userName: `Lg${uuidv4()}`,
    password: `Ps!${uuidv4()}`
  }
}

export function randomGuid() {
  return uuidv4()
}
