export function redirectToLogin() {
    if (window.location.pathname !== '/signin.html') {
        window.location.href = '/signin.html';
    }
}
