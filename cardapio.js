document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       ELEMENTOS PRINCIPAIS
    ========================================== */

    const gridCardapio = document.getElementById('gridCardapio');
    const filtrosContainer = document.querySelector('.filtros-cardapio');
    const botoesFiltro = document.querySelectorAll('.btn-filtro');

    let categoriaAtual = 'todos';

    /* Usuário logado / permissões (auth-shared.js) */
    const usuarioLogado = typeof batatibaGetLoggedUser === 'function' ? batatibaGetLoggedUser() : null;
    const podeEditar = typeof batatibaPodeGerenciarCardapio === 'function' && batatibaPodeGerenciarCardapio(usuarioLogado);

    function escaparHTML(texto) {
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatarPreco(valor) {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function converterPreco(texto) {
        return parseFloat(
            texto
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
                .trim()
        );
    }


    /* ==========================================
       RENDERIZAÇÃO DO CARDÁPIO (dados em localStorage)
    ========================================== */

    function renderizarCardapio() {

        if (!gridCardapio) return;

        const menu = typeof batatibaGetMenu === 'function' ? batatibaGetMenu() : [];

        gridCardapio.innerHTML = '';

        menu.forEach(item => {

            const deveExibir =
                categoriaAtual === 'todos' ||
                item.categoria === categoriaAtual;

            const card = document.createElement('div');

            card.className =
                'item-cardapio' + (deveExibir ? '' : ' escondido');

            card.setAttribute('data-categoria', item.categoria);
            card.setAttribute('data-id', item.id);

            card.innerHTML = `
                <div class="item-img">
                    <img src="${escaparHTML(item.imagem)}" alt="${escaparHTML(item.nome)}">
                </div>
                <div class="item-detalhes">
                    <div class="item-header">
                        <h3>${escaparHTML(item.nome)}</h3>
                        <span class="preco">${formatarPreco(Number(item.preco) || 0)}</span>
                    </div>
                    <p class="descricao">${escaparHTML(item.descricao)}</p>
                    <button type="button" class="btn-comprar">Comprar</button>
                    ${podeEditar ? `
                    <div class="item-admin-acoes">
                        <button type="button" class="btn-item-editar" data-id="${escaparHTML(item.id)}">✏️ Editar</button>
                        <button type="button" class="btn-item-remover" data-id="${escaparHTML(item.id)}">🗑️ Remover</button>
                    </div>` : ''}
                </div>
            `;

            gridCardapio.appendChild(card);

        });

    }


    /* ==========================================
       FILTROS DO CARDÁPIO
    ========================================== */

    if (filtrosContainer) {

        filtrosContainer.addEventListener('click', (event) => {

            const botaoClicado = event.target.closest('.btn-filtro');

            if (!botaoClicado) return;

            botoesFiltro.forEach(btn => btn.classList.remove('active'));

            botaoClicado.classList.add('active');

            categoriaAtual = botaoClicado.dataset.categoria || 'todos';

            renderizarCardapio();

        });

    }


    /* ==========================================
       ELEMENTOS DO PRODUTO (MODAL)
    ========================================== */

    const produtoOverlay = document.getElementById('produtoOverlay');
    const fecharProduto = document.getElementById('fecharProduto');
    const produtoImagem = document.getElementById('produtoImagem');
    const produtoNome = document.getElementById('produtoNome');
    const produtoDescricao = document.getElementById('produtoDescricao');
    const produtoPreco = document.getElementById('produtoPreco');
    const produtoCategoria = document.getElementById('produtoCategoria');
    const quantidadeProduto = document.getElementById('quantidadeProduto');
    const diminuirQuantidade = document.getElementById('diminuirQuantidade');
    const aumentarQuantidade = document.getElementById('aumentarQuantidade');
    const adicionarCarrinho = document.getElementById('adicionarCarrinho');

    /* Elementos do carrinho */
    const carrinhoOverlay = document.getElementById('carrinhoOverlay');
    const carrinhoItens = document.getElementById('carrinhoItens');
    const carrinhoTotal = document.getElementById('carrinhoTotal');
    const fecharCarrinho = document.getElementById('fecharCarrinho');
    const finalizarPedido = document.getElementById('finalizarPedido');

    let produtoAtual = null;
    let quantidadeAtual = 1;


    /* ==========================================
       ABRIR PRODUTO
    ========================================== */

    function abrirProduto(item) {

        const imagem = item.querySelector('.item-img img');
        const nome = item.querySelector('.item-header h3');
        const preco = item.querySelector('.preco');
        const descricao = item.querySelector('.descricao');

        produtoAtual = {
            nome: nome.textContent.trim(),
            preco: converterPreco(preco.textContent),
            imagem: imagem.src,
            descricao: descricao.textContent.trim(),
            categoria: item.dataset.categoria
        };

        quantidadeAtual = 1;
        atualizarQuantidade();

        produtoImagem.src = produtoAtual.imagem;
        produtoImagem.alt = produtoAtual.nome;
        produtoNome.textContent = produtoAtual.nome;
        produtoDescricao.textContent = produtoAtual.descricao;
        produtoPreco.textContent = formatarPreco(produtoAtual.preco);

        const categorias = {
            torres: 'Torre de Batata',
            porcoes: 'Porção',
            bebidas: 'Bebida'
        };

        produtoCategoria.textContent =
            categorias[produtoAtual.categoria] || 'Produto';

        produtoOverlay.classList.add('ativo');
        document.body.style.overflow = 'hidden';

    }


    /* ==========================================
       FECHAR PRODUTO
    ========================================== */

    function fecharModalProduto() {

        produtoOverlay.classList.remove('ativo');

        if (!carrinhoOverlay.classList.contains('ativo')) {
            document.body.style.overflow = '';
        }

    }

    fecharProduto.addEventListener('click', fecharModalProduto);

    produtoOverlay.addEventListener('click', (event) => {
        if (event.target === produtoOverlay) {
            fecharModalProduto();
        }
    });


    /* ==========================================
       QUANTIDADE
    ========================================== */

    function atualizarQuantidade() {
        quantidadeProduto.textContent = quantidadeAtual;
    }

    diminuirQuantidade.addEventListener('click', () => {
        if (quantidadeAtual > 1) {
            quantidadeAtual--;
            atualizarQuantidade();
        }
    });

    aumentarQuantidade.addEventListener('click', () => {
        quantidadeAtual++;
        atualizarQuantidade();
    });


    /* ==========================================
       CARRINHO
    ========================================== */

    let carrinho =
        JSON.parse(localStorage.getItem('batatibaCarrinho')) || [];

    /* Botão do carrinho (fixo no canto inferior direito) */

    const botaoCarrinho = document.createElement('button');

    botaoCarrinho.className = 'btn-carrinho';

    botaoCarrinho.innerHTML = `
        🛒
        <span>Carrinho</span>
        <b id="contadorCarrinho">0</b>
    `;

    document.body.appendChild(botaoCarrinho);

    const contadorCarrinho = document.getElementById('contadorCarrinho');

    botaoCarrinho.addEventListener('click', abrirCarrinho);


    /* ==========================================
       ADICIONAR AO CARRINHO
    ========================================== */

    adicionarCarrinho.addEventListener('click', () => {

        if (!produtoAtual) return;

        const produtoExistente =
            carrinho.find(item => item.nome === produtoAtual.nome);

        if (produtoExistente) {

            produtoExistente.quantidade += quantidadeAtual;

        } else {

            carrinho.push({
                nome: produtoAtual.nome,
                preco: produtoAtual.preco,
                imagem: produtoAtual.imagem,
                quantidade: quantidadeAtual
            });

        }

        salvarCarrinho();
        atualizarCarrinho();
        fecharModalProduto();
        abrirCarrinho();

    });


    function salvarCarrinho() {
        localStorage.setItem('batatibaCarrinho', JSON.stringify(carrinho));
    }


    /* ==========================================
       ATUALIZAR CARRINHO
    ========================================== */

    function atualizarCarrinho() {

        carrinhoItens.innerHTML = '';

        if (carrinho.length === 0) {

            carrinhoItens.innerHTML = `
                <div class="carrinho-vazio">
                    <div class="carrinho-vazio-icon">🛒</div>
                    <h3>Seu carrinho está vazio</h3>
                    <p>Adicione algumas delícias do Batatiba!</p>
                </div>
            `;

        }

        let total = 0;
        let quantidadeTotal = 0;

        carrinho.forEach((item, index) => {

            const subtotal = item.preco * item.quantidade;

            total += subtotal;
            quantidadeTotal += item.quantidade;

            const itemCarrinho = document.createElement('div');

            itemCarrinho.className = 'item-carrinho';

            itemCarrinho.innerHTML = `
                <img src="${escaparHTML(item.imagem)}" alt="${escaparHTML(item.nome)}">

                <div class="item-carrinho-info">
                    <h4>${escaparHTML(item.nome)}</h4>
                    <span class="item-carrinho-preco">${formatarPreco(item.preco)}</span>

                    <div class="item-carrinho-controle">
                        <button class="btn-menos" data-index="${index}">−</button>
                        <span>${item.quantidade}</span>
                        <button class="btn-mais" data-index="${index}">+</button>
                    </div>
                </div>

                <div class="item-carrinho-final">
                    <strong>${formatarPreco(subtotal)}</strong>
                    <button class="btn-remover" data-index="${index}" title="Remover">🗑️</button>
                </div>
            `;

            carrinhoItens.appendChild(itemCarrinho);

        });

        carrinhoTotal.textContent = formatarPreco(total);

        contadorCarrinho.textContent = quantidadeTotal;

        contadorCarrinho.classList.toggle('tem-produtos', quantidadeTotal > 0);

        /* Botão + */
        carrinhoItens.querySelectorAll('.btn-mais').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                carrinho[index].quantidade++;
                salvarCarrinho();
                atualizarCarrinho();
            });
        });

        /* Botão - */
        carrinhoItens.querySelectorAll('.btn-menos').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);

                if (carrinho[index].quantidade > 1) {
                    carrinho[index].quantidade--;
                } else {
                    carrinho.splice(index, 1);
                }

                salvarCarrinho();
                atualizarCarrinho();
            });
        });

        /* Botão remover */
        carrinhoItens.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                carrinho.splice(index, 1);
                salvarCarrinho();
                atualizarCarrinho();
            });
        });

    }


    /* ==========================================
       ABRIR / FECHAR CARRINHO
    ========================================== */

    function abrirCarrinho() {
        atualizarCarrinho();
        carrinhoOverlay.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }

    function fecharCarrinhoFunc() {

        carrinhoOverlay.classList.remove('ativo');

        if (!produtoOverlay.classList.contains('ativo')) {
            document.body.style.overflow = '';
        }

    }

    fecharCarrinho.addEventListener('click', fecharCarrinhoFunc);

    carrinhoOverlay.addEventListener('click', (event) => {
        if (event.target === carrinhoOverlay) {
            fecharCarrinhoFunc();
        }
    });


    /* ==========================================
       FINALIZAR PEDIDO
    ========================================== */

    finalizarPedido.addEventListener('click', () => {

        if (carrinho.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        let mensagem = 'Olá! Gostaria de fazer um pedido no Batatiba:%0A%0A';

        let total = 0;

        carrinho.forEach(item => {

            const subtotal = item.preco * item.quantidade;

            total += subtotal;

            mensagem +=
                `${item.quantidade}x ${item.nome} - ${formatarPreco(subtotal)}%0A`;

        });

        mensagem += `%0A*Total: ${formatarPreco(total)}*`;

        /*
            TROQUE NUMERODOWHATSAPP
            PELO NÚMERO REAL DO BATATIBA.

            Exemplo:
            5541999999999
        */

        const numeroWhatsApp = '55NUMERODOWHATSAPP';

        const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

        window.open(url, '_blank');

    });


    /* ==========================================
       ADMINISTRAÇÃO DO CARDÁPIO (admin / funcionário)
    ========================================== */

    const barraAdminCardapio = document.getElementById('barraAdminCardapio');
    const barraAdminCargo = document.getElementById('barraAdminCargo');
    const btnAdicionarItem = document.getElementById('btnAdicionarItem');
    const btnCancelarItem = document.getElementById('btnCancelarItem');
    const formItemCardapio = document.getElementById('formItemCardapio');
    const formItemTitulo = document.getElementById('formItemTitulo');

    const inputItemId = document.getElementById('itemId');
    const inputItemNome = document.getElementById('itemNome');
    const inputItemCategoria = document.getElementById('itemCategoria');
    const inputItemPreco = document.getElementById('itemPreco');
    const inputItemImagem = document.getElementById('itemImagem');
    const inputItemImagemArquivo = document.getElementById('itemImagemArquivo');
    const itemImagemPreview = document.getElementById('itemImagemPreview');
    const inputItemDescricao = document.getElementById('itemDescricao');

    if (podeEditar) {

        if (barraAdminCardapio) barraAdminCardapio.classList.remove('hidden');

        if (barraAdminCargo && typeof batatibaRoleInfo === 'function') {
            barraAdminCargo.textContent = batatibaRoleInfo(usuarioLogado.role).label;
        }

        function mostrarPreview(src) {
            if (!itemImagemPreview) return;
            if (src) {
                itemImagemPreview.src = src;
                itemImagemPreview.classList.remove('hidden');
            } else {
                itemImagemPreview.removeAttribute('src');
                itemImagemPreview.classList.add('hidden');
            }
        }

        /* Escolher PNG/JPEG no computador */
        if (inputItemImagemArquivo) {
            inputItemImagemArquivo.addEventListener('change', (e) => {

                const arquivo = e.target.files[0];

                if (!arquivo) return;

                if (!['image/png', 'image/jpeg'].includes(arquivo.type)) {
                    alert('Selecione um arquivo PNG ou JPEG.');
                    inputItemImagemArquivo.value = '';
                    return;
                }

                const leitor = new FileReader();

                leitor.onload = (ev) => {
                    inputItemImagem.value = ev.target.result;
                    mostrarPreview(ev.target.result);
                };

                leitor.readAsDataURL(arquivo);

            });
        }

        function abrirFormulario(item) {

            if (!formItemCardapio) return;

            formItemCardapio.classList.remove('hidden');

            if (inputItemImagemArquivo) inputItemImagemArquivo.value = '';

            if (item) {
                formItemTitulo.textContent = 'Editar item do cardápio';
                inputItemId.value = item.id;
                inputItemNome.value = item.nome;
                inputItemCategoria.value = item.categoria;
                inputItemPreco.value = item.preco;
                inputItemImagem.value = item.imagem;
                inputItemDescricao.value = item.descricao;
                mostrarPreview(item.imagem);
            } else {
                formItemTitulo.textContent = 'Adicionar item ao cardápio';
                formItemCardapio.reset();
                inputItemId.value = '';
                inputItemImagem.value = '';
                mostrarPreview('');
            }

            formItemCardapio.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }

        function fecharFormulario() {

            if (!formItemCardapio) return;

            formItemCardapio.classList.add('hidden');
            formItemCardapio.reset();
            inputItemId.value = '';
            inputItemImagem.value = '';
            mostrarPreview('');

        }

        if (btnAdicionarItem) {
            btnAdicionarItem.addEventListener('click', () => abrirFormulario(null));
        }

        if (btnCancelarItem) {
            btnCancelarItem.addEventListener('click', fecharFormulario);
        }

        if (formItemCardapio) {

            formItemCardapio.addEventListener('submit', (e) => {

                e.preventDefault();

                const menu = batatibaGetMenu();
                const nome = inputItemNome.value.trim();
                const categoria = inputItemCategoria.value;
                const preco = parseFloat(inputItemPreco.value);
                const imagem = inputItemImagem.value.trim();
                const descricao = inputItemDescricao.value.trim();

                if (!nome || !categoria || isNaN(preco) || preco < 0 || !imagem || !descricao) {
                    alert('Preencha todos os campos corretamente (inclusive a imagem).');
                    return;
                }

                if (inputItemId.value) {

                    const idx = menu.findIndex(i => i.id === inputItemId.value);

                    if (idx !== -1) {
                        menu[idx] = { ...menu[idx], nome, categoria, preco, imagem, descricao };
                    }

                } else {

                    menu.push({
                        id: batatibaGerarIdItem(nome),
                        nome, categoria, preco, imagem, descricao
                    });

                }

                batatibaSaveMenu(menu);
                fecharFormulario();
                renderizarCardapio();

            });

        }

    }


    /* ==========================================
       CLIQUES NA GRADE (delegação de eventos)
       - Editar / Remover (admin)
       - Comprar / clicar no card => abre o produto
    ========================================== */

    if (gridCardapio) {

        gridCardapio.addEventListener('click', (event) => {

            const btnEditar = event.target.closest('.btn-item-editar');
            const btnRemover = event.target.closest('.btn-item-remover');

            if (podeEditar && btnEditar) {

                event.stopPropagation();

                const item = batatibaGetMenu().find(i => i.id === btnEditar.dataset.id);

                if (item) abrirFormulario(item);

                return;

            }

            if (podeEditar && btnRemover) {

                event.stopPropagation();

                if (!confirm('Tem certeza que deseja remover este item do cardápio?')) return;

                const menu = batatibaGetMenu().filter(i => i.id !== btnRemover.dataset.id);

                batatibaSaveMenu(menu);
                renderizarCardapio();

                return;

            }

            const card = event.target.closest('.item-cardapio');

            if (card) abrirProduto(card);

        });

    }


    /* ==========================================
       ESC
    ========================================== */

    document.addEventListener('keydown', (event) => {

        if (event.key !== 'Escape') return;

        if (produtoOverlay.classList.contains('ativo')) {
            fecharModalProduto();
        }

        if (carrinhoOverlay.classList.contains('ativo')) {
            fecharCarrinhoFunc();
        }

    });


    /* ==========================================
       INICIALIZAÇÃO
    ========================================== */

    renderizarCardapio();
    atualizarCarrinho();

});
