import { LedgerService } from "@repo/ledger";

export class BalancesService {
    private ledger = new LedgerService();

    async getInrBalance(accountId: string) {
        return this.ledger.getBalance(accountId, "INR");
    }

    async getSilverBalance(accountId: string) {
        return this.ledger.getBalance(accountId, "SILVER");
    }
}
