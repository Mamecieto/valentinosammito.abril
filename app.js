// ========================================
// SISTEMA DE NAVEGACIÓN SPA
// ========================================

// Define las vistas disponibles
const views = {
  welcome: 'welcome-view',
  login: 'login-view',
  register: 'register-view',
  main: 'main-view'
};

// Cambia la vista activa
function navigateTo(viewName) {
  // Oculta todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });

  // Muestra la vista solicitada
  const targetView = document.getElementById(views[viewName]);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Actualiza el mensaje de login si es esa vista
  if (viewName === 'login') {
    updateLoginMessage();
  }
}

// Configura los botones de navegación (event delegation)
function setupNavigation() {
  document.addEventListener('click', function (e) {
    const button = e.target.closest('[data-navigate]');
    if (!button) return;
    
    e.preventDefault();
    const targetView = button.getAttribute('data-navigate');
    
    // Manejo especial para logout
    if (targetView === 'welcome' && button.id === 'logout-btn') {
      logout();
    } else {
      navigateTo(targetView);
    }
  });
}


// ========================================
// FUNCIONES DE ALMACENAMIENTO (localStorage)
// ========================================

function getSavedUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setLoggedIn() {
  localStorage.setItem('loggedUser', 'true');
}

function setLoggedOut() {
  localStorage.removeItem('loggedUser');
}

function isLoggedIn() {
  return localStorage.getItem('loggedUser') === 'true';
}


// ========================================
// GESTIÓN DE SESIÓN
// ========================================

function logout() {
  setLoggedOut();
  navigateTo('welcome');
}

function updateLoginMessage() {
  const messageEl = document.getElementById('login-message');
  const user = getSavedUser();
  
  if (!user) {
    messageEl.innerHTML = 'No hay cuenta registrada. <button data-navigate="register">Regístrate primero</button>';
  } else {
    messageEl.innerHTML = '¿No tienes cuenta? <button data-navigate="register">Registrarse</button>';
  }
}


// ========================================
// MENSAJES DE ERROR/ÉXITO EN EL DOM
// ========================================

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    el.classList.add('hidden');
  }, 5000);
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  el.classList.add('hidden');
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    el.classList.add('hidden');
  }, 5000);
}


// ========================================
// PÁGINA DE REGISTRO
// ========================================

function handleRegisterPage() {
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideError('register-error');

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirmPassword').value;

    if (!name || !email || !gender || !password || !confirmPassword) {
      showError('register-error', 'Completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      showError('register-error', 'Las contraseñas no coinciden.');
      return;
    }

    const user = { name, email, gender, password };
    localStorage.setItem('user', JSON.stringify(user));
    showSuccess('register-error', '¡Registro exitoso! Ahora puedes iniciar sesión.');
    
    // Limpiar formulario
    form.reset();
    
    // Redirigir a login después de 1.5 segundos
    setTimeout(() => {
      navigateTo('login');
    }, 1500);
  });
}


// ========================================
// PÁGINA DE INICIO DE SESIÓN
// ========================================

function handleLoginPage() {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideError('login-error');

    const user = getSavedUser();

    // Si no hay usuario registrado, mostrar mensaje de error (no redirigir)
    if (!user) {
      showError('login-error', 'No hay cuenta registrada. Por favor, regístrate primero.');
      return;
    }

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validar credenciales
    if (email === user.email && password === user.password) {
      setLoggedIn();
      navigateTo('main');
    } else {
      showError('login-error', 'Correo o contraseña incorrectos. Intenta de nuevo.');
    }
  });
}


// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

function initApp() {
  // Configura la navegación
  setupNavigation();

  // Verifica si hay sesión activa
  if (isLoggedIn()) {
    navigateTo('main');
  } else {
    navigateTo('welcome');
  }

  // Configura los formularios
  handleRegisterPage();
  handleLoginPage();
}

// Inicia la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', initApp);
