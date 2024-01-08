const { Neuron } = require('./Neuron')

class Layer {
	constructor(size, type = 'sigmoid', mutable = true) {
		this.n = []
		let initial = null
		if (type === 'sigmoid') initial = () => { return Math.random() > .5 ? Math.random() : (Math.random() * -1) }
		if (type === 'positiveSigmoid') initial = () => { return Math.random() }
		if (type === 'bitwise') initial = () => (Math.random() > .5 ? 1 : 0)
		for (let i = 0; i < size; i++) {
			this.n[i] = new Neuron(initial())
		}
		this.mutable = mutable
	}
	async a(input, weights) {
		let activator = async (n, w) => n.a(input.reduce((acc, val) => val + acc), w)
		let fstack = []
		for (let i in this.n) {
			fstack.push(activator(this.n[i], weights[i]))
		}
		return await Promise.all(fstack)
	}
	get weights() {
		return this.n.map(x => x.weight)
	}
	mutate(bitmap, delta) {
		for (let i in this.n) {
			if (this.n[i].weight > bitmap[i]) {
				this.n[i].weight -= delta
			} else {
				this.n[i].weight += delta
			}
		}
	}
}

module.exports = {
	Layer
}