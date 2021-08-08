const fetch = require('node-fetch')
const url = require('url')

function createFetchWrapper(method) {
  return async ({ args, result }, vars) => {
    const { url, headers, body, query } = args
    const requestUrl = new URL(url)

    if (query) {
      // Flatten potential array due to yaml syntax fuckery
      const flatQuery = Array(query).reduce((params, value) => {
        return { ...params, ...value }
      }, {})
      // Build search parameters
      const searchParams = new URLSearchParams()
      Object.keys(flatQuery).forEach(key => {
        searchParams.append(key, flatQuery[key])
      })
      requestUrl.search = searchParams
    }

    const response = await fetch(requestUrl.href, {
      method,
      headers,
      body,
    })

    // Handle JSON response
    const isJson = response.headers.get('content-type').includes('application/json')
    const responseBody = await (isJson ? response.json() : response.text())
    vars[result] = {
      status: response.status,
      body: responseBody,
    }
  }
}

function httpModuleLoader(modules) {
  modules['http.get'] = createFetchWrapper('GET')
  modules['http.post'] = createFetchWrapper('POST')
  modules['http.put'] = createFetchWrapper('PUT')
  modules['http.patch'] = createFetchWrapper('PATCH')
  modules['http.delete'] = createFetchWrapper('DELETE')
}

module.exports = httpModuleLoader
