import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve } from 'path';
import * as bcrypt from 'bcryptjs';

const raw = process.env.DATABASE_URL ?? 'file:./dev.db';
const path = raw.replace(/^file:/, '');
const dbUrl = path.startsWith('/') ? path : resolve(process.cwd(), path);

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const existing = await (prisma as any).user.findUnique({ where: { email: 'admin@smi.com' } });
  if (!existing) {
    await (prisma as any).user.create({
      data: {
        email: 'admin@smi.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrateur SMI',
        role: 'ADMIN',
      },
    });
    console.log('Admin créé: admin@smi.com / admin123');
  } else {
    console.log('Admin déjà existant');
  }
}

main().finally(() => (prisma as any).$disconnect());
