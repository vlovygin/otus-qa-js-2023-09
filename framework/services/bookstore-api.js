import api from './client'
import config from '../config'

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
