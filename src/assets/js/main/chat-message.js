import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import markdownItHighlightjs from 'markdown-it-highlightjs';

// Inicializar markdown-it con el plugin highlight.js
const md = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (_) { }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

md.use(markdownItHighlightjs);

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversationId');
    if (!conversationId) {
        console.error('No se encontró el ID de la conversación.');
        return;
    }

    const apiUrl = `http://54.242.3.57:8000/api/v1/conversation/${conversationId}/message/`;
    const authToken = localStorage.getItem('accessToken');

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/signin.html';
                } else {
                    throw new Error('Error en la solicitud: ' + response.statusText);
                }
            }
            return response.json();
        })
        .then(data => {
            renderChatMessages(data);
            scrollToBottom();
        })
        .catch(error => console.error('Error:', error));

    const chatForm = document.getElementById('question_id');
    const messageInput = chatForm.querySelector('textarea');
    const chatBody = document.querySelector('.chat-body-inner');

    if (!chatForm || !messageInput || !chatBody) {
        console.error('No se pudo encontrar uno o más elementos esenciales del chat.');
        return;
    }

    chatForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const messageText = messageInput.value;
        if (!messageText.trim()) return;

        const userMessageData = {
            text: messageText,
            sender: 'User',
            created_at: new Date().toISOString()
        };

        addMessageAndScroll(userMessageData);

        messageInput.value = '';

        const payload = {
            text: messageText,
            model_embeddings: "text-embedding-ada-002",
            chat_type: "memory_chat",
            repo: "saas-ms-user",
            model_chat: {
                provider: "openai",
                model: "gpt-4-1106-preview",
                temperature: 0.3
            }
        };

        if (!authToken) {
            console.error('Token de autenticación no disponible.');
            return;
        }

        fetch(`http://54.242.3.57:8000/api/v1/conversation/${conversationId}/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.ai_message) {
                    addMessageAndScroll(data.ai_message);
                }
            })
            .catch(error => {
                console.error('Error al enviar mensaje:', error);
            });
    });
});

function renderChatMessages(data) {
    const chatBody = document.querySelector('.chat-body-inner');
    data.results.slice().reverse().forEach(message => {
        let messageElement = createMessageElement(message);
        chatBody.appendChild(messageElement);
    });
}

function createMessageElement(message) {
    let messageDiv = document.createElement('div');
    messageDiv.className = message.sender === 'AI' ? 'message' : 'message message-out';

    let renderedText = md.render(message.text);
    let messageDate = new Date(message.created_at);
    let formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-user-profile" class="avatar avatar-responsive">
            <img class="avatar-img" src="assets/img/avatars/omnissiah_icon.png" alt="">
        </a>
        <div class="message-inner">
            <div class="message-body">
                <div class="message-content">
                    <div class="message-text">
                        ${renderedText}
                    </div>
                </div>
            </div>
            <div class="message-footer">
                <span class="extra-small text-muted">${formattedTime}</span>
            </div>
        </div>`;
    return messageDiv;
}

function addMessageAndScroll(messageData) {
    const chatBody = document.querySelector('.chat-body-inner');
    const messageElement = createMessageElement(messageData);
    chatBody.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    console.log("Scroll");
    const chatBody = document.querySelector('.chat-body');
    // Usar setTimeout para asegurarse de que el DOM se ha actualizado con el nuevo mensaje
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 0);
}
