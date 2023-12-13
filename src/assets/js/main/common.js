// common.js

// Importaciones necesarias para MarkdownIt y highlight.js
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import markdownItHighlightjs from 'markdown-it-highlightjs';

// Importaciones de Variables
import {urlBaseEndpoint} from './vars.js';


/**
 * Obtiene el elemento del loader de la página.
 * @returns {HTMLElement|null} El elemento del loader o null si no se encuentra.
 */
function getLoaderElement() {
    return document.getElementById('loader');
}

/**
 * Oculta el loader añadiendo la clase 'd-none'.
 * Esta función se utiliza para ocultar el elemento del loader cuando ya no es necesario.
 */
function hideLoader() {
    const loader = getLoaderElement();
    if (loader) {
        loader.classList.add('d-none');
    }
}

/**
 * Muestra el loader quitando la clase 'd-none'.
 * Esta función se utiliza para mostrar el elemento del loader durante operaciones que requieren tiempo, como la carga de datos.
 */
function showLoader() {
    const loader = getLoaderElement();
    if (loader) {
        loader.classList.remove('d-none');
    }
}

/**
 * Redirige al usuario a la página de inicio de sesión.
 * Esta función se utiliza para redirigir al usuario al inicio de sesión si no está autenticado o si se requiere autenticación para acceder a una página.
 */
function redirectToLogin() {
    const loginPage = '/signin.html';
    if (window.location.pathname !== loginPage) {
        window.location.href = loginPage;
    }
}

/**
 * Verifica la existencia del token de autenticación, su validez, y lo refresca si está próximo a vencer.
 * @returns {Promise<string | null>} El token de autenticación si está presente y válido, o null si no lo está.
 */
async function checkAuthToken() {
    const authToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiration = localStorage.getItem('exp');

    // Verifica si el token y la fecha de expiración están presentes
    if (!authToken || !expiration || !refreshToken) {
        redirectToLogin();
        return null;
    }

    // Convierte la fecha y hora de expiración a un objeto Date
    const expirationDate = new Date(expiration);
    const currentDate = new Date();

    // Calcula la diferencia en horas
    const hoursToExpire = (expirationDate - currentDate) / (1000 * 60 * 60);

    // Si el token está a menos de 1 hora de vencer, intenta refrescarlo
    if (hoursToExpire <= 1) {
        return await refreshAuthToken(refreshToken);
    }

    return authToken;
}

/**
 * Intenta refrescar el token de autenticación.
 * @param {string} refreshToken - El token de refresco.
 * @returns {Promise<string | null>} El nuevo token de autenticación o null si falla el refresco.
 */
async function refreshAuthToken(refreshToken) {
    try {
        const response = await fetch(urlBaseEndpoint + 'api/token/refresh/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh: refreshToken})
        });

        if (!response.ok) {
            throw new Error('No se pudo refrescar el token');
        }

        const data = await response.json();
        storeLoginDetails(data);
        return data.access;
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        redirectToLogin();
        return null;
    }
}

/**
 * Inicializa una instancia de MarkdownIt.
 *
 * MarkdownIt es una biblioteca para convertir texto Markdown en HTML. Esta configuración
 * incluye una función de resaltado personalizada para manejar bloques de código.
 *
 * La función de resaltado utiliza `highlight.js` para resaltar la sintaxis del código.
 * Si el lenguaje especificado en el bloque de código es soportado por highlight.js,
 * se utiliza para resaltar el código. De lo contrario, el código se escapa para evitar
 * la interpretación de cualquier HTML o JavaScript potencialmente peligroso.
 */
const md = new MarkdownIt({
    highlight: function (str, lang) {
        // Verifica si el lenguaje especificado es soportado por highlight.js
        if (lang && hljs.getLanguage(lang)) {
            try {
                // Intenta resaltar la sintaxis del código con highlight.js
                return `<pre class="hljs"><code>${hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true
                }).value}</code></pre>`;
            } catch (_) {
                // En caso de error, simplemente se retorna el código sin resaltar
            }
        }
        // Si no hay un lenguaje especificado o si highlight.js no lo soporta,
        // escapa el código y lo presenta sin resaltar
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
}).use(markdownItHighlightjs);

/**
 * Almacena los detalles del usuario en localStorage.
 * @param {Object} data - Datos de respuesta del intento de inicio de sesión.
 */
function storeLoginDetails(data) {
    // Extrae y decodifica el payload del token de acceso
    const base64Payload = data.access.split('.')[1];
    const payload = JSON.parse(window.atob(base64Payload));

    // Almacena el token de acceso y los detalles del usuario
    localStorage.setItem('accessToken', data.access);
    if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
    }
    localStorage.setItem('name', payload.name);
    localStorage.setItem('email', payload.email);
    localStorage.setItem('userId', payload.user_id);
    localStorage.setItem('isStaff', payload.is_staff);

    // Convierte el tiempo de expiración a una fecha legible y guárdala
    localStorage.setItem('exp', new Date(payload.exp * 1000).toLocaleString());
}


// Exportaciones nombradas de las funciones para su uso en otros módulos.
export {hideLoader, showLoader, redirectToLogin, checkAuthToken, md, storeLoginDetails};
