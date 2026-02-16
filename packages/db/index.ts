import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export { AccountType };
