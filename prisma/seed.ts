import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Clean up the database (Optional: enables re-running)
    await prisma.subscription.deleteMany()
    await prisma.user.deleteMany()

    // 2. Create the User
    const user = await prisma.user.create({
        data: {
            name: 'Ghost Demo',
            email: 'demo@ghost.com',
            avatar_url: 'https://github.com/shadcn.png',
        },
    })

    // 3. Create Subscriptions
    await prisma.subscription.createMany({
        data: [
            {
                user_id: user.id,
                service_name: 'Netflix Premium',
                category: 'Entertainment',
                cost: 22.99,
                currency: 'USD',
                billing_cycle: 'MONTHLY',
                start_date: new Date('2024-01-01'),
                next_billing_date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days overdue
                status: 'ACTIVE',
                icon_key: 'netflix',
            },
            {
                user_id: user.id,
                service_name: 'Adobe Creative Cloud',
                category: 'Software',
                cost: 54.99,
                currency: 'USD',
                billing_cycle: 'MONTHLY',
                start_date: new Date('2024-02-01'),
                next_billing_date: new Date(new Date().setDate(new Date().getDate() + 3)), // Due in 3 days
                status: 'ACTIVE',
                icon_key: 'adobe',
                reminder_days: 3,
            },
            {
                user_id: user.id,
                service_name: 'AWS Infrastructure',
                category: 'Utilities',
                cost: 242.50,
                currency: 'USD',
                billing_cycle: 'MONTHLY',
                start_date: new Date('2024-03-15'),
                next_billing_date: new Date('2026-02-15'), // Far future
                status: 'ACTIVE',
                icon_key: 'aws',
            },
            {
                user_id: user.id,
                service_name: 'Apple TV+ (Trial)',
                category: 'Entertainment',
                cost: 9.99,
                currency: 'USD',
                billing_cycle: 'MONTHLY',
                start_date: new Date(),
                next_billing_date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days left
                status: 'ACTIVE',
                is_trial: true,
                trial_end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
                icon_key: 'apple',
                reminder_days: 1,
            },
        ],
    })

    console.log('✅ Seed finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })