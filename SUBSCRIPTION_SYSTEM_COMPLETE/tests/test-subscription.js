// Test subscription plans query
const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing subscription plans query...\n');
    
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
    
    console.log('✅ Success! Found', plans.length, 'plans:\n');
    
    plans.forEach(plan => {
      console.log(`💎 ${plan.displayName} ($${plan.priceMonthly}/mo)`);
      console.log(`   - ${plan.description}`);
      console.log(`   - G.I.A. Queries: ${plan.giaQueriesPerDay === -1 ? 'Unlimited' : plan.giaQueriesPerDay}`);
      console.log(`   - Discount: ${plan.bookingDiscountPercent}%`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();

