document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogado = typeof batatibaGetLoggedUser === 'function' ? batatibaGetLoggedUser() : null;
    const temAcesso = typeof batatibaPodeAcessarPainel === 'function' && batatibaPodeAcessarPainel(usuarioLogado);

    const semAcesso = document.getElementById('admin-sem-acesso');
    const conteudo = document.getElementById('admin-conteudo');

    if (!temAcesso) {
        if (semAcesso) semAcesso.classList.remove('hidden');
        if (conteudo) conteudo.classList.add('hidden');
        return;
    }

    if (semAcesso) semAcesso.classList.add('hidden');
    if (conteudo) conteudo.classList.remove('hidden');

    const podeGerenciarUsuarios = batatibaPodeGerenciarUsuarios(usuarioLogado);
    const ehAdministrador = usuarioLogado && usuarioLogado.role === 'admin';

    // ---------- CABEÇALHO ----------
    const boasVindas = document.getElementById('admin-boas-vindas');
    const cargoBadge = document.getElementById('admin-cargo-badge');
    if (boasVindas) boasVindas.textContent = `Olá, ${usuarioLogado.name.split(' ')[0]}! Gerencie o site por aqui.`;
    if (cargoBadge) {
        const info = batatibaRoleInfo(usuarioLogado.role);
        cargoBadge.textContent = info.label;
        cargoBadge.classList.toggle('badge-admin', usuarioLogado.role === 'admin');
        cargoBadge.classList.toggle('badge-funcionario', usuarioLogado.role === 'funcionario');
    }

    // Telefone (só dígitos) da conta logada, usado para identificação estável
    const telefoneUsuarioLogado = (usuarioLogado.phone || '').replace(/\D/g, '');

    const rotulosCategoria = { torres: 'Torres de Batata', porcoes: 'Porções', bebidas: 'Bebidas' };

    /* =====================================================================
       EXPORTAÇÃO (TXT e CSV) - somente Administrador
       ===================================================================== */

    const btnExportarUsuarios = document.getElementById('btnExportarUsuarios');
    const btnExportarUsuariosCsv = document.getElementById('btnExportarUsuariosCsv');
    const btnExportarCardapio = document.getElementById('btnExportarCardapio');
    const btnExportarCardapioCsv = document.getElementById('btnExportarCardapioCsv');

    // Baixa qualquer conteúdo de texto como arquivo
    function baixarArquivo(nomeArquivo, conteudoArquivo, tipoMime) {
        const blob = new Blob([conteudoArquivo], { type: tipoMime });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    function baixarTxt(nomeArquivo, texto) {
        baixarArquivo(nomeArquivo, texto, 'text/plain;charset=utf-8');
    }

    // CSV: separador ";" (padrão do Excel em português) e BOM UTF-8
    // para que acentos (ç, ã, é...) abram corretamente no Excel.
    function csvCelula(valor) {
        let texto = valor === null || valor === undefined ? '' : String(valor);

        // Evita que o Excel interprete o texto como fórmula (=, +, -, @)
        if (/^[=+\-@\t\r]/.test(texto)) {
            texto = "'" + texto;
        }

        return '"' + texto.replace(/"/g, '""') + '"';
    }

    function baixarCsv(nomeArquivo, cabecalho, linhas) {
        const todas = [cabecalho, ...linhas];
        const csv = todas
            .map(linha => linha.map(csvCelula).join(';'))
            .join('\r\n');

        baixarArquivo(nomeArquivo, '\uFEFF' + csv, 'text/csv;charset=utf-8');
    }

    function nomeDoCargo(role) {
        return typeof batatibaRoleInfo === 'function' ? batatibaRoleInfo(role).label : role;
    }

    function precoFormatado(preco) {
        return typeof batatibaFormatarPreco === 'function'
            ? batatibaFormatarPreco(preco)
            : (preco || '-');
    }

    // ---------- USUÁRIOS ----------
    function exportarUsuariosTxt() {
        if (!ehAdministrador) {
            alert('Apenas administradores podem exportar os usuários.');
            return;
        }

        const usuarios = batatibaGetUsers();

        let texto = '';
        texto += 'BATATIBA - USUÁRIOS CADASTRADOS\n';
        texto += '========================================\n';
        texto += `Total de usuários: ${usuarios.length}\n`;
        texto += `Data da exportação: ${new Date().toLocaleString('pt-BR')}\n`;
        texto += '========================================\n\n';

        usuarios.forEach((usuario, index) => {
            texto += `USUÁRIO ${index + 1}\n`;
            texto += `Nome: ${usuario.name || '-'}\n`;
            texto += `Telefone: ${usuario.phone || '-'}\n`;
            texto += `E-mail: ${usuario.email || '-'}\n`;
            texto += `Cargo: ${nomeDoCargo(usuario.role) || '-'}\n`;
            texto += '----------------------------------------\n';
        });

        baixarTxt('batatiba-usuarios.txt', texto);
    }

    function exportarUsuariosCsv() {
        if (!ehAdministrador) {
            alert('Apenas administradores podem exportar os usuários.');
            return;
        }

        const usuarios = batatibaGetUsers();

        const cabecalho = ['Nome', 'Telefone', 'E-mail', 'Cargo'];
        const linhas = usuarios.map(usuario => [
            usuario.name || '',
            usuario.phone || '',
            usuario.email || '',
            nomeDoCargo(usuario.role) || ''
        ]);

        baixarCsv('batatiba-usuarios.csv', cabecalho, linhas);
    }

    // ---------- CARDÁPIO ----------
    function exportarCardapioTxt() {
        if (!ehAdministrador) {
            alert('Apenas administradores podem exportar o cardápio.');
            return;
        }

        const cardapio = batatibaGetMenu();

        let texto = '';
        texto += 'BATATIBA - CARDÁPIO\n';
        texto += '========================================\n';
        texto += `Total de itens: ${cardapio.length}\n`;
        texto += `Data da exportação: ${new Date().toLocaleString('pt-BR')}\n`;
        texto += '========================================\n\n';

        cardapio.forEach((item, index) => {
            texto += `ITEM ${index + 1}\n`;
            texto += `Nome: ${item.nome || '-'}\n`;
            texto += `Categoria: ${rotulosCategoria[item.categoria] || item.categoria || '-'}\n`;
            texto += `Preço: ${precoFormatado(item.preco)}\n`;
            texto += `Descrição: ${item.descricao || '-'}\n`;
            texto += '----------------------------------------\n';
        });

        baixarTxt('batatiba-cardapio.txt', texto);
    }

    function exportarCardapioCsv() {
        if (!ehAdministrador) {
            alert('Apenas administradores podem exportar o cardápio.');
            return;
        }

        const cardapio = batatibaGetMenu();

        // Preço como número com vírgula (ex.: 12,50) para o Excel reconhecer como valor.
        // A imagem não é exportada (é um arquivo grande embutido).
        const cabecalho = ['ID', 'Nome', 'Categoria', 'Preço (R$)', 'Descrição'];
        const linhas = cardapio.map(item => [
            item.id || '',
            item.nome || '',
            rotulosCategoria[item.categoria] || item.categoria || '',
            Number(item.preco || 0).toFixed(2).replace('.', ','),
            item.descricao || ''
        ]);

        baixarCsv('batatiba-cardapio.csv', cabecalho, linhas);
    }

    // Mostra os botões somente para o Administrador
    if (ehAdministrador) {
        [
            [btnExportarUsuarios, exportarUsuariosTxt],
            [btnExportarUsuariosCsv, exportarUsuariosCsv],
            [btnExportarCardapio, exportarCardapioTxt],
            [btnExportarCardapioCsv, exportarCardapioCsv]
        ].forEach(([botao, acao]) => {
            if (!botao) return;
            botao.classList.remove('hidden');
            botao.addEventListener('click', acao);
        });
    }

    // ---------- ABAS ----------
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabPaineis = {
        usuarios: document.getElementById('tab-usuarios'),
        cardapio: document.getElementById('tab-cardapio')
    };

    // Aba de usuários só é exibida para quem tem permissão de gerenciar usuários (admin)
    const btnTabUsuarios = document.querySelector('.admin-tab-btn[data-tab="usuarios"]');
    if (!podeGerenciarUsuarios) {
        if (btnTabUsuarios) btnTabUsuarios.classList.add('hidden');
        if (tabPaineis.usuarios) tabPaineis.usuarios.classList.add('hidden');
        if (tabPaineis.cardapio) tabPaineis.cardapio.classList.remove('hidden');
        const btnTabCardapio = document.querySelector('.admin-tab-btn[data-tab="cardapio"]');
        if (btnTabCardapio) btnTabCardapio.classList.add('active');
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.entries(tabPaineis).forEach(([nome, painel]) => {
                if (!painel) return;
                painel.classList.toggle('hidden', nome !== btn.dataset.tab);
            });
        });
    });

    /* =====================================================================
       ABA USUÁRIOS / CARGOS
       ===================================================================== */
    if (podeGerenciarUsuarios) {
        const formNovoUsuario = document.getElementById('formNovoUsuario');
        const novoNome = document.getElementById('novoNome');
        const novoTelefone = document.getElementById('novoTelefone');
        const novoEmail = document.getElementById('novoEmail');
        const novoCargo = document.getElementById('novoCargo');
        const novaSenha = document.getElementById('novaSenha');
        const tabelaUsuariosBody = document.querySelector('#tabelaUsuarios tbody');

        function setErro(input, msg) {
            if (!input) return;
            const el = document.querySelector(`[data-error-for="${input.id}"]`);
            input.classList.toggle('invalid', !!msg);
            if (el) el.textContent = msg || '';
        }

        function mascararTelefone(e) {
            let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
            if (digits.length > 6) {
                e.target.value = digits.replace(/(\d{2})(\d{4,5})(\d{0,4})/, (m, a, b, c) => c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`);
            } else if (digits.length > 2) {
                e.target.value = digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                e.target.value = digits;
            }
        }
        if (novoTelefone) novoTelefone.addEventListener('input', mascararTelefone);

        function preencherOpcoesCargo(select) {
            if (!select) return;
            select.innerHTML = '';
            Object.entries(BATATIBA_ROLES).forEach(([chave, info]) => {
                const opt = document.createElement('option');
                opt.value = chave;
                opt.textContent = info.label;
                select.appendChild(opt);
            });
        }
        preencherOpcoesCargo(novoCargo);

        function contarAdmins(users) {
            return users.filter(u => u.role === 'admin').length;
        }

        function renderizarUsuarios() {
            if (!tabelaUsuariosBody) return;
            const users = batatibaGetUsers();
            const totalAdmins = contarAdmins(users);
            tabelaUsuariosBody.innerHTML = '';

            users.forEach((user, idx) => {
                const telefoneDigits = (user.phone || '').replace(/\D/g, '');
                const ehVoceMesmo = telefoneDigits === telefoneUsuarioLogado;
                const ehUnicoAdmin = user.role === 'admin' && totalAdmins <= 1;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}${ehVoceMesmo ? '<span class="badge-voce">Você</span>' : ''}</td>
                    <td>${user.phone || '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td>
                        <select class="select-cargo" data-idx="${idx}" ${ehUnicoAdmin ? 'disabled title="Deve existir ao menos 1 administrador"' : ''}></select>
                    </td>
                    <td>
                        <div class="linha-acoes">
                            <button type="button" class="btn-tabela-salvar" data-idx="${idx}">Salvar cargo</button>
                            <button type="button" class="btn-tabela-remover" data-idx="${idx}" ${ehUnicoAdmin ? 'disabled title="Não é possível remover o único administrador"' : ''}>Remover</button>
                        </div>
                    </td>
                `;
                const select = tr.querySelector('.select-cargo');
                preencherOpcoesCargo(select);
                select.value = user.role;
                tabelaUsuariosBody.appendChild(tr);
            });
        }

        if (tabelaUsuariosBody) {
            tabelaUsuariosBody.addEventListener('click', (e) => {
                const btnSalvar = e.target.closest('.btn-tabela-salvar');
                const btnRemover = e.target.closest('.btn-tabela-remover');

                if (btnSalvar) {
                    const idx = Number(btnSalvar.dataset.idx);
                    const users = batatibaGetUsers();
                    const select = tabelaUsuariosBody.querySelector(`.select-cargo[data-idx="${idx}"]`);
                    if (!users[idx] || !select) return;

                    const cargoAtual = users[idx].role;
                    const novoCargoValor = select.value;

                    if (cargoAtual === 'admin' && novoCargoValor !== 'admin' && contarAdmins(users) <= 1) {
                        alert('Não é possível remover o cargo do único administrador do site.');
                        return;
                    }

                    users[idx].role = novoCargoValor;
                    batatibaSaveUsers(users);

                    // Se a conta editada for a que está logada agora, atualiza a sessão
                    const telefoneEditado = (users[idx].phone || '').replace(/\D/g, '');
                    if (telefoneEditado === telefoneUsuarioLogado) {
                        localStorage.setItem('batatiba_logged_user', JSON.stringify(users[idx]));
                    }

                    alert(`Cargo de ${users[idx].name} atualizado para "${batatibaRoleInfo(novoCargoValor).label}".`);
                    renderizarUsuarios();
                }

                if (btnRemover) {
                    const idx = Number(btnRemover.dataset.idx);
                    const users = batatibaGetUsers();
                    if (!users[idx]) return;

                    if (users[idx].role === 'admin' && contarAdmins(users) <= 1) {
                        alert('Não é possível remover o único administrador do site.');
                        return;
                    }

                    const confirmar = confirm(`Remover a conta de ${users[idx].name}? Essa ação não pode ser desfeita.`);
                    if (!confirmar) return;

                    users.splice(idx, 1);
                    batatibaSaveUsers(users);
                    renderizarUsuarios();
                }
            });
        }

        if (formNovoUsuario) {
            formNovoUsuario.addEventListener('submit', (e) => {
                e.preventDefault();
                let valido = true;

                if (novoNome.value.trim().split(' ').filter(Boolean).length < 2) {
                    setErro(novoNome, 'Informe o nome completo');
                    valido = false;
                } else {
                    setErro(novoNome, '');
                }

                const digitsTelefone = novoTelefone.value.replace(/\D/g, '');
                if (digitsTelefone.length < 10 || digitsTelefone.length > 11) {
                    setErro(novoTelefone, 'Informe um telefone válido');
                    valido = false;
                } else {
                    setErro(novoTelefone, '');
                }

                if (novoEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail.value)) {
                    setErro(novoEmail, 'E-mail inválido');
                    valido = false;
                } else {
                    setErro(novoEmail, '');
                }

                if (novaSenha.value.length < 6) {
                    setErro(novaSenha, 'A senha deve ter ao menos 6 caracteres');
                    valido = false;
                } else {
                    setErro(novaSenha, '');
                }

                if (!valido) return;

                const users = batatibaGetUsers();
                const jaExiste = users.some(u => (u.phone || '').replace(/\D/g, '') === digitsTelefone);
                if (jaExiste) {
                    setErro(novoTelefone, 'Já existe uma conta com este telefone');
                    return;
                }

                users.push({
                    name: novoNome.value.trim(),
                    email: novoEmail.value.trim(),
                    phone: novoTelefone.value.trim(),
                    password: novaSenha.value,
                    avatar: '',
                    role: novoCargo.value
                });

                batatibaSaveUsers(users);
                formNovoUsuario.reset();
                preencherOpcoesCargo(novoCargo);
                alert('Pessoa adicionada com sucesso! Ela já pode entrar usando o telefone e a senha temporária cadastrados.');
                renderizarUsuarios();
            });
        }

        renderizarUsuarios();
    }

    /* =====================================================================
       ABA CARDÁPIO / PREÇOS
       ===================================================================== */
    const formItemAdmin = document.getElementById('formItemAdmin');
    const tituloFormItem = document.getElementById('tituloFormItem');
    const adminItemId = document.getElementById('adminItemId');
    const adminItemNome = document.getElementById('adminItemNome');
    const adminItemCategoria = document.getElementById('adminItemCategoria');
    const adminItemPreco = document.getElementById('adminItemPreco');
    const adminItemImagem = document.getElementById('adminItemImagem');
    const adminItemImagemArquivo = document.getElementById('adminItemImagemArquivo');
    const adminItemImagemPreview = document.getElementById('adminItemImagemPreview');
    const adminItemDescricao = document.getElementById('adminItemDescricao');
    const btnCancelarItemAdmin = document.getElementById('btnCancelarItemAdmin');
    const tabelaCardapioBody = document.querySelector('#tabelaCardapio tbody');

    // Ao escolher um arquivo PNG/JPEG no computador, converte para imagem
    // embutida (data URL) e guarda no campo oculto usado ao salvar o item.
    if (adminItemImagemArquivo) {
        adminItemImagemArquivo.addEventListener('change', (e) => {
            const arquivo = e.target.files[0];
            if (!arquivo) return;

            if (!['image/png', 'image/jpeg'].includes(arquivo.type)) {
                alert('Selecione um arquivo PNG ou JPEG.');
                adminItemImagemArquivo.value = '';
                return;
            }

            const leitor = new FileReader();
            leitor.onload = (ev) => {
                adminItemImagem.value = ev.target.result;
                if (adminItemImagemPreview) {
                    adminItemImagemPreview.src = ev.target.result;
                    adminItemImagemPreview.classList.remove('hidden');
                }
            };
            leitor.readAsDataURL(arquivo);
        });
    }

    function limparFormItem() {
        if (!formItemAdmin) return;
        formItemAdmin.reset();
        adminItemId.value = '';
        adminItemImagem.value = '';
        if (adminItemImagemArquivo) adminItemImagemArquivo.value = '';
        if (adminItemImagemPreview) {
            adminItemImagemPreview.src = '';
            adminItemImagemPreview.classList.add('hidden');
        }
        tituloFormItem.textContent = 'Adicionar item ao cardápio';
        btnCancelarItemAdmin.classList.add('hidden');
    }

    function renderizarCardapioAdmin() {
        if (!tabelaCardapioBody) return;
        const menu = batatibaGetMenu();
        tabelaCardapioBody.innerHTML = '';

        menu.forEach((item) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nome}</td>
                <td>${rotulosCategoria[item.categoria] || item.categoria}</td>
                <td><input type="number" min="0" step="0.01" class="input-preco-inline" data-id="${item.id}" value="${item.preco}"></td>
                <td>
                    <div class="linha-acoes">
                        <button type="button" class="btn-tabela-salvar" data-acao="preco" data-id="${item.id}">Salvar preço</button>
                        <button type="button" class="btn-tabela-editar" data-acao="editar" data-id="${item.id}">Editar</button>
                        <button type="button" class="btn-tabela-remover" data-acao="remover" data-id="${item.id}">Remover</button>
                    </div>
                </td>
            `;
            tabelaCardapioBody.appendChild(tr);
        });
    }

    if (formItemAdmin) {
        formItemAdmin.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = adminItemNome.value.trim();
            const categoria = adminItemCategoria.value;
            const preco = parseFloat(adminItemPreco.value);
            const imagem = adminItemImagem.value.trim();
            const descricao = adminItemDescricao.value.trim();

            if (!nome || !categoria || isNaN(preco) || preco < 0 || !imagem || !descricao) {
                alert('Preencha todos os campos corretamente.');
                return;
            }

            const menu = batatibaGetMenu();

            if (adminItemId.value) {
                const idx = menu.findIndex(i => i.id === adminItemId.value);
                if (idx !== -1) menu[idx] = { ...menu[idx], nome, categoria, preco, imagem, descricao };
            } else {
                menu.push({ id: batatibaGerarIdItem(nome), nome, categoria, preco, imagem, descricao });
            }

            batatibaSaveMenu(menu);
            limparFormItem();
            renderizarCardapioAdmin();
        });
    }

    if (btnCancelarItemAdmin) {
        btnCancelarItemAdmin.addEventListener('click', limparFormItem);
    }

    if (tabelaCardapioBody) {
        tabelaCardapioBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-acao]');
            if (!btn) return;
            const { acao, id } = btn.dataset;
            const menu = batatibaGetMenu();
            const item = menu.find(i => i.id === id);
            if (!item) return;

            if (acao === 'preco') {
                const input = tabelaCardapioBody.querySelector(`.input-preco-inline[data-id="${id}"]`);
                const novoPreco = parseFloat(input.value);
                if (isNaN(novoPreco) || novoPreco < 0) {
                    alert('Informe um preço válido.');
                    return;
                }
                item.preco = novoPreco;
                batatibaSaveMenu(menu);
                alert(`Preço de "${item.nome}" atualizado para ${batatibaFormatarPreco(novoPreco)}.`);
            }

            if (acao === 'editar') {
                tituloFormItem.textContent = 'Editar item do cardápio';
                adminItemId.value = item.id;
                adminItemNome.value = item.nome;
                adminItemCategoria.value = item.categoria;
                adminItemPreco.value = item.preco;
                adminItemImagem.value = item.imagem;
                adminItemDescricao.value = item.descricao;
                if (adminItemImagemArquivo) adminItemImagemArquivo.value = '';
                if (adminItemImagemPreview) {
                    adminItemImagemPreview.src = item.imagem;
                    adminItemImagemPreview.classList.remove('hidden');
                }
                btnCancelarItemAdmin.classList.remove('hidden');
                formItemAdmin.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            if (acao === 'remover') {
                const confirmar = confirm(`Remover "${item.nome}" do cardápio?`);
                if (!confirmar) return;
                const novoMenu = menu.filter(i => i.id !== id);
                batatibaSaveMenu(novoMenu);
                renderizarCardapioAdmin();
            }
        });
    }

    renderizarCardapioAdmin();
});