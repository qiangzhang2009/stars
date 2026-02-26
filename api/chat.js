// AI Chat API - 对接 DeepSeek API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, messages, model = 'deepseek-chat', stream = true } = req.body;
    
    // 获取 DeepSeek API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // 构建消息历史
    const chatMessages = [];
    
    // 添加系统提示
    chatMessages.push({
      role: 'system',
      content: `你是一个专业的玄学大师，精通八字、风水、星座、塔罗牌、周易、紫微斗数等多种玄学知识。
请用专业、神秘而有智慧的语气回答用户的问题。
如果用户问的是关于命理、运势等方面的问题，请给出详细的分析和指导。
保持神秘感和专业性，但不要过度夸大。`
    });
    
    // 添加历史消息
    if (messages && Array.isArray(messages)) {
      messages.forEach(msg => {
        chatMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }
    
    // 添加当前消息
    if (message) {
      chatMessages.push({ role: 'user', content: message });
    }

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      return res.status(500).json({ error: 'AI service error', details: errorData });
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        choices: [{
          message: {
            role: 'assistant',
            content: data.choices[0].message.content
          }
        }]
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
