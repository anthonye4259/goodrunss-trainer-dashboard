// Better migration script - executes the full SQL file at once
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting subscription system migration...\n');

    // Read the entire SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'MIGRATION_SUBSCRIPTIONS.sql'),
      'utf8'
    );

    console.log('📝 Executing subscription migration SQL...\n');

    // Execute the entire file as one transaction
    await prisma.$executeRawUnsafe(sqlFile);

    console.log('✅ Migration completed successfully!\n');

    // Verify the data
    console.log('📊 Verifying subscription plans...\n');
    
    const plans = await prisma.$queryRaw`
      SELECT name, "displayName", "priceMonthly", "priceYearly", "trialDays"
      FROM subscription_plans
      ORDER BY "sortOrder"
    `;

    console.log('✅ Available Plans:');
    console.table(plans);

    console.log('\n🎉 Subscription system is ready to use!\n');
    console.log('📋 Next steps:');
    console.log('   1. ✅ Database tables created');
    console.log('   2. ✅ Plans seeded (Free, Basic, Pro, Elite)');
    console.log('   3. 📦 Create Stripe products → Get price IDs');
    console.log('   4. 🔗 Update plans with Stripe price IDs');
    console.log('   5. 🧪 Test subscription flow\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 TIP: You can also run this migration directly in Supabase SQL Editor:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql');
    console.log('   2. Copy contents of MIGRATION_SUBSCRIPTIONS.sql');
    console.log('   3. Paste and click "Run"\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

