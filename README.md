# Node-Apriori
[Apriori Algorithm](https://en.wikipedia.org/wiki/Apriori_algorithm) implementation in TypeScript / JavaScript.

## Getting Started

### Performances

This implementation **does not generate k-candidates as efficiently as it possibly could**, as it adopts a brute-force approach: Every k-itemset is considered as a potential candidate, and an additional step is required to prune the unnecessary ones. [More information about this question here](http://paulallen.ca/apriori-algorithm-generating-candidate-fis/).

The Apriori Algorithm is a great, easy-to-understand algorithm for frequent-itemset mining. However, faster and more memory efficient algorithms such as the [FPGrowth Algorithm](https://en.wikibooks.org/wiki/Data_Mining_Algorithms_In_R/Frequent_Pattern_Mining/The_FP-Growth_Algorithm) have been proposed since it was released.

If you need a more efficient frequent-itemset mining algorithm, **consider checking out my implementation of the [FPGrowth Algorithm](https://github.com/alexisfacques/Node-FPGrowth).**

### Installing

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install --save node-apriori
```

### Example of use

```js

import { Apriori, Itemset, IAprioriResults } from 'node-apriori';

let transactions: number[][] = [
    [1,3,4],
    [2,3,5],
    [1,2,3,5],
    [2,5],
    [1,2,3,5]
];

// Execute Apriori with a minimum support of 40%. Algorithm is generic.
let apriori: Apriori<number> = new Apriori<number>(.4);

// Returns itemsets 'as soon as possible' through events.
apriori.on('data', (itemset: Itemset<number>) => {
    // Do something with the frequent itemset.
    let support: number = itemset.support;
    let items: number[] = itemset.items;
});

// Execute Apriori on a given set of transactions.
apriori.exec(transactions)
    .then( (result: IAprioriResults<number>) => {
        // Returns both the collection of frequent itemsets and execution time in millisecond.
        let frequentItemsets: Itemset<number>[] = result.itemsets;
        let executionTime: number = result.executionTime;
    });


```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
