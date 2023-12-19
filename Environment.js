const vm = require('vm')

const { Layer } = require('./Layer')
const { LayerStack } = require('./LayerStack')
const { LearningUnit } = require('./LearningUnit')

class Environment {
  constructor(opts) {
    this.data = []
    this.learners = []
    this.dataCap = opts?.dataCap || 10000
    this.unitCap = opts?.unitCap || 100
    this.dataSizeCap = opts?.dataSizeCap || 10
    this.widthCap = opts?.widthCap || 25
    this.chunkCap = opts?.chunkCap || 100
    this.lenCap = opts?.lenCap || 5
    this.fnLenCap = opts?.fnLenCap || 100
    this.tickPause = opts?.tickPause || 100
    this.fns = [
      k => k,
      k => k * k,
      () => 0,
      () => 1,
      () => 4556357455,
      k => Math.log(k),
      k => Math.sin(k),
      () => Math.random()
    ]
    this.fnGenLock = false
    this.ctx = {}
    this.ctxLock = false
    vm.createContext(this.ctx)
  }
  getFn(name = null) {
    if (name && name in this.fns) return this.fns[name]
    return getMultipleRandom(this.fns, 1)[0]
  }
  fetchData(size) {
    let bsize = r(size)
    this.data.push({
      val: generateBatches(r(this.chunkCap), bsize, this.getFn()),
      bsize
    })
  }
  async fetchLearner(width, lCount, inputDSize, outputDSize) {
    let layers = []
    layers.push(new Layer(inputDSize))
    for (let i = 1; i < lCount; i++) {
      layers.push(new Layer(width))
    }
    layers.push(new Layer(outputDSize))
    let stack = new LayerStack(layers)
    let learner = new LearningUnit(stack, inputDSize, outputDSize)
    await learner.initiate(r(10) + 1, this.fns[r(this.fns.length - 1)])
    this.learners.push(learner)
  }
  async waveOfBigRandom() {
    let howMuchDataToFetch = r(this.dataCap)
    let howMuchLearnersToSpawn = r(this.unitCap)
    for (let i = 0; i < howMuchDataToFetch; i++) this.fetchData(r(this.dataSizeCap))
    let p = []
    for (let i = 0; i < howMuchLearnersToSpawn; i++) {
      let width = r(this.widthCap) + 1
      let length = r(this.lenCap) + 1
      let dsizeIn = r(this.dataSizeCap)
      let dsizeOut = r(this.dataSizeCap)
      p.push(this.fetchLearner(width, length, dsizeIn, dsizeOut))
    }
    await Promise.all(p)
    l('data and learners spawned')
    let ticker = async () => this.tick()
    ticker()
    l('units here: ', this.learners.length)
    //this.waveOfRandom()
  }
  tick() {
    let i = r(this.data.length - 1)
    let recvs = this.learners.filter(x => x.inputDSize === this.data[i].bsize)
    let reciever = getMultipleRandom(recvs, 1)[0]
    reciever.emit('fluctuationDataIn', this.data[i].val, () => {
      this.data.splice(i, 1)
    })
    this.fetchData(r(this.dataSizeCap))
    setTimeout(this.tick.bind(this), this.tickPause)
  }
  async fnGenerator() {
    if (this.fnGenLock) return
    this.fnGenLock = true
    let fn = rStr(this.fnLenCap)
    try {
      vm.runInContext(`let f=eval('${fn}');let f2=n=>(Number(n)===n);let f3=()=>{if(!f2(f(1))){throw new Error()}}`, this.ctx, { displayErrors: false })
      vm.runInContext(`eval('${fn}')`, this.ctx, { displayErrors: false })
    } catch (e) { return }
    l('fn ', fn, ' spawned!')
    let f = vm.runInContext(`eval('${fn}')`, this.ctx, { displayErrors: false })
    this.fns.push(f)
    this.fnGenLock = false
  }
  async waveOfRandom() {
    while (true) {
      if (Math.random() > .5) { this.dataSizeCap += 1 } else { this.dataSizeCap -= 1 }
      if (Math.random() > .5) { this.widthCap += 1 } else { this.widthCap -= 1 }
      if (Math.random() > .5) { this.chunkCap += 1 } else { this.chunkCap -= 1 }
      if (Math.random() > .5) { this.lenCap += 1 } else { this.lenCap -= 1 }
      if (Math.random() > .5) { this.fnLenCap += 1 } else { this.fnLenCap -= 1 }
      if (Math.random() > .5) {
        l('fngen!')
        if (! this.fnGenLock) {
          this.ctxLock = true
          this.ctx = {}
          vm.createContext(this.ctx)
          this.ctxLock = false
          this.fnGenerator()
        }
      }
      if (Math.random() > .5) {
        l('ctx upd!')
        this.ctxLock = true
        this.ctx = {}
        vm.createContext(this.ctx)
        this.ctxLock = false
      }
      if (Math.random() > .5) {
        this.dataCap += 1
        this.fetchData(r(this.dataSizeCap))
      } else {
        this.dataCap -= 1
        if (this.data.length > this.dataCap) this.data.pop()
      }
      if (Math.random() > .01) {
        l('new learner unit!')
        this.unitCap += 1
        this.fetchLearner(r(this.widthCap) + 1, r(this.lenCap) + 1, r(this.dataSizeCap), r(this.dataSizeCap))
      }
      let slice1 = getMultipleRandom(this.learners, r(this.learners.length - 1))
      let slice2 = getMultipleRandom(this.learners, r(this.learners.length - 1))
      l('s1:', this.learners.length, slice1.length)
      l('s2:', slice2.length)
      let promises = []
      for (let i in slice1) {
        for (let k in slice2) {
          if (i === k) continue
          let ackPromise = new Promise(() => {})
          slice1[i].emit('interactionOffer', slice2[k], () => {
            ackPromise.resolve()
          })
          promises.push(ackPromise)
        }
      }
      l('s1l: ', slice1.length, 's2l: ', slice2.length, promises.length, ' recieved interactionOffer')
      await Promise.all(promises)
    }
  }
}

module.exports = {
  Environment
}