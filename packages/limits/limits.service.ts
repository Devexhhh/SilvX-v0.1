import { Decimal } from "@repo/utils";

export class LimitsService {
    // INR limits
    readonly MIN_BUY_INR = new Decimal(100);
    readonly MAX_BUY_INR = new Decimal(100000);

    async validateBuyInr(amount: Decimal) {
        if (amount.lt(this.MIN_BUY_INR)) {
            throw new Error(
                `Minimum buy amount is ₹${this.MIN_BUY_INR.toString()}`
            );
        }

        if (amount.gt(this.MAX_BUY_INR)) {
            throw new Error(
                `Maximum buy amount is ₹${this.MAX_BUY_INR.toString()}`
            );
        }
    }

    async validateSellSilver(
        silverQty: Decimal,
        availableQty: Decimal
    ) {
        if (silverQty.gt(availableQty)) {
            throw new Error("Insufficient silver balance");
        }
    }
}
