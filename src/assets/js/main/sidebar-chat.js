// Importaciones de otros módulos para configuraciones y funciones comunes
import {getListClassRequest} from "./api.js";

// Al cargar el documento, se intenta recuperar y mostrar las conversaciones
document.addEventListener('DOMContentLoaded', async function () {
    try {
        await fetchClasses();
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchClasses() {
    getListClassRequest()
        .then(data => {
            console.log('Lista de clases obtenida correctamente:', data);
            renderClass(data);
        })
        .catch(error => {
            console.error('Error al obtener la lista de clases:', error.message);
        });
}

/**
 * Actualiza la interfaz de usuario con los datos de las conversaciones.
 * @param {Object} data - Datos de las conversaciones obtenidas de la API.
 */
function renderClass(data) {
    const chatsContainer = document.querySelector('#tab-content-chats .card-list');
    const classCountElement = document.querySelector('.nav-item .badge span');

    chatsContainer.innerHTML = '';

    // Agrupa las conversaciones por fecha
    const groupedClasses = groupClassByDate(data.results);

    // Actualiza el contador de conversaciones
    if (classCountElement) {
        classCountElement.textContent = data.results.length.toString();
    }

    // Crea y agrega elementos de conversación a la interfaz de usuario
    Object.keys(groupedClasses).forEach(group => {
        const groupHeader = document.createElement('h4');
        groupHeader.className = 'text-group';
        groupHeader.textContent = group;
        chatsContainer.appendChild(groupHeader);

        groupedClasses[group].forEach(class_obj => {
            const chatCard = createChatCard(class_obj);
            chatsContainer.appendChild(chatCard);
        });
    });
}

/**
 * Crea un elemento de tarjeta para una conversación.
 * @param {Object} class_obj - Datos de una conversación individual.
 * @returns {HTMLElement} El elemento de tarjeta creado.
 */
function createChatCard(class_obj) {
    const card = document.createElement('a');
    card.href = `chat.html?classId=${class_obj.id}`;
    card.className = "card border-0 text-reset";
    card.innerHTML = getCardInnerHTML(class_obj);
    setSessionStorage(class_obj);
    return card;
}


/**
 * Almacena la información de una conversación en sessionStorage.
 *
 * Esta función toma un objeto de conversación y guarda su ID y título en sessionStorage.
 * Esto es útil para mantener un registro rápido de conversaciones recientes o importantes
 * que necesitan ser accesibles durante la sesión actual del navegador.
 *
 * @param {Object} class_obj - Objeto de conversación que contiene el ID y el título.
 */
function setSessionStorage(class_obj) {
    // Verifica si el objeto de conversación y sus propiedades requeridas existen
    if (class_obj && class_obj.id && class_obj.name) {
        try {
            sessionStorage.setItem(class_obj.id, class_obj.name);
        } catch (error) {
            console.error("Error al guardar en sessionStorage:", error);
        }
    } else {
        console.error("Datos de conversación inválidos proporcionados a setSessionStorage.");
    }
}


/**
 * Genera el contenido interno de una tarjeta de conversación.
 * @param {Object} class_obj - Datos de una conversación individual.
 * @returns {string} El HTML interno para la tarjeta.
 */
function getCardInnerHTML(class_obj) {
    const formattedTitle = class_obj.name.length > 40 ? class_obj.name.substring(0, 40) + '...' : class_obj.name;
    return `
        <div class="card-body">
            <div class="row gx-5">
                <div class="col">
                    <div class="d-flex align-items-center">
                        <h5 class="me-auto mb-0">${formattedTitle}</h5>
                        <span class="text-muted extra-small ms-2">${formatDate(class_obj.created_at)}</span>
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
 * @param {Array} classes - Array de conversaciones.
 * @returns {Object} Conversaciones agrupadas por fecha.
 */
function groupClassByDate(classes) {
    const grouped = {};

    classes.forEach(class_obj => {
        const date = new Date(class_obj.updated_at);
        const group = getClassGroup(date);

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(class_obj);
    });

    return grouped;
}

/**
 * Determina el grupo de fecha para una conversación (Hoy, Ayer, etc.)
 * @param {Date} date - La fecha de la conversación.
 * @returns {string} El nombre del grupo de fecha.
 */
function getClassGroup(date) {
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

