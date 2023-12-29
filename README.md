This is unique solution developed from scratch, except getMultipleRandom function, which was fairly stolen from StackOverflow.

### Input-reduce neural network

Open the terminal and run:
```sh
node main.js
```

This will run test from test.js to predict value of pair traded on Kraken, given batches of previous prices.
Compose any layer sizes, and use any input matrices. This code doesn't use tensor multiply at all, passing reduced input to neuron activation function.
