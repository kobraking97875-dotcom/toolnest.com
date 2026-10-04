const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;"UvVWPANgTHN06XuKz1aLBYs6"
  if (!secret) {
    return res.status(500).json({ error: 'Razorpay server secret is not configured.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const orderId = String(body.razorpay_order_id || '');
    const paymentId = String(body.razorpay_payment_id || '');
    const signature = String(body.razorpay_signature || '');

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing payment verification fields.' });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }

    return res.status(200).json({ success: true, order_id: orderId, payment_id: paymentId });
  } catch (error) {
    return res.status(400).json({ success: false, error: 'Invalid payment verification request.' });
  }
};
