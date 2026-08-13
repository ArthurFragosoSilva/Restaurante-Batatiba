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
    function updateButtons() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - 1;
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            moveSlider();
        }
    });
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            moveSlider();
        }
    });

    window.addEventListener('resize', moveSlider);
    updateButtons();

});