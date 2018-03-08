var apriori = require("../dist/apriori");

var transactions = [
    [1, 3, 4],
    [2, 3, 5],
    [1, 2, 3, 5],
    [2, 5],
    [1, 2, 3, 5]
];


// Execute Apriori with a minimum support of 40%.
var apriori = new apriori.Apriori(.4);
console.log(`Executing Apriori...`);

// Returns itemsets 'as soon as possible' through events.
apriori.on('data', function (itemset) {
    // Do something with the frequent itemset.
    var support = itemset.support;
    var items = itemset.items;
    console.log(`Itemset { ${items.join(',')} } is frequent and have a support of ${support}`);
});

// Execute Apriori on a given set of transactions.
apriori.exec(transactions)
    .then(function (result) {
      // Returns both the collection of frequent itemsets and execution time in millisecond.
      var frequentItemsets = result.itemsets;
      var executionTime = result.executionTime;
      console.log(`Finished executing Apriori. ${frequentItemsets.length} frequent itemsets were found in ${executionTime}ms.`);
  });
