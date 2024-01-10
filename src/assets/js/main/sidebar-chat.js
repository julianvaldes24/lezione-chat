// Importaciones de otros módulos para configuraciones y funciones comunes
import {urlBaseEndpoint} from './vars.js';
import {checkAuthToken} from './common.js';

// Al cargar el documento, se intenta recuperar y mostrar las conversaciones
document.addEventListener('DOMContentLoaded', async function () {
    try {
        await fetchChats();
    } catch (error) {
        console.error('Error:', error);
    }
});

/**
 * Recupera las conversaciones desde la API y actualiza la interfaz de usuario.
 */
async function fetchChats() {
    const apiUrl = `${urlBaseEndpoint}api/v1/conversation/?limit=100`;

    // Verifica si el token de autenticación está disponible
    const authToken = await checkAuthToken();

    const response = await fetch(apiUrl, getFetchOptions(authToken));
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    updateUI(data);
}

/**
 * Configura las opciones de solicitud para la API.
 * @param {string} token - El token de autenticación JWT.
 * @returns {Object} Las opciones de la solicitud.
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
 * Actualiza la interfaz de usuario con los datos de las conversaciones.
 * @param {Object} data - Datos de las conversaciones obtenidas de la API.
 */
function updateUI(data) {
    const chatsContainer = document.querySelector('#tab-content-chats .card-list');
    const conversationCountElement = document.querySelector('.nav-item .badge span');

    chatsContainer.innerHTML = '';

    // Agrupa las conversaciones por fecha
    const groupedConversations = groupConversationsByDate(data.results);

    // Actualiza el contador de conversaciones
    if (conversationCountElement) {
        conversationCountElement.textContent = data.results.length.toString();
    }

    // Crea y agrega elementos de conversación a la interfaz de usuario
    Object.keys(groupedConversations).forEach(group => {
        const groupHeader = document.createElement('h4');
        groupHeader.className = 'text-group';
        groupHeader.textContent = group;
        chatsContainer.appendChild(groupHeader);

        groupedConversations[group].forEach(conversation => {
            const chatCard = createChatCard(conversation);
            chatsContainer.appendChild(chatCard);
        });
    });
}

/**
 * Crea un elemento de tarjeta para una conversación.
 * @param {Object} conversation - Datos de una conversación individual.
 * @returns {HTMLElement} El elemento de tarjeta creado.
 */
function createChatCard(conversation) {
    const card = document.createElement('a');
    card.href = `chat.html?conversationId=${conversation.conversation_id}`;
    card.className = "card border-0 text-reset";
    card.innerHTML = getCardInnerHTML(conversation);
    setSessionStorage(conversation);
    return card;
}


/**
 * Almacena la información de una conversación en sessionStorage.
 *
 * Esta función toma un objeto de conversación y guarda su ID y título en sessionStorage.
 * Esto es útil para mantener un registro rápido de conversaciones recientes o importantes
 * que necesitan ser accesibles durante la sesión actual del navegador.
 *
 * @param {Object} conversation - Objeto de conversación que contiene el ID y el título.
 */
function setSessionStorage(conversation) {
    // Verifica si el objeto de conversación y sus propiedades requeridas existen
    if (conversation && conversation.conversation_id && conversation.title) {
        try {
            sessionStorage.setItem(conversation.conversation_id, conversation.title);
        } catch (error) {
            console.error("Error al guardar en sessionStorage:", error);
        }
    } else {
        console.error("Datos de conversación inválidos proporcionados a setSessionStorage.");
    }
}


/**
 * Genera el contenido interno de una tarjeta de conversación.
 * @param {Object} conversation - Datos de una conversación individual.
 * @returns {string} El HTML interno para la tarjeta.
 */
function getCardInnerHTML(conversation) {
    const formattedTitle = conversation.title.length > 20 ? conversation.title.substring(0, 20) + '...' : conversation.title;
    return `
        <div class="card-body">
            <div class="row gx-5">
                <div class="col">
                    <div class="d-flex align-items-center">
                        <h5 class="me-auto mb-0">${formattedTitle}</h5>
                        <span class="text-muted extra-small ms-2">${formatDate(conversation.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Formatea una fecha en un formato legible.
 * @param {string} dateString - La fecha en formato string.
 * @returns {string} La fecha formateada.
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

/**
 * Agrupa las conversaciones por fecha (Hoy, Ayer, Últimos 7 Días, etc.)
 * @param {Array} conversations - Array de conversaciones.
 * @returns {Object} Conversaciones agrupadas por fecha.
 */
function groupConversationsByDate(conversations) {
    const grouped = {};

    conversations.forEach(conversation => {
        const date = new Date(conversation.updated_at);
        const group = getConversationGroup(date);

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(conversation);
    });

    return grouped;
}

/**
 * Determina el grupo de fecha para una conversación (Hoy, Ayer, etc.)
 * @param {Date} date - La fecha de la conversación.
 * @returns {string} El nombre del grupo de fecha.
 */
function getConversationGroup(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else if (date > sevenDaysAgo) {
        return 'Últimos 7 Días';
    } else if (date > twentyDaysAgo) {
        return 'Últimos 20 Días';
    } else if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
        return 'Mes Pasado';
    } else {
        return 'Anteriores';
    }
}

