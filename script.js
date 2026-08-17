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