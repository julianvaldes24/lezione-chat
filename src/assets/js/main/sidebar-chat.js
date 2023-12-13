// Url base de la api
import {urlBaseEndpoint} from './vars.js';
import {redirectToLogin} from './common.js';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        await fetchChats();
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchChats() {
    const apiUrl = `${urlBaseEndpoint}api/v1/conversation/`;
    const authToken = localStorage.getItem('accessToken');

    if (!authToken) {
        redirectToLogin();
        return;
    }

    const response = await fetch(apiUrl, getFetchOptions(authToken));
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    updateUI(data);
}

function getFetchOptions(token) {
    return {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
}

function updateUI(data) {
    const chatsContainer = document.querySelector('#tab-content-chats .card-list');
    chatsContainer.innerHTML = '';

    const groupedConversations = {};

    data.results.forEach(conversation => {
        const date = new Date(conversation.created_at);
        const group = getConversationGroup(date);

        if (!groupedConversations[group]) {
            groupedConversations[group] = [];
        }

        groupedConversations[group].push(conversation);
    });

    Object.keys(groupedConversations).forEach(group => {
        const groupHeader = document.createElement('h4');
        groupHeader.textContent = group;
        chatsContainer.appendChild(groupHeader);

        groupedConversations[group].forEach(conversation => {
            const chatCard = createChatCard(conversation);
            chatsContainer.appendChild(chatCard);
        });
    });
}


function createChatCard(conversation) {
    const card = document.createElement('a');
    card.href = `chat.html?conversationId=${conversation.conversation_id}`;
    card.className = "card border-0 text-reset";
    card.innerHTML = getCardInnerHTML(conversation);
    return card;
}

function getCardInnerHTML(conversation) {
    return `
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
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function getConversationGroup(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else if (date > sevenDaysAgo) {
        return 'Últimos 7 Días';
    } else if (date > twentyDaysAgo) {
        return 'Últimos 20 Días';
    } else if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
        return 'Mes Pasado';
    } else {
        return 'Anteriores';
    }
}

