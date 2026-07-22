const PINPAY_API_URL = 'https://api.usepinpay.com';

function normalizeStatus(data) {
  const rawStatus =
    typeof data === 'string'
      ? data
      : data?.status || data?.data?.status || data?.transaction_status || '';

  return String(rawStatus || '').trim().toLowerCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'ID da transação não fornecido.' });

  try {
    const publicKey = process.env.PINPAY_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({ error: 'PINPAY_PUBLIC_KEY não configurada no servidor.' });
    }

    const response = await fetch(`${PINPAY_API_URL}/rest/v1/rpc/get_transaction_status_public`, {
      method: 'POST',
      headers: {
        apikey: publicKey,
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_external_id: id }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PinPay status RPC error:', {
        status: response.status,
        error: data?.message || data?.error || 'unknown_error',
      });
      return res.status(response.status).json({ error: 'Não foi possível consultar o pagamento.' });
    }

    const status = normalizeStatus(data);
    return res.status(200).json({ id, status: status || 'pending' });
  } catch (error) {
    console.error('Error fetching PinPay product transaction status:', error);
    return res.status(500).json({ error: 'Erro ao consultar status.' });
  }
}
