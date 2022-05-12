const inlineCodeRegexp = /^\$\{((.|\n)+)\}$/m

function parseFunctionFromString(str, vars) {
  const fnPatternMatch = str.match(inlineCodeRegexp)
  if (fnPatternMatch) {
    const [_, fnBody] = fnPatternMatch
    return createFunctionWithVars(fnBody, vars)
  }
  return false
}

function createFunctionWithVars(fnBody, vars) {
  const varKeys = Object.keys(vars)
  const varValues = Object.values(vars)
  const fn = new Function(...varKeys, injectReturnToFunctionBody(fnBody))
  return () => fn(...varValues)
}

function injectReturnToFunctionBody(fnBody) {
  const returnPrefix = 'return '
  // Check if return already exists
  if (fnBody.substr(0, returnPrefix.length) === returnPrefix) return fnBody

  // Find the last semicolon index so we can inject returnPrefix
  const lastSemicolonIndex = fnBody.lastIndexOf(';')
  // No semicolons so just prepend
  if (lastSemicolonIndex === -1) {
    return returnPrefix + fnBody
  }
  // Splice returnPrefix to last semicolon index
  // FIXME: does not take semicolons inside strings into consideration
  return fnBody.substr(0, lastSemicolonIndex + 1) + returnPrefix + fnBody.substr(lastSemicolonIndex + 1)
}

function processAssignValuesRecursive(obj, vars) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' || typeof obj[key] === 'array') {
      processAssignValuesRecursive(obj[key], vars)
    }
    else if (typeof obj[key] === 'string') {
      const fn = parseFunctionFromString(obj[key], vars)
      if (fn) {
        vars[key] = fn()
      }
      else {
        vars[key] = obj[key]
      }
    }
    else {
      vars[key] = obj[key]
    }
  })
}

function processInlineCodeRecursive(obj, vars) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' || typeof obj[key] === 'array') {
      processInlineCodeRecursive(obj[key], vars)
    }
    else if (typeof obj[key] === 'string') {
      const fn = parseFunctionFromString(obj[key], vars)
      if (fn) {
        obj[key] = fn()
      }
    }
  })
}

module.exports = {
  parseFunctionFromString,
  createFunctionWithVars,
  injectReturnToFunctionBody,

  processAssignValuesRecursive,
  processInlineCodeRecursive,
}
