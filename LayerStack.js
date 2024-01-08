const { Neuron } = require('./Neuron')
const { Layer } = require('./Layer')

class LayerStack {
	constructor(layers) {
		this.layers = Array.from(layers)
	}
	async a(input, weights = this.weights) {
		let state = input
		for (let i = 0; i < this.layers.length; i++) {
			state = normalize(state, this.layers[i].n.length)
			state = await this.layers[i].a(state, weights[i])
		}
		return state
	}
	get weights() {
		return this.layers.map(x => x.weights)
	}
	mutate(bitmap, delta) {
		l('mutated')
		for (let i in this.layers) this.layers[i].mutate(bitmap[i], delta)
	}
	async train(trainBatches, trainTargets, iters = 100000, miniBatchSize = 10000, learnMulConst = 3) {
		let weights = this.weights
		let prevBitmap = genBitmap(weights)
		let curveSuccessMonitor = (curve) => {
			return (unit) => {
				return (unit < avg(curve))
			}
		}
		let roller = async (batches, targets) => {
			let iter = fetchTrain(batches, targets)
			let bitmap = genBitmap(this.weights)
			let losses = []
			let olosses = []
			let lossMonitor = curveSuccessMonitor(losses)
			let olossMonitor = curveSuccessMonitor(olosses)
			let up = 0
			let oup = 0
			for (let i = 0; i < batches.length; i++) {
				let [batch, target] = iter.next().value
				let res = await this.a(batch, bitmap)
				let orig = await this.a(batch, this.weights)
				let loss = avg(measure(res, [target]))
				losses.push(loss)
				let oloss = avg(measure(orig, [target]))
				olosses.push(oloss)
				if (i == 0) continue;
				if (lossMonitor(loss)) up++
				if (olossMonitor(oloss)) oup++
				if (up > (i / 2)) this.mutate(bitmap, ((up / i) ** learnMulConst) * loss.length)
				if (oup > (i / 2)) this.mutate(bitmap, ((oup / i) ** learnMulConst) * loss.length)
				i++
			}
		}
		let tMap = new Map()
		trainBatches.forEach((x, i) => tMap.set(x, trainTargets[i]))
		let iter2 = fetchTrain([...trainBatches], [...trainTargets])
		for (let j = 0; j < iters; j++) {
			let [batch, target] = iter2.next().value
			let batchSlice = getMultipleRandom(trainBatches, miniBatchSize)
			let targetSlice = []
			batchSlice.forEach(x => targetSlice.push(tMap.get(x)))
			await roller(batchSlice, targetSlice)
			l(this.layers[this.layers.length - 1])
			let res = await this.a(batch, this.weights)
			let loss = avg(measure(res, [target]))
			l('@ roll ', j, ' loss is : ', loss.toFixed(8), ' t: ', target.toFixed(8), ' o: ', res)
		}
	}
	async predict(batch, cb = null) {
		if (!cb) {
			return await this.a(batch, this.weights)
		}
		let res = await this.a(batch, this.weights)
		let ans = await cb(res)
		if (ans) await this.train([batch], [res])
		return res
	}
}

module.exports = {
	LayerStack
}