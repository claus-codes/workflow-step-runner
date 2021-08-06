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
  // Check if return already exists
  if (fnBody.substr(0, 'return '.length) === 'return ') return fnBody

  // Find the last semicolon index so we can inject 'return '
  const lastSemicolonIndex = fnBody.lastIndexOf(';')
  // No semicolons so just prepend
  if (lastSemicolonIndex === -1) {
    return `return ${fnBody}`
  }
  // Splice return to last semicolon index
  // NOTE: does not take semicolons inside strings into consideration
  return fnBody.substr(0, lastSemicolonIndex + 1) + 'return ' + fnBody.substr(lastSemicolonIndex + 1)
}

module.exports = {
  parseFunctionFromString,
  createFunctionWithVars,
  injectReturnToFunctionBody,
}
