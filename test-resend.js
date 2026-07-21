const { Resend } = require('resend');
const dotenv = require('dotenv');
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Key exists:', !!process.env.RESEND_API_KEY);
  console.log('Sending test email...');
  try {
    const data = await resend.emails.send({
      from: 'Raxie <admin@raxie.my.id>',
      to: 'dimasf699@gmail.com',
      subject: 'Test Resend API via Node',
      html: '<p>Testing Resend API from localhost.</p>'
    });
    console.log('Success!', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
