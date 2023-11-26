import axios from 'axios'

const apiClient = (config) => {
  const api = axios.create({
    timeout: 5000,
    validateStatus: () => true,
    ...config
  })

  api.interceptors.request.use((request) => {
    const requestData = {
      method: request.method.toUpperCase(),
      url: request.baseURL + request.url,
      headers: request.headers,
      body: request.data
    }

    console.debug('[REQUEST INFO]', JSON.stringify(requestData, null, 2))

    return request
  })

  api.interceptors.response.use((response) => {
    const responseData = {
      status: response.status,
      body: response.data
    }

    console.debug('[RESPONSE INFO]', JSON.stringify(responseData, null, 2))

    return response
  })

  return api
}

export default apiClient
