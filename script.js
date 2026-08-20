//===========================//
//       Botão Entrar        //
//===========================//

// ===== ELEMENTOS =====
const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');

const screenChoice = document.getElementById('screenChoice');
const screenLogin = document.getElementById('screenLogin');
const screenRegister = document.getElementById('screenRegister');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const backBtns = document.querySelectorAll('[data-back]');

const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');

const allScreens = [screenChoice, screenLogin, screenRegister];

// ===== ABRIR / FECHAR MODAL =====
function openModal(){
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  showScreen(screenChoice);
}

function closeModal(){
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    showScreen(screenChoice);
    resetForm(formLogin);
    resetForm(formRegister);
  }, 250);
}

openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
});

// ===== NAVEGAÇÃO ENTRE TELAS =====
function showScreen(target){
  allScreens.forEach(screen => {
    screen.classList.toggle('hidden', screen !== target);
  });
}

btnLogin.addEventListener('click', () => showScreen(screenLogin));
btnRegister.addEventListener('click', () => showScreen(screenRegister));

backBtns.forEach(btn => {
  btn.addEventListener('click', () => showScreen(screenChoice));
});

// ===== HELPERS DE VALIDAÇÃO =====
function setError(input, message){
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
  form.reset();
  form.querySelectorAll('input').forEach(input => setError(input, ''));
}

// Máscara simples de telefone (00) 00000-0000
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

document.getElementById('loginPhone').addEventListener('input', maskPhone);
document.getElementById('regPhone').addEventListener('input', maskPhone);

// ===== LOGIN =====
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

  // Aqui entraria a chamada real de autenticação (API/back-end)
  console.log('Login enviado:', {
    phone: phone.value,
    password: password.value
  });

  alert('Login realizado com sucesso!');
  closeModal();
});

// ===== CADASTRO =====
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

  // Aqui entraria a chamada real de cadastro (API/back-end)
  console.log('Cadastro enviado:', {
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value
  });

  alert('Conta criada com sucesso!');
  closeModal();
});



//==============////==============//


document.addEventListener('DOMContentLoaded', function() {
    
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = track.querySelectorAll('.card-promo');

    // Configurações
    let currentIndex = 0; 
    const gap = 30; 

    // Função que faz o cálculo e move o slider
    function moveSlider() {
        if (cards.length === 0) return;

        const cardWidth = cards[0].offsetWidth;
        
        const amountToMove = (cardWidth + gap) * currentIndex;
        track.style.transform = `translateX(-${amountToMove}px)`;

        updateButtons();
    }

    // Função para desativar botões se chegar no limite
/*     function updateButtons() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - 1;
    } */

    nextBtn.addEventListener('click', () => {

      const cardWidth = track.querySelector('.card-promo').offsetWidth + gap;
      track.style.transition = 'transform 0.3s ease-in-out';
      track.style.transform = `translateX(-${cardWidth}px)`;

    // 2. Espera a animação acabar para reordenar os elementos no HTML
        track.addEventListener('transitionend', function handler() {
            track.removeEventListener('transitionend', handler);
            
            // Remove a transição para resetar a posição sem piscar
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
        });

    });

    prevBtn.addEventListener('click', () => {
        const cardWidth = track.querySelector('.card-promo').offsetWidth + gap;

        // 1. Move o último card para o início da fila no HTML
        track.insertBefore(track.lastElementChild, track.firstElementChild);

        // 2. Desloca instantaneamente a fila para a esquerda (sem transição) para "esconder" o card inserido
        track.style.transition = 'none';
        track.style.transform = `translateX(-${cardWidth}px)`;

        // 3. Usa um pequeno delay para ativar a animação deslizando até a posição zero
        setTimeout(() => {
            track.style.transition = 'transform 0.3s ease-in-out';
            track.style.transform = 'translateX(0)';
        }, 10);
    });

    window.addEventListener('resize', moveSlider);
    updateButtons();
});