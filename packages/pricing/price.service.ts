import { Decimal } from "@repo/utils";

export class PriceService {
    private midPrice = new Decimal(75);

    private spreadPercent = new Decimal(0.02); // 2%

    async getBuyPrice(): Promise<Decimal> {
        return this.midPrice.mul(
            new Decimal(1).plus(this.spreadPercent.div(2))
        );
    }

    async getSellPrice(): Promise<Decimal> {
        return this.midPrice.mul(
            new Decimal(1).minus(this.spreadPercent.div(2))
        );
    }
}
