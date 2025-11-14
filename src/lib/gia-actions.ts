// GIA Action Handlers - Execute Function Calls
// These functions actually perform the actions GIA requests

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/resend";
import { createCalendarEvent } from "@/lib/google-calendar";

// ═══════════════════════════════════════════════════════════════
// 📅 CALENDAR ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function createCalendarEventAction(params: {
  clientName: string;
  date: string;
  time: string;
  duration?: number;
  sessionType?: string;
  location?: string;
  notes?: string;
  trainerId: string;
}) {
  try {
    // 1. Find client by name
    const client = await prisma.client.findFirst({
      where: {
        name: {
          contains: params.clientName,
          mode: "insensitive"
        },
        trainerId: params.trainerId
      }
    });

    if (!client) {
      return {
        success: false,
        error: `Client "${params.clientName}" not found. Would you like to create them first?`
      };
    }

    // 2. Parse date and time
    const [hours, minutes] = params.time.split(":").map(Number);
    const startTime = new Date(params.date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (params.duration || 60));

    // 3. Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        trainerId: params.trainerId,
        status: { not: "cancelled" },
        OR: [
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gte: startTime,
            },
          },
          {
            startTime: {
              lte: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    });

    if (conflict) {
      return {
        success: false,
        error: `⚠️ You already have a session at ${params.time} on ${params.date}. Would you like me to suggest alternative times?`
      };
    }

    // 4. Create booking
    const booking = await prisma.booking.create({
      data: {
        trainerId: params.trainerId,
        clientId: client.id,
        startTime,
        endTime,
        sessionType: params.sessionType || "Session",
        location: params.location || "TBD",
        notes: params.notes,
        status: "confirmed"
      },
      include: {
        client: true
      }
    });

    // 5. Send confirmation email
    await sendEmail({
      to: client.email,
      subject: "Session Confirmed",
      template: "session-confirmation",
      data: {
        clientName: client.name,
        trainerName: params.trainerId, // Should get trainer name
        date: params.date,
        time: params.time,
        duration: params.duration || 60,
        sessionType: params.sessionType || "Session",
        location: params.location || "TBD"
      }
    });

    return {
      success: true,
      message: `✅ Session created! ${client.name} on ${params.date} at ${params.time}. Confirmation email sent to ${client.email}.`,
      data: {
        bookingId: booking.id,
        clientName: client.name,
        date: params.date,
        time: params.time,
        duration: params.duration || 60
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create session: ${error.message}`
    };
  }
}

export async function getScheduleAction(params: {
  startDate: string;
  endDate?: string;
  trainerId: string;
}) {
  try {
    const start = new Date(params.startDate);
    const end = params.endDate ? new Date(params.endDate) : new Date(params.startDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        trainerId: params.trainerId,
        startTime: {
          gte: start,
          lte: end
        },
        status: { not: "cancelled" }
      },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: "asc"
      }
    });

    if (bookings.length === 0) {
      return {
        success: true,
        message: `📅 You have no sessions scheduled for ${params.startDate}${params.endDate ? ` to ${params.endDate}` : ""}.`,
        data: { bookings: [] }
      };
    }

    const formattedBookings = bookings.map(b => ({
      id: b.id,
      time: b.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      client: b.client.name,
      sessionType: b.sessionType,
      location: b.location,
      duration: Math.round((b.endTime.getTime() - b.startTime.getTime()) / 60000)
    }));

    const message = `📅 You have ${bookings.length} session${bookings.length > 1 ? "s" : ""} scheduled:\n\n` +
      formattedBookings.map(b => 
        `• ${b.time} - ${b.client} (${b.sessionType})`
      ).join("\n");

    return {
      success: true,
      message,
      data: { bookings: formattedBookings }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get schedule: ${error.message}`
    };
  }
}

export async function findAvailableSlotsAction(params: {
  date: string;
  duration?: number;
  trainerId: string;
}) {
  try {
    const targetDate = new Date(params.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(6, 0, 0, 0); // Start at 6am
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(21, 0, 0, 0); // End at 9pm

    // Get all bookings for that day
    const bookings = await prisma.booking.findMany({
      where: {
        trainerId: params.trainerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "cancelled" }
      },
      orderBy: {
        startTime: "asc"
      }
    });

    // Find gaps in schedule
    const availableSlots: string[] = [];
    let currentTime = new Date(startOfDay);

    for (const booking of bookings) {
      while (currentTime < booking.startTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + (params.duration || 60));

        if (slotEnd <= booking.startTime) {
          availableSlots.push(
            currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          );
        }
        currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-min increments
      }
      currentTime = new Date(booking.endTime);
    }

    // Check remaining time after last booking
    while (currentTime < endOfDay) {
      availableSlots.push(
        currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    if (availableSlots.length === 0) {
      return {
        success: true,
        message: `You're fully booked on ${params.date}! 💪`,
        data: { slots: [] }
      };
    }

    return {
      success: true,
      message: `Available time slots on ${params.date}:\n\n${availableSlots.slice(0, 10).join(", ")}`,
      data: { slots: availableSlots }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to find available slots: ${error.message}`
    };
  }
}

export async function cancelEventAction(params: {
  eventId: string;
  reason?: string;
  notifyClient?: boolean;
  trainerId: string;
}) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.eventId,
        trainerId: params.trainerId
      },
      include: {
        client: true
      }
    });

    if (!booking) {
      return {
        success: false,
        error: "Session not found"
      };
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: params.eventId },
      data: {
        status: "cancelled",
        notes: params.reason ? `Cancelled: ${params.reason}` : undefined
      }
    });

    // Notify client
    if (params.notifyClient !== false) {
      await sendEmail({
        to: booking.client.email,
        subject: "Session Cancelled",
        template: "session-cancellation",
        data: {
          clientName: booking.client.name,
          date: booking.startTime.toLocaleDateString(),
          time: booking.startTime.toLocaleTimeString(),
          reason: params.reason || "No reason provided"
        }
      });
    }

    return {
      success: true,
      message: `✅ Session cancelled. ${params.notifyClient !== false ? `Cancellation email sent to ${booking.client.name}.` : ""}`,
      data: {
        bookingId: booking.id,
        clientName: booking.client.name
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to cancel session: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 👥 CLIENT ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function createClientAction(params: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  trainerId: string;
}) {
  try {
    // Check if client already exists
    const existing = await prisma.client.findFirst({
      where: {
        email: params.email,
        trainerId: params.trainerId
      }
    });

    if (existing) {
      return {
        success: false,
        error: `Client with email ${params.email} already exists`
      };
    }

    const client = await prisma.client.create({
      data: {
        name: params.name,
        email: params.email,
        phone: params.phone,
        notes: params.notes,
        trainerId: params.trainerId,
        status: "active"
      }
    });

    return {
      success: true,
      message: `✅ Client "${params.name}" added successfully!`,
      data: {
        clientId: client.id,
        name: client.name,
        email: client.email
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create client: ${error.message}`
    };
  }
}

export async function searchClientsAction(params: {
  query: string;
  trainerId: string;
}) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        trainerId: params.trainerId,
        OR: [
          { name: { contains: params.query, mode: "insensitive" } },
          { email: { contains: params.query, mode: "insensitive" } }
        ]
      },
      take: 10
    });

    if (clients.length === 0) {
      return {
        success: true,
        message: `No clients found matching "${params.query}"`,
        data: { clients: [] }
      };
    }

    const message = `Found ${clients.length} client${clients.length > 1 ? "s" : ""}:\n\n` +
      clients.map(c => `• ${c.name} (${c.email})`).join("\n");

    return {
      success: true,
      message,
      data: { clients }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to search clients: ${error.message}`
    };
  }
}

export async function getClientDetailsAction(params: {
  clientId: string;
  trainerId: string;
}) {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        trainerId: params.trainerId
      },
      include: {
        bookings: {
          where: { status: "completed" },
          orderBy: { startTime: "desc" },
          take: 5
        }
      }
    });

    if (!client) {
      return {
        success: false,
        error: "Client not found"
      };
    }

    const totalSessions = await prisma.booking.count({
      where: {
        clientId: client.id,
        status: "completed"
      }
    });

    const totalRevenue = await prisma.payment.aggregate({
      where: {
        clientId: client.id,
        status: "completed"
      },
      _sum: {
        amount: true
      }
    });

    const message = `👤 **${client.name}**\n\n` +
      `📧 Email: ${client.email}\n` +
      `📱 Phone: ${client.phone || "N/A"}\n` +
      `📊 Total Sessions: ${totalSessions}\n` +
      `💰 Total Revenue: $${totalRevenue._sum.amount || 0}\n` +
      `📅 Last Session: ${client.bookings[0]?.startTime.toLocaleDateString() || "None"}`;

    return {
      success: true,
      message,
      data: {
        client,
        stats: {
          totalSessions,
          totalRevenue: totalRevenue._sum.amount || 0,
          recentBookings: client.bookings
        }
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get client details: ${error.message}`
    };
  }
}

export async function getClientListAction(params: {
  status?: "active" | "inactive" | "all";
  limit?: number;
  trainerId: string;
}) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        trainerId: params.trainerId,
        ...(params.status && params.status !== "all" ? { status: params.status } : {})
      },
      take: params.limit || 50,
      orderBy: {
        createdAt: "desc"
      }
    });

    const message = `You have ${clients.length} ${params.status || "total"} client${clients.length !== 1 ? "s" : ""}`;

    return {
      success: true,
      message,
      data: { clients }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get client list: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 💰 PAYMENT ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function getRevenueStatsAction(params: {
  period: "today" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
  trainerId: string;
}) {
  try {
    let start: Date;
    let end = new Date();

    // Calculate date range based on period
    switch (params.period) {
      case "today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case "year":
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start = new Date(params.startDate || new Date());
        end = new Date(params.endDate || new Date());
    }

    // Get revenue
    const revenue = await prisma.payment.aggregate({
      where: {
        trainerId: params.trainerId,
        status: "completed",
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // Get sessions
    const sessions = await prisma.booking.count({
      where: {
        trainerId: params.trainerId,
        status: "completed",
        startTime: {
          gte: start,
          lte: end
        }
      }
    });

    // Compare to previous period
    const prevStart = new Date(start);
    prevStart.setTime(prevStart.getTime() - (end.getTime() - start.getTime()));

    const prevRevenue = await prisma.payment.aggregate({
      where: {
        trainerId: params.trainerId,
        status: "completed",
        createdAt: {
          gte: prevStart,
          lt: start
        }
      },
      _sum: {
        amount: true
      }
    });

    const currentAmount = revenue._sum.amount || 0;
    const previousAmount = prevRevenue._sum.amount || 0;
    const percentChange = previousAmount > 0 
      ? ((currentAmount - previousAmount) / previousAmount * 100).toFixed(1)
      : "100";

    const message = `💰 **Revenue for ${params.period}**\n\n` +
      `Total: $${currentAmount.toFixed(2)}\n` +
      `Sessions: ${sessions}\n` +
      `Transactions: ${revenue._count}\n` +
      `Change: ${Number(percentChange) >= 0 ? "+" : ""}${percentChange}% vs previous ${params.period}`;

    return {
      success: true,
      message,
      data: {
        revenue: currentAmount,
        sessions,
        transactions: revenue._count,
        percentChange: Number(percentChange)
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get revenue stats: ${error.message}`
    };
  }
}

export async function createInvoiceAction(params: {
  clientId: string;
  amount: number;
  description?: string;
  dueDate?: string;
  trainerId: string;
}) {
  try {
    // Find client
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: params.clientId },
          { name: { contains: params.clientId, mode: "insensitive" } }
        ],
        trainerId: params.trainerId
      }
    });

    if (!client) {
      return {
        success: false,
        error: `Client not found`
      };
    }

    // Create payment/invoice
    const payment = await prisma.payment.create({
      data: {
        trainerId: params.trainerId,
        clientId: client.id,
        amount: params.amount,
        description: params.description || "Training session",
        status: "pending",
        dueDate: params.dueDate ? new Date(params.dueDate) : undefined
      }
    });

    // Send invoice email
    await sendEmail({
      to: client.email,
      subject: "Invoice from Your Trainer",
      template: "invoice",
      data: {
        clientName: client.name,
        amount: params.amount,
        description: params.description || "Training session",
        dueDate: params.dueDate || "Upon receipt",
        invoiceId: payment.id
      }
    });

    return {
      success: true,
      message: `✅ Invoice for $${params.amount} sent to ${client.name}`,
      data: {
        invoiceId: payment.id,
        clientName: client.name,
        amount: params.amount
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create invoice: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 💬 MESSAGING ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function sendMessageAction(params: {
  clientId: string;
  message: string;
  attachments?: string[];
  trainerId: string;
}) {
  try {
    // Find client
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: params.clientId },
          { name: { contains: params.clientId, mode: "insensitive" } }
        ],
        trainerId: params.trainerId
      }
    });

    if (!client) {
      return {
        success: false,
        error: `Client not found`
      };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: params.trainerId,
        recipientId: client.id,
        content: params.message,
        metadata: params.attachments ? { attachments: params.attachments } : undefined
      }
    });

    // Send email notification
    await sendEmail({
      to: client.email,
      subject: "New Message from Your Trainer",
      template: "message",
      data: {
        clientName: client.name,
        message: params.message
      }
    });

    return {
      success: true,
      message: `✅ Message sent to ${client.name}`,
      data: {
        messageId: message.id,
        clientName: client.name
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to send message: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 💪 WORKOUT ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function generateWorkoutPlanAction(params: {
  clientId: string;
  goal: string;
  duration?: number;
  sessionsPerWeek?: number;
  equipment?: string[];
  restrictions?: string;
  trainerId: string;
}) {
  try {
    // Fetch trainer's specialty to generate sport-specific workout
    const trainer = await prisma.user.findUnique({
      where: { id: params.trainerId },
      select: {
        specialties: true,
        bio: true,
      },
    });

    const specialties = trainer?.specialties || [];
    const primarySpecialty = specialties[0] || 'fitness';

    // Get sport-specific workout format
    const workoutFormat = getWorkoutFormat(primarySpecialty);

    return {
      success: true,
      message: `✅ Generating ${params.duration || 4}-week ${primarySpecialty} ${workoutFormat.planType} for ${params.goal}. This will be customized for ${primarySpecialty} training!`,
      data: {
        status: "generating",
        goal: params.goal,
        specialty: primarySpecialty,
        format: workoutFormat.format,
        planType: workoutFormat.planType,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to generate workout plan: ${error.message}`
    };
  }
}

/**
 * Get sport-specific workout format
 */
function getWorkoutFormat(specialty: string): {
  format: string;
  planType: string;
  terminology: Record<string, string>;
} {
  const formats: Record<string, any> = {
    basketball: {
      format: 'Court drills + conditioning',
      planType: 'training program',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    pickleball: {
      format: 'Court drills + match prep',
      planType: 'training program',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    tennis: {
      format: 'Court work + conditioning',
      planType: 'training program',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    yoga: {
      format: 'Flow sequences + meditation',
      planType: 'practice plan',
      terminology: {
        session: 'class',
        exercise: 'pose/asana',
        sets: 'rounds',
        reps: 'breaths/holds',
      },
    },
    pilates: {
      format: 'Mat/Reformer exercises',
      planType: 'program',
      terminology: {
        session: 'class',
        exercise: 'movement',
        sets: 'sets',
        reps: 'repetitions',
      },
    },
    barre: {
      format: 'Barre sequences',
      planType: 'program',
      terminology: {
        session: 'class',
        exercise: 'sequence',
        sets: 'sets',
        reps: 'pulses/holds',
      },
    },
    strength_training: {
      format: 'Resistance training',
      planType: 'program',
      terminology: {
        session: 'workout',
        exercise: 'exercise',
        sets: 'sets',
        reps: 'reps',
      },
    },
    hiit: {
      format: 'Interval training',
      planType: 'program',
      terminology: {
        session: 'workout',
        exercise: 'exercise',
        sets: 'rounds',
        reps: 'reps',
      },
    },
    crossfit: {
      format: 'WODs + skill work',
      planType: 'program',
      terminology: {
        session: 'WOD',
        exercise: 'movement',
        sets: 'rounds',
        reps: 'reps',
      },
    },
    running: {
      format: 'Run workouts + speed work',
      planType: 'training plan',
      terminology: {
        session: 'run',
        exercise: 'interval',
        sets: 'sets',
        reps: 'repetitions',
      },
    },
    cycling: {
      format: 'Bike workouts + intervals',
      planType: 'training plan',
      terminology: {
        session: 'ride',
        exercise: 'interval',
        sets: 'sets',
        reps: 'repetitions',
      },
    },
    swimming: {
      format: 'Pool workouts + drills',
      planType: 'training plan',
      terminology: {
        session: 'swim',
        exercise: 'drill/set',
        sets: 'sets',
        reps: 'repetitions',
      },
    },
    martial_arts: {
      format: 'Technique + sparring',
      planType: 'training program',
      terminology: {
        session: 'class',
        exercise: 'technique',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    boxing: {
      format: 'Pad work + conditioning',
      planType: 'training program',
      terminology: {
        session: 'training',
        exercise: 'combination',
        sets: 'rounds',
        reps: 'punches',
      },
    },
    dance: {
      format: 'Choreography + technique',
      planType: 'program',
      terminology: {
        session: 'class',
        exercise: 'sequence',
        sets: 'sets',
        reps: 'repetitions',
      },
    },
    soccer: {
      format: 'Field drills + conditioning',
      planType: 'training program',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    volleyball: {
      format: 'Court drills + game prep',
      planType: 'training program',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'rounds',
        reps: 'repetitions',
      },
    },
    golf: {
      format: 'Range work + course play',
      planType: 'practice plan',
      terminology: {
        session: 'practice',
        exercise: 'drill',
        sets: 'sets',
        reps: 'swings',
      },
    },
  };

  const normalizedSpecialty = specialty.toLowerCase().replace(/[_\s-]+/g, '_');
  return formats[normalizedSpecialty] || {
    format: 'Workout sessions',
    planType: 'program',
    terminology: {
      session: 'workout',
      exercise: 'exercise',
      sets: 'sets',
      reps: 'reps',
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// 🤖 AI PERSONA ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function getPersonaEarningsAction(params: {
  period?: "today" | "week" | "month" | "all";
  trainerId: string;
}) {
  try {
    let start: Date | undefined;

    if (params.period && params.period !== "all") {
      start = new Date();
      switch (params.period) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "week":
          start.setDate(start.getDate() - 7);
          break;
        case "month":
          start.setMonth(start.getMonth() - 1);
          break;
      }
    }

    const earnings = await prisma.aiPersonaEarning.aggregate({
      where: {
        aiPersona: {
          trainerId: params.trainerId
        },
        ...(start ? { createdAt: { gte: start } } : {})
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    const sessions = await prisma.aiPersonaSession.count({
      where: {
        aiPersona: {
          trainerId: params.trainerId
        },
        ...(start ? { createdAt: { gte: start } } : {})
      }
    });

    const message = `🤖 **AI Persona Earnings (${params.period || "all time"})**\n\n` +
      `💰 Total: $${(earnings._sum.amount || 0).toFixed(2)}\n` +
      `🎤 Sessions: ${sessions}\n` +
      `📊 Avg per session: $${sessions > 0 ? ((earnings._sum.amount || 0) / sessions).toFixed(2) : "0.00"}`;

    return {
      success: true,
      message,
      data: {
        totalEarnings: earnings._sum.amount || 0,
        sessions,
        transactions: earnings._count
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get persona earnings: ${error.message}`
    };
  }
}

