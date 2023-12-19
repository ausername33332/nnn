class Neuron {
  constructor(weight) {
    this.weight = weight
  }
  a(input, weight = this.weight) {
    return weight * input
  }
}

class ExperimentRandomMulActivationNeuron extends Neuron {
  a(input) {
    return super.a(input) * Math.random()
  }
}

module.exports = {
	Neuron,
	ExperimentRandomMulActivationNeuron
}