const express = require('express')
const bodyParser = require('body-parser')

const rootRouter = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(rootRouter)

app.listen(port, () => {
  console.log(`Workflow step runner listening on port ${port}`)
})
