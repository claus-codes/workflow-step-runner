const YAML = require('yaml')

const { getWorkflowById, updateWorkflow, WorkflowStates } = require('./database/workflow')
const { createWorkflowFromConfig } = require('./util/config-processor')
const {
  processAssignValuesRecursive,
  processInlineCodeRecursive,
  parseFunctionFromString
} = require('./util/inline-code')

const moduleCallbacks = {}

function loadModule(name, callbacks) {
  const moduleLoader = require(`./module/${name}`)
  moduleLoader(callbacks)
}

loadModule('noop', moduleCallbacks)
loadModule('console', moduleCallbacks)
loadModule('http', moduleCallbacks)

async function runWorkflow(id) {
  const workflow = getWorkflowById(id)
  if (workflow.state !== WorkflowStates.Initial) {
    throw new Error(`Workflow in invalid state: ${workflow.state}`)
  }
  const parsedConfig = YAML.parse(workflow.config)
  const stepConfig = createWorkflowFromConfig(parsedConfig)
  await executeWorkflow(stepConfig, workflow)
}

async function executeWorkflow(stepConfig, workflow) {
  let stepName = stepConfig.stepIndex[0]
  const start = Date.now()

  workflow.startTime = start
  workflow.state = WorkflowStates.Running
  updateWorkflow(workflow)

  while (stepName) {
    workflow.currentStep = stepName
    updateWorkflow(workflow)
    try {
      const step = stepConfig.stepDictionary[stepName]
      const nextStep = await executeStep(step, stepConfig.vars, workflow)
      stepName = nextStep || step.next || stepConfig.stepIndex[stepConfig.stepIndex.indexOf(stepName) + 1]
    } catch (err) {
      console.log(`*** ERROR: ${err.message}`)
      workflow.state = WorkflowStates.Error
      workflow.error = err
      updateWorkflow(workflow)
      return
    }
  }
  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`*** Workflow execution finished. Total time elapsed: ${executionTimeInSeconds} seconds.`)

  workflow.endTime = Date.now()
  workflow.state = WorkflowStates.Complete
  updateWorkflow(workflow)
}

async function executeStep(step, vars, workflow) {
  console.log(`*** Running step "${step.__name}"`)
  const start = Date.now()
  let nextStep

  workflow.currentStepStartTime = start
  updateWorkflow(workflow)

  if (step.assign) {
    processAssignValuesRecursive(step.assign, vars)
  }
  else if (step.switch) {
    for (const switchCase of step.switch) {
      const conditionFn = parseFunctionFromString(switchCase.condition, vars)
      if (conditionFn()) {
        return switchCase.next
      }
    }
  }
  else if (step.call) {
    processInlineCodeRecursive(step, vars)
    nextStep = await moduleCallbacks[step.call](step, vars)
  }
  else {
    throw new Error(`Unknown step configuration`)
  }

  const executionTimeInMs = Date.now() - start
  console.log(`*** Step execution finished. Time elapsed: ${executionTimeInMs}ms.`)

  workflow.vars = vars
  workflow.log.push(`${step.__name} ${executionTimeInMs}ms`)
  updateWorkflow(workflow)

  return nextStep
}

module.exports = {
  runWorkflow
}
