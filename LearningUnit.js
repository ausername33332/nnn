const { EventEmitter } = require('events')
const { generateBatches } = require('./tools')

class LearningUnit extends EventEmitter {
  constructor(brain, inputDSize, outputDSize) {
    super()
    this.name = rStr(5)
    this.brain = brain
    this.buffer = new Map()
    this.target = []
    for (let i = 0; i < outputDSize; i++) this.target.push(Math.random())
    this.inputDSize = inputDSize
    this.outputDSize = outputDSize
    this.isLifeBeing = true
    this.interactive = Math.random()
    this.memory = new Map()
    this.lc = Math.random() * (Math.random() * (Math.random() * .01))
    this.memTrainItersCap = r(10)
    let interact = (to, self, cb) => {
      let pack = []
      for (let batch of self.buffer.entries()) pack.push(batch)
      to.emit('io', pack, cb)
    }
    this.on('interactionOffer', (subject, cb) => {
      let chance = Math.random()
      if (chance < this.interactive) return
      if (subject.inputDSize === this.outputDSize) {
        interact(subject, this, cb)
      } else if (subject.outputDSize === this.inputDSize) {
        subject.emit('interaction', this, cb)
      }
    })
    this.on('io', async (pack, cb) => {
      let data = []
      for (let [, batch] of pack) data.push(batch)
      await this.brain.train(data, this.target, this.learnConst, this.memTrainItersCap)
      let loss = new Map()
      for (let [author, batch] of pack) {
        let prediction = await this.brain.predict(batch)
        this.buffer.set(author, prediction)
        loss.set(avg(measure(prediction, this.target)), author)
      }
      for (let [lossPerAuthor, lossAuthor] of loss.entries()) {
        if (this.memory.has(lossAuthor)) {
          if (lossPerAuthor < this.memory.get(lossAuthor)) {
            l('interaction of ', this.name, ' with ', lossAuthor.name, ' on target loss decrease')
            lossAuthor.emit('interactionOffer', this, cb)
          } else {
            if (this.buffer.has(lossAuthor)) this.buffer.delete(lossAuthor)
            this.memory.delete(lossAuthor)
          }
        } else this.memory.set(lossAuthor, lossPerAuthor)
      }
      cb()
    })
    this.on('interaction', (subject, cb) => {
      interact(subject, this, cb)
    })
    this.on('fluctuationDataIn', (data, cb) => {
      this.brain.train(data, [this.target], this.learnConst, this.memTrainItersCap).then(cb).catch(cb)
    })
  }
  async initiate(startIters, fn) {
    return new Promise((go, stop) => {
      let [b, t] = generateBatches(1, this.inputDSize, fn)
      this.brain.train(b, t, startIters, this.lc)
      this.brain.predict(b).then(res => {
        this.buffer.set(this, res)
        return go()
      })
    })
  }
}

module.exports = {
  LearningUnit
}