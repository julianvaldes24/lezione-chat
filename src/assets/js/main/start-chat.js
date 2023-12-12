document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('new_question_id');
    const startChatButton = document.getElementById('start-chat-button');

    startChatButton.addEventListener('click', function () {
        // Disparar la acción de envío del formulario
        form.dispatchEvent(new Event('submit', { cancelable: true }));
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtener los valores del formulario
        const repo = document.getElementById('repo').value;
        const provider = document.getElementById('provider').value;
        const model = document.getElementById('model').value;
        const temperature = document.getElementById('temperature').value;
        const text = document.getElementById('text').value;
        const memoryChat = document.getElementById('new-chat-options-1').checked ? 'memory_chat' : 'normal_chat';

        const authToken = localStorage.getItem('accessToken');
        if (!authToken) {
            window.location.href = '/signin.html';
            return;
        }

        // Construir el objeto de datos para el cuerpo de la solicitud
        const payload = {
            text: text,
            model_embeddings: "text-embedding-ada-002",
            chat_type: memoryChat,
            repo: repo,
            model_chat: {
                provider: provider,
                model: model,
                temperature: parseFloat(temperature)
            }
        };

        // Hacer la solicitud POST a la API
        fetch(`http://54.242.3.57:8000/api/v1/conversation/00000000-0000-0000-0000-000000000000/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            const conversationId = data.conversation.conversation_id; // Obtener el ID de la conversación
            window.location.href = `http://localhost:3000/chat-direct.html?conversationId=${conversationId}`; // Redirigir
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
