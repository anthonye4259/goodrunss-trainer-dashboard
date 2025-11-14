import { prisma } from '@/lib/prisma'

export type ZapierEvent =
  | 'booking.created'
  | 'email.sent'
  | 'payment.completed'
  | 'trial.started'

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL
const ZAPIER_SIGNING_TOKEN = process.env.ZAPIER_SIGNING_TOKEN

export async function notifyZapier(event: ZapierEvent, payload: Record<string, unknown>) {
  if (!ZAPIER_WEBHOOK_URL) return { success: false, error: 'Zapier not configured' }

  const body = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  }

  const res = await fetch(ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ZAPIER_SIGNING_TOKEN ? { 'X-Zapier-Token': ZAPIER_SIGNING_TOKEN } : {}),
    },
    body: JSON.stringify(body),
  })

  const ok = res.ok

  // Optional: persist minimal log
  try {
    await prisma.viralMetrics.create({
      data: {
        userId: (payload.userId as string) || 'system',
        metricType: 'engagement',
        platform: 'zapier',
        metadata: { event, ok },
      },
    })
  } catch (_) {}

  return { success: ok }
}

