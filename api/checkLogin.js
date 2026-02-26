// Check Login Status API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查 Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // 如果有 token，返回登录状态
    return res.status(200).json({
      code: 200,
      data: {
        user_id: 'demo_user',
        account: 'demo@example.com'
      }
    });
  }
  
  // 没有 token，返回未登录
  return res.status(200).json({
    code: 4001,
    message: 'Not logged in'
  });
}
