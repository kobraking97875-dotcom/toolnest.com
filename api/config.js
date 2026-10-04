module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) return res.status(500).json({ error: 'Razorpay Key ID is not configured.' });
  return res.status(200).json({ key_id: keyId });
};
