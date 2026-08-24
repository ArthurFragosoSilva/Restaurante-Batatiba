document.addEventListener('DOMContentLoaded', () => {
    const filtrosContainer = document.querySelector('.filtros-cardapio');
    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    const itensCardapio = document.querySelectorAll('.item-cardapio');

    if (!filtrosContainer) return;

    // Delegação de eventos no contêiner dos botões
    filtrosContainer.addEventListener('click', (event) => {
        const botaoClicado = event.target.closest('.btn-filtro');
        
        // Se o clique não foi em um botão de filtro, ignora
        if (!botaoClicado) return;

        // Atualiza a classe ativa nos botões
        botoesFiltro.forEach(btn => btn.classList.remove('active'));
        botaoClicado.classList.add('active');

        // Obtém a categoria a ser filtrada pelo botão clicado
        const categoriaSelecionada = botaoClicado.dataset.categoria || 'todos';

        // Filtra os itens com base no data-categoria do HTML
        itensCardapio.forEach(item => {
            const itemCategoria = item.getAttribute('data-categoria');
            const deveExibir = categoriaSelecionada === 'todos' || itemCategoria === categoriaSelecionada;

            item.classList.toggle('escondido', !deveExibir);
        });
    });
});