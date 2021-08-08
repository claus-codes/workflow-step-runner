const fetch = require('node-fetch')
const url = require('url')

function createFetchWrapper(method) {
  return async ({ args, result }, vars) => {
    const { url, headers, body, query } = args
    const requestUrl = new URL(url)

    if (query) {
      const flatQuery = query.reduce((params, value) => {
        return { ...params, ...value }
      }, {})
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

    const isJson = response.headers.get('content-type').includes('application/json')
    const responseBody = await (isJson ? response.json() : response.text())
    console.log(responseBody)
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
