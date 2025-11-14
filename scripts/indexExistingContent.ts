/**
 * Script to index existing trainers, facilities, and content into the adaptive feed system
 * 
 * Usage:
 *   npx ts-node scripts/indexExistingContent.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function indexAllTrainers() {
  console.log('📋 Indexing trainers...');
  
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    include: {
      _count: {
        select: {
          trainerSessions: true,
          reviews: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });

  let indexed = 0;

  for (const trainer of trainers) {
    try {
      // Calculate metrics
      const viewCount = trainer._count.trainerSessions * 10; // Estimate 10 views per session
      const bookingCount = trainer._count.trainerSessions;
      const avgRating = trainer.reviews.length > 0
        ? trainer.reviews.reduce((sum, r) => sum + r.rating, 0) / trainer.reviews.length
        : 0;

      // Determine trainer style based on specialties (simple heuristic)
      let trainerStyle = 'motivational';
      if (trainer.specialties?.includes('nutrition') || trainer.specialties?.includes('wellness')) {
        trainerStyle = 'gentle';
      } else if (trainer.specialties?.includes('strength') || trainer.specialties?.includes('hiit')) {
        trainerStyle = 'tough_love';
      }

      // Determine workout type from first specialty
      const workoutType = trainer.specialties?.[0]?.toLowerCase() || 'general';

      // Create content feature
      await prisma.contentFeature.upsert({
        where: {
          contentType_contentId: {
            contentType: 'trainer',
            contentId: trainer.id,
          },
        },
        update: {
          workoutType,
          intensity: 'medium',
          duration: 60,
          specialty: trainer.specialties || [],
          trainerId: trainer.id,
          trainerStyle,
          location: trainer.latitude && trainer.longitude
            ? {
                lat: trainer.latitude,
                lng: trainer.longitude,
                city: trainer.city,
                state: trainer.state,
              }
            : null,
          viewCount,
          bookingCount,
          rating: avgRating,
          engagementScore: bookingCount > 0 ? Math.min(1.0, bookingCount / 100) : 0,
          publishedAt: trainer.createdAt,
          tags: trainer.specialties || [],
          lastUpdated: new Date(),
        },
        create: {
          contentType: 'trainer',
          contentId: trainer.id,
          workoutType,
          intensity: 'medium',
          duration: 60,
          specialty: trainer.specialties || [],
          trainerId: trainer.id,
          trainerStyle,
          location: trainer.latitude && trainer.longitude
            ? {
                lat: trainer.latitude,
                lng: trainer.longitude,
                city: trainer.city,
                state: trainer.state,
              }
            : null,
          viewCount,
          bookingCount,
          rating: avgRating,
          engagementScore: bookingCount > 0 ? Math.min(1.0, bookingCount / 100) : 0,
          publishedAt: trainer.createdAt,
          tags: trainer.specialties || [],
        },
      });

      indexed++;
      console.log(`✅ Indexed trainer: ${trainer.name} (${trainer.id})`);
    } catch (error) {
      console.error(`❌ Failed to index trainer ${trainer.name}:`, error);
    }
  }

  console.log(`\n✅ Indexed ${indexed} trainers\n`);
}

async function indexAIPersonas() {
  console.log('🤖 Indexing AI personas...');
  
  const personas = await prisma.aiPersona.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          sessions: true,
          feedback: true,
        },
      },
      feedback: {
        select: { rating: true },
      },
    },
  });

  let indexed = 0;

  for (const persona of personas) {
    try {
      const avgRating = persona.feedback.length > 0
        ? persona.feedback.reduce((sum, f) => sum + f.rating, 0) / persona.feedback.length
        : 0;

      await prisma.contentFeature.upsert({
        where: {
          contentType_contentId: {
            contentType: 'ai_persona',
            contentId: persona.id,
          },
        },
        update: {
          workoutType: persona.specialties?.[0] || 'general',
          intensity: 'medium',
          duration: 30, // AI sessions typically shorter
          specialty: persona.specialties,
          trainerId: persona.trainerId,
          trainerStyle: persona.teachingStyle,
          viewCount: persona.totalSessions * 5,
          bookingCount: persona.totalSessions,
          rating: avgRating || Number(persona.averageRating) || 0,
          engagementScore: Math.min(1.0, persona.totalSessions / 100),
          publishedAt: persona.publishedAt || persona.createdAt,
          tags: persona.specialties,
          lastUpdated: new Date(),
        },
        create: {
          contentType: 'ai_persona',
          contentId: persona.id,
          workoutType: persona.specialties?.[0] || 'general',
          intensity: 'medium',
          duration: 30,
          specialty: persona.specialties,
          trainerId: persona.trainerId,
          trainerStyle: persona.teachingStyle,
          viewCount: persona.totalSessions * 5,
          bookingCount: persona.totalSessions,
          rating: avgRating || Number(persona.averageRating) || 0,
          engagementScore: Math.min(1.0, persona.totalSessions / 100),
          publishedAt: persona.publishedAt || persona.createdAt,
          tags: persona.specialties,
        },
      });

      indexed++;
      console.log(`✅ Indexed AI persona: ${persona.name} (${persona.id})`);
    } catch (error) {
      console.error(`❌ Failed to index AI persona ${persona.name}:`, error);
    }
  }

  console.log(`\n✅ Indexed ${indexed} AI personas\n`);
}

async function main() {
  console.log('🚀 Starting content indexing for adaptive feed...\n');

  await indexAllTrainers();
  await indexAIPersonas();

  console.log('🎉 Content indexing complete!\n');
  
  // Show stats
  const stats = await prisma.contentFeature.groupBy({
    by: ['contentType'],
    _count: true,
  });

  console.log('📊 Content Statistics:');
  stats.forEach(stat => {
    console.log(`   - ${stat.contentType}: ${stat._count} items`);
  });

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('❌ Indexing failed:', error);
    process.exit(1);
  });

