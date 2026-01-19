import prisma from "@repo/db";

export class UsersService {
    /**
     * Create a user and their default accounts.
     * This must be atomic.
     */
    async createUser(phone: string) {
        return prisma.$transaction(async (tx: any) => {
            const existing = await tx.user.findUnique({
                where: { phone },
            });

            if (existing) {
                return existing;
            }

            const user = await tx.user.create({
                data: { phone },
            });

            await tx.account.createMany({
                data: [
                    { userId: user.id, type: "USER_INR" },
                    { userId: user.id, type: "USER_SILVER" },
                ],
            });

            return user;
        });
    }


    async getUserAccounts(userId: string) {
        return prisma.account.findMany({
            where: { userId },
        });
    }
}
