const fetch = require('node-fetch')
const url = require('url')

const { processInlineCodeRecursive } = require('../util/inline-code')

function createFetchWrapper(method) {
  return async ({ args, result }, vars) => {
    // Process the arguments so we can inject vars
    processInlineCodeRecursive(args, vars)
    // Extract arguments
    const { url, headers, body, query } = args
    const requestUrl = new URL(url)
    // Handle query string
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
    // Fetch request
    const response = await fetch(requestUrl.href, {
      method,
      headers,
      body,
    })
    // Handle JSON
    const isJson = response.headers.get('content-type').includes('application/json')
    const responseBody = await (isJson ? response.json() : response.text())
    console.log(responseBody)
    // Store result in vars
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
