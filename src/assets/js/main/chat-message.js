// Imports para el markdown del chat
import {urlBaseEndpoint} from './vars.js';
import {md} from './common.js';
import {checkAuthToken} from './common.js';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import {getClassRequest} from "./api.js";

let streamedMessageElement = null;

document.addEventListener('DOMContentLoaded', async function () {
    const classId = getClassId();
    console.log('classId:', classId);
    if (!getClassId) {
        console.error('No se encontró el ID de la clase.');
        return;
    }

    try {
        const data = await fetchClass(classId);
        console.log('Clase obtenida correctamente chat-messages:', data);
        renderTitleClass(classId);
        renderClassSessions(data);
        /*scrollToBottom();
        initializeChatForm(getClassRequest);*/
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
function getClassId() {
    // Verifica si la URL actual es la esperada (/chat.html)
    if (window.location.pathname === '/chat.html') {
        // Crea una instancia de URLSearchParams con la cadena de consulta de la URL
        const urlParams = new URLSearchParams(window.location.search);
        // Retorna el valor del parámetro 'conversationId'
        return urlParams.get('classId');
    } else {
        // Retorna null si no estamos en la página /chat.html
        return null;
    }
}

async function fetchClass(classId) {
    return getClassRequest(classId)
        .then(data => {
            console.log('Clase obtenida correctamente:', data);
            return data;
        })
        .catch(error => {
            console.error('Error al obtener la clase:', error.message);
            throw error; // Re-lanzar el error para que pueda ser manejado por quien llama a fetchClass()
        });
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
 * Actualiza el título de la conversación en la interfaz de usuario.
 * @param {string} class_id - El identificador de la conversación.
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
function renderTitleClass(class_id) {
    const chatTitle = document.querySelector('.chat-header .text-truncate');

    if (chatTitle) {
        const title = sessionStorage.getItem(class_id);
        chatTitle.textContent = title || 'New Chat';
    } else {
        console.error('No se encontró el elemento del título del chat.');
    }
}

function renderClassSessions(data) {
    const chatBody = document.querySelector('.chat-body-inner');
    chatBody.innerHTML = '';

    if (data.response.length > 0) {
        data.response.forEach((session, index, array) => {
            const sessionElement = createSessionElement(session, index === array.length - 1, data);
            chatBody.appendChild(sessionElement);
        });
    } else {
        console.log('No hay sesiones para mostrar.');
    }

}

function formatDateString(dateString) {
    // Crear un objeto Date a partir del string de fecha ISO 8601
    const date = new Date(dateString);
    // Usar toLocaleString para convertir a un formato más amigable
    // Puedes especificar opciones adicionales para toLocaleString si lo necesitas
    return date.toLocaleString('es-CO', { // 'es-CO' es un ejemplo, puedes elegir tu localidad
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function createSessionElement(session, isLastSession, data) {
    let sessionDiv = document.createElement('div');
    sessionDiv.className = 'document-container';

    // Agregar título de la sesión
    let sessionTitle = document.createElement('h1');
    sessionTitle.textContent = session.title;
    sessionDiv.appendChild(sessionTitle);

    let generalInfoTable = document.createElement('table');
    let generalInfoBody = document.createElement('tbody');

    // Fila para creador y fecha de creación con colspan
    let row1 = document.createElement('tr');
    createTableCell('Autor', data.created_by.first_name + ' ' + data.created_by.last_name, row1, 2);
    createTableCell('Creado', formatDateString(data.created_at), row1, 2);
    generalInfoBody.appendChild(row1);

    // Fila para promedio de edad y grado con colspan
    let row2 = document.createElement('tr');
    createTableCell('Edad', data.age_average, row2,);
    createTableCell('Grado', data.grade_level.name + ' - ' + data.grade_level.educational_level, row2,); // Colspan de 2 para esta celda
    createTableCell('Sesión', data.duration_amount + ' ' + data.duration_unit, row2);
    generalInfoBody.appendChild(row2);

    // Fila para locación, asignatura y área de conocimiento sin colspan porque ya son tres celdas
    let row3 = document.createElement('tr');
    createTableCell('Locación', data.location, row3);
    createTableCell('Asignatura', data.subject.name, row3);
    createTableCell('Área de conocimiento', data.area_of_knowledge.name, row3);
    generalInfoBody.appendChild(row3);

    let row4 = document.createElement('tr');
    createTableCell('Enfoque Pedagogico', data.approach.name, row4, 5);
    generalInfoBody.appendChild(row4);

    generalInfoTable.appendChild(generalInfoBody);
    sessionDiv.appendChild(generalInfoTable);

    // Agregar objetivo general
    let objectiveTitle = document.createElement('h2');
    objectiveTitle.textContent = 'Objetivo General';
    sessionDiv.appendChild(objectiveTitle);

    let objectiveParagraph = document.createElement('p');
    objectiveParagraph.textContent = data.object;
    sessionDiv.appendChild(objectiveParagraph);

    // Agregar objetivos específicos
    let specificObjectivesTitle = document.createElement('h2');
    specificObjectivesTitle.textContent = 'Objetivos Específicos';
    sessionDiv.appendChild(specificObjectivesTitle);

    let objectivesList = document.createElement('p');
    objectivesList.textContent = data.object;
    sessionDiv.appendChild(objectivesList);

    // Agregar flujo de aprendizaje
    let learningFlowTitle = document.createElement('h2');
    learningFlowTitle.textContent = 'Flujo de aprendizaje';
    sessionDiv.appendChild(learningFlowTitle);

    let learningFlowTable = document.createElement('table');
    let learningFlowHead = document.createElement('thead');
    let learningFlowBody = document.createElement('tbody');

    // Crear encabezados para la tabla
    let flowHeaders = ['Secuencia', 'Duración', 'Tipo', 'Título', 'Descripción', 'Materiales'];
    let headRow = document.createElement('tr');
    flowHeaders.forEach(headerText => {
        let headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headRow.appendChild(headerCell);
    });
    learningFlowHead.appendChild(headRow);

    // Crear filas para el flujo de aprendizaje
    data.response[session.session - 1].learning_flow.forEach(flow => {
        let row = document.createElement('tr');
        let rowData = [
            flow.sequence,
            `${flow.duration} - ${flow.duration_unit}`,
            flow.type,
            flow.title,
            flow.description
            // No se agrega aquí directamente el contenido de materials
        ];

        // Agregar celdas de información al flujo
        rowData.forEach((cellText, index) => {
            let cell = document.createElement('td');
            if (index === 5) { // Suponiendo que 'materials' es el sexto elemento en 'rowData'
                // Utilizar innerHTML para interpretar las etiquetas HTML como saltos de línea
                cell.innerHTML = cellText;
            } else {
                // Para el texto normal usar textContent
                cell.textContent = cellText;
            }
            row.appendChild(cell);
        });

        // Separar la creación de la celda de materiales
        let materialsCell = document.createElement('td');
        materialsCell.innerHTML = createMaterialsContent(flow.materials); // Usar innerHTML aquí
        row.appendChild(materialsCell);

        learningFlowBody.appendChild(row);
    });

    learningFlowTable.appendChild(learningFlowHead);
    learningFlowTable.appendChild(learningFlowBody);
    sessionDiv.appendChild(learningFlowTable);

    // Agregar guía de valoración
    let valuationGuideTitle = document.createElement('h2');
    valuationGuideTitle.textContent = 'Guía de valoración';
    sessionDiv.appendChild(valuationGuideTitle);

    let valuationGuideTable = document.createElement('table');
    let valuationGuideHead = document.createElement('thead');
    let valuationGuideBody = document.createElement('tbody');

    // Crear encabezados para la tabla de guía de valoración
    let guideHeaders = ['Secuencia', 'Criterio', 'Tipo', 'Título', 'Descripción'];
    let guideHeadRow = document.createElement('tr');
    guideHeaders.forEach(headerText => {
        let headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        guideHeadRow.appendChild(headerCell);
    });
    valuationGuideHead.appendChild(guideHeadRow);

    // Crear filas para la guía de valoración
    data.response[session.session - 1].valuation_guide.forEach(guide => {
        let row = document.createElement('tr');
        let guideData = [
            guide.sequence,
            guide.criterion,
            guide.type,
            guide.title,
            guide.description
        ];
        guideData.forEach(cellText => {
            let cell = document.createElement('td');
            cell.textContent = cellText;
            row.appendChild(cell);
        });
        valuationGuideBody.appendChild(row);
    });

    valuationGuideTable.appendChild(valuationGuideHead);
    valuationGuideTable.appendChild(valuationGuideBody);
    sessionDiv.appendChild(valuationGuideTable);

    // Si es la última sesión, añadir un separador
    if (!isLastSession) {
        let separator = document.createElement('hr');
        sessionDiv.appendChild(separator);
    }

    // Retornar el div de la sesión
    return sessionDiv;
}

function createMaterialsContent(materials) {
    return materials.map(material => {
        return `${material.title} <br> ${material.description} <br> ${material.type} <br> <a href="${material.url}" target="_blank">Enlace</a>`;
    }).join('<br><br>'); // Separar cada material con dos saltos de línea para mejor legibilidad
}


function createTableCell(label, value, rowElement, colspan = 1) {
    let labelCell = document.createElement('th');
    labelCell.textContent = label;
    let valueCell = document.createElement('td');
    valueCell.textContent = value;
    if (colspan > 1) {
        valueCell.setAttribute('colspan', colspan.toString());
    }
    rowElement.appendChild(labelCell);
    rowElement.appendChild(valueCell);
}

function getConversationId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('conversationId');
}

export {getConversationId, getFetchOptions}