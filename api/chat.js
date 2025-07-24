export default async function handler(req, res) {
    // 检查请求方法
    if (req.method !== 'POST') {
        console.error(`Invalid method: ${req.method}`);
        return res.status(405).json({ error: 'Method not allowed, please use POST' });
    }

    const { message } = req.body;

    // 验证请求体
    if (!message || typeof message !== 'string') {
        console.error('Invalid request body:', req.body);
        return res.status(400).json({ error: 'Invalid or missing message in request body' });
    }

    // 检查环境变量
    if (!process.env.OPENROUTER_API_KEY) {
        console.error('OPENROUTER_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    try {
        console.log('Sending request to OpenRouter API with message:', message);
        console.log('Using API key (first 10 chars):', process.env.OPENROUTER_API_KEY.substring(0, 10));
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
        console.log('OpenRouter API response:', JSON.stringify(data, null, 2));
        if (response.ok) {
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                console.error('No content in response:', data);
                return res.status(500).json({ error: 'No response content from OpenRouter API' });
            }
            res.status(200).json({ message: content });
        } else {
            console.error('OpenRouter API error:', data);
            res.status(response.status).json({ error: data.error?.message || 'OpenRouter API request failed', status: response.status });
        }
    } catch (error) {
        console.error('API request failed:', error.message, error.stack);
        res.status(500).json({ error: 'API request failed', details: error.message });
    }
}