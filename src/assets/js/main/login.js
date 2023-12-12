// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            // Validación básica del lado del cliente
            if (!email || !password) {
                alert('Por favor, ingrese tanto el email como la contraseña.');
                return;
            }

            try {
                const response = await fetch('https://api-omnissiah.omni.pro/api/token/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.access) {
                    // Decodificar el payload del JWT
                    const base64Payload = data.access.split('.')[1];
                    const payload = JSON.parse(window.atob(base64Payload));

                    // Guardar los detalles en localStorage
                    localStorage.setItem('accessToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    localStorage.setItem('name', payload.name);
                    localStorage.setItem('userId', payload.user_id);
                    localStorage.setItem('exp', payload.exp);

                    // Redireccionar a otra página o actualizar la interfaz de usuario
                    window.location.href = '/index.html';
                } else {
                    alert('Credenciales incorrectas. Intente de nuevo.');
                }
            } catch (error) {
                console.error('Error durante el inicio de sesión:', error);
                alert('Ocurrió un error al intentar iniciar sesión.');
            }
        });
    }
});
