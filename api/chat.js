export default async function handler(req, res) {
    // 检查请求方法
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed, please use POST' });
    }

    const { message } = req.body;

    // 验证请求体
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing message in request body' });
    }

    // 检查环境变量
    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://grok-iota-nine.vercel.app',
                'X-Title': 'AI 聊天'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat:free',
                messages: [
                    { role: 'system', content: '你是一个有帮助的 AI 助手，用简洁的中文回答用户的问题。' },
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();
        if (response.ok) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(response.status).json({ error: data.error?.message || 'OpenRouter API request failed' });
        }
    } catch (error) {
        res.status(500).json({ error: 'API request failed', details: error.message });
    }
}