import { EventEmitter } from 'events';

interface ItemsCount {
    [stringifiedItem: string]: number
}

export interface IAprioriEvents<T> {
    on(event: 'data', listener: (itemset: Itemset<T>) => void): this;
    on(event: 'close', listener: (stats: any) => void): this;
    on(event: string, listener: Function): this;
}

export interface Itemset<T> {
    items: T[],
    support: number
}

export class Apriori<T> extends EventEmitter implements IAprioriEvents<T> {

    constructor( private _transactions: T[][], private _support: number /*, private _confidence: number*/ ) {
        super();
    }

    public exec(): any {
        let frequentItemsets: Itemset<T>[][] = [];

        frequentItemsets.push( this.getFrequentOneItemsets(this._transactions) );

        let i: number = 0;
        while( frequentItemsets[i].length > 0 ) {
            frequentItemsets.push( this.getFrequentKItemsets(frequentItemsets[i]) );
            i++;
        }

        console.log(`Algorithm stopped at size ${i}`);

        [].concat.apply([], frequentItemsets).forEach( (frequentItemset: Itemset<T>) => {
            console.log(`=====\r\nItems: ${frequentItemset.items.toString()}`);
            console.log(`Support: ${frequentItemset.support}\r\n=====`);
        });
    }

    /**
     * Returns frequent one-itemsets from a given set of transactions.
     * @param  {T[][]}              transactions Your set of transactions.
     * @return {Itemset<T>}              Frequent one-itemsets.
     */
    private getFrequentOneItemsets( transactions: T[][] ): Itemset<T>[] {
        // This generates one-itemset candidates.
        let count: ItemsCount = this._getDistinctItemsCount(transactions);

        return Object.keys(count)
            .reduce<Itemset<T>[]>( (ret: Itemset<T>[], stringifiedItem: string) => {
                // Returning pruned one-itemsets.
                if( count[stringifiedItem] >= transactions.length * this._support ) {
                    let frequentItemset: Itemset<T> = {
                        support: count[stringifiedItem],
                        items: [JSON.parse(stringifiedItem)]
                    };
                    ret.push(frequentItemset);
                    this.emit('data', frequentItemset)
                }
                return ret;
            }, []);
    }

    /**
     * Returns frequent (k = n+1)-itemsets from a given array of frequent n-itemsets.
     * @param  {Itemset<T>[]} frequentNItemsets Previously determined n-itemsets.
     * @return {any}                                    [description]
     */
    private getFrequentKItemsets( frequentNItemsets: Itemset<T>[] ): Itemset<T>[] {
        // Trivial precondition.
        if(!frequentNItemsets.length) return [];

        // Size of frequent itemsets we want to determine.
        let k: number = frequentNItemsets[0].items.length + 1;

        // Get unique items from these itemsets (Brute-force approach).
        let items: T[] = frequentNItemsets
            .reduce<T[]>( (items: T[], itemset: Itemset<T>) => items.concat(itemset.items), [])
            .filter( (item: T, index: number, that: T[]) => that.indexOf(item) === index );

        // Generating candidates and counting their occurence.
        return this._getCandidatesCount( this._generateKCandidates(items,k) )
            // Pruning candidates.
            .filter( (itemset: Itemset<T>) => {
                let isFrequent: boolean = itemset.support >= this._transactions.length * this._support;
                if(isFrequent) this.emit('data', itemset);
                return isFrequent;
            });
    }

    /**
     * Returns all combinations (itemset candidates) of size k from a given set of items.
     * @param  {T[]}    items The set of items of which you want the combinations.
     * @param  {number} k     Size of combinations you want.
     * @return {T[]}          Array of itemset candidates.
     */
    private _generateKCandidates( items: T[], k: number): Itemset<T>[] {
        // Trivial preconditions over k.
        if(k > items.length || k <= 0) return [];
        if(k == items.length) return [{items: items, support: 0}];
        if(k == 1) return items.map( (item: T) => {
            return { items: [item], support: 0 };
        });

        let ret: Itemset<T>[] = [];
        for( let i: number = 0; i < items.length - k + 1; i++) {
            let head: T[] = items.slice(i, i + 1);
            this._generateKCandidates(items.slice(i + 1), k - 1)
                .forEach( (tailcomb: Itemset<T>) => ret.push({
                    items: head.concat(tailcomb.items),
                    support: 0
                }));
        }

        return ret;
    }

    /**
     * Populates an Itemset array with their support in the given set of transactions
     * @param  {Itemset<T>[]} candidates The itemset candidates to populate with their support.
     * @return {Itemset<T>}              The support-populated collection of itemsets.
     */
    private _getCandidatesCount( candidates: Itemset<T>[] ): Itemset<T>[] {
        this._transactions.forEach( (transaction: T[]) => {
            candidates.forEach( (candidate: Itemset<T>) => {
                let includesCandidate: boolean = candidate.items.every( (item: T) => transaction.indexOf(item) !== -1 );
                if(includesCandidate) candidate.support += 1;
            })
        });
        return candidates;
    }

    /**
     * Returns the occurence of single items in a given set of transactions.
     * @param  {T[][]}      transactions The set of transaction.
     * @return {ItemsCount}              Count of items (stringified items as keys).
     */
    private _getDistinctItemsCount( transactions: T[][] ): ItemsCount {
        return transactions.reduce<ItemsCount>( (count: ItemsCount, arr: T[]) => {
            return arr.reduce<ItemsCount>( (count: ItemsCount, item: T) => {
                count[JSON.stringify(item)] = (count[JSON.stringify(item)] || 0) + 1;
                return count;
            }, count);
        }, {});
    }
}