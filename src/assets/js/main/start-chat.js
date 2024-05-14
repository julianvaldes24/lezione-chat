// Importación de la URL base de la API desde otro módulo
import {urlBaseEndpoint} from './vars.js';
import {showLoader, removeAllOptions, checkAuthToken, updateTextareaWithSelectedOptions, hideLoader} from './common.js';
import {
    getListAreaOfKnowledgeRequest,
    getListSubjectRequest,
    getListGradeLevelRequest,
    getListApproachRequest,
    createClassRequest
} from './api.js';

let selectAreaOfKnowledge
let selectSubject
let selectGrade
let selectApproach
let inputSession
let inputDuration
let inputDurationUnit
let textareaTheme
let textareaObjective
let textareaObjectiveSpecific
let selectLocation
let textareaLocation
let selectMaterial
let textareaMaterial
let selectProvider
let formNewClass
let createClassButton


// Se ejecuta cuando se carga el contenido del DOM
document.addEventListener('DOMContentLoaded', initChatForm);

/**
 * Inicializa el formulario de chat y configura los manejadores de eventos.
 */
function initChatForm() {
    getElements();
    addEventListeners();
    fetchAreaOfKnowledge();
    fetchGradeLevel();
    fetchApproach();
    setupRangeInputs();
}

function getElements() {
    formNewClass = document.getElementById('formNewClassId');
    createClassButton = document.getElementById('createClassButtonId');
    selectAreaOfKnowledge = document.getElementById('selectAreaOfKnowledgeId');
    selectSubject = document.getElementById('selectSubjectId');
    selectGrade = document.getElementById('selectGradeId');
    selectApproach = document.getElementById('selectApproachId');
    inputDuration = document.getElementById('inputDurationId');
    inputSession = document.getElementById('inputSessionId');
    textareaTheme = document.getElementById('textareaThemeId');
    textareaObjective = document.getElementById('textareaObjectiveId');
    textareaObjectiveSpecific = document.getElementById('textareaObjectiveSpecificId');
    textareaLocation = document.getElementById('textareaLocationId');
    selectLocation = document.getElementById('selectLocationId');
    textareaMaterial = document.getElementById('textareaMaterialId');
    selectMaterial = document.getElementById('selectMaterialId');
    inputDurationUnit = document.getElementById('inputDurationUnitId');
    selectProvider = document.getElementById('selectProviderId');
}

function addEventListeners() {
    selectAreaOfKnowledge.addEventListener('change', handleAreaOfKnowledgeChange);
    selectLocation.addEventListener('change', function () {
        updateTextareaWithSelectedOptions(selectLocation, textareaLocation);
    });
    selectMaterial.addEventListener('change', function () {
        updateTextareaWithSelectedOptions(selectMaterial, textareaMaterial);
    });
    createClassButton.addEventListener('click', submitForm);
    formNewClass.addEventListener('submit', handleFormSubmit);
}

function handleAreaOfKnowledgeChange() {
    const areaOfKnowledgeId = selectAreaOfKnowledge.value;
    selectSubject.value = '';
    console.log('Area de Conocimiento seleccionada:', areaOfKnowledgeId);
    fetchSubject(areaOfKnowledgeId);
}

async function fetchAreaOfKnowledge() {
    getListAreaOfKnowledgeRequest()
        .then(data => {
            console.log('Lista de Areas de Conocimientos obtenida correctamente:', data);
            renderAreaOfKnowledge(data);
        })
        .catch(error => {
            console.error('Error al obtener la lista de Areas de Conocimientos:', error.message);
        });
}

async function fetchSubject(areaOfKnowledgeId) {
    getListSubjectRequest(areaOfKnowledgeId)
        .then(data => {
            console.log('Lista de Asignaturas obtenidas correctamente:', data);
            renderSubject(data);
        })
        .catch(error => {
            console.error('Error al obtener la lista de Asignaturas:', error.message);
        });
}

async function fetchGradeLevel() {
    getListGradeLevelRequest()
        .then(data => {
            console.log('Lista de Grados obtenida correctamente:', data);
            renderGradeLevel(data);
        })
        .catch(error => {
            console.error('Error al obtener la lista de Grados:', error.message);
        });
}

async function fetchApproach() {
    getListApproachRequest()
        .then(data => {
            console.log('Lista de Enfoques obtenida correctamente:', data);
            renderApproach(data);
        })
        .catch(error => {
            console.error('Error al obtener la lista de Enfoques:', error.message);
        });
}

function renderAreaOfKnowledge(data) {
    const select = document.getElementById('selectAreaOfKnowledgeId');
    data.results.forEach(area => {
        const option = document.createElement('option');
        option.value = area.id;
        option.textContent = area.name;
        select.appendChild(option);
    });
    fetchSubject();
}

function renderSubject(data) {
    removeAllOptions(selectSubject)
    data.results.forEach(area => {
        const option = document.createElement('option');
        option.value = area.id;
        option.textContent = area.name;
        selectSubject.appendChild(option);
    });
}

function renderGradeLevel(data) {
    removeAllOptions(selectGrade)
    data.results.forEach(area => {
        const option = document.createElement('option');
        option.value = area.id;
        option.textContent = area.name;
        selectGrade.appendChild(option);
    });
}

function renderApproach(data) {
    removeAllOptions(selectApproach)
    data.results.forEach(area => {
        const option = document.createElement('option');
        option.value = area.id;
        option.textContent = area.name;
        selectApproach.appendChild(option);
    });

}

function setupRangeInputs() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');

    rangeInputs.forEach(input => {
        const inputId = input.id;
        const label = document.querySelector(`label[for="${inputId}"]`);
        const valueDisplay = label.querySelector('span');

        function updateValueDisplay() {
            valueDisplay.textContent = input.value;
        }

        input.addEventListener('input', updateValueDisplay);
        updateValueDisplay();
    });
}


/**
 * Envía el formulario de chat.
 */
function submitForm() {
    formNewClass.dispatchEvent(new Event('submit', {cancelable: true}));
    showLoader();
}

/**
 * Maneja el envío del formulario de chat.
 * @param {Event} e - El evento de envío del formulario.
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    let response = await createClassRequest(buildClassPayload());
    console.log('Clase creada correctamente' + response);
    hideLoader();
    window.location.href = `chat.html?classId=${response.id}`;
}

/**
 * Construye el payload para la solicitud de chat.
 * @returns {Object} El payload para la solicitud.
 */
function buildClassPayload() {
    return {
        "disability_or_health_info": "",
        "duration_amount": inputDuration.value,
        "duration_unit": inputDurationUnit.value,
        "is_active": true,
        "location": textareaLocation.value,
        "materials": textareaMaterial.value,
        "name": textareaTheme.value,
        "number_sessions": inputSession.value,
        "object": textareaObjective.value,
        "objects_specific": textareaObjectiveSpecific.value,
        "approach_id": selectApproach.value,
        "grade_level_id": selectGrade.value,
        "subject_id": selectSubject.value,
        "area_of_knowledge_id": selectAreaOfKnowledge.value,
        "provider_ia": selectProvider.value
    }
}