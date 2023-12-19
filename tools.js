const avg = x => x.reduce((prev, cur) => prev + cur) / x.length
const measure = (output, target) => output.map((x, i) => x - target[i])
const l = console.log
const r = x => Math.floor(Math.random() * x)
const shuffle = (array) => {
	let currentIndex = array.length, randomIndex
	while (currentIndex > 0) {
		randomIndex = r(currentIndex)
		currentIndex--
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
	}
}
const getMultipleRandom = (arr, num) => {
	const shuffled = [...arr].sort(() => 0.5 - Math.random())
	return shuffled.slice(0, num)
}
const rStr = (length) => {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?\'\\\/"\n\t '
	const charactersLength = characters.length
	let counter = 0
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
		counter += 1
	}
	return result
}

const fetchTrain = function*(batches, targets) {
	let i = 0
	while (1 === 1) {
		yield [batches[i], targets[i]]
		i++
		if (i >= batches.length) i = 0
	}
}

const genBitmap = (weights, initial = () => { return Math.random() > .5 ? Math.random() : (Math.random() * -1) }) => {
	let bitmap = []
	for (let layer in weights) {
		bitmap[layer] = []
		for (let neuron in weights[layer]) {
			bitmap[layer][neuron] = initial()
		}
	}
	return bitmap
}

const generateBatches = (size = 10000, batchSize = 100, fn) => {
  let batches = []
  let targets = []
  for (let i = 0; i < size; i++) {
    let batch = new Array()
    let start = Math.floor(Math.random() * (size - batchSize))
    let k = start
    while (k < start + batchSize) {
      batch.push(fn(k))
      k++
    }
    batches.push(batch)
    targets.push(fn(k))
  }
  return [batches, targets]
}

module.exports = {
	avg,
	measure,
	l,
	r,
	shuffle,
	getMultipleRandom,
	rStr,
	fetchTrain,
	genBitmap,
	generateBatches
}