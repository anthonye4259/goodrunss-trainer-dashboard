/**
 * PDF Generator for Session Plans
 * Generates printable PDFs of session plans
 * 
 * Note: This runs async after API response to not block the 20-second requirement
 */

import type { SessionPlan } from '@/lib/types/gia-session-plan'

/**
 * Generate a PDF from a session plan
 * In production, use a library like jsPDF, PDFKit, or Puppeteer
 * 
 * For now, this is a placeholder that returns HTML that can be printed
 */
export async function generateSessionPlanPDF(
  sessionPlan: SessionPlan
): Promise<string> {
  // In production, you would:
  // 1. Use jsPDF or PDFKit to create a PDF
  // 2. Upload to Firebase Storage or S3
  // 3. Return the public URL
  
  // For now, generate an HTML version that can be printed
  const html = generatePrintableHTML(sessionPlan)
  
  // TODO: Convert HTML to PDF using Puppeteer or similar
  // TODO: Upload to storage and return URL
  
  // Return a placeholder URL for now
  return `https://storage.goodrunss.com/session-plans/${sessionPlan.id}.pdf`
}

/**
 * Generate printable HTML for a session plan
 */
function generatePrintableHTML(plan: SessionPlan): string {
  const warmup = plan.warmup as any
  const drills = plan.drills as any
  const cooldown = plan.cooldown as any
  const instagram = plan.instagramContent as any

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${plan.sport} Session Plan - ${plan.clientName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header .meta {
      opacity: 0.9;
      font-size: 16px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .exercise, .drill {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
    }
    .exercise h3, .drill h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .meta-info {
      display: flex;
      gap: 15px;
      margin: 10px 0;
      flex-wrap: wrap;
    }
    .meta-item {
      background: white;
      padding: 5px 12px;
      border-radius: 5px;
      font-size: 14px;
    }
    .instructions {
      margin-top: 10px;
    }
    .instructions li {
      margin: 5px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${plan.sport.toUpperCase()} SESSION PLAN</h1>
    <div class="meta">
      <strong>${plan.clientName}</strong> • 
      ${plan.clientLevel} Level • 
      ${plan.sessionDuration} minutes • 
      ${new Date(plan.createdAt).toLocaleDateString()}
    </div>
  </div>

  <!-- Warmup Section -->
  <div class="section">
    <h2>🔥 Warmup (${warmup.duration} min)</h2>
    ${warmup.exercises
      .map(
        (ex: any) => `
      <div class="exercise">
        <h3>${ex.name}</h3>
        <div class="meta-info">
          <span class="meta-item">⏱️ ${ex.duration} min</span>
          ${ex.reps ? `<span class="meta-item">🔄 ${ex.reps} reps</span>` : ''}
          ${ex.sets ? `<span class="meta-item">📊 ${ex.sets} sets</span>` : ''}
        </div>
        <p>${ex.instructions}</p>
      </div>
    `
      )
      .join('')}
  </div>

  <!-- Drills Section -->
  <div class="section">
    <h2>⚡ Drills</h2>
    ${drills
      .map(
        (drill: any, index: number) => `
      <div class="drill">
        <h3>${index + 1}. ${drill.name} (${drill.duration} min)</h3>
        <div class="meta-info">
          <span class="meta-item">📈 ${drill.difficulty}</span>
          ${drill.focus
            .map((f: string) => `<span class="meta-item">🎯 ${f}</span>`)
            .join('')}
        </div>
        <p><strong>Description:</strong> ${drill.description}</p>
        <div class="instructions">
          <strong>Instructions:</strong>
          <ol>
            ${drill.instructions.map((step: string) => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        ${
          drill.equipment && drill.equipment.length > 0
            ? `<p><strong>Equipment:</strong> ${drill.equipment.join(', ')}</p>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>

  <!-- Cooldown Section -->
  <div class="section">
    <h2>🧘 Cooldown (${cooldown.duration} min)</h2>
    ${cooldown.exercises
      .map(
        (ex: any) => `
      <div class="exercise">
        <h3>${ex.name}</h3>
        <div class="meta-info">
          <span class="meta-item">⏱️ ${ex.duration} min</span>
        </div>
        <p>${ex.instructions}</p>
        <p><em>Benefits: ${ex.benefits}</em></p>
      </div>
    `
      )
      .join('')}
  </div>

  <!-- Notes Section -->
  ${
    plan.notes
      ? `
  <div class="section">
    <h2>📝 Coaching Notes</h2>
    <div class="exercise">
      <p>${plan.notes}</p>
    </div>
  </div>
  `
      : ''
  }

  <!-- Progressions Section -->
  ${
    plan.progressions
      ? `
  <div class="section">
    <h2>📊 Progressions</h2>
    <div class="exercise">
      <p>${plan.progressions}</p>
    </div>
  </div>
  `
      : ''
  }

  <!-- Instagram Content Section -->
  ${
    instagram
      ? `
  <div class="section no-print">
    <h2>📱 Share on Instagram</h2>
    <div class="exercise">
      <p><strong>Caption:</strong> ${instagram.caption}</p>
      <p><strong>Hashtags:</strong> ${instagram.hashtags.join(' ')}</p>
      <div class="instructions">
        <strong>Tips:</strong>
        <ul>
          ${instagram.tips.map((tip: string) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>Generated by GIA (GoodRunss Intelligent Assistant)</p>
    <p>© ${new Date().getFullYear()} GoodRunss</p>
  </div>

  <script>
    // Auto-print dialog for convenience
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `
}

/**
 * Generate a shareable link for the session plan
 */
export function generateShareableLink(sessionPlanId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/session-plan/${sessionPlanId}`
}



