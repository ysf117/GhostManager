-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "is_trial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder_days" INTEGER,
ADD COLUMN     "trial_end_date" TIMESTAMP(3);
