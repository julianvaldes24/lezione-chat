import {urlBaseEndpoint} from './vars.js';
import {checkAuthToken} from './common.js';

// Evento que se dispara cuando el contenido del DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const authToken = await checkAuthToken();
        if (authToken) {
            await fetchUsers(authToken);
            activateUsersTab();
            if (window.location.pathname.endsWith('/user.html')) {
                // Si estamos en la página de listado de usuarios
                const userId = new URLSearchParams(window.location.search).get('userId');
                if (userId) {
                    fetchUserDetails(userId, authToken);
                } else {
                    console.error('No se proporcionó userId en la URL.');
                }
            }
        }
    } catch (error) {
        console.error('Error inicializando la página:', error);
    }
});

/**
 * Realiza una solicitud a la API para obtener los datos de los usuarios.
 * @param {string} authToken - Token de autenticación del usuario.
 */
async function fetchUsers(authToken) {
    const apiUrl = `${urlBaseEndpoint}api/v1/users/`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await handleResponse(response);
        renderUsers(data.results);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
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

async function fetchUserDetails(userId, authToken) {
    const apiUrl = `${urlBaseEndpoint}api/v1/users/${userId}/`;
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const userDetails = await response.json();
        fillUserForm(userDetails);
    } catch (error) {
        console.error('Error al obtener los detalles del usuario:', error);
    }
}

function fillUserForm(user) {
    // Actualiza los campos del formulario con la información del usuario
    document.getElementById('user-email').value = user.email;
    document.getElementById('username').value = user.username;
    document.getElementById('first-name').value = user.first_name;
    document.getElementById('last-name').value = user.last_name;
    document.getElementById('is-active').checked = user.is_active;
    document.getElementById('is-staff').checked = user.is_staff;

    // Actualiza la fecha y hora de último inicio de sesión si está disponible
    if (user.last_login) {
        const lastLoginDate = new Date(user.last_login);
        document.getElementById('last-login').value = lastLoginDate.toISOString().slice(0, -1);
    }

    // Actualiza las iniciales en el avatar del usuario
    updateProfileIcon(user.first_name, user.last_name);
}

function updateProfileIcon(firstName, lastName) {
    // Obtiene las iniciales del nombre y apellido
    const initials = `${firstName[0]}${lastName[0]}`;
    const userAbbrElement = document.querySelector('.user-abbr');

    // Actualiza el contenido del elemento h5 con las iniciales
    if (userAbbrElement) {
        userAbbrElement.textContent = initials.toUpperCase();
    } else {
        console.error('No se encontró el elemento para las iniciales del usuario.');
    }
}

/**
 * Activa la pestaña de usuarios si la URL actual es /user.html.
 */
function activateUsersTab() {
    if (window.location.pathname.endsWith('/user.html')) {
        const sidebarTabPanes = document.querySelectorAll('aside.sidebar > .tab-content > .tab-pane.fade');
        sidebarTabPanes.forEach(pane => pane.classList.remove('show', 'active'));
        const usersTabPane = document.querySelector('#tab-content-users');
        usersTabPane?.classList.add('show', 'active');
    }
}