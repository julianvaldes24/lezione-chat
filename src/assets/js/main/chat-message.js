// Imports para el markdown del chat
import {urlBaseEndpoint} from './vars.js';
import {redirectToLogin} from './common.js';
import {md} from './common.js';
import {checkAuthToken} from './common.js';
import { fetchEventSource } from '@microsoft/fetch-event-source';

let streamedMessageElement = null; 

document.addEventListener('DOMContentLoaded', async function () {
    const conversationId = getConversationId();
    if (!conversationId) {
        console.error('No se encontró el ID de la conversación.');
        return;
    }

    try {
        const data = await fetchChatMessages(conversationId);
        renderTitleConversation(conversationId);
        renderChatMessages(data);
        scrollToBottom();
        initializeChatForm(conversationId);
    } catch (error) {
        console.error('Error:', error);
    }
});
  
/**
 * Obtiene el identificador de la conversación de la URL de la página.
 *
 * Esta función está diseñada para ser utilizada en la página /chat.html,
 * donde se espera un parámetro 'conversationId' en la URL.
 *
 * @returns {string | null} El identificador de la conversación si está presente,
 *                          o null si no se encuentra o si la URL no es /chat.html.
 */
function getConversationId() {
    // Verifica si la URL actual es la esperada (/chat.html)
    if (window.location.pathname === '/chat.html') {
        // Crea una instancia de URLSearchParams con la cadena de consulta de la URL
        const urlParams = new URLSearchParams(window.location.search);

        // Retorna el valor del parámetro 'conversationId'
        return urlParams.get('conversationId');
    } else {
        // Retorna null si no estamos en la página /chat.html
        return null;
    }
}


/**
 * Recupera los mensajes de una conversación específica desde la API.
 * @param {string} conversationId - El ID de la conversación para la cual se recuperarán los mensajes.
 * @returns {Promise<Object>} Una promesa que se resuelve con los datos de los mensajes de la conversación.
 */
async function fetchChatMessages(conversationId) {
    // Construye la URL para solicitar los mensajes de la conversación especificada
    const apiUrl = `${urlBaseEndpoint}api/v1/conversation/${conversationId}/message/`;

    try {
        // Verifica y obtiene el token de autenticación actual
        const authToken = await checkAuthToken();
        if (!authToken) {
            // Si no hay token, la función checkAuthToken se encargará de redirigir
            return null;
        }

        // Realiza la solicitud GET a la API para obtener los mensajes
        const response = await fetch(apiUrl, getFetchOptions(authToken));

        // Verifica si la respuesta de la solicitud es exitosa
        if (!response.ok) {
            // Maneja los errores de la respuesta
            handleFetchError(response);
            return null;
        }

        // Devuelve los datos de la respuesta en formato JSON
        return await response.json();
    } catch (error) {
        // Maneja cualquier error que ocurra durante la solicitud fetch
        console.error('Error al recuperar mensajes de la conversación:', error);
        return null;
    }
}

/**
 * Genera las opciones de solicitud para las llamadas fetch.
 * @param {string} token - El token de autenticación a utilizar en las cabeceras.
 * @returns {Object} Un objeto con las opciones de la solicitud.
 */
function getFetchOptions(token) {
    return {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
}

/**
 * Maneja los errores de respuesta en las solicitudes fetch.
 * Esta función toma una respuesta de la API y lanza un error con el texto del estado
 * si la respuesta indica un fallo en la solicitud (por ejemplo, si el estado no es 200 OK).
 *
 * @param {Response} response - La respuesta de la solicitud fetch que se está manejando.
 * @throws {Error} Lanza un error con el mensaje de estado de la respuesta.
 */
function handleFetchError(response) {
    // Lanza una excepción con el mensaje de estado de la respuesta
    throw new Error('Error en la solicitud: ' + response.statusText);
}

/**
 *  Inicia una conexión utilizando EventSource para recibir eventos en tiempo real.
 * @param {string} conversationId - Identificador único de la conversación.
 * @param {string} messageText - Texto del mensaje enviado a la conversación. 
 */
async function startEventSource(conversationId, messageText) {
    const endpointURL = 'http://34.232.199.165:8089/chat/stream_log';
    let accumulatedMessage = '';
    
    try {
        await fetchEventSource(endpointURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify({
                input: {
                    question: messageText,
                    chat_history: [],
                },
                config: {
                    metadata: {
                        conversation_id: conversationId,
                    },
                },
                include_names: ['FindDocs'],
            }),
            onmessage(event) {
                console.log('event:', event);
                if (event.data !== '') {
                    const data = JSON.parse(event.data);
                    if (Array.isArray(data.ops)) {
                        data.ops.forEach(op => {
                            if (op.op === 'add' && op.path === '/streamed_output/-') {
                                accumulatedMessage += op.value;
                            }
                        });
            
                        if (accumulatedMessage) {
                            addStreamedMessageToUI(accumulatedMessage); 
                        }
                    }
                }else if(event.event === 'end'){
                    sendMessage(conversationId, messageText, accumulatedMessage);
                }
            },
            onerror(error) {
                console.error('Error en la conexión:', error);
            },
        });
    } catch (error) {
        console.error('Error al establecer la conexión:', error);
    }
}


/**
 * Actualiza el título de la conversación en la interfaz de usuario.
 * @param {string} conversation_id - El identificador de la conversación.
 *
 * Esta función busca el título de la conversación almacenado en sessionStorage
 * utilizando el ID de la conversación proporcionado. Luego actualiza el elemento
 * del título en la interfaz de usuario con el título recuperado. Si no se encuentra
 * un título en sessionStorage o si no se puede encontrar el elemento del título en
 * el DOM, se muestra un mensaje de error en la consola.
 *
 * El título se muestra en un elemento <h5> dentro del encabezado del chat. Si no se
 * encuentra un título para el ID dado, se utiliza 'New Chat' como título predeterminado.
 */
function renderTitleConversation(conversation_id) {
    const chatTitle = document.querySelector('.chat-header .text-truncate');

    if (chatTitle) {
        const title = sessionStorage.getItem(conversation_id);
        chatTitle.textContent = title || 'New Chat';
    } else {
        console.error('No se encontró el elemento del título del chat.');
    }
}

/**
 * Renderiza los mensajes de chat en la interfaz de usuario y almacena información del último mensaje.
 *
 * @param {Object} data - Datos que contienen los mensajes de chat.
 */
function renderChatMessages(data) {
    const chatBody = document.querySelector('.chat-body-inner');
    chatBody.innerHTML = '';

    // Si hay mensajes, procesa y muestra los mensajes, y almacena datos del último mensaje.
    if (data.results.length > 0) {
        storeLastMessageData(data.results[data.results.length - 1]);
        data.results.slice().reverse().forEach((message, index, array) => {
            const messageElement = createMessageElement(message);
            starEvents(messageElement, index === array.length - 1, message);
            chatBody.appendChild(messageElement);
        });
        renderchatMessageInfo(data.results[data.results.length - 1]);
    } else {
        console.log('No hay mensajes para mostrar.');
    }
}

function renderchatMessageInfo(data) {
    let chatRepoInfo = document.getElementById('chat-repo-info');
    let chatProviderInfo = document.getElementById('chat-provider-info');
    let chatModelInfo = document.getElementById('chat-model-info');
    let chatTemperatureInfo = document.getElementById('chat-temperature-info');

    chatRepoInfo.innerHTML = `
        <h5>Repo</h5>
        <p>${data.repo}</p>
    `;
    chatProviderInfo.innerHTML = `
        <h5>Provider</h5>
        <p>${data.model_chat.provider}</p>
    `;
    chatModelInfo.innerHTML = `
        <h5>Model</h5>
        <p>${data.model_chat.model}</p>
    `;
    chatTemperatureInfo.innerHTML = `
        <h5>Temperature</h5>
        <p>${data.model_chat.temperature.toString()}</p>
    `;
}

/**
 * Almacena información relevante del último mensaje en sessionStorage.
 *
 * @param {Object} lastMessage - El último mensaje de la lista de mensajes de chat.
 */
function storeLastMessageData(lastMessage) {
    sessionStorage.setItem('lastMessageRepo', lastMessage.repo);
    sessionStorage.setItem('lastMessageChatType', lastMessage.chat_type);
    sessionStorage.setItem('lastMessageProvider', lastMessage.model_chat.provider);
    sessionStorage.setItem('lastMessageModel', lastMessage.model_chat.model);
    sessionStorage.setItem('lastMessageTemperature', lastMessage.model_chat.temperature.toString());
    sessionStorage.setItem('lastMessageModelEmbeddings', lastMessage.model_embeddings);

    console.log('Información del último mensaje almacenada en sessionStorage.');
}

/**
 * Agrega un mensaje recibido por trama al chat en la interfaz de usuario y
 * actualiza el contenido del mensaje recibido.
 *
 * @param {string} messageText - Texto del mensaje recibido por trama.
 */
function addStreamedMessageToUI(messageText) {
    if (!streamedMessageElement) {
        // Si el elemento del mensaje aún no existe, créalo
        streamedMessageElement = createStreamedMessageElement();
    }

    // Actualiza el contenido del mensaje con el nuevo texto
    if (streamedMessageElement) {
        const messageTextElement = streamedMessageElement.querySelector('.message-text');
        messageTextElement.innerHTML = md.render(messageText); // Actualiza el contenido del mensaje
    }

    const chatBody = document.querySelector('.chat-body-inner');
    chatBody.appendChild(streamedMessageElement); // Agrega o actualiza el mensaje en el chat
    scrollToBottom();
}

/**
 * Crea un elemento HTML para un mensaje de chat.
 *
 * @param {Object} message - Objeto de mensaje que incluye detalles como el texto y el remitente.
 * @returns {HTMLElement} Elemento HTML representando el mensaje.
 */
function createMessageElement(message) {
    let messageDiv = document.createElement('div');
    messageDiv.className = message.sender === 'AI' ? 'message message-in' : 'message message-out';

    let renderedText = md.render(message.text);
    let messageDate = new Date(message.created_at);
    let formattedTime = messageDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

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
    return messageDiv;
}

/**
 * Crea un elemento HTML para un mensaje recibido por trama.
 *
 * @returns {HTMLElement} Elemento HTML representando el mensaje recibido por trama.
 */
function createStreamedMessageElement() {
    let messageDiv = document.createElement('div');
    messageDiv.className = 'message message-in'; // Puedes personalizar la clase según tus necesidades

    let formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let avatarHTML = '';
    
    messageDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-inner">
            <div class="message-body">
                <div class="message-content">
                    <div class="message-text"></div>
                </div>
            </div>
            <div class="message-footer">
                <span class="extra-small text-muted">${formattedTime}</span>
            </div>
        </div>`;
    return messageDiv;
}

/**
 * Genera el HTML para la calificación con estrellas de un mensaje.
 *
 * @param {number} rating - Valoración del mensaje (cantidad de estrellas).
 * @returns {string} HTML representando la calificación con estrellas.
 */
function generateStarRating(rating) {
    let starsHTML = '';
    for (let i = 5; i >= 1; i--) {
        starsHTML += `<span class="star ${i <= rating ? 'select-star' : ''}" data-value="${i}">&#9733;</span>`;
    }
    return `<div class="star-rating">${starsHTML}</div>`;
}

/**
 * Agrega eventos a las estrellas de calificación en un mensaje de chat.
 *
 * @param {HTMLElement} messageElement - Elemento del mensaje al que se agregarán los eventos.
 * @param {boolean} isLastMessage - Indica si es el último mensaje.
 * @param {Object} message - Objeto de mensaje.
 */
function starEvents(messageElement, isLastMessage, message) {
    let stars = messageElement.querySelectorAll('.star-rating .star');
    if (isLastMessage && message.rating == 0) {
        stars.forEach(star => {
            star.style.pointerEvents = 'auto';
            star.addEventListener('click', function () {
                let rating = star.getAttribute('data-value');
                sendRating(message.id, message.conversation_id, rating);
                star.classList.add('select-star');
                stars.forEach(starNoHover => starNoHover.style.pointerEvents = 'none');
            });
        });
    } else {
        stars.forEach(star => star.style.pointerEvents = 'none');
    }
}

/**
 * Envía la calificación de un mensaje a la API.
 *
 * @param {string} messageId - Identificador del mensaje.
 * @param {string} conversationId - Identificador de la conversación.
 * @param {number} rating - Calificación asignada al mensaje.
 */
function sendRating(messageId, conversationId, rating) {
    const ratingUrl = `${urlBaseEndpoint}api/v1/conversation/${conversationId}/message/${messageId}/rating/`;
    const authToken = localStorage.getItem('accessToken');

    fetch(ratingUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({"rating": rating})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => console.log('Calificación enviada con éxito:', data))
        .catch(error => console.error('Error al enviar calificación:', error));
}

/**
 * Añade un mensaje al chat y realiza scroll hasta el final.
 *
 * @param {Object} messageData - Datos del mensaje a agregar.
 */
function addMessageAndScroll(messageData) {
    const chatBody = document.querySelector('.chat-body-inner');
    const messageElement = createMessageElement(messageData);
    chatBody.appendChild(messageElement);
    scrollToBottom();
}

/**
 * Desplaza el chat hasta el mensaje más reciente.
 */
function scrollToBottom() {
    const chatBody = document.querySelector('.chat-body');
    setTimeout(() => chatBody.scrollTop = chatBody.scrollHeight, 0);
}

/**
 * Inicializa el formulario de chat y agrega el manejador de eventos de envío.
 *
 * @param {string} conversationId - Identificador de la conversación actual.
 */
function initializeChatForm(conversationId) {
    const chatForm = document.getElementById('question_id');
    const messageInput = chatForm.querySelector('textarea');
    if (!chatForm || !messageInput) {
        console.error('No se pudo encontrar uno o más elementos esenciales del chat.');
        return;
    }

    chatForm.addEventListener('submit', event => {
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
        startEventSource(conversationId, messageText);
        streamedMessageElement = '';
    });
}

/**
 * Envía un mensaje a la API para ser procesado y almacenado en la conversación
 *
 * @param {string} conversationId - Identificador de la conversación.
 * @param {string} messageText - Texto del mensaje enviado por el usuario.
 * @param {string} messageAi - Texto del mensaje enviado por la IA.
 */
async function sendMessage(conversationId, messageText, messageAi) {

    const messagesToSend = {
        user_msg: {
            text: messageText
        },
        ai_msg: {
            text: messageAi
        },
        model_embeddings: sessionStorage.getItem('lastMessageModelEmbeddings') || 'text-embedding-ada-002',
        chat_type: sessionStorage.getItem('lastMessageChatType') || 'memory_chat',
        repo: sessionStorage.getItem('lastMessageRepo') || 'sportline-magento',
        model_chat: {
            provider: sessionStorage.getItem('lastMessageProvider') || 'openai',
            model: sessionStorage.getItem('lastMessageModel') || 'gpt-4-1106-preview',
            temperature: parseFloat(sessionStorage.getItem('lastMessageTemperature')) || 0.5,
        }
    };

    const authToken = localStorage.getItem('accessToken');
    if (!authToken) {
        console.error('Token de autenticación no disponible.');
        return;
    }

    try {
        const response = await fetch(`${urlBaseEndpoint}api/v1/conversation/${conversationId}/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(messagesToSend)
        });

        if (!response.ok) {
            throw new Error(`HTTP error al enviar los mensajes! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error al enviar mensajess:', error);
    }
}

export {getConversationId, getFetchOptions}