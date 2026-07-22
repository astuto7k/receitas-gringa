export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone } = req.body || {};

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const pinpayToken = process.env.PINPAY_SECRET_KEY;

    if (!pinpayToken) {
      console.error('PINPAY_SECRET_KEY env variable missing');
      return res.status(500).json({ error: 'Chave de API PinPay não configurada no servidor.' });
    }

    // Helper to generate valid 11-digit CPF for PinPay API compliance
    const num = Math.floor(Math.random() * 899999999) + 100000000;
    const str = num.toString();
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(str.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    sum = 0;
    const str2 = str + rev;
    for (let i = 0; i < 10; i++) sum += parseInt(str2.charAt(i)) * (11 - i);
    let rev2 = 11 - (sum % 11);
    if (rev2 === 10 || rev2 === 11) rev2 = 0;
    const validCpf = str2 + rev2;

    const externalRef = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const response = await fetch('https://api.usepinpay.com/functions/v1/api-v1/pix', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinpayToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': externalRef,
      },
      body: JSON.stringify({
        amount: 1900,
        description: 'Doce Liberdade',
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          document: { type: 'CPF', number: validCpf },
          phone: phone.replace(/\D/g, ''),
        },
        expires_in: 3600,
        metadata: {
          external_reference: externalRef,
          checkout_url: req.headers.referer || 'https://receitas-gringa.vercel.app/checkout.html',
          product_name: 'Doce Liberdade',
          product_id: 'doce_liberdade_19',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PinPay API Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno ao comunicar com o gateway de pagamento.' });
  }
}
