document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://54.242.3.57:8000/api/v1/conversation/';
    const authToken = localStorage.getItem('accessToken');

    if (!authToken) {
        console.error('No se encontró el token de autenticación.');
        return;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        }
    })
        .then(response => response.json())
        .then(data => {
            updateUI(data);
        })
        .catch(error => console.error('Error:', error));
});

function updateUI(data) {
    let chatsContainer = document.querySelector('#tab-content-chats .card-list'); // Seleccionamos el contenedor correcto
    chatsContainer.innerHTML = ''; // Limpia el contenedor antes de añadir nuevos chats

    data.results.forEach(conversation => {
        let chatCard = createChatCard(conversation);
        chatsContainer.appendChild(chatCard);
    });
}

function createChatCard(conversation) {
    let card = document.createElement('a');
    card.href = `chat-direct.html?conversationId=${conversation.conversation_id}`;
    card.className = "card border-0 text-reset";

    card.innerHTML = `
        <div class="card-body">
            <div class="row gx-5">
                <div class="col">
                    <div class="d-flex align-items-center">
                        <h5 class="me-auto mb-0">${conversation.title}</h5>
                        <span class="text-muted extra-small ms-2">${formatDate(conversation.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>`;

    return card;
}

function formatDate(dateString) {
    let date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
