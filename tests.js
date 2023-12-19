const testRun = async function(stack, data, iters, name) {
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
  await stack.train(trainBatches, trainTargets, iters = iters)
  l('\nTEST ', name, ' TRAIN END\n')
  l('RUNNING ', name, ' PREDICTION: ')
  /*for (let i = 0; i < testBatches.length; i++) {
    let prediction = await stack.predict(testBatches[i])
    let loss = measure(prediction, [testTargets[i]])
    l('TEST ', name, ' i ', i, ' PREDICTION: ', prediction, ' AGAINST ', testTargets[i], ' LOSS IS: ', loss)
  }*/
}

const o = async () => {
  let testStack1 = new LayerStack([
    new Layer(100),
    new Layer(100),
    new Layer(100),
    new Layer(1)
  ])
  let testStack2 = new LayerStack([
    new Layer(100),
    new Layer(300),
    new Layer(1)
  ])
  let testStack3 = new LayerStack([
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(50),
    new Layer(1)
  ])
  let test1Batches = generateBatches(10000, 100, x => Math.abs(Math.log(x)))
  l('b: ', test1Batches[0][test1Batches[0].length - 1])
  l('t: ', test1Batches[1][test1Batches[1].length - 1])
  await testRun(testStack1, test1Batches, 100000, 'ln 2 200n 100n layer')
  let test2Batches = generateBatches(10000, 100, x => Math.abs(Math.log(x)))
  //await testRun(testStack2, test2Batches, 100000, 'ln 2 100n 300n layer')
  let test3Batches = generateBatches(10000, 50, x => Math.abs(Math.log(x)))
  //await testRun(testStack3, test3Batches, 100000, 'ln 2 50n 50n 50n 50n layer')
}
o().then(() => {
  l('\nTEST DONE\n')
}).catch(e => {
  console.error(e)
})