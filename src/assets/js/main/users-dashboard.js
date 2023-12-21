import Chart from 'chart.js/auto';
import { urlBaseEndpoint } from './vars.js';
import { checkAuthToken } from './common.js';


// Asegúrate de que este script se ejecute después de que la página se haya cargado completamente
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const authToken = await checkAuthToken();
        const userId = new URLSearchParams(window.location.search).get('userId');
        const apiUrl = `${urlBaseEndpoint}api/v1/stats/${userId}/`;


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
                document.querySelector('#totalCost').textContent = `${data.total_cost}`;
                document.querySelector('#totalConversations').textContent = `${data.total_conversations}`;
                document.querySelector('#totalMessages').textContent = `${data.total_messages}`;
                const totalRatings = data.total_rating;

                // Asegúrate de que tienes un elemento en tu HTML para cada valoración de estrellas
                totalRatings.forEach(rating => {
                    const ratingElement = document.getElementById(`starRating${rating.rating}`);
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
                const ctx = document.getElementById('consumoDiasChart').getContext('2d');
                const consumoDiasChart = new Chart(ctx, {
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

                const userConsumptionList = document.getElementById('userConsumptionList');
                userConsumptionList.innerHTML = ''; // Limpia el contenedor antes de agregar nuevos elementos

                // Asumiendo que tienes un total máximo de consumo para establecer la barra de progreso
                const maxConsumption = Math.max(...data.total_cost_per_user.map(u => u.total));

                data.total_cost_per_user.forEach(user => {
                    const percentage = (user.total / maxConsumption) * 100; // Calcula el porcentaje del total
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
                    userConsumptionList.appendChild(userElement); // Añade el elemento al contenedor
                });

                const conversationsPerRepoList = document.getElementById('conversationsPerRepoList');
                conversationsPerRepoList.innerHTML = ''; // Limpia el contenedor

                data.total_conversations_per_repo.forEach(repo => {
                    const repoElement = document.createElement('div');
                    repoElement.classList.add('repo-conversations');
                    repoElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="repo-name">${repo.repo}</span>
                    <span class="repo-total">${repo.total}</span>
                    </div>
                `;
                    conversationsPerRepoList.appendChild(repoElement); // Añade el elemento al contenedor
                });

                const messagesPerRepoList = document.getElementById('messagesPerRepoList');
                messagesPerRepoList.innerHTML = ''; // Limpia el contenedor

                data.total_messages_per_repo.forEach(repo => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('repo-messages');
                    messageElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="repo-name">${repo.repo}</span>
                <span class="repo-total">${repo.total}</span>
                </div>
            `;
                    messagesPerRepoList.appendChild(messageElement); // Añade el elemento al contenedor
                });

                const selectElement = document.getElementById('selectOptions');
                // Función para manejar el cambio de selección
                function handleSelectChange() {
                    // Obtén los datos de la API y actualiza la vista según la opción seleccionada
                    // Aquí podrías usar la respuesta de la API para actualizar la vista
                    const selectedOption = selectElement.value;
                    // Oculta todos los contenedores
                    userConsumptionList.style.display = 'none';
                    conversationsPerRepoList.style.display = 'none';
                    messagesPerRepoList.style.display = 'none';

                    // Determina cuál contenedor mostrar basado en la opción seleccionada
                    if (selectedOption === 'dinero') {
                        userConsumptionList.style.display = 'block';
                        // ... Actualiza userConsumptionList con datos de la API ...
                    } else if (selectedOption === 'conversaciones') {
                        conversationsPerRepoList.style.display = 'block';
                        // ... Actualiza conversationsPerRepoList con datos de la API ...
                    } else if (selectedOption === 'mensajes') {
                        messagesPerRepoList.style.display = 'block';
                        // ... Actualiza messagesPerRepoList con datos de la API ...
                    }
                }

                // Event listener para el cambio de selección
                selectElement.addEventListener('change', handleSelectChange);

                // Llama a la función de manejo al cargar para establecer la vista inicial
                handleSelectChange();


                const selectElement2 = document.getElementById('selectedValue');
                const userSpendingDiv = document.getElementById('userSpendingDiv');
                const repoConversationsDiv = document.getElementById('repoConversationsDiv');
                const repoMessagesDiv = document.getElementById('repoMessagesDiv');

                selectElement2.addEventListener('change', function () {
                    // Ocultar todos los contenedores
                    userSpendingDiv.style.display = 'none';
                    repoConversationsDiv.style.display = 'none';
                    repoMessagesDiv.style.display = 'none';

                    // Mostrar el contenedor correspondiente al valor seleccionado
                    const selectedValue = selectElement2.value;
                    switch (selectedValue) {
                        case 'userSpending':
                            userSpendingDiv.style.display = 'block';
                            break;
                        case 'repoConversations':
                            repoConversationsDiv.style.display = 'block';
                            break;
                        case 'repoMessages':
                            repoMessagesDiv.style.display = 'block';
                            break;
                    }
                });

            })
    } catch (error) {
        console.error('Error:', error);
    }
});
