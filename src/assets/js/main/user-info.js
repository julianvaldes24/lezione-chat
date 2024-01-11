//imports
import UAParser from 'ua-parser-js';
import {logout} from './common.js';

//Exports
export {loadUserInfo};

//Carga del sitio
document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('name');
    const mail = localStorage.getItem('email');
    const parser = new UAParser();
    const result = parser.getResult();
    const sistemaOperativo = result.os.name;
    const isStaff = localStorage.getItem('isStaff');

    console.log(isStaff);

    createUsersSection(isStaff);
    loadUserInfo(username, mail);
    profileIcon(username);
    profileSettings(username, mail)
    localSystemInfo(getBrowser(), sistemaOperativo, formatDate());
    document.getElementById("logout-icon").addEventListener("click", logout);
});

//Se agrega la informacion del usuario
function loadUserInfo(username, mail){
    document.getElementById("user-info").innerHTML = `
        <h5>${username}</h5>
        <p>${mail}</p>
    `;
}

function profileIcon(username){
    let iniciales = username.split(' ').map(palabra => palabra[0]).join('');
    document.getElementById("profileIcon").innerHTML = `
        <h5>${iniciales}</h5>
    `;
}

//Se agrega la informacion del usuario para ser editada
function profileSettings(username, mail){
    document.getElementById("profile-name").value = username;
    document.getElementById("profile-email").value = mail;
}


//Se obtiene el navegador
function getBrowser() {
    const userAgent = navigator.userAgent;
  
    // Navegadores basados en Chromium (incluido Google Chrome)
    if (userAgent.match(/chrome|chromium|crios/i)) {
      return "Chrome";
    } // Firefox
    else if (userAgent.match(/firefox|fxios/i)) {
      return "Firefox";
    } // Safari
    else if (userAgent.match(/safari/i)) {
      return "Safari";
    } // Opera
    else if (userAgent.match(/opera|opr/i)) {
      return "Opera";
    } // Edge
    else if (userAgent.match(/edg/i)) {
      return "Edge";
    } // Internet Explorer
    else if (userAgent.match(/msie|trident/i)) {
      return "Internet Explorer";
    } // No reconocido
    else {
      return "Unrecognized";
    }
}

//Se agrega la informacion del sistema local
function localSystemInfo(browser, sistemaOperativo, fecha){
    document.getElementById("local-system-info").innerHTML = `
        <h5>${sistemaOperativo}</h5>
        <p>${fecha} ⋅ Browser: ${browser}</p>
    `;
}

//Se obtiene la fecha y hora actual
function formatDate() {
    let ahora = new Date();
    // Array de los meses
    let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    // Formatear la fecha
    let fechaFormateada = ahora.getDate() + " de " + meses[ahora.getMonth()];


    // Obtener horas, minutos y AM/PM
    let horas = ahora.getHours();
    let minutos = ahora.getMinutes();
    let ampm = horas >= 12 ? 'PM' : 'AM';
    // Convertir a formato de 12 horas
    horas = horas % 12;
    horas = horas ? horas : 12; // La hora '0' debe ser '12'
    minutos = minutos < 10 ? '0'+minutos : minutos;
    let horaFormateada = horas + ':' + minutos + ' ' + ampm;

    let formateada = fechaFormateada + " a las " + horaFormateada;

    return formateada;
}

function createUsersSection(isStaff){
    if (isStaff == "true") {
        document.getElementById("users-section").style.display = "block";
        document.getElementById("consumption-section").style.display = "block";
    }else{
        document.getElementById("users-section").style.display = "none";
        document.getElementById("consumption-section").style.display = "none";
    }
}