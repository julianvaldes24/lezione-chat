// Importación de la URL base de la API desde otro módulo
import {urlBaseEndpoint} from './vars.js';
import {checkAuthToken} from './common.js';


export async function getClassRequest(id) {
    return await fetchClassRequest({id});
}

export async function getListClassRequest() {
    return await fetchClassRequest();
}

export async function createClassRequest(payload) {
    return await fetchClassRequest({payload});
}

/**
 * Obtiene la lista de clases.
 * @param {Object} params (Opcional) El ID de la clase a obtener.
 * @returns {Promise<Array>} Promesa con los datos de la lista de clases o la clase específica.
 */
async function fetchClassRequest(params = {}) {
    const {id, payload} = params;
    try {
        const authToken = await checkAuthToken();
        let url = urlBaseEndpoint + 'api/v1/classes/';
        let authorization = 'Bearer ' + authToken;  // Corregí la ortografía de "autorization" a "authorization"
        let headers = {  // Cambié 'let headers:' a 'let headers ='
            "Content-Type": "application/json",
            "Authorization": authorization
        };

        let response; // Declarar response fuera del if para que esté en el scope adecuado

        if (payload) {
            response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)  // Asumiendo que quieres enviar 'payload' como el cuerpo de la solicitud
            });
        } else {
            if (id) {
                url += id + '/';
            }

            response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
        }

        if (!response.ok) {
            throw new Error('Error al obtener la clase' + (id ? ' con ID ' + id : '') + ': ' + response.statusText);
        }

        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener la clase' + (id ? ' con ID ' + id : '') + ': ' + error.message);
    }
}


export async function getAreaOfKnowledgeRequest(id) {
    return await fetchAreaOfKnowledgeRequest(id);
}

export async function getListAreaOfKnowledgeRequest() {
    return await fetchAreaOfKnowledgeRequest();
}


/**
 * Obtiene la lista de áreas de conocimiento.
 * @param {string} id (Opcional) El ID de la area a obtener.
 * @returns {Promise<Array>} Promesa con los datos de la lista de areas o la area específica.
 */
async function fetchAreaOfKnowledgeRequest(id) {
    try {
        const authToken = await checkAuthToken();
        let url = urlBaseEndpoint + 'api/v1/areas-of-knowledge/';
        if (id) {
            url += id + '/';
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el Area de Conocimiento' + (id ? ' con ID ' + id : '') + ': ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener la Area de Conocimiento' + (id ? ' con ID ' + id : '') + ': ' + error.message);
    }
}

export async function getSubjectRequest(id) {
    return await fetchSubjectRequest({id});
}

export async function getListSubjectRequest(area_of_knowledge_id) {
    if (area_of_knowledge_id) {
        return await fetchSubjectRequest({area_of_knowledge_id});
    }
    return await fetchSubjectRequest({});
}

/**
 * Obtiene la lista de asignaturas o una asignatura específica según los filtros proporcionados.
 * @param {Object} params - Objeto que puede contener id y area_of_knowledge_id como filtros.
 * @returns {Promise<Array>} Promesa con los datos de la lista de asignaturas o la asignatura específica.
 */
async function fetchSubjectRequest(params = {}) {
    const {id, area_of_knowledge_id} = params;
    try {
        const authToken = await checkAuthToken();
        let url = urlBaseEndpoint + 'api/v1/subjects/';
        if (id) {
            url += `${id}/`;
        } else if (area_of_knowledge_id) {
            url += `?area_of_knowledge_id=${area_of_knowledge_id}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las asignaturas: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener las asignaturas: ' + error.message);
    }
}

export async function getGradeLevelRequest(id) {
    return await fetchGradeLevelRequest({id});
}

export async function getListGradeLevelRequest() {
    return await fetchGradeLevelRequest({});
}

/**
 * Obtiene la lista de grados o una grado específico según los filtros proporcionados.
 * @param {Object} params - Objeto que puede contener id como filtros.
 * @returns {Promise<Array>} Promesa con los datos de la lista de grados o grado específico.
 */
async function fetchGradeLevelRequest(params = {}) {
    const {id} = params;
    try {
        const authToken = await checkAuthToken();
        let url = urlBaseEndpoint + 'api/v1/grades-levels/';
        if (id) {
            url += `${id}/`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los grados: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener los grados: ' + error.message);
    }
}

export async function getApproachRequest(id) {
    return await fetchApproachRequest({id});
}

export async function getListApproachRequest() {
    return await fetchApproachRequest({});
}

/**
 * Obtiene la lista de enfoque pedagogicos o una grado específico según los filtros proporcionados.
 * @param {Object} params - Objeto que puede contener id como filtros.
 * @returns {Promise<Array>} Promesa con los datos de la lista de enfoque pedagogicos o grado específico.
 */
async function fetchApproachRequest(params = {}) {
    const {id} = params;
    try {
        const authToken = await checkAuthToken();
        let url = urlBaseEndpoint + 'api/v1/approaches/';
        if (id) {
            url += `${id}/`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los enfoque pedagogicos: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener los enfoque pedagogicos: ' + error.message);
    }
}


