import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Sending test email using key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  try {
    const data = await resend.emails.send({
      from: 'Raxie <admin@raxie.my.id>',
      to: 'projekjaya4@gmail.com',
      subject: 'Test Resend API',
      html: '<p>Testing Resend API from localhost.</p>'
    });
    console.log('Success!', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
