document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversationId');
    if (!conversationId) {
        console.error('No se encontró el ID de la conversación.');
        return;
    }

    const apiUrl = `http://54.242.3.57:8000/api/v1/conversation/${conversationId}/message/`;
    const authToken = localStorage.getItem('accessToken');

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Redirigir al inicio de sesión si la respuesta es 401
                    window.location.href = '/signin.html';
                } else {
                    throw new Error('Error en la solicitud: ' + response.statusText);
                }
            }
            return response.json();
        })
        .then(data => {
            renderChatMessages(data);
        })
        .catch(error => console.error('Error:', error));
});

function renderChatMessages(data) {
    const chatBody = document.querySelector('.chat-body-inner');
    // Invertimos el arreglo de mensajes antes de iterar sobre él
    data.results.slice().reverse().forEach(message => {
        let messageElement = createMessageElement(message);
        chatBody.appendChild(messageElement);
    });
}

function createMessageElement(message) {
    let messageDiv = document.createElement('div');
    messageDiv.className = message.sender === 'AI' ? 'message message-out' : 'message';
    messageDiv.innerHTML = `
        <a href="#" data-bs-toggle="modal" data-bs-target="#modal-user-profile" class="avatar avatar-responsive">
            <img class="avatar-img" src="assets/img/avatars/omnissiah_icon.png" alt="">
        </a>
        <div class="message-inner">
            <div class="message-body">
                <div class="message-content">
                    <div class="message-text">
                        <p>${message.text}</p>
                    </div>
                </div>
            </div>
            <div class="message-footer">
                <span class="extra-small text-muted">08:45 PM</span>
            </div>
        </div>`;
    return messageDiv;
}
