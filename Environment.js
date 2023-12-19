class Environment {
  constructor() {
    this.data = []
    this.life = []
    this.dataCap = 10000
    this.lifeCap = 100
    this.dataSizeCap = 10
    this.widthCap = 25
    this.chunkCap = 100
    this.lenCap = 5
    this.fnLenCap = 100
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
      val: generateBatches(r(this.chunkCap), bsize, getFn()),
      bsize
    })
  }
  fetchLife(width, lCount, inputDSize, outputDSize) {
    let layers = []
    layers.push(new Layer(inputDSize))
    for (let i = 1; i < lCount; i++) {
      layers.push(new Layer(width))
    }
    layers.push(new Layer(outputDSize))
    let stack = new LayerStack(layers)
    let lifeBeing = new LifeBeing(stack, inputDSize, outputDSize)
    this.life.push(lifeBeing)
  }
  waveOfBigRandom() {
    let howMuchDataToFetch = r(this.dataCap)
    let howMuchLifeToSpawn = r(this.lifeCap)
    for (let i = 0; i < howMuchDataToFetch; i++) this.fetchData(r(this.dataSizeCap))
    for (let i = 0; i < howMuchLifeToSpawn; i++) {
      let width = r(this.widthCap) + 1
      let length = r(this.lenCap) + 1
      let dsizeIn = r(this.dataSizeCap)
      let dsizeOut = r(this.dataSizeCap)
      this.fetchLife(width, length, dsizeIn, dsizeOut)
    }
    let ticker = async () => this.tick()
    ticker()
    this.fnGenerator()
    this.waveOfRandom()
  }
  tick() {
    let i = r(this.data.length - 1)
    let recvs = this.life.filter(x => x.inputDSize === this.data[i].bsize)
    let reciever = getMultipleRandom(recvs, 1)[0]
    reciever.emit('fluctuationDataIn', this.data[i].val, () => {
      this.data.splice(i, 1)
    })
    this.fetchData(r(this.dataSizeCap))
    this.tick()
  }
  async fnGenerator() {
    if (this.fnGenLock) return
    this.fnGenLock = true
    while (true && (! this.ctxLock)) {
      let fn = rStr(this.fnLenCap)
      let test = `const f=n=>(Number(n)===n);if(!f(${fn}(1))){throw new Error()}`
      let code = (k) => vm.runInContext(`${fn}(${k})`, this.ctx, { displayErrors: false })
      try {
        vm.runInContext(test, this.ctx, { displayErrors: false })
      } catch (e) { continue }
      this.fns.push(code)
      this.fnGenLock = false
      break
    }
    if (! this.ctxLock) this.fnGenerator()
  }
  async waveOfRandom() {
    while (true) {
      this.lifeCap = 100
      this.dataSizeCap = 10
      this.widthCap = 25
      this.chunkCap = 100
      if (Math.random() > .5) { this.dataSizeCap += 1 } else { this.dataSizeCap -= 1 }
      if (Math.random() > .5) { this.widthCap += 1 } else { this.widthCap -= 1 }
      if (Math.random() > .5) { this.chunkCap += 1 } else { this.chunkCap -= 1 }
      if (Math.random() > .5) { this.lenCap += 1 } else { this.lenCap -= 1 }
      if (Math.random() > .5) { this.fnLenCap += 1 } else { this.fnLenCap -= 1 }
      if (Math.random() > .5) {
        this.ctxLock = true
        this.ctx = {}
        vm.createContext(this.ctx)
        this.ctxLock = false
        if (! this.fnGenLock) this.fnGenerator()
      }
      if (Math.random() > .5) {
        this.dataCap += 1
        this.fetchData(r(this.dataSizeCap))
      } else {
        this.dataCap -= 1
        this.fetchData(r(this.dataSizeCap))
      }
      if (Math.random() > .5) {
        this.lifeCap += 1
        this.fetchLife(r(this.widthCap) + 1, r(this.lenCap) + 1, r(this.dataSizeCap), r(this.dataSizeCap))
      } else {
        this.lifeCap -= 1
        this.fetchLife(r(this.widthCap) + 1, r(this.lenCap) + 1, r(this.dataSizeCap), r(this.dataSizeCap))
      }
      let slice1 = getMultipleRandom(this.life, r(this.life.length - 1))
      let slice2 = getMultipleRandom(this.life, r(this.life.length - 1))
      let promises = []
      for (let i in slice1) {
        for (let k in slice2) {
          if (i === k) continue
          let ackPromise = new Promise()
          slice1[i].emit('interactionOffer', slice2[k], () => {
            ackPromise.resolve()
          })
          promises.push(ackPromise)
        }
      }
      await Promise.all(promises)
    }
  }
}