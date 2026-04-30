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

  if (viewName === 'main') {
    renderDiceStats();
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

function getSavedUsers() {
  const raw = localStorage.getItem('users');
  if (raw) {
    return JSON.parse(raw);
  }

  // Compatibilidad con la versión anterior que guardaba un solo usuario
  const legacy = localStorage.getItem('user');
  return legacy ? [JSON.parse(legacy)] : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const users = getSavedUsers();
  return users.find(user => user.email.toLowerCase() === normalized) || null;
}

function setLoggedIn(email) {
  localStorage.setItem('loggedUser', email);
}

function setLoggedOut() {
  localStorage.removeItem('loggedUser');
}

function getLoggedUserEmail() {
  return localStorage.getItem('loggedUser');
}

function isLoggedIn() {
  return Boolean(getLoggedUserEmail());
}

function getLoggedUser() {
  return getUserByEmail(getLoggedUserEmail());
}

function getUserIndexByEmail(email) {
  const users = getSavedUsers();
  return users.findIndex(user => user.email.toLowerCase() === email.trim().toLowerCase());
}

function saveUser(user) {
  const users = getSavedUsers();
  const index = getUserIndexByEmail(user.email);
  if (index === -1) {
    users.push(user);
  } else {
    users[index] = user;
  }
  saveUsers(users);
}

function getDiceStatsForEmail(email) {
  const user = getUserByEmail(email);
  return user && user.stats ? user.stats : { totalRolls: 0, sum: 0, lastRoll: null };
}

function saveDiceStatsForEmail(email, stats) {
  const user = getUserByEmail(email);
  if (!user) return;
  user.stats = stats;
  saveUser(user);
}

function rollDiceValue() {
  return Math.floor(Math.random() * 20) + 1;
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
  const users = getSavedUsers();
  
  if (!users.length) {
    messageEl.innerHTML = 'No hay cuentas registradas. <button data-navigate="register">Regístrate primero</button>';
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

    const name = (document.getElementById('reg-name') || document.getElementById('name')).value.trim();
    const email = (document.getElementById('reg-email') || document.getElementById('email')).value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const password = (document.getElementById('reg-password') || document.getElementById('password')).value;
    const confirmPassword = (document.getElementById('reg-confirmPassword') || document.getElementById('confirmPassword')).value;

    if (!name || !email || !gender || !password || !confirmPassword) {
      showError('register-error', 'Completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      showError('register-error', 'Las contraseñas no coinciden.');
      return;
    }

    if (getUserByEmail(email)) {
      showError('register-error', 'Ya existe una cuenta con ese correo.');
      return;
    }

    const users = getSavedUsers();
    users.push({ name, email, gender, password });
    saveUsers(users);

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

    const email = (document.getElementById('login-email') || document.getElementById('email')).value.trim();
    const password = (document.getElementById('login-password') || document.getElementById('password')).value;
    const user = getUserByEmail(email);

    if (!user) {
      showError('login-error', 'No hay cuenta registrada con ese correo. Por favor, regístrate primero.');
      return;
    }

    if (password === user.password) {
      setLoggedIn(user.email);
      navigateTo('main');
    } else {
      showError('login-error', 'Correo o contraseña incorrectos. Intenta de nuevo.');
    }
  });
}

function renderDiceStats() {
  const email = getLoggedUserEmail();
  if (!email) return;

  const stats = getDiceStatsForEmail(email);
  const rollCountEl = document.getElementById('roll-count');
  const averageEl = document.getElementById('roll-average');
  const diceValueEl = document.getElementById('dice-value');
  const diceImageEl = document.getElementById('dice-image');

  if (rollCountEl) {
    rollCountEl.textContent = stats.totalRolls || 0;
  }

  if (averageEl) {
    const average = stats.totalRolls ? (stats.sum / stats.totalRolls).toFixed(2) : '0.00';
    averageEl.textContent = average;
  }

  if (stats.lastRoll && diceValueEl && diceImageEl) {
    diceValueEl.textContent = `Resultado: ${stats.lastRoll}`;
    diceImageEl.textContent = stats.lastRoll;
    diceImageEl.classList.remove('hidden');
  } else if (diceValueEl && diceImageEl) {
    diceValueEl.textContent = '';
    diceImageEl.textContent = '';
    diceImageEl.classList.add('hidden');
  }
}

function handleMainPage() {
  const rollButton = document.getElementById('roll-button');
  const resetButton = document.getElementById('reset-button');

  if (!rollButton || !resetButton) return;

  rollButton.addEventListener('click', function () {
    const email = getLoggedUserEmail();
    if (!email) return;

    const value = rollDiceValue();
    const stats = getDiceStatsForEmail(email);
    stats.totalRolls += 1;
    stats.sum += value;
    stats.lastRoll = value;

    saveDiceStatsForEmail(email, stats);
    renderDiceStats();
  });

  resetButton.addEventListener('click', function () {
    const email = getLoggedUserEmail();
    if (!email) return;

    const resetStats = { totalRolls: 0, sum: 0, lastRoll: null };
    saveDiceStatsForEmail(email, resetStats);
    renderDiceStats();
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

  // Configura los formularios y la página principal
  handleRegisterPage();
  handleLoginPage();
  handleMainPage();
}

// Inicia la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', initApp);
