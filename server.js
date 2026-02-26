import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 10000;

  // CORS 配置
  app.use(cors());
  app.use(express.json());

  // 创建 Vite 服务器
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: { overlay: false }
    },
    appType: 'custom',
    configFile: './frontend/vite.config.js'
  });

  // 使用 Vite 中间件
  app.use(vite.middlewares);

  // AI Chat API - 对接 DeepSeek API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, messages, model = 'deepseek-chat' } = req.body;
      
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
  });

  // 用户登录 API
  app.post('/api/userLogin', (req, res) => {
    const { email, password } = req.body;
    // 模拟登录
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    return res.status(200).json({
      code: 200,
      data: {
        user_token: token,
        user_id: 'user_' + Date.now(),
        account: email
      }
    });
  });

  // 检查登录状态 API
  app.get('/api/checkLogin', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return res.status(200).json({
        code: 200,
        data: {
          user_id: 'demo_user',
          account: 'demo@example.com'
        }
      });
    }
    return res.status(200).json({
      code: 4001,
      message: 'Not logged in'
    });
  });

  // SPA fallback - 处理所有其他路由
  app.get('*', async (req, res, next) => {
    try {
      const indexPath = join(__dirname, 'frontend/index.html');
      let html = await vite.transformIndexHtml(req.url, indexPath);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
