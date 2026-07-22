export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID da transação não fornecido.' });
  }

  try {
    const pinpayToken = process.env.PINPAY_SECRET_KEY;

    if (!pinpayToken) {
      return res.status(500).json({ error: 'PINPAY_SECRET_KEY não configurada no servidor.' });
    }

    const response = await fetch(`https://api.usepinpay.com/functions/v1/api-v1/pix/${id}`, {
      headers: {
        'Authorization': `Bearer ${pinpayToken}`,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching status:', error);
    return res.status(500).json({ error: 'Erro ao consultar status.' });
  }
}
