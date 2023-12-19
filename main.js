const tools = require('./tools')
for (let i in tools) global[i] = tools[i]

const test = require('./test')
const { Environment } = requir('./Environment')

let testWorld1 = new Environment()