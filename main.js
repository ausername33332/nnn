const tools = require('./tools')
for (let i in tools) global[i] = tools[i]

const test = require('./test')

//const { Environment } = require('./Environment')


//let fn = async () => {
//  let env1 = new Environment()
//  env1.waveOfBigRandom()
//}

test.o()

//fn().then(() => l('k'))