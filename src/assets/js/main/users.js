import {urlBaseEndpoint} from './vars.js';

// Evento que se dispara cuando el contenido del DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    activateUsersTab();
});

/**
 * Realiza una solicitud a la API para obtener los datos de los usuarios.
 */
function fetchUsers() {
    const apiUrl = `${urlBaseEndpoint}api/v1/users/`;

    fetch(apiUrl)
        .then(handleResponse)
        .then(data => {
            console.log('Usuarios:', data);
            renderUsers(data.results);
        })
        .catch(error => {
            console.error('Error al obtener usuarios:', error);
        });
}

/**
 * Maneja la respuesta de la API, verificando si es exitosa.
 * @param {Response} response - Respuesta de la solicitud fetch.
 * @returns {Promise<JSON>} Promesa con los datos en formato JSON.
 */
function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Error en la solicitud: ' + response.statusText);
    }
    return response.json();
}

/**
 * Renderiza los usuarios en la interfaz de usuario.
 * @param {Array} users - Lista de usuarios obtenidos de la API.
 */
function renderUsers(users) {
    const usersContainer = document.getElementById('list-all-users');
    const usersHtml = users.map(user => createUserCardHtml(user)).join('');
    usersContainer.innerHTML = usersHtml;
}

/**
 * Crea el HTML para la tarjeta de un usuario.
 * @param {Object} user - Objeto que representa a un usuario.
 * @returns {string} Cadena de texto con el HTML de la tarjeta del usuario.
 */
function createUserCardHtml(user) {
    const user_href = `user.html?userId=${user.id}`;
    return `
        <div class="card border-0">
            <div class="card-body">
                <div class="row align-items-center gx-5">
                    <div class="col-auto">
                        <a href="#" class="avatar">
                            <span class="avatar-text">${user.name.charAt(0)}</span>
                        </a>
                    </div>
                    <div class="col">
                        <h5><a href="${user_href}">${user.name}</a></h5>
                        <p>${user.email}</p>
                    </div>
                    <div class="col-auto">
                        <div class="dropdown">
                            <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <img src="../../assets/img/icons/dropdown.png" class="user-dropdown-icon">
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="${user_href}">Edit contact</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#">Delete user</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Activa la pestaña de usuarios si la URL actual es /user.html.
 */
function activateUsersTab() {
    if (window.location.pathname.includes('/user.html')) {
        // Selecciona todos los paneles del tab-content
        const sidebarTabPanes = document.querySelectorAll('aside.sidebar > .tab-content > .tab-pane.fade');


        // Elimina la clase 'active' de todos los paneles
        sidebarTabPanes.forEach(pane => pane.classList.remove('show', 'active'));

        // Agrega la clase 'active' al panel de usuarios
        const usersTab = document.getElementById('tab-content-users');
        if (usersTab) {
            usersTab.classList.add('show', 'active');
        }
    }
}