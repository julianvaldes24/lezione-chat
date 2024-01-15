// Imports para el markdown del chat
import {urlBaseEndpoint} from './vars.js';
import {checkAuthToken} from './common.js';
import { getConversationId, getFetchOptions } from './chat-message.js';



document.addEventListener('DOMContentLoaded', async function () {
    const conversationId = getConversationId();
    if (!conversationId) {
        console.error('No se encontró el ID de la conversación.');
        return;
    }
    try {
        await fetchChats(conversationId);   
        
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchChats(conversationId) {
    const apiUrl = `${urlBaseEndpoint}api/v1/conversation/?limit=100`;

    // Verifica si el token de autenticación está disponible
    const authToken = await checkAuthToken();

    const response = await fetch(apiUrl, getFetchOptions(authToken));
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    let newTitle = "nuevo titulo"

    updateChatTitle(conversationId, newTitle, data);
}


function editTitleButton(titleId, newTitle) {
    const editButton = document.getElementById('edit-button');
    const title = document.getElementById('editable-title');

    editButton.addEventListener('click', function(event) {
        event.preventDefault(); // Previene el comportamiento por defecto del enlace

        const currentText = title.textContent;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentText;
        inputField.classList.add('form-control');

        // Reemplaza el título con el campo de entrada
        title.replaceWith(inputField);

        // Enfoca el campo de entrada y selecciona el texto
        inputField.focus();
        inputField.select();

        

        // Evento para cuando se finaliza la edición
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const updateUrl = `${urlBaseEndpoint}api/v1/conversation/${titleId}/`;
                const authToken = localStorage.getItem('accessToken');
                newTitle = inputField.value;

                fetch(updateUrl, {
                    method: 'PUT', // Asegúrate de que el método sea el correcto según tu API
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({"title": newTitle})
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la solicitud: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => console.log('Título actualizado con éxito:', data))
                .catch(error => console.error('Error al actualizar el título:', error));
                title.textContent = newTitle;
                inputField.replaceWith(title);
                
                setTimeout(function(){
                    window.location.reload();
                }, 500);
                
                
                //
            }
        });
        inputField.addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
                title.textContent = currentText;
                inputField.replaceWith(title);
            }
        });
    });
}

/**
 * Actualiza el título de un chat mediante una solicitud a la API.
 *
 * @param {string} conversationId - Identificador de la conversación.
 * @param {string} titleId - id para modificar el titulo.
 * @param {string} newTitle - Nuevo título del chat.
 */
function updateChatTitle(conversationId, newTitle, data) {
    let titleId = "";

    data.results.forEach(element => {
        if (element.conversation_id == conversationId) {
           titleId = element.id; 
        }
    });

    editTitleButton(titleId, newTitle, data)
    
}
