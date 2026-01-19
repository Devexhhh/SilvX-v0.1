import prisma from "./index";
import { UsersService } from "@repo/users";
import { DepositsService } from "@repo/deposits";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";

async function main() {
    const users = new UsersService();
    const deposits = new DepositsService();
    const ledger = new LedgerService();

    // 1. Create a user
    const user = await users.createUser(
        `9${Date.now().toString().slice(-9)}`
    );


    // 2. Deposit INR
    await deposits.depositINR({
        userId: user.id,
        amount: new Decimal(500),
        referenceId: "UPI_TEST_001",
    });

    // 3. Fetch user's INR account
    const userInr = await prisma.account.findFirst({
        where: {
            userId: user.id,
            type: "USER_INR",
        },
    });

    if (!userInr) {
        throw new Error("USER_INR account not found");
    }

    // 4. Compute balance from ledger
    const balance = await ledger.getBalance(userInr.id, "INR");
    console.log("User INR balance:", balance.toString());
}

main()
    .catch((err) => {
        console.error("Test failed:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
