// imports.js
import { urlBaseEndpoint } from './vars.js';
import { showLoader } from './common.js';
import { storeLoginDetails } from './common.js';

// login.js
document.addEventListener('DOMContentLoaded', initLoginForm);

/**
 * Inicializa el formulario de inicio de sesión.
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

/**
 * Maneja el envío del formulario de inicio de sesión.
 * @param {Event} e - Evento de envío del formulario.
 */
async function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!validateLoginInput(email, password)) {
        alert('Por favor, ingrese tanto el email como la contraseña.');
        return;
    }

    try {
        const data = await attemptLogin(email, password);
        processLoginResponse(data);
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        alert('Ocurrió un error al intentar iniciar sesión.');
    }
}

/**
 * Valida las entradas del formulario de inicio de sesión.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {boolean} Verdadero si las entradas son válidas.
 */
function validateLoginInput(email, password) {
    return email && password;
}

/**
 * Intenta iniciar sesión con las credenciales proporcionadas.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} Datos de respuesta del intento de inicio de sesión.
 */
async function attemptLogin(email, password) {
    const response = await fetch(urlBaseEndpoint + 'api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}

/**
 * Procesa la respuesta del intento de inicio de sesión.
 * @param {Object} data - Datos de respuesta del intento de inicio de sesión.
 */
function processLoginResponse(data) {
    if (data.access) {
        storeLoginDetails(data);
        showLoader();
        window.location.href = '/index.html';
    } else {
        alert('Credenciales incorrectas. Intente de nuevo.');
    }
}
