//Imports para el markdown del chat
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import markdownItHighlightjs from 'markdown-it-highlightjs';

//Url base de la api
import { urlBaseEndpoint } from './vars.js';

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

//loader al cargar el sitio
let loaderIcon = document.getElementById('main-logo');
loaderIcon.innerHTML = '<img src="../../assets/img/avatars/omnissiah_icon.svg" alt="Omnissiah Icon" width="100%">';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversationId');
    if (!conversationId) {
        console.error('No se encontró el ID de la conversación.');
        return;
    }

    const apiUrl = urlBaseEndpoint + `api/v1/conversation/${conversationId}/message/`;
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

        const messageText = JSON.stringify(messageInput.value);
        console.log(messageText)
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

        fetch(urlBaseEndpoint + `api/v1/conversation/${conversationId}/message/`, {
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
    console.log("data", data);
    const chatBody = document.querySelector('.chat-body-inner');
    data.results.slice().reverse().forEach((message, index, array) => {
        let messageElement = createMessageElement(message);
        // Pasar true si es el último mensaje
        starEvents(messageElement, index === array.length - 1, message);
        chatBody.appendChild(messageElement);
    });
}

function createMessageElement(message) {
    let messageDiv = document.createElement('div');
    messageDiv.className = message.sender === 'AI' ? 'message message-in' : 'message message-out';

    let renderedText = md.render(message.text);
    let messageDate = new Date(message.created_at);
    let formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let avatarHTML = '';
    let starRating = '';
    if (message.sender === 'AI') {
        avatarHTML = `
            <a href="#" data-bs-toggle="modal" data-bs-target="#modal-user-profile" class="avatar avatar-responsive">
                <img class="avatar-img" src="assets/img/avatars/omnissiah_icon.gif" alt="">
            </a>`;
        starRating = generateStarRating(message.rating);
    }

    messageDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-inner">
            <div class="message-body">
                <div class="message-content">
                    <div class="message-text">
                        ${renderedText}
                        ${starRating}
                    </div>
                </div>
                
            </div>
            <div class="message-footer">
                <span class="extra-small text-muted">${formattedTime}</span>
                
            </div>
        </div>
    `;
    starEvents(messageDiv);
    return messageDiv;
}
function generateStarRating(rating) {
    let starsHTML = '';
    for (let i = 5; i >= 1; i--) {
        starsHTML += `<span class="star ${i <= rating ? 'select-star' : ''}" data-value="${i}">&#9733;</span>`;
    }
    return `<div class="star-rating">${starsHTML}</div>`;
}
function starEvents(messageElement, isLastMessage, message) {
    let stars = messageElement.querySelectorAll('.star-rating .star');
    if (isLastMessage) {
        if (message.rating == 0) {
            stars.forEach(function (star) {
                star.style.pointerEvents = 'auto';
                star.addEventListener('click', function () {
                    let rating = star.getAttribute('data-value');
                    sendRating(message.id, message.conversation_id, rating);
                    star.classList.add('select-star');
                    stars.forEach(function (starNoHover) {
                        starNoHover.style.pointerEvents = 'none';
                    });
                });
            });
        } else {
            stars.forEach(function (star) {
                star.style.pointerEvents = 'none';
            });   
        } 
    } else {
        stars.forEach(function (star) {
            star.style.pointerEvents = 'none';
        });
    }
}

function sendRating(messageId, conversationId, rating) {
    const ratingUrl = urlBaseEndpoint + `api/v1/conversation/${conversationId}/message/${messageId}/rating/`;
    const authToken = localStorage.getItem('accessToken'); 

    fetch(ratingUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            "rating": rating
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Calificación enviada con éxito:', data);
    })
    .catch(error => {
        console.error('Error al enviar calificación:', error);
    });
}

function addMessageAndScroll(messageData) {
    const chatBody = document.querySelector('.chat-body-inner');
    const messageElement = createMessageElement(messageData);
    //starEvents(messageDiv);
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
