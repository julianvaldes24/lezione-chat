// login.js
document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var email = document.getElementById('signin-email').value;
            var password = document.getElementById('signin-password').value;

            fetch('http://54.242.3.57:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': 'csrftoken=xqJcOp5kWJRwnJAn5y92fTeOl17P1DEx'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.access) {
                    // Guardar el token en LocalStorage
                    localStorage.setItem('accessToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);


                    // Redireccionar a otra página o actualizar la interfaz de usuario
                    window.location.href = '/index.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});

