// User Login API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // 简单的模拟登录验证
    // 在实际生产环境中，应该连接 Supabase 或其他数据库进行验证
    
    // 生成一个模拟的 token
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    return res.status(200).json({
      code: 200,
      data: {
        user_token: token,
        user_id: 'user_' + Date.now(),
        account: email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ code: 500, error: 'Login failed' });
  }
}
