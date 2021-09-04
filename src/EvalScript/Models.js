function upcharge(rate, percentage) {
    return (rate + (rate * (percentage / 100)));
}

class LabourModel {
    constructor(prices, costRates, burden, burdenDollarValue) {
        this.prices = prices;
        this.costRates = costRates;
        this.burden = burden;
        /**
         * The "burdenDollarValue" can be either true or false.
         */
        this.burdenDollarValue = burdenDollarValue;
    }
    /**
     * Apply a burden to all rates (if the model has a burden).
     */
    get costs() {
        let temp = Object.create(this.costRates);
        for (let cost in temp) {
            /**
             * If "burdenDollarValue" is true, upcharge burden
             * as a straight dollar value.
             */
            if (this.burdenDollarValue) {
                temp[cost] = (temp[cost]  + (this.burden ? this.burden : 0));
            } else {
                temp[cost] = upcharge(temp[cost], this.burden ? this.burden : 0);
            }
        }
        return temp;
    }
}

module.exports = {
    LabourModel: LabourModel
};
