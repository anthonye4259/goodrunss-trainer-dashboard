import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
    try {
        console.log('Testing Resend API...')
        console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')

        const result = await resend.emails.send({
            from: 'GoodRunss Ambassadors <anthony@goodrunss.com>',
            to: 'anthony@goodrunss.com',
            subject: 'Test Magic Link Email',
            html: '<h1>Test Email</h1><p>This is a test email from the magic link system.</p>'
        })

        console.log('✅ Email sent successfully!')
        console.log('Result:', result)
    } catch (error: any) {
        console.error('❌ Failed to send email:')
        console.error('Error:', error)
        console.error('Message:', error?.message)
        console.error('Name:', error?.name)
        console.error('Status Code:', error?.statusCode)
        console.error('Response:', error?.response)
    }
}

testEmail()
