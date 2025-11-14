import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST /api/email/send - Send email
export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json();

    if (!type || !to) {
      return NextResponse.json(
        { error: 'type and to are required' },
        { status: 400 }
      );
    }

    let emailContent;

    // Get template based on type
    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data.name);
        break;

      case 'booking_confirmation':
        emailContent = emailTemplates.bookingConfirmation({
          userName: data.userName,
          trainerName: data.trainerName,
          date: data.date,
          time: data.time,
          location: data.location,
          bookingId: data.bookingId,
        });
        break;

      case 'payment_receipt':
        emailContent = emailTemplates.paymentReceipt({
          userName: data.userName,
          amount: data.amount,
          currency: data.currency,
          trainerName: data.trainerName,
          date: data.date,
          paymentId: data.paymentId,
        });
        break;

      case 'session_reminder':
        emailContent = emailTemplates.sessionReminder({
          userName: data.userName,
          trainerName: data.trainerName,
          time: data.time,
          location: data.location,
          hours: data.hours,
        });
        break;

      case 'waitlist_notification':
        emailContent = emailTemplates.waitlistNotification({
          userName: data.userName,
          trainerName: data.trainerName,
          date: data.date,
          time: data.time,
          waitlistId: data.waitlistId,
        });
        break;

      case 'password_reset':
        emailContent = emailTemplates.passwordReset({
          userName: data.userName,
          resetLink: data.resetLink,
        });
        break;

      case 'custom':
        // Send custom email
        emailContent = {
          subject: data.subject,
          html: data.html,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

