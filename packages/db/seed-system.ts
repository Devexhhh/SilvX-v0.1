import prisma, { AccountType } from "./index";
import { Decimal } from "@repo/utils";
import { LedgerService } from "@repo/ledger";

const ledger = new LedgerService();

async function seedSystemAccounts() {
    const systemAccounts = [
        AccountType.SYSTEM_INR,
        AccountType.SYSTEM_SILVER,
        AccountType.SYSTEM_REVENUE_INR,
    ];

    for (const type of systemAccounts) {
        const exists = await prisma.account.findFirst({
            where: { type },
        });

        if (!exists) {
            await prisma.account.create({
                data: {
                    type,
                    userId: null,
                },
            });

            console.log(`Created ${type}`);
        }
    }
}

async function seedReserve() {
    const systemSilver = await prisma.account.findFirst({
        where: { type: AccountType.SYSTEM_SILVER },
    });

    const systemInr = await prisma.account.findFirst({
        where: { type: AccountType.SYSTEM_INR },
    });

    if (!systemSilver || !systemInr) {
        throw new Error("System accounts missing");
    }

    // Check if reserve already seeded
    const existingReserve = await prisma.ledgerEntry.findFirst({
        where: { referenceType: "INITIAL_RESERVE" },
    });

    if (existingReserve) {
        console.log("Reserve already seeded. Skipping.");
        return;
    }

    // Inject 1000 grams reserve
    await ledger.createEntry({
        debitAccountId: systemInr.id,
        creditAccountId: systemSilver.id,
        amount: new Decimal(1000),
        asset: "SILVER",
        referenceType: "INITIAL_RESERVE",
        referenceId: "SEED_1",
    });

    console.log("Seeded 1000g system silver reserve");
}

async function main() {
    await seedSystemAccounts();
    await seedReserve();
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
