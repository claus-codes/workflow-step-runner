const { getWorkflowById } = require("../../database/workflow")

function readWorkflowHandler(request, response) {
  const { params: { id } } = request
  try {
    const workflow = getWorkflowById(id)
    response.status(200).json({ workflow })
  }
  catch (err) {
    response.status(500).json({ error: err.message })
  }
}

module.exports = readWorkflowHandler
