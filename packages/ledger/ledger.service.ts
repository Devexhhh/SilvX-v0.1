import prisma from "@repo/db";
import Decimal from "@repo/utils/decimal";

export type Asset = "INR" | "SILVER";

export class LedgerService {
    async createEntryTx(tx: any, params: {
        debitAccountId: string;
        creditAccountId: string;
        amount: Decimal;
        asset: "INR" | "SILVER";
        referenceType: string;
        referenceId: string;
    }) {
        return tx.ledgerEntry.create({
            data: params,
        });
    }

    async createEntry(params: {
        debitAccountId: string;
        creditAccountId: string;
        amount: Decimal;
        asset: Asset;
        referenceType: string;
        referenceId: string;
    }) {
        if (params.amount.lte(0)) {
            throw new Error("Ledger entry amount must be > 0");
        }

        return prisma.ledgerEntry.create({
            data: {
                debitAccountId: params.debitAccountId,
                creditAccountId: params.creditAccountId,
                amount: params.amount,
                asset: params.asset,
                referenceType: params.referenceType,
                referenceId: params.referenceId,
            },
        });
    }
    async getBalance(accountId: string, asset: Asset): Promise<Decimal> {
        const credits = await prisma.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                creditAccountId: accountId,
                asset,
            },
        });

        const debits = await prisma.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                debitAccountId: accountId,
                asset,
            },
        });

        const creditSum = new Decimal(credits._sum.amount || 0);
        const debitSum = new Decimal(debits._sum.amount || 0);

        return creditSum.minus(debitSum);
    }
}
