export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

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
        if (response.status === 200) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(response.status).json({ error: data });
        }
    } catch (error) {
        res.status(500).json({ error: 'API request failed', details: error.message });
    }
}