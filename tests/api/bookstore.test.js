import { account, bookstore } from '../../framework/services/bookstore/api'
import { generateCredentials, randomGuid, randomISBN } from '../../framework/fixtures/bookstore-fake-data'
import { validateSchema, errorSchema, accountSchema, bookstoreSchema } from '../../framework/services/bookstore/json-schema'

describe('[POST] /Account/v1/Authorized', () => {
  test('Authorized user', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    await account.generateToken(credentials)

    const response = await account.authorized(credentials)

    expect(response.status).toBe(200)
    expect(response.data).toBe(true)
    expect(validateSchema(accountSchema.authorize, response.data)).toBe(true)
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)

    const response = await account.authorized(credentials)

    expect(response.status).toBe(200)
    expect(response.data).toBe(false)
    expect(validateSchema(accountSchema.authorize, response.data)).toBe(true)
  })

  test('Not exists user', async () => {
    const credentials = generateCredentials()

    const response = await account.authorized(credentials)

    expect(response.status).toBe(404)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User not found!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Miss required user credentials', async () => {
    const response = await account.authorized({})

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('UserName and Password required.')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})

describe('[DELETE] /Account/v1/User/{UUID}', () => {
  test('Delete user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.deleteUser(userID, token)

    expect(response.status).toBe(204)
    expect(validateSchema(accountSchema.deleteUser, response.data)).toBe(true)
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data

    const response = await account.deleteUser(userID, '')

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not exists userID', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.deleteUser(randomGuid(), token)

    expect(response.status).toBe(200)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User Id not correct!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
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
    expect(validateSchema(accountSchema.getUser, response.data)).toBe(true)
  })

  test('Not authorized user', async () => {
    const credentials = generateCredentials()
    const { userID } = (await account.createUser(credentials)).data

    const response = await account.getUser(userID, '')

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not exists userID', async () => {
    const credentials = generateCredentials()
    await account.createUser(credentials)
    const { token } = (await account.generateToken(credentials)).data

    const response = await account.getUser(randomGuid(), token)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User not found!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})

describe('[GET] /BookStore/v1/Book', () => {
  test('Get book info', async () => {
    const book = (await bookstore.getBooks()).data.books[0]
    const response = await bookstore.getBook(book.isbn)

    expect(response.status).toBe(200)
    expect(response.data).toStrictEqual(book)
    expect(validateSchema(bookstoreSchema.getBook, response.data)).toBe(true)
  })

  test.each(['', randomISBN()])('Get info not exists book', async (isbn) => {
    const response = await bookstore.getBook(isbn)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1205')
    expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})

describe('[POST] /BookStore/v1/Books', () => {
  let bookstoreBooks, userId, token

  beforeAll(async () => {
    // get bookstore books info
    bookstoreBooks = (await bookstore.getBooks()).data
  })

  beforeEach(async () => {
    // generate new user and get a token
    const credentials = generateCredentials()
    userId = (await account.createUser(credentials)).data.userID
    token = (await account.generateToken(credentials)).data.token
  })

  test('Add books', async () => {
    const collectionOfIsbns = [{ isbn: bookstoreBooks.books[0].isbn }]
    const payload = {
      userId: userId,
      collectionOfIsbns: collectionOfIsbns
    }
    const response = await bookstore.addBooks(payload, token)

    expect(response.status).toBe(201)
    expect(response.data.books).toStrictEqual(collectionOfIsbns)
    expect(validateSchema(bookstoreSchema.addBooks, response.data)).toBe(true)
  })

  test('Add already exists books', async () => {
    const collectionOfIsbns = [{ isbn: bookstoreBooks.books[0].isbn }]
    const payload = {
      userId: userId,
      collectionOfIsbns: collectionOfIsbns
    }
    await bookstore.addBooks(payload, token)

    const response = await bookstore.addBooks(payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1210')
    expect(response.data.message).toBe("ISBN already present in the User's Collection!")
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Add not exists books', async () => {
    const collectionOfIsbns = [{ isbn: randomISBN() }]
    const payload = {
      userId: userId,
      collectionOfIsbns: collectionOfIsbns
    }
    const response = await bookstore.addBooks(payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1205')
    expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not exists userID', async () => {
    const collectionOfIsbns = [{ isbn: bookstoreBooks.books[0].isbn }]
    const payload = {
      userId: randomGuid(),
      collectionOfIsbns: collectionOfIsbns
    }
    const response = await bookstore.addBooks(payload, token)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User Id not correct!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not authorized user', async () => {
    const collectionOfIsbns = [{ isbn: bookstoreBooks.books[0].isbn }]
    const payload = {
      userId: userId,
      collectionOfIsbns: collectionOfIsbns
    }
    const response = await bookstore.addBooks(payload, '')

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})

describe('[DELETE] /BookStore/v1/Book', () => {
  let bookstoreBooks, userId, token

  beforeAll(async () => {
    // get bookstore books info
    bookstoreBooks = (await bookstore.getBooks()).data
  })

  beforeEach(async () => {
    // generate new user and get a token
    const credentials = generateCredentials()
    userId = (await account.createUser(credentials)).data.userID
    token = (await account.generateToken(credentials)).data.token
  })

  test('Delete book', async () => {
    const book = bookstoreBooks.books[0]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: book.isbn,
      userId: userId
    }
    const response = await bookstore.deleteBook(payload, token)

    expect(response.status).toBe(204)
    expect(validateSchema(bookstoreSchema.deleteBook, response.data)).toBe(true)
  })

  test('Delete book not exists in coolection', async () => {
    const book = bookstoreBooks.books[0]

    const payload = {
      isbn: book.isbn,
      userId: userId
    }
    const response = await bookstore.deleteBook(payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1206')
    expect(response.data.message).toBe("ISBN supplied is not available in User's Collection!")
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not exists userID', async () => {
    const book = bookstoreBooks.books[0]

    const payload = {
      isbn: book.isbn,
      userId: randomGuid()
    }
    const response = await bookstore.deleteBook(payload, token)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User Id not correct!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('User not authorized', async () => {
    const book = bookstoreBooks.books[0]

    const payload = {
      isbn: book.isbn,
      userId: userId
    }
    const response = await bookstore.deleteBook(payload, null)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})

describe('[PUT] /BookStore/v1/Book', () => {
  let bookstoreBooks, userId, token

  beforeAll(async () => {
    // get bookstore books info
    bookstoreBooks = (await bookstore.getBooks()).data
  })

  beforeEach(async () => {
    // generate new user and get a token
    const credentials = generateCredentials()
    userId = (await account.createUser(credentials)).data.userID
    token = (await account.generateToken(credentials)).data.token
  })

  test('Update book', async () => {
    const book = bookstoreBooks.books[0]
    const newBook = bookstoreBooks.books[1]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: newBook.isbn,
      userId: userId
    }
    const response = await bookstore.updateBook(book.isbn, payload, token)

    expect(response.status).toBe(200)
    expect(response.data.userId).toBe(userId)
    expect(response.data.books[0]).toStrictEqual(newBook)
    expect(validateSchema(bookstoreSchema.updateBook, response.data)).toBe(true)
  })

  test('Update book to self book', async () => {
    const book = bookstoreBooks.books[0]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: book.isbn,
      userId: userId
    }
    const response = await bookstore.updateBook(book.isbn, payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1206')
    expect(response.data.message).toBe("ISBN supplied is not available in User's Collection!")
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Update book to not exists in user collection', async () => {
    const book = bookstoreBooks.books[0]
    const newBook = bookstoreBooks.books[1]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: newBook.isbn,
      userId: userId
    }
    const response = await bookstore.updateBook(randomISBN(), payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1206')
    expect(response.data.message).toBe("ISBN supplied is not available in User's Collection!")
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Update book to not exists in books collection', async () => {
    const book = bookstoreBooks.books[0]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: randomISBN(),
      userId: userId
    }
    const response = await bookstore.updateBook(book.isbn, payload, token)

    expect(response.status).toBe(400)
    expect(response.data.code).toBe('1205')
    expect(response.data.message).toBe('ISBN supplied is not available in Books Collection!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('Not exists userID', async () => {
    const book = bookstoreBooks.books[0]
    const newBook = bookstoreBooks.books[1]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: newBook.isbn,
      userId: randomGuid()
    }
    const response = await bookstore.updateBook(book.isbn, payload, token)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1207')
    expect(response.data.message).toBe('User Id not correct!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })

  test('User not authorized', async () => {
    const book = bookstoreBooks.books[0]
    const newBook = bookstoreBooks.books[1]
    await bookstore.addBooks({ userId: userId, collectionOfIsbns: [{ isbn: book.isbn }] }, token)

    const payload = {
      isbn: newBook.isbn,
      userId: userId
    }
    const response = await bookstore.updateBook(book.isbn, payload, null)

    expect(response.status).toBe(401)
    expect(response.data.code).toBe('1200')
    expect(response.data.message).toBe('User not authorized!')
    expect(validateSchema(errorSchema, response.data)).toBe(true)
  })
})
