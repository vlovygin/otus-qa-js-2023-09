import apiClient from '../client'
import config from '../../config'

const api = apiClient()
api.defaults.baseURL = config.bookstoreApiBaseUrl

export const account = {
  createUser: (payload) => {
    return api.post('/Account/v1/User', payload)
  },

  generateToken: (payload) => {
    return api.post('/Account/v1/GenerateToken', payload)
  },

  authorized: (payload) => {
    return api.post('/Account/v1/Authorized', payload)
  },

  deleteUser: (userId, token) => {
    return api.delete(`/Account/v1/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  getUser: (userId, token) => {
    return api.get(`/Account/v1/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

export const bookstore = {
  getBook: (isbn) => {
    return api.get(`/BookStore/v1/Book`, {
      params: { ISBN: isbn }
    })
  },

  getBooks: () => {
    return api.get('/BookStore/v1/Books')
  },

  addBooks: (payload, token) => {
    return api.post('/BookStore/v1/Books', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  updateBook: (isbn, payload, token) => {
    return api.put(`/BookStore/v1/Books/${isbn}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  deleteBook: (payload, token) => {
    return api.delete('/BookStore/v1/Book', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: payload
    })
  }
}
