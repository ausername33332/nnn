const fs = require('fs/promises')

const { Layer } = require('./Layer')
const { LayerStack } = require('./LayerStack')
const { generateBatches } = require('./tools')

const testRun = async function(stack, data, iters, name, lc) {
  let [batches, targetsRaw] = data
  let targets = []
  let bt = new Map()
  batches.forEach((x, i) => bt.set(x, targetsRaw[i]))
  shuffle(batches)
  batches.forEach(x => targets.push(bt.get(x)))
  let trainBatches = batches.slice(0, batches.length - Math.floor(batches.length / 4))
  let trainTargets = targets.slice(0, targets.length - Math.floor(targets.length / 4))
  l('tbprelast: ', trainBatches[trainBatches.length - 2])
  l('ttprelast: ', trainTargets[trainTargets.length - 2])
  l('tblast: ', trainBatches[trainBatches.length - 1])
  l('ttlast: ', trainTargets[trainTargets.length - 1])
  let testBatches = batches.slice(batches.length - Math.floor(batches.length / 4))
  let testTargets = targets.slice(targets.length - Math.floor(targets.length / 4))
  l('testbfirst: ', testBatches[0])
  l('testtfirst: ', testTargets[0])
  
  l('RUNNING ', name, ' TEST TRAIN!')
  await stack.train(trainBatches, trainTargets, iters, lc)
  l('\nTEST ', name, ' TRAIN END\n')
  l('RUNNING ', name, ' PREDICTION: ')
  for (let i = 0; i < testBatches.length; i++) {
    let prediction = await stack.predict(testBatches[i])
    let loss = measure(prediction, [testTargets[i]])
    l('TEST ', name, ' i ', i, ' PREDICTION: ', prediction, ' AGAINST ', testTargets[i], ' LOSS IS: ', loss)
  }
}

const o = async () => {
  let testStack1 = new LayerStack([
    new Layer(100),
    new Layer(100),
    new Layer(100),
    new Layer(1, type = 'bitwise')
  ])
  let testStack3 = new LayerStack([
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(1)
  ])
  let data = (await fs.readFile('./testdata.txt', { encoding: 'utf8' })).split('\n')
  for (let i in data) {
    data[i] = data[i].split(' ')
    data[i][0] = Number(data[i][0])
    data[i][1] = Number(data[i][1])
  }
  let input = []
  for (let i in data) input.push(data[i][0])
  let batchFn = (k) => input[k]
  let targetFn = (batch, k) => input[k]
  let test4batches = generateBatches(data.length, 100, batchFn, targetFn)
  let test5batches = generateBatches(data.length, 50, batchFn, targetFn)
  l('data', test4batches[0].length, test4batches[1].length, test4batches[0][23], test4batches[1][23])
  await testRun(testStack1, test4batches, data.length * 10, '100 100 100n layerstack', 0.01)
  await testRun(testStack3, test5batches, data.length * 10, '50 * 8 n layerstack', 0.0001)

  let test1Batches = generateBatches(10000, 100, x => Math.abs(Math.log(x)))
  //await testRun(testStack1, test1Batches, 10000, 'ln 2 200n 100n layer')
  let test2Batches = generateBatches(10000, 100, x => Math.abs(Math.log(x)))
  //await testRun(testStack2, test2Batches, 10000, 'ln 2 100n 300n layer')
  let test3Batches = generateBatches(10000, 50, x => Math.abs(Math.log(x)))
  //await testRun(testStack3, test3Batches, 100000, 'ln 2 50n 50n 50n 50n layer')
}

module.exports = {
  testRun,
  o
}