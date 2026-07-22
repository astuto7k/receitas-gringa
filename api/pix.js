const PINPAY_API_URL = 'https://api.usepinpay.com';
const DEFAULT_PRODUCT_ID = '7c552d33-7f1e-4645-af68-8f82163a7f0c';

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

function findPixCode(data) {
  const pix = data?.pix || {};
  const nestedPix = data?.data?.pix || {};

  return (
    data?.pix_code ||
    pix.qrCodeText ||
    pix.copyPaste ||
    pix.qrcode ||
    pix.qr_code ||
    pix.emv ||
    nestedPix.qr_code ||
    nestedPix.copy_paste ||
    nestedPix.brl_code ||
    nestedPix.qrcode ||
    data?.data?.qrCode ||
    data?.qrCodeText ||
    data?.qr_code_text ||
    data?.qrcode ||
    data?.pixCopyPaste ||
    ''
  );
}

function findTransactionId(data) {
  return data?.id || data?.transaction_id || data?.data?.id || data?.data?.transaction_id || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, cpf, originUrl } = req.body || {};
    const cleanPhone = onlyDigits(phone);
    const cleanCpf = onlyDigits(cpf);

    if (!name || !email || !cleanPhone || !cleanCpf) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    if (!isValidCpf(cleanCpf)) {
      return res.status(400).json({ error: 'Informe um CPF válido.' });
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return res.status(400).json({ error: 'Informe um celular válido com DDD.' });
    }

    const publicKey = process.env.PINPAY_PUBLIC_KEY;
    const productId = process.env.PINPAY_PRODUCT_ID || DEFAULT_PRODUCT_ID;

    if (!publicKey) {
      console.error('PINPAY_PUBLIC_KEY env variable missing');
      return res.status(500).json({ error: 'Integração PinPay não configurada no servidor.' });
    }

    const checkoutOrigin =
      typeof originUrl === 'string' && originUrl.startsWith('https://receitas-gringa.vercel.app/')
        ? originUrl
        : req.headers.referer || 'https://receitas-gringa.vercel.app/checkout.html';

    const response = await fetch(`${PINPAY_API_URL}/functions/v1/create-pix`, {
      method: 'POST',
      headers: {
        apikey: publicKey,
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          document: { number: cleanCpf, type: 'CPF' },
          address: {
            cep: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
          },
        },
        userAgent: req.headers['user-agent'] || '',
        bumpItems: [],
        shippingCents: 0,
        origin_url: checkoutOrigin,
        variantId: null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PinPay create-pix error:', {
        status: response.status,
        error: data?.error || data?.message || 'unknown_error',
      });
      return res.status(response.status).json({
        error: data?.error || data?.message || 'Não foi possível gerar o PIX.',
      });
    }

    const transactionId = findTransactionId(data);
    const pixCode = findPixCode(data);

    if (!transactionId || !pixCode) {
      console.error('PinPay create-pix returned an incomplete payload');
      return res.status(502).json({ error: 'A PinPay não retornou todos os dados do PIX.' });
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

    return res.status(201).json({
      id: transactionId,
      status: data?.status || 'pending',
      product: {
        id: productId,
        name: 'Doce Liberdade',
      },
      pix: {
        qr_code: pixCode,
        qr_code_url: qrCodeUrl,
        expires_at: data?.expires_at || data?.pix?.expires_at || data?.data?.pix?.expires_at || null,
      },
    });
  } catch (error) {
    console.error('Server error while creating product PIX:', error);
    return res.status(500).json({ error: 'Erro interno ao comunicar com a PinPay.' });
  }
}
