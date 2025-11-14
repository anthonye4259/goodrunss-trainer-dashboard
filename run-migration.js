// Quick script to run the subscription migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting subscription system migration...\n');

    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'MIGRATION_SUBSCRIPTIONS.sql'),
      'utf8'
    );

    // Split into individual statements (simple approach)
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
        const tableName = statement.match(/TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/) || 
                         statement.match(/INDEX\s+IF\s+NOT\s+EXISTS\s+"(\w+)"/) ||
                         [];
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}: ${tableName[1] || 'index'}...`);
      } else if (statement.includes('INSERT INTO')) {
        console.log(`⚙️  Seeding subscription plans...`);
      }
      
      try {
        await prisma.$executeRawUnsafe(statement + ';');
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Verify the data
    console.log('📊 Verifying subscription plans...\n');
    
    const plans = await prisma.$queryRaw`
      SELECT name, "displayName", "priceMonthly", "priceYearly", "trialDays"
      FROM subscription_plans
      ORDER BY "sortOrder"
    `;

    console.log('Available Plans:');
    console.table(plans);

    console.log('\n🎉 Subscription system is ready to use!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create Stripe products (Basic, Pro, Elite)');
    console.log('   2. Update plans with Stripe price IDs');
    console.log('   3. Test the subscription flow');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

