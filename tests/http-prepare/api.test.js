import { v4 as uuidv4 } from 'uuid'

function generateCredentials() {
  return {
    username: `Login${uuidv4()}`,
    password: `Ps!${uuidv4()}`
  }
}

async function createUser(username, password) {
  const response = await fetch('https://bookstore.demoqa.com/Account/v1/User', {
    method: 'POST',
    body: JSON.stringify({
      userName: username,
      password: password
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  return response
}

async function generateToken(username, password) {
  const response = await fetch('https://bookstore.demoqa.com/Account/v1/GenerateToken', {
    method: 'POST',
    body: JSON.stringify({
      userName: username,
      password: password
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  return response
}

describe('Bookstore API tests', () => {
  test('Successful create a new user', async () => {
    const { username, password } = generateCredentials()

    const response = await createUser(username, password)

    const data = await response.json()
    expect(response.status).toBe(201)
    expect(data.username).toBe(username)
    expect(data.userID).toMatch(/(^([0-9A-Fa-f]{8}[-]?[0-9A-Fa-f]{4}[-]?[0-9A-Fa-f]{4}[-]?[0-9A-Fa-f]{4}[-]?[0-9A-Fa-f]{12})$)/)
    expect(data.books).toStrictEqual([])
  })

  test('Create a new user with exists login', async () => {
    const { username, password } = generateCredentials()
    await createUser(username, password)

    const response = await createUser(username, password)
    const data = await response.json()

    expect(response.status).toBe(406)
    expect(data.code).toBe('1204')
    expect(data.message).toBe('User exists!')
  })

  test('Create a new user with invalid password', async () => {
    const { username } = generateCredentials()

    const response = await createUser(username, `test`)

    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.code).toBe('1300')
    expect(data.message).toBe(
      `Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer.`
    )
  })

  test('Successful generate token', async () => {
    const { username, password } = generateCredentials()
    const response = await createUser(username, password)
    expect(response.status).toBe(201)

    const response2 = await generateToken(username, password)

    const data = await response2.json()
    expect(response2.status).toBe(200)
    expect(data.status).toBe('Success')
    expect(data.result).toBe('User authorized successfully.')
    expect(typeof data.token).toBe('string')
    expect(data.token.length).toBeTruthy()
    expect(Date.parse(data.expires) > new Date()).toBe(true)
  })

  test('Generate token for not exists user', async () => {
    const { username, password } = generateCredentials()

    const response = await generateToken(username, password)

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.token).toBeNull()
    expect(data.expires).toBeNull()
    expect(data.status).toBe('Failed')
    expect(data.result).toBe('User authorization failed.')
  })
})
