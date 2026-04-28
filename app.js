// ========================================
// FUNCIONES DE ALMACENAMIENTO (localStorage)
// ========================================

// Obtiene usuario guardado en localStorage
function getSavedUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}


// Marca el usuario como conectado
function setLoggedIn() {
  localStorage.setItem('loggedUser', 'true');
}


// Verifica si hay usuario conectado
function isLoggedIn() {
  return localStorage.getItem('loggedUser') === 'true';
}


// Redirecciona a otra página
function redirectTo(page) {
  window.location.href = page;
}


// ========================================
// PÁGINA DE REGISTRO
// ========================================

function handleRegisterPage() {
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Obtiene valores del formulario
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    // Valida que todos los campos estén completos
    if (!name || !email || !gender || !password || !confirmPassword) {
      alert('Completa todos los campos.');
      return;
    }


    // Valida que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }


    // Crea objeto usuario y lo guarda
    const user = { name, email, gender, password };
    localStorage.setItem('user', JSON.stringify(user));
    alert('Registro guardado. Ahora puedes iniciar sesión.');
    redirectTo('login.html');
  });
}


// ========================================
// PÁGINA DE INICIO DE SESIÓN
// ========================================

function handleLoginPage() {
  const message = document.getElementById('message');
  const user = getSavedUser();

  // Si no hay usuario registrado, muestra mensaje
  if (!user) {
    message.innerHTML = 'No hay cuenta registrada. <a href="register.html">Regístrate primero</a>.';
  }

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Valida que exista un usuario registrado
    if (!user) {
      alert('No tienes una cuenta registrada.');
      redirectTo('register.html');
      return;
    }


    // Obtiene credenciales del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;


    // Valida credenciales contra las guardadas
    if (email === user.email && password === user.password) {
      setLoggedIn();
      redirectTo('main.html');
    } else {
      alert('Correo o contraseña incorrectos.');
    }
  });
}


// ========================================
// PÁGINA PRINCIPAL (PROTEGIDA)
// ========================================

function handleMainPage() {
  // Si no hay sesión, redirecciona a página de inicio
  if (!isLoggedIn()) {
    redirectTo('index.html');
  }
}


// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

function initApp() {
  // Detecta qué página se está cargando
  const page = document.body.dataset.page;


  // Ejecuta la lógica correspondiente
  if (page === 'register') {
    handleRegisterPage();
  } else if (page === 'login') {
    handleLoginPage();
  } else if (page === 'main') {
    handleMainPage();
  }
}


// Inicia la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', initApp);
