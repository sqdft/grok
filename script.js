class DeepSeekChat {
    constructor() {
        this.chatContainer = document.querySelector('.chat-container');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.sendLoader = document.getElementById('sendLoader');
        this.initEventListeners();
    }

    initEventListeners() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        // 输入框回车事件
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        // 输入框动态调整高度
        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
    }

    adjustTextareaHeight() {
        this.messageInput.style.height = '48px';
        this.messageInput.style.height = `${Math.min(this.messageInput.scrollHeight, 120)}px`;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 显示用户消息
        this.appendMessage('user', message);
        this.messageInput.value = '';
        this.adjustTextareaHeight();

        // 显示加载动画
        this.sendButton.disabled = true;
        this.sendLoader.classList.remove('hidden');
        const loadingMessage = this.appendLoadingMessage();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            // 移除加载动画
            this.sendButton.disabled = false;
            this.sendLoader.classList.add('hidden');
            if (loadingMessage) loadingMessage.remove();

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                this.appendMessage('ai', data.message);
            } else {
                this.appendMessage('error', data.error || '服务器返回错误');
            }
        } catch (error) {
            console.error('Error:', error);
            // 移除加载动画
            this.sendButton.disabled = false;
            this.sendLoader.classList.add('hidden');
            if (loadingMessage) loadingMessage.remove();
            this.appendMessage('error', '无法连接到服务器，请稍后再试');
        }
    }

    appendMessage(type, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${type}-message`);
        messageElement.textContent = message;
        this.chatContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    appendLoadingMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'loading-message');
        loadingElement.innerHTML = 'AI 正在思考... <span class="loading-dots"><span></span><span></span><span></span></span>';
        this.chatContainer.appendChild(loadingElement);
        this.scrollToBottom();
        return loadingElement;
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DeepSeekChat();
});