import Chart from 'chart.js/auto';

// Asegúrate de que este script se ejecute después de que la página se haya cargado completamente
document.addEventListener('DOMContentLoaded', () => {
    const ctxBar = document.getElementById('barChartConsumoRepo').getContext('2d');
    const barChartConsumoRepo = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['SaaS-ms-users', 'SaaS-ms-Stock', '...'],
            datasets: [{
                label: 'Consumo Repo',
                data: [25000, 58000, '...'], // Tus datos aquí
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // ... Repite para otros gráficos ...
});
