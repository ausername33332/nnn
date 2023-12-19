const { Neuron } = require('./Neuron')
const { Layer } = require('./Layer')

class LayerStack {
  constructor(layers) {
    this.layers = Array.from(layers)
    this.lastLoss = 1
  }
  async a(input, weights = this.weights) {
    let state = input
    for (let i = 0; i < this.layers.length; i++) {
      state = await this.layers[i].a(state, weights[i])
    }
    return state
  }
  get weights() {
    let weights = []
    this.layers.forEach((layer, k) => {
      weights.push([])
      layer.n.forEach((n) => {
        weights[k].push(n.weight)
      })
    })
    return weights
  }
  async train(trainBatches, trainTargets, learnConst = 0.00001, iters = 1000000) {
    let weights = this.weights
    let prevBitmap = genBitmap(weights)
    for (let j = 0; j < iters; j++) {
      let [batch, target] = fetchTrain(trainBatches, trainTargets).next().value
      let bitmap = genBitmap(weights)
      let res = await this.a(batch, bitmap)
      let orig = await this.a(batch, this.weights)
      let loss = measure(res, [target])
      let origLoss = measure(orig, [target])
      l('b', batch, 't', target, 'r', res, 'o', orig, 'l', loss, 'ol', measure(orig, [target]))
      l('train at j ', j, 'orig loss: ', origLoss, 'last loss: ', this.lastLoss)
      if (j === 0) continue;
      if (loss < this.lastLoss) {
        for (let i in this.layers) {
          for (let k in this.layers[i].n) {
            let delta = Math.abs(this.layers[i].n[k].weight - bitmap[i][k]) * learnConst
            if (this.layers[i].n[k].weight > bitmap[i][k]) {
              this.layers[i].n[k].weight -= delta
            } else {
              this.layers[i].n[k].weight += delta
            }
          }
        }
      } else {
        for (let i in this.layers) {
          for (let k in this.layers[i].n) {
            let delta = Math.abs(this.layers[i].n[k].weight - prevBitmap[i][k]) * learnConst
            if (this.layers[i].n[k].weight > prevBitmap[i][k]) {
              this.layers[i].n[k].weight -= delta
            } else {
              this.layers[i].n[k].weight += delta
            }
          }
        }
      }
      prevBitmap = [...bitmap]
      this.lastLoss = loss
    }
  }
  async predict(batch, cb = null) {
    if (!cb) {
      return await this.a(this.weights)
    }
    let res = await this.a(batch, this.weights)
    let ans = await cb(res)
    if (ans) await this.train([batch], [res])
    return res
  }
}