import prisma, { AccountType } from "@repo/db";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";
import { PriceService } from "@repo/pricing";
import { LimitsService } from "@repo/limits";


export class SilverService {
    private ledger = new LedgerService();
    private pricing = new PriceService();
    private limits = new LimitsService();
    private feePercent = new Decimal(0.005); // 0.5%

    async buySilver(params: {
        userId: string;
        inrAmount: Decimal;
        referenceId: string;
    }) {
        const { userId, inrAmount, referenceId } = params;


        if (inrAmount.lte(0)) {
            throw new Error("INR amount must be > 0");
        }

        this.limits.validateBuyInr(inrAmount);

        const buyPrice = await this.pricing.getBuyPrice();

        const fee = inrAmount.mul(this.feePercent);
        const netInr = inrAmount.minus(fee);
        const silverQty = netInr.div(buyPrice);

        return prisma.$transaction(async (tx) => {

            const [
                userInr,
                userSilver,
                systemInr,
                systemSilver,
                systemRevenue,
            ] = await Promise.all([
                tx.account.findFirst({ where: { userId, type: AccountType.USER_INR } }),
                tx.account.findFirst({ where: { userId, type: AccountType.USER_SILVER } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_INR } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_SILVER } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_REVENUE_INR } }),
            ]);

            if (!userInr || !userSilver)
                throw new Error("User accounts missing");

            if (!systemInr || !systemSilver || !systemRevenue)
                throw new Error("System accounts missing");
            // 🔒 Reserve Guard
            const currentSystemSilver = await this.ledger.getBalanceTx(
                tx,
                systemSilver.id,
                "SILVER"
            );

            if (currentSystemSilver.lt(silverQty)) {
                throw new Error("Insufficient system silver reserve");
            }

            // 1️⃣ User pays net INR to liquidity
            await this.ledger.createEntryTx(tx, {
                debitAccountId: userInr.id,
                creditAccountId: systemInr.id,
                amount: netInr,
                asset: "INR",
                referenceType: "BUY_SILVER",
                referenceId,
            });

            // 2️⃣ User pays fee to revenue
            await this.ledger.createEntryTx(tx, {
                debitAccountId: userInr.id,
                creditAccountId: systemRevenue.id,
                amount: fee,
                asset: "INR",
                referenceType: "BUY_FEE",
                referenceId,
            });

            // 3️⃣ System gives silver
            await this.ledger.createEntryTx(tx, {
                debitAccountId: systemSilver.id,
                creditAccountId: userSilver.id,
                amount: silverQty,
                asset: "SILVER",
                referenceType: "BUY_SILVER",
                referenceId,
            });

            return {
                silverQty,
                buyPrice,
                fee,
            };
        });
    }

    async sellSilver(params: {
        userId: string;
        silverQty: Decimal;
        referenceId: string;
    }) {
        const { userId, silverQty, referenceId } = params;

        if (silverQty.lte(0)) {
            throw new Error("Silver quantity must be > 0");
        }

        const sellPrice = await this.pricing.getSellPrice();

        const grossInr = silverQty.mul(sellPrice);
        const fee = grossInr.mul(this.feePercent);
        const netInr = grossInr.minus(fee);

        return prisma.$transaction(async (tx) => {
            const [
                userInr,
                userSilver,
                systemInr,
                systemSilver,
                systemRevenue,
            ] = await Promise.all([
                tx.account.findFirst({ where: { userId, type: AccountType.USER_INR } }),
                tx.account.findFirst({ where: { userId, type: AccountType.USER_SILVER } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_INR } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_SILVER } }),
                tx.account.findFirst({ where: { type: AccountType.SYSTEM_REVENUE_INR } }),
            ]);

            if (!userInr || !userSilver)
                throw new Error("User accounts missing");

            if (!systemInr || !systemSilver || !systemRevenue)
                throw new Error("System accounts missing");

            const userSilverBalance = await this.ledger.getBalanceTx(
                tx,
                userSilver.id,
                "SILVER"
            );

            this.limits.validateSellSilver(
                silverQty,
                userSilverBalance
            );

            // 1️⃣ User gives silver
            await this.ledger.createEntryTx(tx, {
                debitAccountId: userSilver.id,
                creditAccountId: systemSilver.id,
                amount: silverQty,
                asset: "SILVER",
                referenceType: "SELL_SILVER",
                referenceId,
            });

            // 2️⃣ System pays net INR
            await this.ledger.createEntryTx(tx, {
                debitAccountId: systemInr.id,
                creditAccountId: userInr.id,
                amount: netInr,
                asset: "INR",
                referenceType: "SELL_SILVER",
                referenceId,
            });

            // 3️⃣ System pays fee to revenue
            await this.ledger.createEntryTx(tx, {
                debitAccountId: systemInr.id,
                creditAccountId: systemRevenue.id,
                amount: fee,
                asset: "INR",
                referenceType: "SELL_FEE",
                referenceId,
            });

            return {
                netInr,
                sellPrice,
                fee,
            };
        });
    }
}
