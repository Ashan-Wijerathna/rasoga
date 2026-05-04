const sendSMS = async (phoneNumber, message) => {
  try {
    let phone = phoneNumber.toString().replace(/\s/g, '');
    if (phone.startsWith('0')) phone = '94' + phone.slice(1);

    if (process.env.NOTIFY_USER_ID && process.env.NOTIFY_API_KEY) {
      const axios = require('axios');
      await axios.get('https://app.notify.lk/api/v1/send', {
        params: {
          user_id: process.env.NOTIFY_USER_ID,
          api_key: process.env.NOTIFY_API_KEY,
          sender_id: process.env.NOTIFY_SENDER_ID || 'NotifyDEMO',
          to: phone,
          message,
        },
      });
    }
  } catch (err) {
    console.error('[SMS] Failed:', err.message);
  }
};

module.exports = { sendSMS };
