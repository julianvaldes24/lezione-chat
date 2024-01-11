import Chart from 'chart.js/auto';
import {urlBaseEndpoint} from './vars.js';
import {checkAuthToken} from './common.js';

// Evento que se dispara cuando el contenido del DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const authToken = await checkAuthToken();
        if (authToken) {
            activateUsersTab();
        }
        const apiUrl = `${urlBaseEndpoint}api/v1/stats/`;


        fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })


            .then(data => {
                // Aquí actualizas tu DOM con los datos obtenidos
                document.querySelector('#generalTotalCost').textContent = `${data.total_cost}`;
                document.querySelector('#generalTotalConversations').textContent = `${data.total_conversations}`;
                document.querySelector('#generalTotalMessages').textContent = `${data.total_messages}`;
                const totalRatings = data.total_rating;

                // Asegúrate de que tienes un elemento en tu HTML para cada valoración de estrellas
                totalRatings.forEach(rating => {
                    const ratingElement = document.getElementById(`generalStarRating${rating.rating}`);
                    if (ratingElement) {
                        // Puedes personalizar este HTML para que coincida con tu diseño
                        ratingElement.innerHTML = `
                    <h5>${rating.rating == 0 ? 'Sin calificar' : (rating.rating + ' Star')}</h5>
                    <p>${rating.total}</p>
                `;
                    }
                });
                // Mostrar en consola los datos de 'total_rating'
                console.log('Total Rating:');
                data.total_rating.forEach(rating => {
                    console.log(`${rating.rating} star: ${rating.total}`);
                });


                // Procesa los datos para la gráfica
                const labels = data.total_cost_per_day.map(item => item.date);
                const dataPoints = data.total_cost_per_day.map(item => item.total);

                // Configuración de la gráfica de Chart.js
                const ctx = document.getElementById('generalConsumptionDaysChart').getContext('2d');
                const generalConsumptionDaysChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Consumo ($)',
                            data: dataPoints,
                            fill: false,
                            borderColor: 'rgb(75, 192, 235)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Consumo (Dinero) por Día'
                            }
                        }
                    }
                });

                // Datos para la gráfica de conversaciones por día
                const labelsConversationsDay = data.total_conversations_per_day.map(item => item.date);
                const dataPointsConversationsDay = data.total_conversations_per_day.map(item => item.total);

                // Configuración de la gráfica de Chart.js para conversaciones por día
                const ctxConversationsDay = document.getElementById('generalRepoConversationsChart').getContext('2d');
                const generalRepoConversationsChart = new Chart(ctxConversationsDay, {
                    type: 'line',
                    data: {
                        labels: labelsConversationsDay,
                        datasets: [{
                            label: 'Conversaciones por Día',
                            data: dataPointsConversationsDay,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Conversaciones por Día'
                            }
                        }
                    }
                });

                // Datos para la gráfica de mensajes por día
                const labelsMessagesDay = data.total_messages_per_day.map(item => item.date);
                const dataPointsMessagesDay = data.total_messages_per_day.map(item => item.total);

                // Configuración de la gráfica de Chart.js para mensajes por día
                const ctxMessagesDay = document.getElementById('generalRepoMessagesChart').getContext('2d');
                const generalRepoMessagesChart = new Chart(ctxMessagesDay, {
                    type: 'line',
                    data: {
                        labels: labelsMessagesDay,
                        datasets: [{
                            label: 'Mensajes por Día',
                            data: dataPointsMessagesDay,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Mensajes por Día'
                            }
                        }
                    }
                });




                const generalUserConsumptionList = document.getElementById('generalUserConsumptionList');
                generalUserConsumptionList.innerHTML = ''; // Limpia el contenedor antes de agregar nuevos elementos

                // Asumiendo que tienes un total máximo de consumo para establecer la barra de progreso
                const generalMaxConsumption = Math.max(...data.total_cost_per_user.map(u => u.total));

                data.total_cost_per_user.forEach(user => {
                    const percentage = (user.total / generalMaxConsumption) * 100; // Calcula el porcentaje del total
                    const userElement = document.createElement('div');
                    userElement.classList.add('user-consumption');
                    userElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="user-initial bg-primary">${user.name[0]}</div>
                    <span>${user.name}</span>
                    <span>${user.total.toFixed(2)}</span> <!-- Formatea el número a dos decimales -->
                    <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                `;
                    generalUserConsumptionList.appendChild(userElement); // Añade el elemento al contenedor
                });

                const generalConversationsPerRepoList = document.getElementById('generalConversationsPerRepoList');
                generalConversationsPerRepoList.innerHTML = ''; // Limpia el contenedor

                data.total_conversations_per_repo.forEach(repo => {
                    const repoElement = document.createElement('div');
                    repoElement.classList.add('repo-conversations');
                    repoElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="repo-name">${repo.repo}</span>
                    <span class="repo-total">${repo.total}</span>
                    </div>
                `;
                    generalConversationsPerRepoList.appendChild(repoElement); // Añade el elemento al contenedor
                });

                const generalMessagesPerRepoList = document.getElementById('generalMessagesPerRepoList');
                generalMessagesPerRepoList.innerHTML = ''; // Limpia el contenedor

                data.total_messages_per_repo.forEach(repo => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('repo-messages');
                    messageElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="repo-name">${repo.repo}</span>
                <span class="repo-total">${repo.total}</span>
                </div>
            `;
                    generalMessagesPerRepoList.appendChild(messageElement); // Añade el elemento al contenedor
                });

                const generalSelectElement = document.getElementById('generalSelectOptions');
                // Función para manejar el cambio de selección
                function handleSelectChange() {
                    // Obtén los datos de la API y actualiza la vista según la opción seleccionada
                    // Aquí podrías usar la respuesta de la API para actualizar la vista
                    const generalSelectedOption = generalSelectElement.value;
                    // Oculta todos los contenedores
                    generalUserConsumptionList.style.display = 'none';
                    generalConversationsPerRepoList.style.display = 'none';
                    generalMessagesPerRepoList.style.display = 'none';

                    // Determina cuál contenedor mostrar basado en la opción seleccionada
                    if (generalSelectedOption === 'dinero') {
                        generalUserConsumptionList.style.display = 'block';
                        // ... Actualiza generalUserConsumptionList con datos de la API ...
                    } else if (generalSelectedOption === 'conversaciones') {
                        generalConversationsPerRepoList.style.display = 'block';
                        // ... Actualiza conversationsPerRepoList con datos de la API ...
                    } else if (generalSelectedOption === 'mensajes') {
                        messagesPerRepoList.style.display = 'block';
                        // ... Actualiza messagesPerRepoList con datos de la API ...
                    }
                }

                // Event listener para el cambio de selección
                selectElement.addEventListener('change', handleSelectChange);

                // Llama a la función de manejo al cargar para establecer la vista inicial
                handleSelectChange();


                const generalSelectElement2 = document.getElementById('generalSelectedValue');
                const generalUserSpendingDiv = document.getElementById('generalUserSpendingDiv');
                const generalRepoConversationsDiv = document.getElementById('generalRepoConversationsDiv');
                const generalRepoMessagesDiv = document.getElementById('generalRepoMessagesDiv');

                generalSelectElement2.addEventListener('change', function () {
                    // Ocultar todos los contenedores
                    generalUserSpendingDiv.style.display = 'none';
                    generalRepoConversationsDiv.style.display = 'none';
                    generalRepoMessagesDiv.style.display = 'none';

                    // Mostrar el contenedor correspondiente al valor seleccionado
                    const generalSelectedValue = generalSelectElement2.value;
                    switch (generalSelectedValue) {
                        case 'userSpending':
                            generalUserSpendingDiv.style.display = 'block';
                            break;
                        case 'repoConversations':
                            generalRepoConversationsDiv.style.display = 'block';
                            break;
                        case 'repoMessages':
                            generalRepoMessagesDiv.style.display = 'block';
                            break;
                    }
                });

            })
    } catch (error) {
        console.error('Error:', error);
    }
});
/**
 * Activa la pestaña de usuarios si la URL actual es /user.html.
 */
function activateUsersTab() {
    if (window.location.pathname.endsWith('/consumption.html')) {
        const sidebarTabPanes = document.querySelectorAll('aside.sidebar > .tab-content > .tab-pane.fade');
        sidebarTabPanes.forEach(pane => pane.classList.remove('show', 'active'));
        const usersTabPane = document.querySelector('#tab-content-support');
        usersTabPane?.classList.add('show', 'active');
    }
}