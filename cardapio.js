document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       FILTROS DO CARDÁPIO
    ========================================== */

    const filtrosContainer = document.querySelector('.filtros-cardapio');
    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    const itensCardapio = document.querySelectorAll('.item-cardapio');

    if (filtrosContainer) {

        filtrosContainer.addEventListener('click', (event) => {

            const botaoClicado = event.target.closest('.btn-filtro');

            if (!botaoClicado) return;

            botoesFiltro.forEach(btn => {
                btn.classList.remove('active');
            });

            botaoClicado.classList.add('active');

            const categoriaSelecionada =
                botaoClicado.dataset.categoria || 'todos';

            itensCardapio.forEach(item => {

                const itemCategoria =
                    item.getAttribute('data-categoria');

                const deveExibir =
                    categoriaSelecionada === 'todos' ||
                    itemCategoria === categoriaSelecionada;

                item.classList.toggle(
                    'escondido',
                    !deveExibir
                );

            });

        });

    }


    /* ==========================================
       ELEMENTOS DO PRODUTO
    ========================================== */

    const produtoOverlay =
        document.getElementById('produtoOverlay');

    const fecharProduto =
        document.getElementById('fecharProduto');

    const produtoImagem =
        document.getElementById('produtoImagem');

    const produtoNome =
        document.getElementById('produtoNome');

    const produtoDescricao =
        document.getElementById('produtoDescricao');

    const produtoPreco =
        document.getElementById('produtoPreco');

    const produtoCategoria =
        document.getElementById('produtoCategoria');

    const quantidadeProduto =
        document.getElementById('quantidadeProduto');

    const diminuirQuantidade =
        document.getElementById('diminuirQuantidade');

    const aumentarQuantidade =
        document.getElementById('aumentarQuantidade');

    const adicionarCarrinho =
        document.getElementById('adicionarCarrinho');


    let produtoAtual = null;
    let quantidadeAtual = 1;


    /* ==========================================
       FORMATAÇÃO DE PREÇO
    ========================================== */

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
       CRIAR BOTÃO COMPRAR NOS PRODUTOS
    ========================================== */

    itensCardapio.forEach(item => {

        const detalhes =
            item.querySelector('.item-detalhes');

        if (!detalhes) return;

        const botaoComprar =
            document.createElement('button');

        botaoComprar.className =
            'btn-comprar';

        botaoComprar.innerHTML =
            'Comprar';

        detalhes.appendChild(botaoComprar);


        /* Clique no botão comprar */

        botaoComprar.addEventListener('click', (event) => {

            event.stopPropagation();

            abrirProduto(item);

        });


        /* Clique no card inteiro */

        item.addEventListener('click', () => {

            abrirProduto(item);

        });

    });


    /* ==========================================
       ABRIR PRODUTO
    ========================================== */

    function abrirProduto(item) {

        const imagem =
            item.querySelector('.item-img img');

        const nome =
            item.querySelector('.item-header h3');

        const preco =
            item.querySelector('.preco');

        const descricao =
            item.querySelector('.descricao');


        produtoAtual = {

            nome:
                nome.textContent.trim(),

            preco:
                converterPreco(
                    preco.textContent
                ),

            imagem:
                imagem.src,

            descricao:
                descricao.textContent.trim(),

            categoria:
                item.dataset.categoria

        };


        quantidadeAtual = 1;

        atualizarQuantidade();


        produtoImagem.src =
            produtoAtual.imagem;

        produtoImagem.alt =
            produtoAtual.nome;

        produtoNome.textContent =
            produtoAtual.nome;

        produtoDescricao.textContent =
            produtoAtual.descricao;

        produtoPreco.textContent =
            formatarPreco(
                produtoAtual.preco
            );


        const categorias = {

            torres:
                'Torre de Batata',

            porcoes:
                'Porção',

            bebidas:
                'Bebida'

        };


        produtoCategoria.textContent =
            categorias[produtoAtual.categoria]
            || 'Produto';


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


    fecharProduto.addEventListener(
        'click',
        fecharModalProduto
    );


    produtoOverlay.addEventListener(
        'click',
        (event) => {

            if (
                event.target === produtoOverlay
            ) {

                fecharModalProduto();

            }

        }
    );


    /* ==========================================
       QUANTIDADE
    ========================================== */

    function atualizarQuantidade() {

        quantidadeProduto.textContent =
            quantidadeAtual;

    }


    diminuirQuantidade.addEventListener(
        'click',
        () => {

            if (quantidadeAtual > 1) {

                quantidadeAtual--;

                atualizarQuantidade();

            }

        }
    );


    aumentarQuantidade.addEventListener(
        'click',
        () => {

            quantidadeAtual++;

            atualizarQuantidade();

        }
    );


    /* ==========================================
       CARRINHO
    ========================================== */

    let carrinho =
        JSON.parse(
            localStorage.getItem('batatibaCarrinho')
        ) || [];


    const carrinhoOverlay =
        document.getElementById('carrinhoOverlay');

    const carrinhoItens =
        document.getElementById('carrinhoItens');

    const carrinhoTotal =
        document.getElementById('carrinhoTotal');

    const fecharCarrinho =
        document.getElementById('fecharCarrinho');

    const finalizarPedido =
        document.getElementById('finalizarPedido');


    /* ==========================================
       BOTÃO DO CARRINHO
    ========================================== */

    const botaoCarrinho =
        document.createElement('button');

    botaoCarrinho.className =
        'btn-carrinho';

    botaoCarrinho.innerHTML = `
        🛒
        <span>Carrinho</span>
        <b id="contadorCarrinho">0</b>
    `;

    /*
       Coloca o botão diretamente no body
       para o CSS conseguir deixá-lo fixo
       no canto inferior direito.
    */

    document.body.appendChild(botaoCarrinho);


    const contadorCarrinho =
        document.getElementById(
            'contadorCarrinho'
        );


    botaoCarrinho.addEventListener(
        'click',
        abrirCarrinho
    );


    /* ==========================================
       ADICIONAR AO CARRINHO
    ========================================== */

    adicionarCarrinho.addEventListener(
        'click',
        () => {

            if (!produtoAtual) return;


            const produtoExistente =
                carrinho.find(
                    item =>
                        item.nome === produtoAtual.nome
                );


            if (produtoExistente) {

                produtoExistente.quantidade +=
                    quantidadeAtual;

            } else {

                carrinho.push({

                    nome:
                        produtoAtual.nome,

                    preco:
                        produtoAtual.preco,

                    imagem:
                        produtoAtual.imagem,

                    quantidade:
                        quantidadeAtual

                });

            }


            salvarCarrinho();

            atualizarCarrinho();

            fecharModalProduto();

            abrirCarrinho();

        }
    );


    /* ==========================================
       SALVAR CARRINHO
    ========================================== */

    function salvarCarrinho() {

        localStorage.setItem(
            'batatibaCarrinho',
            JSON.stringify(carrinho)
        );

    }


    /* ==========================================
       ATUALIZAR CARRINHO
    ========================================== */

    function atualizarCarrinho() {

        carrinhoItens.innerHTML = '';


        if (carrinho.length === 0) {

            carrinhoItens.innerHTML = `

                <div class="carrinho-vazio">

                    <div class="carrinho-vazio-icon">
                        🛒
                    </div>

                    <h3>
                        Seu carrinho está vazio
                    </h3>

                    <p>
                        Adicione algumas delícias
                        do Batatiba!
                    </p>

                </div>

            `;

        }


        let total = 0;

        let quantidadeTotal = 0;


        carrinho.forEach(
            (item, index) => {

                const subtotal =
                    item.preco *
                    item.quantidade;

                total += subtotal;

                quantidadeTotal +=
                    item.quantidade;


                const itemCarrinho =
                    document.createElement('div');

                itemCarrinho.className =
                    'item-carrinho';


                itemCarrinho.innerHTML = `

                    <img
                        src="${item.imagem}"
                        alt="${item.nome}"
                    >

                    <div class="item-carrinho-info">

                        <h4>
                            ${item.nome}
                        </h4>

                        <span class="item-carrinho-preco">
                            ${formatarPreco(item.preco)}
                        </span>

                        <div class="item-carrinho-controle">

                            <button
                                class="btn-menos"
                                data-index="${index}"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantidade}
                            </span>

                            <button
                                class="btn-mais"
                                data-index="${index}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <div class="item-carrinho-final">

                        <strong>
                            ${formatarPreco(subtotal)}
                        </strong>

                        <button
                            class="btn-remover"
                            data-index="${index}"
                            title="Remover"
                        >
                            🗑️
                        </button>

                    </div>

                `;


                carrinhoItens.appendChild(
                    itemCarrinho
                );

            }
        );


        carrinhoTotal.textContent =
            formatarPreco(total);


        contadorCarrinho.textContent =
            quantidadeTotal;


        if (quantidadeTotal > 0) {

            contadorCarrinho.classList.add(
                'tem-produtos'
            );

        } else {

            contadorCarrinho.classList.remove(
                'tem-produtos'
            );

        }


        /* ==========================================
           BOTÃO +
        ========================================== */

        document.querySelectorAll(
            '.btn-mais'
        ).forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const index =
                        Number(btn.dataset.index);

                    carrinho[index].quantidade++;

                    salvarCarrinho();

                    atualizarCarrinho();

                }
            );

        });


        /* ==========================================
           BOTÃO -
        ========================================== */

        document.querySelectorAll(
            '.btn-menos'
        ).forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const index =
                        Number(btn.dataset.index);


                    if (
                        carrinho[index].quantidade > 1
                    ) {

                        carrinho[index].quantidade--;

                    } else {

                        carrinho.splice(index, 1);

                    }


                    salvarCarrinho();

                    atualizarCarrinho();

                }
            );

        });


        /* ==========================================
           BOTÃO REMOVER
        ========================================== */

        document.querySelectorAll(
            '.btn-remover'
        ).forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const index =
                        Number(btn.dataset.index);

                    carrinho.splice(index, 1);

                    salvarCarrinho();

                    atualizarCarrinho();

                }
            );

        });

    }


    /* ==========================================
       ABRIR CARRINHO
    ========================================== */

    function abrirCarrinho() {

        atualizarCarrinho();

        carrinhoOverlay.classList.add('ativo');

        document.body.style.overflow = 'hidden';

    }


    /* ==========================================
       FECHAR CARRINHO
    ========================================== */

    function fecharCarrinhoFunc() {

        carrinhoOverlay.classList.remove(
            'ativo'
        );


        if (
            !produtoOverlay.classList.contains('ativo')
        ) {

            document.body.style.overflow = '';

        }

    }


    fecharCarrinho.addEventListener(
        'click',
        fecharCarrinhoFunc
    );


    carrinhoOverlay.addEventListener(
        'click',
        (event) => {

            if (
                event.target === carrinhoOverlay
            ) {

                fecharCarrinhoFunc();

            }

        }
    );


    /* ==========================================
       FINALIZAR PEDIDO
    ========================================== */

    finalizarPedido.addEventListener(
        'click',
        () => {

            if (carrinho.length === 0) {

                alert(
                    'Seu carrinho está vazio!'
                );

                return;

            }


            let mensagem =
                'Olá! Gostaria de fazer um pedido no Batatiba:%0A%0A';


            let total = 0;


            carrinho.forEach(item => {

                const subtotal =
                    item.preco *
                    item.quantidade;

                total += subtotal;


                mensagem +=
                    `${item.quantidade}x ${item.nome} - ${formatarPreco(subtotal)}%0A`;

            });


            mensagem +=
                `%0A*Total: ${formatarPreco(total)}*`;


            /*
                TROQUE NUMERODOWHATSAPP
                PELO NÚMERO REAL DO BATATIBA.

                Exemplo:
                5541999999999
            */

            const numeroWhatsApp =
                '55NUMERODOWHATSAPP';


            const url =
                `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;


            window.open(
                url,
                '_blank'
            );

        }
    );


    /* ==========================================
       ESC
    ========================================== */

    document.addEventListener(
        'keydown',
        (event) => {

            if (event.key !== 'Escape') return;


            if (
                produtoOverlay.classList.contains(
                    'ativo'
                )
            ) {

                fecharModalProduto();

            }


            if (
                carrinhoOverlay.classList.contains(
                    'ativo'
                )
            ) {

                fecharCarrinhoFunc();

            }

        }
    );


    /* ==========================================
       INICIALIZAÇÃO
    ========================================== */

    atualizarCarrinho();

});