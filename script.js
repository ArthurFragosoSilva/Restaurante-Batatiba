// ===== ELEMENTOS =====
const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');

const screenChoice = document.getElementById('screenChoice');
const screenLogin = document.getElementById('screenLogin');
const screenRegister = document.getElementById('screenRegister');
const screenProfile = document.getElementById('screenProfile');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const backBtns = document.querySelectorAll('[data-back]');

const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const formProfile = document.getElementById('formProfile');

const inputAvatar = document.getElementById('inputAvatar');
const avatarImage = document.getElementById('avatarImage');
const btnLogout = document.getElementById('btnLogout');

const allScreens = [screenChoice, screenLogin, screenRegister, screenProfile];

// Guarda o telefone (só dígitos) do usuário que está sendo editado no perfil,
// para localizar o registro certo em 'batatiba_users' mesmo se o telefone for alterado.
let currentUserOriginalPhone = '';

// ===== NAVEGAÇÃO ENTRE TELAS =====
function showScreen(target){
  allScreens.forEach(screen => {
    if (screen) {
      screen.classList.toggle('hidden', screen !== target);
    }
  });
}

function updateHeaderButton(user) {
  if (!openBtn) return;

  if (user && user.name) {
    const firstName = user.name.split(' ')[0];
    const inicial = firstName.charAt(0).toUpperCase();

    openBtn.classList.add('logged');
    openBtn.setAttribute('aria-label', `Perfil de ${firstName}`);
    openBtn.innerHTML = `<span class="avatar-circle">${
      user.avatar
        ? `<img src="${user.avatar}" alt="Foto de perfil de ${firstName}">`
        : `<span class="avatar-iniciais">${inicial}</span>`
    }</span>`;
  } else {
    openBtn.classList.remove('logged');
    openBtn.removeAttribute('aria-label');
    openBtn.textContent = 'Entrar';
  }
}

// Preenche a tela de perfil com os dados do usuário logado
function populateProfile(user){
  const profName = document.getElementById('profName');
  const profEmail = document.getElementById('profEmail');
  const profPhone = document.getElementById('profPhone');

  if (profName) profName.value = user.name || '';
  if (profEmail) profEmail.value = user.email || '';
  if (profPhone) profPhone.value = user.phone || '';
  if (avatarImage) avatarImage.src = user.avatar || 'https://via.placeholder.com/100';

  currentUserOriginalPhone = (user.phone || '').replace(/\D/g, '');
}

// ===== ABRIR / FECHAR MODAL =====
function openModal(){
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  const loggedUser = JSON.parse(localStorage.getItem('batatiba_logged_user'));

  if (loggedUser) {
    populateProfile(loggedUser);
    showScreen(screenProfile);
  } else {
    showScreen(screenChoice);
  }
}

function closeModal(){
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    showScreen(screenChoice);
    if (formLogin) resetForm(formLogin);
    if (formRegister) resetForm(formRegister);
  }, 250);
}

if (openBtn) {
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);

if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) closeModal();
});

if (btnLogin) btnLogin.addEventListener('click', () => showScreen(screenLogin));
if (btnRegister) btnRegister.addEventListener('click', () => showScreen(screenRegister));

backBtns.forEach(btn => {
  btn.addEventListener('click', () => showScreen(screenChoice));
});

// ===== HELPERS E VALIDAÇÕES =====
function setError(input, message){
  if (!input) return;
  const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);
  if (message){
    input.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
  } else {
    input.classList.remove('invalid');
    if (errorEl) errorEl.textContent = '';
  }
}

function isValidPhone(value){
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resetForm(form){
  if (!form) return;
  form.reset();
  form.querySelectorAll('input').forEach(input => setError(input, ''));
}

function maskPhone(e){
  let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 6){
    e.target.value = digits.replace(/(\d{2})(\d{4,5})(\d{0,4})/, (m, a, b, c) =>
      c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`
    );
  } else if (digits.length > 2){
    e.target.value = digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    e.target.value = digits;
  }
}

const loginPhone = document.getElementById('loginPhone');
const regPhone = document.getElementById('regPhone');
const profPhoneInput = document.getElementById('profPhone');
if (loginPhone) loginPhone.addEventListener('input', maskPhone);
if (regPhone) regPhone.addEventListener('input', maskPhone);
if (profPhoneInput) profPhoneInput.addEventListener('input', maskPhone);

// ===== CADASTRO =====
if (formRegister) {
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('regName');
    const email = document.getElementById('regEmail');
    const phone = document.getElementById('regPhone');
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    let valid = true;

    if (name.value.trim().split(' ').filter(Boolean).length < 2){
      setError(name, 'Informe seu nome completo');
      valid = false;
    } else {
      setError(name, '');
    }

    if (!isValidEmail(email.value)){
      setError(email, 'Informe um e-mail válido');
      valid = false;
    } else {
      setError(email, '');
    }

    if (!isValidPhone(phone.value)){
      setError(phone, 'Informe um telefone válido');
      valid = false;
    } else {
      setError(phone, '');
    }

    if (password.value.length < 6){
      setError(password, 'A senha deve ter ao menos 6 caracteres');
      valid = false;
    } else {
      setError(password, '');
    }

    if (confirmPassword.value !== password.value || confirmPassword.value === ''){
      setError(confirmPassword, 'As senhas não coincidem');
      valid = false;
    } else {
      setError(confirmPassword, '');
    }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('batatiba_users')) || [];
    const cleanPhone = phone.value.replace(/\D/g, '');
    const cleanEmail = email.value.trim().toLowerCase();

    const existingUser = users.find(u => {
      const uPhone = u.phone.replace(/\D/g, '');
      const uEmail = u.email.trim().toLowerCase();
      return uPhone === cleanPhone || uEmail === cleanEmail;
    });

    if (existingUser) {
      if (existingUser.phone.replace(/\D/g, '') === cleanPhone) setError(phone, 'Telefone já cadastrado');
      if (existingUser.email.trim().toLowerCase() === cleanEmail) setError(email, 'E-mail já cadastrado');
      return;
    }

    const newUser = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value,
      avatar: ''
    };

    users.push(newUser);
    localStorage.setItem('batatiba_users', JSON.stringify(users));

    alert('Conta criada com sucesso! Redirecionando para o login...');
    resetForm(formRegister);
    showScreen(screenLogin);
  });
}

// ===== LOGIN =====
if (formLogin) {
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    const phone = document.getElementById('loginPhone');
    const password = document.getElementById('loginPassword');
    let valid = true;

    if (!isValidPhone(phone.value)){
      setError(phone, 'Informe um telefone válido');
      valid = false;
    } else {
      setError(phone, '');
    }

    if (password.value.length < 6){
      setError(password, 'A senha deve ter ao menos 6 caracteres');
      valid = false;
    } else {
      setError(password, '');
    }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('batatiba_users')) || [];
    const cleanLoginPhone = phone.value.replace(/\D/g, '');

    // Compara apenas os números do telefone e a senha
    const matchedUser = users.find(u => 
      u.phone.replace(/\D/g, '') === cleanLoginPhone && u.password === password.value
    );

    if (!matchedUser) {
      setError(password, 'Telefone ou senha incorretos');
      return;
    }

    localStorage.setItem('batatiba_logged_user', JSON.stringify(matchedUser));
    updateHeaderButton(matchedUser);

    alert(`Seja bem-vindo(a), ${matchedUser.name.split(' ')[0]}!`);
    closeModal();
  });
}

// ===== PERFIL (edição de dados) =====
if (formProfile) {
  formProfile.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('profName');
    const email = document.getElementById('profEmail');
    const phone = document.getElementById('profPhone');
    let valid = true;

    if (name.value.trim().split(' ').filter(Boolean).length < 2){
      setError(name, 'Informe seu nome completo');
      valid = false;
    } else {
      setError(name, '');
    }

    if (!isValidEmail(email.value)){
      setError(email, 'Informe um e-mail válido');
      valid = false;
    } else {
      setError(email, '');
    }

    if (!isValidPhone(phone.value)){
      setError(phone, 'Informe um telefone válido');
      valid = false;
    } else {
      setError(phone, '');
    }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('batatiba_users')) || [];
    const idx = users.findIndex(u => u.phone.replace(/\D/g, '') === currentUserOriginalPhone);

    if (idx === -1) return;

    users[idx].name = name.value.trim();
    users[idx].email = email.value.trim();
    users[idx].phone = phone.value.trim();
    if (avatarImage && avatarImage.src) {
      users[idx].avatar = avatarImage.src;
    }

    localStorage.setItem('batatiba_users', JSON.stringify(users));
    localStorage.setItem('batatiba_logged_user', JSON.stringify(users[idx]));

    currentUserOriginalPhone = users[idx].phone.replace(/\D/g, '');
    updateHeaderButton(users[idx]);

    alert('Perfil atualizado com sucesso!');
    closeModal();
  });
}

// Pré-visualização/upload da foto de perfil
if (inputAvatar) {
  inputAvatar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (avatarImage) avatarImage.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Sair da conta
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('batatiba_logged_user');
    updateHeaderButton(null);
    closeModal();
  });
}

// Checar Login na inicialização
document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = JSON.parse(localStorage.getItem('batatiba_logged_user'));
  updateHeaderButton(loggedUser);
});

//============== CARROSSEL ==============//
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!track) return;

    const cards = track.querySelectorAll('.card-promo');
    const gap = 30; 

    function moveSlider() {
        if (!cards || cards.length === 0) return;
        const cardWidth = cards[0].offsetWidth;
        const amountToMove = (cardWidth + gap) * 0;
        track.style.transform = `translateX(-${amountToMove}px)`;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cardWidth = track.querySelector('.card-promo').offsetWidth + gap;
        track.style.transition = 'transform 0.3s ease-in-out';
        track.style.transform = `translateX(-${cardWidth}px)`;

        track.addEventListener('transitionend', function handler() {
            track.removeEventListener('transitionend', handler);
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
        });
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cardWidth = track.querySelector('.card-promo').offsetWidth + gap;

        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.style.transition = 'none';
        track.style.transform = `translateX(-${cardWidth}px)`;

        setTimeout(() => {
            track.style.transition = 'transform 0.3s ease-in-out';
            track.style.transform = 'translateX(0)';
        }, 10);
      });
    }

    window.addEventListener('resize', moveSlider);
});