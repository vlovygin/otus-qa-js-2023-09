import { account } from '../../framework/services/bookstore-api'
import { generateCredentials, randomGuid } from '../../framework/fixtures/bookstore-api-fake'

describe('[POST] /Account/v1/Authorized', () => {
  test('Authorized user', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    await account.generateToken(credentials)

    const response = await account.authorized(credentials)

    expect(response.status).toBe(200)
    expect(response.data).toBe(true)
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)

    const response = await account.authorized(credentials)

    expect(response.status).toBe(200)
    expect(response.data).toBe(false)
  })

  test('Not exists user', async () => {
    const credentials = generateCredentials()

    const response = await account.authorized(credentials)

    expect(response.status).toBe(404)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User not found!')
  })

  test('Miss required user credentials', async () => {
    const response = await account.authorized({})

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('UserName and Password required.')
  })
})

describe('[DELETE] /Account/v1/User/{UUID}', () => {
  test('Delete user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.deleteUser(userID, token)

    expect(response.status).toBe(204)
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data

    const response = await account.deleteUser(userID, '')

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
  })

  test('Not exists userID', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.deleteUser(randomGuid(), token)

    expect(response.status).toBe(200)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User Id not correct!')
  })
})

describe('[GET] /Account/v1/User/{UUID}', () => {
  test('Get user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.getUser(userID, token)

    expect(response.status).toBe(200)
    expect(response.data.userId).toBe(userID)
    expect(response.data.username).toBe(credentials.userName)
    expect(response.data.books).toStrictEqual([])
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data

    const response = await account.getUser(userID, '')

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
  })

  test('Not exists userID', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.getUser(randomGuid(), token)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User not found!')
  })
})
