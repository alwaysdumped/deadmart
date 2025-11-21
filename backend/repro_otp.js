import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/send-otp';

async function testSendOTP() {
  try {
    console.log('Sending OTP request...');
    const response = await axios.post(API_URL, {
      email: 'test@example.com',
      name: 'Test User'
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testSendOTP();
