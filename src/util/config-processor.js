const getStepTuple = step => [Object.keys(step)[0], Object.values(step)[0]]

const getStepNameFromTuple = tuple => tuple[0]

function stepTupleToDictionaryReducer(dictionary, stepTuple) {
  const [stepName, stepData] = stepTuple
  dictionary[stepName] = stepData
  dictionary[stepName].__name = stepName
  return dictionary
}

function createWorkflowFromConfig(workflowConfig) {
  const stepTuples = workflowConfig.map(getStepTuple)
  return {
    stepIndex: stepTuples.map(getStepNameFromTuple),
    stepDictionary: stepTuples.reduce(stepTupleToDictionaryReducer, {}),
    vars: {},
  }
}

module.exports = {
  stepTupleToDictionaryReducer,
  createWorkflowFromConfig,
}
