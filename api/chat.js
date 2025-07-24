export default async function handler(req, res) {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 检查 API 密钥
        if (!process.env.DEEPSEEK_API_KEY) {
            console.error('DEEPSEEK_API_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error: API key missing' });
        }

        // 使用 OpenRouter 端点和免费模型
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        const model = 'deepseek/deepseek-r1:free';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'HTTP-Referer': 'https://grok-iota-nine.vercel.app',
                'X-Title': 'Grok Chat'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个友善和有帮助的AI助手。请用中文回答用户的问题。'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `OpenRouter API error: ${response.status} - ${errorText}`
            });
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response:', data);
            return res.status(500).json({ error: 'Invalid API response format' });
        }

        res.status(200).json({
            success: true,
            message: data.choices[0].message.content
        });

    } catch (error) {
        console.error('Chat API Error:', error.message);
        res.status(500).json({ 
            success: false,
            error: `服务暂时不可用: ${error.message}`
        });
    }
}