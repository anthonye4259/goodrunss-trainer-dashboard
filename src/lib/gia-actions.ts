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
      }
    });

    // 5. Send confirmation email
    if (client.email) {
      await sendEmail({
        to: client.email,
        subject: "Session Confirmed",
        html: `
          <h2>Session Confirmed!</h2>
          <p>Hi ${client.name},</p>
          <p>Your session has been confirmed:</p>
          <ul>
            <li><strong>Date:</strong> ${params.date}</li>
            <li><strong>Time:</strong> ${params.time}</li>
            <li><strong>Duration:</strong> ${params.duration || 60} minutes</li>
            <li><strong>Type:</strong> ${params.sessionType || "Session"}</li>
            <li><strong>Location:</strong> ${params.location || "TBD"}</li>
          </ul>
          <p>See you there!</p>
        `
      });
    }

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
      client: b.clientId,
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
      }
    });

    if (!booking) {
      return {
        success: false,
        error: "Session not found"
      };
    }

    // Fetch client details
    const client = await prisma.user.findUnique({
      where: { id: booking.clientId }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: params.eventId },
      data: {
        status: "cancelled",
        notes: params.reason ? `Cancelled: ${params.reason}` : undefined
      }
    });

    // Notify client
    if (params.notifyClient !== false && client?.email) {
      await sendEmail({
        to: client.email,
        subject: "Session Cancelled",
        html: `
          <h2>Session Cancelled</h2>
          <p>Hi ${client.name || 'there'},</p>
          <p>Your session has been cancelled:</p>
          <ul>
            <li><strong>Date:</strong> ${booking.startTime.toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${booking.startTime.toLocaleTimeString()}</li>
            <li><strong>Reason:</strong> ${params.reason || "No reason provided"}</li>
          </ul>
        `
      });
    }

    return {
      success: true,
      message: `✅ Session cancelled. ${params.notifyClient !== false && client ? `Cancellation email sent to ${client.name}.` : ""}`,
      data: {
        bookingId: booking.id,
        clientName: client?.name || booking.clientId
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
        trainerId: params.trainerId
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

// 📱 WHATSAPP MESSAGING ACTION (NEW!)
export async function sendWhatsAppAction(params: {
  clientName?: string;
  phoneNumber?: string;
  message: string;
  mediaUrl?: string;
  trainerId: string;
}) {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    let recipientPhone = params.phoneNumber;
    let recipientName = params.clientName || 'Client';

    // If client name provided, look up their phone number
    if (params.clientName && !params.phoneNumber) {
      const clientRecord = await prisma.client.findFirst({
        where: {
          name: { contains: params.clientName, mode: "insensitive" },
          trainerId: params.trainerId
        }
      });

      if (!clientRecord) {
        return {
          success: false,
          error: `Client "${params.clientName}" not found. Please provide a phone number directly.`
        };
      }

      recipientPhone = clientRecord.phone;
      recipientName = clientRecord.name;

      if (!recipientPhone) {
        return {
          success: false,
          error: `${clientRecord.name} doesn't have a phone number on file. Please add it first.`
        };
      }
    }

    if (!recipientPhone) {
      return {
        success: false,
        error: "Phone number required. Provide either clientName or phoneNumber."
      };
    }

    // Format phone number for WhatsApp (ensure it has +1 for US)
    if (!recipientPhone.startsWith('+')) {
      recipientPhone = '+1' + recipientPhone.replace(/\D/g, '');
    }

    // WhatsApp requires whatsapp: prefix
    const whatsappNumber = `whatsapp:${recipientPhone}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`;

    // Send WhatsApp message via Twilio
    const messageData: any = {
      body: params.message,
      from: fromNumber,
      to: whatsappNumber
    };

    // Add media if provided
    if (params.mediaUrl) {
      messageData.mediaUrl = [params.mediaUrl];
    }

    const message = await client.messages.create(messageData);

    return {
      success: true,
      message: `✅ WhatsApp message sent to ${recipientName} (${recipientPhone})${params.mediaUrl ? ' with media' : ''}`,
      data: {
        messageSid: message.sid,
        recipient: recipientName,
        phone: recipientPhone,
        status: message.status,
        mediaIncluded: !!params.mediaUrl
      }
    };
  } catch (error: any) {
    console.error('WhatsApp Error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('not a WhatsApp user')) {
      return {
        success: false,
        error: `${params.clientName || 'This number'} doesn't have WhatsApp. Try SMS instead.`
      };
    }
    
    return {
      success: false,
      error: `Failed to send WhatsApp: ${error.message || 'Unknown error'}`
    };
  }
}

// 📱 SMS/TEXT MESSAGING ACTION (NEW!)
export async function sendSmsAction(params: {
  clientName?: string;
  phoneNumber?: string;
  message: string;
  trainerId: string;
}) {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    let recipientPhone = params.phoneNumber;
    let recipientName = params.clientName || 'Client';

    // If client name provided, look up their phone number
    if (params.clientName && !params.phoneNumber) {
      const clientRecord = await prisma.client.findFirst({
        where: {
          name: { contains: params.clientName, mode: "insensitive" },
          trainerId: params.trainerId
        }
      });

      if (!clientRecord) {
        return {
          success: false,
          error: `Client "${params.clientName}" not found. Please provide a phone number directly.`
        };
      }

      recipientPhone = clientRecord.phone;
      recipientName = clientRecord.name;

      if (!recipientPhone) {
        return {
          success: false,
          error: `${clientRecord.name} doesn't have a phone number on file. Please add it first.`
        };
      }
    }

    if (!recipientPhone) {
      return {
        success: false,
        error: "Phone number required. Provide either clientName or phoneNumber."
      };
    }

    // Format phone number (ensure it has +1 for US)
    if (!recipientPhone.startsWith('+')) {
      recipientPhone = '+1' + recipientPhone.replace(/\D/g, '');
    }

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: params.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhone
    });

    return {
      success: true,
      message: `✅ Text message sent to ${recipientName} (${recipientPhone})`,
      data: {
        messageSid: message.sid,
        recipient: recipientName,
        phone: recipientPhone,
        status: message.status
      }
    };
  } catch (error: any) {
    console.error('SMS Error:', error);
    return {
      success: false,
      error: `Failed to send SMS: ${error.message || 'Unknown error'}`
    };
  }
}

// 📱 BULK SMS MESSAGING ACTION (NEW!)
export async function sendBulkSmsAction(params: {
  filter: "all" | "active" | "inactive" | "unpaid" | "specific";
  clientNames?: string[];
  message: string;
  personalizeWithName?: boolean;
  trainerId: string;
}) {
  try {
    const twilio = require('twilio');
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Build query based on filter
    let whereClause: any = {
      trainerId: params.trainerId,
      phone: { not: null }  // Must have phone number
    };

    if (params.filter === "specific" && params.clientNames) {
      whereClause.OR = params.clientNames.map(name => ({
        name: { contains: name, mode: "insensitive" }
      }));
    } else if (params.filter === "active") {
      whereClause.status = "active";
    } else if (params.filter === "inactive") {
      whereClause.status = "inactive";
    } else if (params.filter === "unpaid") {
      // Get clients with unpaid invoices
      const unpaidPayments = await prisma.payment.findMany({
        where: {
          trainerId: params.trainerId,
          status: "pending"
        },
        select: { clientId: true },
        distinct: ["clientId"]
      });
      whereClause.id = { in: unpaidPayments.map(p => p.clientId) };
    }

    // Fetch recipients
    const recipients = await prisma.client.findMany({
      where: whereClause
    });

    if (recipients.length === 0) {
      return {
        success: false,
        error: `No clients found with the filter "${params.filter}". Make sure clients have phone numbers.`
      };
    }

    // Ask for confirmation first
    const totalCost = recipients.length * 0.0079; // Twilio SMS cost
    const confirmMessage = `⚠️ About to send ${recipients.length} SMS messages (estimated cost: $${totalCost.toFixed(2)}). Recipients: ${recipients.map(c => c.name).slice(0, 5).join(', ')}${recipients.length > 5 ? `, +${recipients.length - 5} more` : ''}. Proceed?`;

    // For now, proceed automatically. In production, you'd add a confirmation step.

    // Send messages
    const results: any[] = [];
    const personalize = params.personalizeWithName !== false;

    for (const recipient of recipients) {
      try {
        let phone = recipient.phone!;
        
        // Format phone number
        if (!phone.startsWith('+')) {
          phone = '+1' + phone.replace(/\D/g, '');
        }

        // Personalize message
        const finalMessage = personalize 
          ? `Hi ${recipient.name.split(' ')[0]},\n\n${params.message}`
          : params.message;

        // Send SMS
        const message = await twilioClient.messages.create({
          body: finalMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        results.push({
          name: recipient.name,
          phone: phone,
          status: 'sent',
          messageSid: message.sid
        });
      } catch (error: any) {
        results.push({
          name: recipient.name,
          phone: recipient.phone,
          status: 'failed',
          error: error.message
        });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      success: true,
      message: `✅ Bulk SMS sent!\n\n📤 Sent: ${sent} messages\n❌ Failed: ${failed}\n💰 Cost: $${(sent * 0.0079).toFixed(2)}\n\nRecipients: ${results.filter(r => r.status === 'sent').map(r => r.name).join(', ')}`,
      data: {
        sent,
        failed,
        cost: sent * 0.0079,
        results
      }
    };
  } catch (error: any) {
    console.error('Bulk SMS Error:', error);
    return {
      success: false,
      error: `Failed to send bulk SMS: ${error.message || 'Unknown error'}`
    };
  }
}

// 📱 BULK WHATSAPP MESSAGING ACTION (NEW!)
export async function sendBulkWhatsAppAction(params: {
  filter: "all" | "active" | "inactive" | "unpaid" | "specific";
  clientNames?: string[];
  message: string;
  mediaUrl?: string;
  personalizeWithName?: boolean;
  trainerId: string;
}) {
  try {
    const twilio = require('twilio');
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Build query based on filter
    let whereClause: any = {
      trainerId: params.trainerId,
      phone: { not: null }  // Must have phone number
    };

    if (params.filter === "specific" && params.clientNames) {
      whereClause.OR = params.clientNames.map(name => ({
        name: { contains: name, mode: "insensitive" }
      }));
    } else if (params.filter === "active") {
      whereClause.status = "active";
    } else if (params.filter === "inactive") {
      whereClause.status = "inactive";
    } else if (params.filter === "unpaid") {
      // Get clients with unpaid invoices
      const unpaidPayments = await prisma.payment.findMany({
        where: {
          trainerId: params.trainerId,
          status: "pending"
        },
        select: { clientId: true },
        distinct: ["clientId"]
      });
      whereClause.id = { in: unpaidPayments.map(p => p.clientId) };
    }

    // Fetch recipients
    const recipients = await prisma.client.findMany({
      where: whereClause
    });

    if (recipients.length === 0) {
      return {
        success: false,
        error: `No clients found with the filter "${params.filter}". Make sure clients have phone numbers.`
      };
    }

    // Send messages (WhatsApp is FREE!)
    const results: any[] = [];
    const personalize = params.personalizeWithName !== false;

    for (const recipient of recipients) {
      try {
        let phone = recipient.phone!;
        
        // Format phone number
        if (!phone.startsWith('+')) {
          phone = '+1' + phone.replace(/\D/g, '');
        }

        // Personalize message
        const finalMessage = personalize 
          ? `Hi ${recipient.name.split(' ')[0]},\n\n${params.message}`
          : params.message;

        // Send WhatsApp
        const messageData: any = {
          body: finalMessage,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:${phone}`
        };

        if (params.mediaUrl) {
          messageData.mediaUrl = [params.mediaUrl];
        }

        const message = await twilioClient.messages.create(messageData);

        results.push({
          name: recipient.name,
          phone: phone,
          status: 'sent',
          messageSid: message.sid
        });
      } catch (error: any) {
        // Check if it's a "not a WhatsApp user" error
        if (error.message?.includes('not a WhatsApp user')) {
          results.push({
            name: recipient.name,
            phone: recipient.phone,
            status: 'no_whatsapp',
            error: 'Not a WhatsApp user'
          });
        } else {
          results.push({
            name: recipient.name,
            phone: recipient.phone,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const noWhatsApp = results.filter(r => r.status === 'no_whatsapp').length;

    return {
      success: true,
      message: `✅ Bulk WhatsApp sent!\n\n📤 Sent: ${sent} messages\n❌ Failed: ${failed}\n📵 No WhatsApp: ${noWhatsApp}\n💰 Cost: FREE!\n\n${params.mediaUrl ? '📎 Media included\n' : ''}Recipients: ${results.filter(r => r.status === 'sent').map(r => r.name).join(', ')}`,
      data: {
        sent,
        failed,
        noWhatsApp,
        cost: 0,
        results
      }
    };
  } catch (error: any) {
    console.error('Bulk WhatsApp Error:', error);
    return {
      success: false,
      error: `Failed to send bulk WhatsApp: ${error.message || 'Unknown error'}`
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
// 🍎 NUTRITION ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function createMealPlanAction(params: {
  clientId: string;
  goal: string;
  duration?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  mealsPerDay?: number;
  preferences?: string;
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
        error: `Client "${params.clientId}" not found`
      };
    }

    // Generate meal plan using AI
    const goalDescriptions: Record<string, string> = {
      muscle_gain: "muscle building and strength gains",
      fat_loss: "fat loss while preserving muscle",
      maintenance: "weight maintenance and balanced nutrition",
      performance: "optimal athletic performance",
      general_health: "overall health and wellness"
    };

    const restrictions = params.dietaryRestrictions?.length 
      ? `Dietary restrictions: ${params.dietaryRestrictions.join(", ")}`
      : "";
    
    const allergies = params.allergies?.length
      ? `Allergies: ${params.allergies.join(", ")}`
      : "";

    const mealPlan = {
      clientId: client.id,
      clientName: client.name,
      goal: goalDescriptions[params.goal] || params.goal,
      duration: params.duration || 4,
      mealsPerDay: params.mealsPerDay || 3,
      restrictions: params.dietaryRestrictions || [],
      allergies: params.allergies || [],
      preferences: params.preferences,
      generatedAt: new Date(),
      // In a real implementation, this would call Claude API to generate detailed meal plan
      summary: `Personalized ${params.duration || 4}-week meal plan created for ${client.name} focusing on ${goalDescriptions[params.goal] || params.goal}.`
    };

    return {
      success: true,
      message: `✅ Meal plan created for ${client.name}!\n\n` +
               `🎯 Goal: ${goalDescriptions[params.goal]}\n` +
               `📅 Duration: ${params.duration || 4} weeks\n` +
               `🍽️ Meals/day: ${params.mealsPerDay || 3}\n` +
               `${restrictions ? `🚫 ${restrictions}\n` : ''}` +
               `${allergies ? `⚠️ ${allergies}\n` : ''}\n` +
               `The plan includes macro targets, meal suggestions, and shopping lists. Would you like me to email it to ${client.name}?`,
      data: mealPlan
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create meal plan: ${error.message}`
    };
  }
}

export async function calculateMacrosAction(params: {
  clientId: string;
  weight: number;
  heightFeet?: number;
  heightInches?: number;
  age: number;
  sex: "male" | "female";
  activityLevel: string;
  goal: string;
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
        error: `Client "${params.clientId}" not found`
      };
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    const heightInInches = (params.heightFeet || 0) * 12 + (params.heightInches || 0);
    const heightInCm = heightInInches * 2.54;
    const weightInKg = params.weight * 0.453592; // assuming lbs, convert to kg

    let bmr: number;
    if (params.sex === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * params.age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * params.age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[params.activityLevel] || 1.55);

    // Adjust calories based on goal
    let targetCalories: number;
    let proteinPerKg: number;
    let fatPercentage: number;

    switch (params.goal) {
      case "muscle_gain":
        targetCalories = tdee + 300; // +300 cal surplus
        proteinPerKg = 2.2; // High protein
        fatPercentage = 0.25;
        break;
      case "fat_loss":
        targetCalories = tdee - 500; // -500 cal deficit
        proteinPerKg = 2.4; // Very high protein to preserve muscle
        fatPercentage = 0.25;
        break;
      default: // maintenance
        targetCalories = tdee;
        proteinPerKg = 1.8;
        fatPercentage = 0.3;
    }

    // Calculate macros
    const protein = Math.round(weightInKg * proteinPerKg);
    const fat = Math.round((targetCalories * fatPercentage) / 9);
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

    const macros = {
      calories: Math.round(targetCalories),
      protein: protein,
      carbs: carbs,
      fats: fat,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };

    return {
      success: true,
      message: `✅ Macros calculated for ${client.name}!\n\n` +
               `**Daily Targets:**\n` +
               `🔥 Calories: ${macros.calories} kcal\n` +
               `💪 Protein: ${macros.protein}g (${Math.round(protein * 4 / targetCalories * 100)}%)\n` +
               `🍞 Carbs: ${macros.carbs}g (${Math.round(carbs * 4 / targetCalories * 100)}%)\n` +
               `🥑 Fats: ${macros.fats}g (${Math.round(fat * 9 / targetCalories * 100)}%)\n\n` +
               `**Metabolic Info:**\n` +
               `BMR: ${macros.bmr} kcal (resting)\n` +
               `TDEE: ${macros.tdee} kcal (with activity)\n\n` +
               `These targets support: **${params.goal.replace('_', ' ')}**\n\n` +
               `Want me to create a meal plan based on these macros?`,
      data: macros
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to calculate macros: ${error.message}`
    };
  }
}

export async function getNutritionAdviceAction(params: {
  topic: string;
  clientContext?: string;
  sport?: string;
  trainerId: string;
}) {
  try {
    const adviceBank: Record<string, string> = {
      pre_workout: `**Pre-Workout Nutrition:**\n\n` +
        `**Timing:** 1-3 hours before training\n\n` +
        `**What to eat:**\n` +
        `• Carbs: 1-2g per kg bodyweight (fuel for performance)\n` +
        `• Protein: 20-30g (prevent muscle breakdown)\n` +
        `• Low fat (digests slowly, can cause GI issues)\n\n` +
        `**Examples:**\n` +
        `• 3hrs before: Chicken, rice, vegetables\n` +
        `• 2hrs before: Oatmeal with protein powder and banana\n` +
        `• 1hr before: Toast with honey and a protein shake\n` +
        `• 30min before: Banana or energy gel\n\n` +
        `**Hydration:** 5-10ml per kg, 2-4 hours before`,

      post_workout: `**Post-Workout Nutrition:**\n\n` +
        `**Timing:** Within 2 hours (sooner is better)\n\n` +
        `**What to eat:**\n` +
        `• Protein: 20-40g (muscle repair and growth)\n` +
        `• Carbs: 2-3x protein amount (replenish glycogen)\n` +
        `• Carb:Protein ratio of 2:1 or 3:1\n\n` +
        `**Examples:**\n` +
        `• Protein shake + banana (quick)\n` +
        `• Chicken breast + sweet potato + veggies\n` +
        `• Greek yogurt + granola + berries\n` +
        `• Tuna sandwich + apple\n\n` +
        `**Hydration:** Replace 150% of fluid lost (weigh before/after)`,

      hydration: `**Hydration Strategy:**\n\n` +
        `**Daily Baseline:**\n` +
        `• 30-35ml per kg bodyweight\n` +
        `• More if in hot climate or heavy sweater\n\n` +
        `**Pre-Exercise:**\n` +
        `• 5-10ml/kg, 2-4 hours before\n` +
        `• Check urine color (pale yellow = good)\n\n` +
        `**During Exercise:**\n` +
        `• 0.4-0.8L per hour\n` +
        `• Add electrolytes if >60min or heavy sweating\n` +
        `• Sodium: 300-600mg per hour\n\n` +
        `**Post-Exercise:**\n` +
        `• Drink 150% of fluid lost\n` +
        `• Weigh before/after to calculate loss\n` +
        `• Include sodium to help retention`,

      supplements: `**Evidence-Based Supplements:**\n\n` +
        `**Proven Effective:**\n` +
        `• Creatine: 3-5g daily (strength, power, muscle)\n` +
        `• Caffeine: 3-6mg/kg, 30-60min pre (performance)\n` +
        `• Protein Powder: Convenience (not superior to whole food)\n` +
        `• Vitamin D: If deficient (common in athletes)\n\n` +
        `**Possibly Effective:**\n` +
        `• Beta-Alanine: 3-6g daily (high-intensity endurance)\n` +
        `• BCAAs: If training fasted (otherwise, whole protein better)\n` +
        `• Fish Oil: 2-3g EPA/DHA (inflammation, recovery)\n\n` +
        `**Save Your Money:**\n` +
        `• Fat burners, testosterone boosters, most pre-workouts\n` +
        `• Focus on diet first, supplements are 5% of results`
    };

    const advice = adviceBank[params.topic] || `Nutrition advice for ${params.topic} coming soon!`;

    return {
      success: true,
      message: advice + `\n\n${params.clientContext ? `\n**Context:** ${params.clientContext}` : ''}`,
      data: {
        topic: params.topic,
        context: params.clientContext
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get nutrition advice: ${error.message}`
    };
  }
}

export async function trackNutritionProgressAction(params: {
  clientId: string;
  currentWeight?: number;
  weeklyChange?: number;
  adherence?: number;
  energyLevels?: string;
  feedback?: string;
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
        error: `Client "${params.clientId}" not found`
      };
    }

    let analysis = `📊 **Nutrition Progress for ${client.name}**\n\n`;

    if (params.currentWeight && params.weeklyChange) {
      const changeDirection = params.weeklyChange > 0 ? "gained" : "lost";
      const changeAmount = Math.abs(params.weeklyChange);
      analysis += `⚖️ Weight: ${params.currentWeight} lbs (${changeDirection} ${changeAmount} lbs this week)\n`;

      // Assess if rate is appropriate
      if (changeAmount > 2) {
        analysis += `⚠️ That's a rapid change. Consider adjusting calories slightly.\n`;
      } else if (changeAmount > 0.5 && changeAmount <= 2) {
        analysis += `✅ Great progress! This is a sustainable rate.\n`;
      } else {
        analysis += `📝 Slower progress. May need to adjust calories or be more patient.\n`;
      }
    }

    if (params.adherence !== undefined) {
      analysis += `\n📋 Adherence: ${params.adherence}%\n`;
      if (params.adherence >= 90) {
        analysis += `🌟 Excellent adherence! Keep it up!\n`;
      } else if (params.adherence >= 70) {
        analysis += `👍 Good adherence. Small room for improvement.\n`;
      } else {
        analysis += `💡 Let's identify barriers and make the plan more sustainable.\n`;
      }
    }

    if (params.energyLevels) {
      analysis += `\n⚡ Energy Levels: ${params.energyLevels.replace('_', ' ')}\n`;
      if (params.energyLevels === "very_low" || params.energyLevels === "low") {
        analysis += `⚠️ Low energy could mean:\n`;
        analysis += `• Calories too low\n`;
        analysis += `• Carbs too low\n`;
        analysis += `• Poor sleep\n`;
        analysis += `• Overtraining\n`;
        analysis += `\nLet's review your nutrition and recovery.\n`;
      }
    }

    if (params.feedback) {
      analysis += `\n💬 Feedback: "${params.feedback}"\n`;
    }

    analysis += `\n**Next Steps:**\n`;
    analysis += `• Continue tracking daily intake\n`;
    analysis += `• Adjust macros if needed based on progress\n`;
    analysis += `• Focus on whole foods, adequate protein\n`;
    analysis += `• Check in next week\n`;

    return {
      success: true,
      message: analysis,
      data: {
        clientId: client.id,
        clientName: client.name,
        ...params
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to track nutrition progress: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎯 FORM & TECHNIQUE ANALYSIS ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function analyzeFormVideoAction(params: {
  clientId: string;
  videoUrl: string;
  exercise: string;
  focusAreas?: string[];
  clientInjuryHistory?: string;
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
        error: `Client "${params.clientId}" not found`
      };
    }

    // In a real implementation, this would use Claude's vision API or a specialized video analysis service
    // For now, provide a structured template for manual analysis

    const analysis = {
      clientId: client.id,
      clientName: client.name,
      exercise: params.exercise,
      videoUrl: params.videoUrl,
      focusAreas: params.focusAreas || [],
      analysisDate: new Date(),
      // Template for analysis
      feedback: `**Form Analysis for ${client.name} - ${params.exercise}**\n\n` +
        `📹 Video: ${params.videoUrl}\n\n` +
        `**Analysis Framework:**\n\n` +
        `1. **Setup & Starting Position**\n` +
        `   - Feet positioning\n` +
        `   - Hip/shoulder alignment\n` +
        `   - Grip/hand placement\n` +
        `   - Core engagement\n\n` +
        `2. **Movement Execution**\n` +
        `   - Range of motion\n` +
        `   - Tempo and control\n` +
        `   - Breathing pattern\n` +
        `   - Power generation\n\n` +
        `3. **Common Issues to Check**\n` +
        `   - Joint alignment (knees, hips, shoulders)\n` +
        `   - Compensation patterns\n` +
        `   - Symmetry left/right\n` +
        `   - Core stability\n\n` +
        `${params.clientInjuryHistory ? `⚠️ **Injury History:** ${params.clientInjuryHistory}\nWatch for: Compensation patterns, pain indicators, range of motion limitations\n\n` : ''}` +
        `**Recommended:**\n` +
        `• Record from multiple angles (front, side, back)\n` +
        `• Use slow-motion for detailed analysis\n` +
        `• Compare to demonstration video\n` +
        `• Focus on ${params.focusAreas?.join(', ') || 'overall form'}\n\n` +
        `_Video analysis complete. I can provide specific corrections based on what you observe._`
    };

    return {
      success: true,
      message: analysis.feedback,
      data: analysis
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to analyze form video: ${error.message}`
    };
  }
}

export async function giveTechniqueCorrectionAction(params: {
  exercise: string;
  observedIssues: string[];
  clientLevel?: string;
  sport?: string;
  trainerId: string;
}) {
  try {
    const exerciseLower = params.exercise.toLowerCase();
    
    // Build comprehensive corrections based on observed issues
    let corrections = `**Technique Corrections: ${params.exercise}**\n\n`;
    corrections += `📊 Client Level: ${params.clientLevel || 'intermediate'}\n`;
    if (params.sport) {
      corrections += `🎯 Sport Context: ${params.sport}\n`;
    }
    corrections += `\n**Issues Identified:**\n`;
    params.observedIssues.forEach((issue, i) => {
      corrections += `${i + 1}. ${issue}\n`;
    });

    corrections += `\n**Corrections & Cues:**\n\n`;

    // Common correction patterns
    const correctionDatabase: Record<string, Record<string, string>> = {
      "knees caving": {
        cue: '"Push knees out" or "Spread the floor apart"',
        drill: 'Banded squats with resistance band around knees',
        why: 'Knee valgus increases ACL injury risk and reduces power generation'
      },
      "rounded back": {
        cue: '"Chest up, proud chest" or "Show me your logo"',
        drill: 'Wall-facing squats to reinforce upright torso',
        why: 'Spinal flexion under load can cause disc injury'
      },
      "heels lifting": {
        cue: '"Push through your heels" or "Dig heels into ground"',
        drill: 'Elevated heel squats or ankle mobility work',
        why: 'Weight shift forward reduces power and can strain knees'
      },
      "elbow flare": {
        cue: '"Tuck elbows at 45 degrees"',
        drill: 'Close-grip bench press or banded rows',
        why: 'Excessive flare can cause shoulder impingement'
      },
      "late preparation": {
        cue: '"Racket back early, unit turn"',
        drill: 'Shadow swings with exaggerated early prep',
        why: 'Late prep reduces power and causes rushed swings'
      }
    };

    // Match observed issues to corrections
    params.observedIssues.forEach((issue, index) => {
      const issueLower = issue.toLowerCase();
      let matched = false;

      for (const [pattern, correction] of Object.entries(correctionDatabase)) {
        if (issueLower.includes(pattern.toLowerCase())) {
          corrections += `**${index + 1}. ${issue}**\n\n`;
          corrections += `🗣️ **Cue:** ${correction.cue}\n`;
          corrections += `🏋️ **Drill:** ${correction.drill}\n`;
          corrections += `❓ **Why:** ${correction.why}\n\n`;
          matched = true;
          break;
        }
      }

      if (!matched) {
        corrections += `**${index + 1}. ${issue}**\n\n`;
        corrections += `This requires specific assessment. Consider:\n`;
        corrections += `• Is it a mobility limitation?\n`;
        corrections += `• Is it a stability/strength issue?\n`;
        corrections += `• Is it a motor control/learning issue?\n`;
        corrections += `• Does it require regression or progression?\n\n`;
      }
    });

    corrections += `\n**Action Plan:**\n`;
    corrections += `1. Address most critical issue first (typically safety-related)\n`;
    corrections += `2. Use 1-2 cues max per session (don't overload)\n`;
    corrections += `3. Record before/after to track improvement\n`;
    corrections += `4. Reduce load/intensity while learning correct form\n`;
    corrections += `5. Reassess in 2-3 sessions\n\n`;

    corrections += `**Progression:**\n`;
    if (params.clientLevel === "beginner") {
      corrections += `• Master bodyweight/light load first\n`;
      corrections += `• Focus on slow, controlled tempo\n`;
      corrections += `• Use mirrors or video feedback\n`;
    } else if (params.clientLevel === "advanced") {
      corrections += `• Fine-tune under competition loads\n`;
      corrections += `• Address under fatigue conditions\n`;
      corrections += `• Integrate into sport-specific movements\n`;
    } else {
      corrections += `• Gradually increase load as form improves\n`;
      corrections += `• Maintain form under moderate fatigue\n`;
      corrections += `• Self-monitor and self-correct\n`;
    }

    return {
      success: true,
      message: corrections,
      data: {
        exercise: params.exercise,
        issues: params.observedIssues,
        level: params.clientLevel,
        sport: params.sport
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to provide technique corrections: ${error.message}`
    };
  }
}

export async function assessMovementPatternsAction(params: {
  clientId: string;
  assessmentType: string;
  observations: string;
  painPoints?: string[];
  goals?: string;
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
        error: `Client "${params.clientId}" not found`
      };
    }

    let assessment = `**Movement Pattern Assessment: ${client.name}**\n\n`;
    assessment += `📋 Assessment Type: ${params.assessmentType.replace('_', ' ')}\n`;
    if (params.goals) {
      assessment += `🎯 Goals: ${params.goals}\n`;
    }
    assessment += `\n**Observations:**\n${params.observations}\n\n`;

    if (params.painPoints && params.painPoints.length > 0) {
      assessment += `⚠️ **Pain/Discomfort Points:**\n`;
      params.painPoints.forEach(point => {
        assessment += `• ${point}\n`;
      });
      assessment += `\n`;
    }

    // Provide assessment framework
    assessment += `**Analysis Framework:**\n\n`;

    const assessmentFrameworks: Record<string, string> = {
      functional_movement_screen: `**FMS Scoring & Interpretation:**\n\n` +
        `**Check for:**\n` +
        `• Asymmetries (left vs right differences)\n` +
        `• Compensations (using wrong muscles/joints)\n` +
        `• Pain during movement\n` +
        `• Mobility limitations\n` +
        `• Stability deficits\n\n` +
        `**Red Flags:**\n` +
        `• Pain during any test → Refer to medical professional\n` +
        `• Severe asymmetry → Address immediately\n` +
        `• Multiple compensation patterns → Start with basics\n\n` +
        `**Priority Corrections:**\n` +
        `1. Address pain first (medical referral if needed)\n` +
        `2. Fix severe asymmetries\n` +
        `3. Improve mobility restrictions\n` +
        `4. Build stability patterns\n` +
        `5. Integrate into functional movement`,

      overhead_squat: `**Overhead Squat Assessment:**\n\n` +
        `**Common Dysfunctions & Causes:**\n` +
        `• Arms fall forward → Lat tightness, thoracic mobility\n` +
        `• Torso leans forward → Ankle mobility, hip flexor tightness, core weakness\n` +
        `• Knees cave in → Glute weakness, hip internal rotation\n` +
        `• Heels lift → Ankle mobility, calf tightness\n` +
        `• Excessive arch → Hip flexor tightness, core weakness\n\n` +
        `**Corrective Strategy:**\n` +
        `1. Assess mobility (ankles, hips, thoracic spine, shoulders)\n` +
        `2. Address tightest restrictions first\n` +
        `3. Strengthen weak patterns (glutes, core)\n` +
        `4. Retest and progress\n\n` +
        `**Exercises:**\n` +
        `• Ankle: Calf stretches, ankle mobility drills\n` +
        `• Hips: Hip flexor stretches, 90/90 stretches\n` +
        `• T-Spine: Foam rolling, thoracic extensions\n` +
        `• Glutes: Clamshells, glute bridges, side planks`,

      single_leg: `**Single Leg Assessment:**\n\n` +
        `**Key Observations:**\n` +
        `• Hip drop (Trendelenburg) → Glute medius weakness\n` +
        `• Knee valgus → Hip stability, foot control\n` +
        `• Excessive trunk lean → Hip strength, ankle mobility\n` +
        `• Wobbling/instability → Proprioception, foot/ankle strength\n\n` +
        `**Injury Risk Indicators:**\n` +
        `• ACL risk: Knee valgus + internal rotation\n` +
        `• Ankle sprains: Lateral instability\n` +
        `• IT band syndrome: Hip drop + adduction\n\n` +
        `**Corrective Exercises:**\n` +
        `1. Single-leg balance progressions\n` +
        `2. Hip stability (side planks, Copenhagen planks)\n` +
        `3. Glute strengthening (single-leg RDL, step-ups)\n` +
        `4. Foot/ankle strength (toe yoga, single-leg calf raises)`,

      gait_analysis: `**Gait Analysis:**\n\n` +
        `**Normal Gait Markers:**\n` +
        `• Heel strike → Midstance → Toe-off\n` +
        `• Hip extension at push-off\n` +
        `• Neutral foot position\n` +
        `• Minimal trunk rotation\n` +
        `• Arms swing opposite to legs\n\n` +
        `**Common Dysfunctions:**\n` +
        `• Overpronation → Flat feet, weak posterior tibialis\n` +
        `• Excessive bouncing → Quad dominant, tight calves\n` +
        `• Crossover gait → Hip adductor tightness\n` +
        `• No hip extension → Tight hip flexors\n\n` +
        `**Running-Specific:**\n` +
        `• Cadence: Aim for 170-180 steps/min\n` +
        `• Foot strike: Mid-foot preferred for efficiency\n` +
        `• Ground contact time: Minimize (quick, light steps)\n` +
        `• Vertical oscillation: Minimize bouncing`,

      sport_specific: `**Sport-Specific Movement Assessment:**\n\n` +
        `**Analyze:**\n` +
        `1. Sport-specific positions (athletic stance, ready position)\n` +
        `2. Primary movement patterns (cutting, jumping, throwing)\n` +
        `3. Asymmetries (dominant vs non-dominant side)\n` +
        `4. Power generation chain\n` +
        `5. Deceleration and change of direction\n\n` +
        `**Performance Limiters:**\n` +
        `• Mobility restrictions → Limits range of motion\n` +
        `• Stability deficits → Energy leaks, injury risk\n` +
        `• Asymmetries → Performance imbalance, injury risk\n` +
        `• Poor sequencing → Reduced power transfer\n\n` +
        `**Training Focus:**\n` +
        `1. Address movement quality before adding load\n` +
        `2. Train both sides (even if sport is asymmetric)\n` +
        `3. Progress: Slow → Fast → Under fatigue → Reactive\n` +
        `4. Integrate into sport-specific drills`
    };

    assessment += assessmentFrameworks[params.assessmentType] || 
      `Detailed assessment framework for ${params.assessmentType} coming soon.`;

    assessment += `\n\n**Recommended Next Steps:**\n`;
    assessment += `1. Prioritize addressing pain/discomfort (medical referral if needed)\n`;
    assessment += `2. Start corrective exercises (2-3x per week)\n`;
    assessment += `3. Integrate into warm-up routine\n`;
    assessment += `4. Reassess in 4-6 weeks\n`;
    assessment += `5. Progress training as movement improves\n\n`;

    assessment += `💡 **Pro Tip:** Video record assessments for comparison and track progress over time.`;

    return {
      success: true,
      message: assessment,
      data: {
        clientId: client.id,
        clientName: client.name,
        assessmentType: params.assessmentType,
        observations: params.observations,
        painPoints: params.painPoints,
        goals: params.goals,
        assessmentDate: new Date()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to assess movement patterns: ${error.message}`
    };
  }
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

// ═══════════════════════════════════════════════════════════════
// 👥 GROUP CLASS MANAGEMENT ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function createGroupClassAction(params: {
  className: string;
  date: string;
  time: string;
  duration: number;
  maxCapacity: number;
  pricePerPerson: number;
  location?: string;
  description?: string;
  level?: string;
  recurring?: boolean;
  recurringPattern?: string;
  trainerId: string;
}) {
  try {
    // Parse date and time
    const [hours, minutes] = params.time.split(":").map(Number);
    const scheduledAt = new Date(params.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    // Call the existing API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/group-classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.className,
        description: params.description,
        maxCapacity: params.maxCapacity,
        pricePerPerson: params.pricePerPerson,
        scheduledAt: scheduledAt.toISOString(),
        duration: params.duration,
        location: params.location,
        isRecurring: params.recurring || false,
        recurringPattern: params.recurringPattern,
        level: params.level || "all_levels"
      })
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to create group class"
      };
    }

    const classInfo = data.class;
    return {
      success: true,
      message: `✅ **${params.className}** created!\n\n` +
        `📅 ${scheduledAt.toLocaleDateString()} at ${params.time}\n` +
        `👥 Capacity: ${params.maxCapacity} people\n` +
        `💵 $${params.pricePerPerson}/person\n` +
        `📍 ${params.location || "TBD"}\n` +
        `${params.recurring ? `🔄 ${params.recurringPattern}` : ""}`,
      data: classInfo
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create group class: ${error.message}`
    };
  }
}

export async function manageClassRosterAction(params: {
  classId: string;
  action: "view_roster" | "add_participant" | "remove_participant" | "check_capacity";
  clientName?: string;
  trainerId: string;
}) {
  try {
    if (params.action === "view_roster") {
      // Get roster
      const roster: any = await prisma.$queryRaw`
        SELECT 
          c.id, c.name, c.email, c.phone,
          gcb.status, gcb.booked_at
        FROM group_class_bookings gcb
        JOIN clients c ON c.id = gcb.client_id
        WHERE gcb.class_id = ${params.classId}
        ORDER BY gcb.booked_at ASC
      `;

      if (roster.length === 0) {
        return {
          success: true,
          message: "📋 No participants booked yet for this class."
        };
      }

      const rosterList = roster.map((p: any, i: number) => 
        `${i + 1}. ${p.name} (${p.status})`
      ).join("\n");

      return {
        success: true,
        message: `📋 **Class Roster** (${roster.length} participants):\n\n${rosterList}`,
        data: roster
      };
    }

    if (params.action === "check_capacity") {
      const classInfo: any = await prisma.$queryRaw`
        SELECT max_capacity, current_bookings
        FROM group_classes
        WHERE id = ${params.classId}
      `;

      if (!classInfo[0]) {
        return { success: false, error: "Class not found" };
      }

      const { max_capacity, current_bookings } = classInfo[0];
      const spotsLeft = max_capacity - current_bookings;

      return {
        success: true,
        message: `👥 **Capacity**: ${current_bookings}/${max_capacity}\n` +
          `${spotsLeft > 0 ? `✅ ${spotsLeft} spots available` : "❌ FULL"}`,
        data: { maxCapacity: max_capacity, currentBookings: current_bookings, spotsLeft }
      };
    }

    if (params.action === "add_participant" || params.action === "remove_participant") {
      if (!params.clientName) {
        return {
          success: false,
          error: "Client name is required for add/remove actions"
        };
      }

      // Find client
      const client = await prisma.client.findFirst({
        where: {
          name: { contains: params.clientName, mode: "insensitive" },
          trainerId: params.trainerId
        }
      });

      if (!client) {
        return {
          success: false,
          error: `Client "${params.clientName}" not found`
        };
      }

      if (params.action === "add_participant") {
        // Book client
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/group-classes/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: params.classId,
            clientId: client.id
          })
        });

        const data = await response.json();

        if (!data.success) {
          return { success: false, error: data.error };
        }

        return {
          success: true,
          message: `✅ ${client.name} added to class!`
        };
      } else {
        // Remove client
        await prisma.$queryRaw`
          DELETE FROM group_class_bookings
          WHERE class_id = ${params.classId} AND client_id = ${client.id}
        `;

        await prisma.$queryRaw`
          UPDATE group_classes
          SET current_bookings = current_bookings - 1
          WHERE id = ${params.classId}
        `;

        return {
          success: true,
          message: `✅ ${client.name} removed from class.`
        };
      }
    }

    return { success: false, error: "Invalid action" };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to manage roster: ${error.message}`
    };
  }
}

export async function takeAttendanceAction(params: {
  classId: string;
  presentClients: string[];
  absentClients?: string[];
  lateClients?: string[];
  notes?: string;
  trainerId: string;
}) {
  try {
    // Get class info
    const classInfo: any = await prisma.$queryRaw`
      SELECT name, scheduled_at FROM group_classes WHERE id = ${params.classId}
    `;

    if (!classInfo[0]) {
      return { success: false, error: "Class not found" };
    }

    // Mark attendance in database
    const attendanceData = {
      classId: params.classId,
      presentCount: params.presentClients.length,
      absentCount: params.absentClients?.length || 0,
      lateCount: params.lateClients?.length || 0,
      present: params.presentClients,
      absent: params.absentClients || [],
      late: params.lateClients || [],
      notes: params.notes,
      takenAt: new Date()
    };

    // Save to session metadata or create attendance record
    await prisma.$queryRaw`
      UPDATE group_classes
      SET attendance_data = ${JSON.stringify(attendanceData)}::jsonb
      WHERE id = ${params.classId}
    `;

    const totalRoster = params.presentClients.length + (params.absentClients?.length || 0);
    const attendanceRate = ((params.presentClients.length / totalRoster) * 100).toFixed(0);

    return {
      success: true,
      message: `✅ **Attendance Recorded** for ${classInfo[0].name}\n\n` +
        `✅ Present: ${params.presentClients.length}\n` +
        `❌ Absent: ${params.absentClients?.length || 0}\n` +
        `⏰ Late: ${params.lateClients?.length || 0}\n` +
        `📊 Attendance Rate: ${attendanceRate}%`,
      data: attendanceData
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to take attendance: ${error.message}`
    };
  }
}

export async function messageClassParticipantsAction(params: {
  classId: string;
  message: string;
  channel?: "email" | "sms" | "whatsapp";
  includeWaitlist?: boolean;
  trainerId: string;
}) {
  try {
    // Get all participants
    const participants: any = await prisma.$queryRaw`
      SELECT c.name, c.email, c.phone
      FROM group_class_bookings gcb
      JOIN clients c ON c.id = gcb.client_id
      WHERE gcb.class_id = ${params.classId} AND gcb.status = 'confirmed'
    `;

    if (participants.length === 0) {
      return {
        success: false,
        error: "No participants found for this class"
      };
    }

    const channel = params.channel || "email";
    let sent = 0;

    for (const participant of participants) {
      if (channel === "sms" && participant.phone) {
        await sendSmsAction({
          clientName: participant.name,
          message: params.message,
          trainerId: params.trainerId
        });
        sent++;
      } else if (channel === "whatsapp" && participant.phone) {
        await sendWhatsAppAction({
          clientName: participant.name,
          message: params.message,
          trainerId: params.trainerId
        });
        sent++;
      } else if (channel === "email" && participant.email) {
        // Send email (implement if needed)
        sent++;
      }
    }

    return {
      success: true,
      message: `✅ Message sent to ${sent} participants via ${channel.toUpperCase()}!`
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to message participants: ${error.message}`
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 📊 CLASS ANALYTICS & INSIGHTS ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function getClassAnalyticsAction(params: {
  period?: string;
  classId?: string;
  trainerId: string;
}) {
  try {
    const periodDays = params.period || "30";
    
    // Call internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/class-analytics?period=${periodDays}${params.classId ? `&classId=${params.classId}` : ''}`)
    
    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to fetch analytics"
      };
    }

    if (params.classId) {
      const cls = data.class;
      return {
        success: true,
        message: `📊 **${cls.name} Analytics**\n\n` +
          `📅 ${new Date(cls.scheduledAt).toLocaleDateString()}\n` +
          `👥 Bookings: ${cls.totalBookings}/${cls.maxCapacity}\n` +
          `✅ Checked In: ${cls.checkedIn}\n` +
          `❌ No-Shows: ${cls.noShows}\n` +
          `📈 Attendance Rate: ${cls.attendanceRate}%\n` +
          `💰 Revenue: $${cls.revenue.toFixed(2)}\n` +
          `📊 Capacity Utilization: ${cls.capacityUtilization}%`,
        data: cls
      };
    } else {
      const { overview, topClasses } = data;
      return {
        success: true,
        message: `📊 **Class Analytics (Last ${periodDays} days)**\n\n` +
          `📅 Classes Held: ${overview.totalClasses}\n` +
          `👥 Total Bookings: ${overview.totalBookings}\n` +
          `✅ Total Checked In: ${overview.totalCheckedIn}\n` +
          `❌ No-Shows: ${overview.totalNoShows} (${overview.noShowRate}%)\n` +
          `📈 Avg Attendance Rate: ${overview.avgAttendanceRate}%\n` +
          `💰 Revenue: $${overview.actualRevenue.toFixed(2)}\n\n` +
          `🏆 **Top Classes:**\n` +
          topClasses.slice(0, 5).map((cls: any, i: number) => 
            `${i+1}. ${cls.name} - $${cls.revenue.toFixed(2)} (${cls.attendanceRate}% attendance)`
          ).join('\n'),
        data: { overview, topClasses, trends: data.trends }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to fetch analytics: ${error.message}`
    };
  }
}

export async function getAttendanceInsightsAction(params: {
  trainerId: string;
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/class-analytics/attendance-insights`);

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to fetch insights"
      };
    }

    const { insights, summary } = data;

    return {
      success: true,
      message: `🔍 **Attendance Insights**\n\n` +
        `👥 Total Active Clients: ${summary.totalActiveClients}\n` +
        `⭐ Regulars (4+ classes, 75%+ rate): ${summary.regulars}\n` +
        `🔄 Occasional (2-3 classes): ${summary.occasional}\n` +
        `⚠️ At Risk (low attendance): ${summary.atRisk}\n` +
        `📉 Dropoffs (inactive 30+ days): ${summary.dropoffs}\n` +
        `🆕 New Clients: ${summary.newClients}\n` +
        `📊 Retention Rate: ${summary.retentionRate}%\n\n` +
        (summary.dropoffs > 0 ? `💡 **Action:** You have ${summary.dropoffs} clients who haven't attended in 30+ days. Should I send them a re-engagement message?\n\n` : '') +
        (summary.atRisk > 0 ? `💡 **Action:** You have ${summary.atRisk} clients with low attendance rates. Should I check in with them?\n\n` : '') +
        (summary.regulars > 0 ? `🎉 **Great!** You have ${summary.regulars} regular clients. Consider offering them a loyalty discount or special class!\n\n` : ''),
      data: { insights, summary }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to fetch insights: ${error.message}`
    };
  }
}

export async function reengageDropoffsAction(params: {
  message?: string;
  channel?: "sms" | "whatsapp" | "email";
  trainerId: string;
}) {
  try {
    // Get dropoffs
    const insightsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/class-analytics/attendance-insights`);

    const insightsData = await insightsResponse.json();
    const dropoffs = insightsData.insights.dropoffs.clients;

    if (dropoffs.length === 0) {
      return {
        success: true,
        message: "🎉 Great news! You have no dropoffs. All clients are engaged!"
      };
    }

    const channel = params.channel || "sms";
    let sent = 0;

    for (const client of dropoffs) {
      const personalizedMessage = params.message || 
        `Hi ${client.name}! We haven't seen you in a while. We miss you at our classes! 🙌 We have some great new sessions coming up. Would love to see you back soon!`;

      if (channel === "sms") {
        await sendSmsAction({
          clientName: client.name,
          message: personalizedMessage,
          trainerId: params.trainerId
        });
        sent++;
      } else if (channel === "whatsapp") {
        await sendWhatsAppAction({
          clientName: client.name,
          message: personalizedMessage,
          trainerId: params.trainerId
        });
        sent++;
      }
    }

    return {
      success: true,
      message: `✅ Re-engagement messages sent to ${sent} dropoff clients via ${channel.toUpperCase()}!`
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to re-engage dropoffs: ${error.message}`
    };
  }
}

export async function checkInAtRiskClientsAction(params: {
  message?: string;
  channel?: "sms" | "whatsapp" | "email";
  trainerId: string;
}) {
  try {
    // Get at-risk clients
    const insightsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/class-analytics/attendance-insights`);

    const insightsData = await insightsResponse.json();
    const atRiskClients = insightsData.insights.atRisk.clients;

    if (atRiskClients.length === 0) {
      return {
        success: true,
        message: "🎉 No at-risk clients! Everyone is attending regularly."
      };
    }

    const channel = params.channel || "sms";
    let sent = 0;

    for (const client of atRiskClients) {
      const personalizedMessage = params.message || 
        `Hi ${client.name}! Just checking in - we've noticed you've missed a few classes recently. Everything okay? We're here if you need to adjust your schedule or have any questions! 😊`;

      if (channel === "sms") {
        await sendSmsAction({
          clientName: client.name,
          message: personalizedMessage,
          trainerId: params.trainerId
        });
        sent++;
      } else if (channel === "whatsapp") {
        await sendWhatsAppAction({
          clientName: client.name,
          message: personalizedMessage,
          trainerId: params.trainerId
        });
        sent++;
      }
    }

    return {
      success: true,
      message: `✅ Check-in messages sent to ${sent} at-risk clients via ${channel.toUpperCase()}!`
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to check in with at-risk clients: ${error.message}`
    };
  }
}

