import { Decimal } from "@repo/utils";

export class PriceService {
    private midPrice = new Decimal(75);
    private spreadPercent = new Decimal(0.01);
    private volatility = new Decimal(0.002);

    constructor() {
        this.startSimulation();
    }

    private startSimulation() {
        setInterval(() => {
            const randomDirection = Math.random() > 0.5 ? 1 : -1;
            const drift = this.midPrice.mul(this.volatility).mul(randomDirection);

            this.midPrice = this.midPrice.plus(drift);

            if (this.midPrice.lte(10)) {
                this.midPrice = new Decimal(10);
            }
        }, 5000);
    }

    async getMidPrice() {
        return this.midPrice;
    }

    async getBuyPrice() {
        const halfSpread = this.midPrice.mul(this.spreadPercent).div(2);
        return this.midPrice.plus(halfSpread);
    }

    async getSellPrice() {
        const halfSpread = this.midPrice.mul(this.spreadPercent).div(2);
        return this.midPrice.minus(halfSpread);
    }
}