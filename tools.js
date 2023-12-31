const avg = x => x.reduce((prev, cur) => prev + cur) / x.length
const measure = (output, target) => output.map((x, i) => {
  let t = target[i]
  if (x <= 0) {
    if (t <= 0) { return Math.abs(Math.abs(x) - Math.abs(t))
    } else { return Math.abs(x) + t }
  } else {
    if (t <= 0) { return Math.abs(t) + x
    } else { return Math.abs(x - t)}
  }
})
const l = console.log
const r = x => Math.floor(Math.random() * x)
const isLossCurveSuccessive = (loss) => {
	let up = 0
	for (let i = 1; i < loss.length; i++) {
		if (loss[i] < loss[i - 1]) up++
	}
	return (up > (loss.length / 2))
}
const getSuccessDelta = (successives) => (successives.reduce((acc, val) => {
	if (val) acc++
}) / successives.length)
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
const fetchTrain = function* (batches, targets) {
	let i = 0
	while (i < batches.length) {
		yield [batches[i], targets[i]]
		i++
	}
}
const fetchInfiniteTrain = function* (batches, targets) {
	let i = 0
	while (true) {
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
const generateBatches = (size = 10000, batchSize = 100, batchFn, targetFn) => {
  let batches = []
  let targets = []
  for (let i = 0; i < size; i++) {
    let batch = new Array()
    let start = Math.floor(Math.random() * (size - batchSize))
    let k = start
    while (k < start + batchSize) {
      batch.push(batchFn(k))
      k++
    }
    batches.push(batch)
    targets.push(targetFn(batch, k))
  }
  return [batches, targets]
}
const normalize = (batch, size) => {
  let i = 0
  let k = 0
  let res = []
  while (k < size) {
    res.push(batch[i])
    i++
    k++
    if (i >= batch.length) i = 0
  }
  return res
}

module.exports = {
	avg,
	measure,
	l,
	r,
	isLossCurveSuccessive,
	getSuccessDelta,
	shuffle,
	getMultipleRandom,
	rStr,
	fetchTrain,
	fetchInfiniteTrain,
	genBitmap,
	generateBatches,
  normalize
}