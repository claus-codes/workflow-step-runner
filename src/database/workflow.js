const { v4: uuid } = require('uuid')

const WorkflowStates = {
  Initial: 'INIT',
  Running: 'RUNNING',
  Complete: 'COMPLETE',
  Error: 'ERROR'
}

const storage = {}

function getWorkflowById(id) {
  if (!storage[id]) {
    throw new Error(`Workflow not found: ${id}`)
  }
  return storage[id]
}

function createWorkflow(config) {
  const id = uuid()
  const workflow = {
    id,
    state: WorkflowStates.Initial,
    config,
    vars: {},
    log: [],
  }
  storage[id] = workflow
  return workflow
}

function updateWorkflow(workflow) {
  const { id } = workflow
  if (!storage[id]) {
    throw new Error(`Workflow not found: ${id}`)
  }
  storage[id] = workflow
}

module.exports = {
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  WorkflowStates,
}
