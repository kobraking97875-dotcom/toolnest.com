const Razorpay = require('razorpay');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;"TjlrAG631yHMOC"
  const keySecret = process.env.RAZORPAY_KEY_SECRET;"UvVWPANgTHN06XuKz1aLBYs6"
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay server credentials are not configured.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const amount = Number(body.amount);
    const currency = String(body.currency || 'INR').toUpperCase();
    const receipt = String(body.receipt || `toolnest_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);

    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ error: 'Amount must be an integer of at least 100 paise.' });
    }
    if (currency !== 'INR') {
      return res.status(400).json({ error: 'Only INR is supported by this ToolNest checkout.' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: 1
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    const status = error?.statusCode === 401 || error?.statusCode === 403 ? 401 : 500;
    return res.status(status).json({ error: 'Unable to create Razorpay order.' });
  }
};
