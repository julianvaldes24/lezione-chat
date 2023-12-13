// Importación de la URL base de la API desde otro módulo
import { urlBaseEndpoint } from './vars.js';
import { showLoader } from './common.js';
import { checkAuthToken } from './common.js';

// Se ejecuta cuando se carga el contenido del DOM
document.addEventListener('DOMContentLoaded', initChatForm);

/**
 * Inicializa el formulario de chat y configura los manejadores de eventos.
 */
function initChatForm() {
    const form = document.getElementById('new_question_id');
    const startChatButton = document.getElementById('start-chat-button');

    // Agrega un manejador de eventos al botón de inicio de chat
    startChatButton.addEventListener('click', () => submitForm(form));

    // Agrega un manejador de eventos al formulario
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Envía el formulario de chat.
 * @param {HTMLFormElement} form - El formulario de chat.
 */
function submitForm(form) {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    showLoader();
}

/**
 * Maneja el envío del formulario de chat.
 * @param {Event} e - El evento de envío del formulario.
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    // Verifica si el token de autenticación está disponible
    const authToken = await checkAuthToken();

    // Construye y envía la solicitud de chat
    const payload = buildChatPayload();
    sendChatRequest(payload, authToken);
}

/**
 * Construye el payload para la solicitud de chat.
 * @returns {Object} El payload para la solicitud.
 */
function buildChatPayload() {
    const repo = document.getElementById('repo').value;
    const provider = document.getElementById('provider').value;
    const model = document.getElementById('model').value;
    const temperature = document.getElementById('temperature').value;
    const text = document.getElementById('text').value;
    const memoryChat = document.getElementById('new-chat-options-1').checked ? 'memory_chat' : 'normal_chat';

    return {
        text: text,
        model_embeddings: "text-embedding-ada-002",
        chat_type: memoryChat,
        repo: repo,
        model_chat: {
            provider: provider,
            model: model,
            temperature: parseFloat(temperature)
        }
    };
}

/**
 * Envía la solicitud de chat a la API.
 * @param {Object} payload - El payload de la solicitud de chat.
 * @param {string} authToken - El token de autenticación.
 */
function sendChatRequest(payload, authToken) {
    fetch(urlBaseEndpoint + `api/v1/conversation/00000000-0000-0000-0000-000000000000/message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(payload)
    })
        .then(handleResponse)
        .then(handleSuccess)
        .catch(handleError);
}

/**
 * Maneja la respuesta de la API.
 * @param {Response} response - La respuesta de la API.
 * @returns {Promise<Object>} Promesa con los datos de la respuesta.
 */
function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

/**
 * Maneja el éxito de la solicitud de chat.
 * @param {Object} data - Los datos de la respuesta.
 */
function handleSuccess(data) {
    const conversationId = data.conversation.conversation_id;
    window.location.href = `/chat.html?conversationId=${conversationId}`;
}

/**
 * Maneja los errores en las solicitudes de la API.
 * @param {Error} error - El error ocurrido.
 */
function handleError(error) {
    console.error('Error:', error);
}