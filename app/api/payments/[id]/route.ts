/**
 * Payment Update API
 * Update payment status (mark as paid, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const trainer = await getOrCreateUser()

        if (!trainer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const body = await request.json()
        const { status, amount, description, method } = body

        // Verify payment belongs to trainer
        const payment = await prisma.payments.findFirst({
            where: {
                id,
                trainerId: trainer.id,
            },
        })

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        // Update payment
        const updatedPayment = await prisma.payments.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(amount !== undefined && { amount }),
                ...(description && { description }),
                ...(method && { method }),
                updatedAt: new Date(),
            },
            include: {
                clients: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            payment: updatedPayment,
            message: 'Payment updated successfully',
        })
    } catch (error: any) {
        console.error('[API] Error updating payment:', error)
        return NextResponse.json(
            { error: 'Failed to update payment', details: error.message },
            { status: 500 }
        )
    }
}
