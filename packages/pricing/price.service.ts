import { Decimal } from "@repo/utils";

export class PriceService {
    /**
     * Returns price per gram of silver in INR
     * In v1 this is static
     * Later this can be replaced by live market data
     */
    async getSilverPricePerGram(): Promise<Decimal> {
        // ₹100 per gram (mock)
        return new Decimal(100);
    }
}
