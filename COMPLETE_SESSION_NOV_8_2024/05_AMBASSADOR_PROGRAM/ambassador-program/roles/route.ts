import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/ambassador-program/roles - Get all program roles with tiers
export async function GET(req: NextRequest) {
  try {
    const roles = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_roles ORDER BY name
    `) as any[];

    const rolesWithTiers = await Promise.all(
      roles.map(async (role) => {
        const tiers = await prisma.$queryRawUnsafe(`
          SELECT * FROM role_tiers 
          WHERE role_id = $1 
          ORDER BY tier_level
        `, role.id) as any[];

        return {
          ...role,
          tiers
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      roles: rolesWithTiers 
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

