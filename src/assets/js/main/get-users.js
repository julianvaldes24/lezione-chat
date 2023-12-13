import { urlBaseEndpoint } from './vars.js';

document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();
});

function fetchUsers() {
    const apiUrl = `${urlBaseEndpoint}api/v1/users/`;

    fetch(apiUrl)
        .then(response => {
            // Verifica si la respuesta es exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json(); // Convierte la respuesta en JSON
        })
        .then(data => {
            console.log('Usuarios:', data);
            renderUsers(data);
             // Maneja los datos de los usuarios
            // Aquí puedes hacer algo con los datos de los usuarios, como mostrarlos en la interfaz de usuario
        })
        .catch(error => {
            console.error('Error al obtener usuarios:', error); // Maneja cualquier error que ocurra durante la solicitud o el procesamiento de la respuesta
        });
        
}


function renderUsers(users) {
    let allUsers = users.results;
    //let userAbbr = users.name.split(' ').map(palabra => palabra[0]).join('');
    let divToAdd = document.getElementById('list-all-users');
    allUsers.forEach(user => {
        divToAdd.innerHTML += `
            <div class="card border-0">
                <div class="card-body">
            
                    <div class="row align-items-center gx-5">
                        <div class="col-auto">
                            <a href="#" class="avatar">
                                <span class="avatar-text">N/A</span>
                            </a>
                        </div>
            
                        <div class="col">
                            <h5><a href="#">${user.email}</a></h5>
                            <p>${user.email}</p>
                        </div>
            
                        <div class="col-auto">
                            <!-- Dropdown -->
                            <div class="dropdown">
                                <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="../../assets/img/icons/dropdown.png" class="user-dropdown-icon">
                                </a>
            
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/user_form.html">Edit contact</a>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#">Delete user</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
            
                    </div>
            
                </div>
            </div>
        `;
    });
}

