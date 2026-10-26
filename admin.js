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

    // Preenchida pela aba de usuários; usada pela importação para atualizar a tabela
    let rerenderUsuarios = () => {};

    /* =====================================================================
       EXPORTAÇÃO (TXT e CSV) - somente Administrador
       ===================================================================== */

    const btnExportarUsuarios = document.getElementById('btnExportarUsuarios');
    const btnExportarUsuariosCsv = document.getElementById('btnExportarUsuariosCsv') || document.getElementById('btnExportarUsuariosCSV');
    const btnExportarCardapio = document.getElementById('btnExportarCardapio');
    const btnExportarCardapioCsv = document.getElementById('btnExportarCardapioCsv') || document.getElementById('btnExportarCardapioCSV');

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
        rerenderUsuarios = renderizarUsuarios;
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

    /* =====================================================================
       IMPORTAÇÃO (CSV e TXT) - somente Administrador
       ===================================================================== */

    // Se true, o cargo "Administrador" do arquivo é aceito. Deixe false por segurança.
    const IMPORTAR_ADMIN_COMO_ADMIN = false;

    const COLUNAS_USUARIO = {
        nome: ['nome', 'name'],
        telefone: ['telefone', 'phone', 'celular', 'whatsapp'],
        email: ['email'],
        cargo: ['cargo', 'cargofuncao', 'funcao', 'role', 'perfil'],
        senha: ['senha', 'password']
    };

    const COLUNAS_ITEM = {
        id: ['id', 'codigo', 'codigoitem'],
        nome: ['nome', 'name', 'produto', 'item'],
        categoria: ['categoria', 'category'],
        preco: ['preco', 'precor', 'precors', 'valor', 'price'],   // "Preço (R$)" vira "precor"
        descricao: ['descricao', 'description'],
        imagem: ['imagem', 'image', 'foto']
    };

    // ---------- utilidades ----------
    function normalizarCabecalho(valor) {
        return String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    // Lê o arquivo como UTF-8; se vier em ANSI (Excel antigo), usa windows-1252.
    function lerArquivoTexto(input, aoLer) {
        input.addEventListener('change', async () => {
            const arquivo = input.files && input.files[0];
            if (!arquivo) return;

            try {
                const buffer = await arquivo.arrayBuffer();
                let texto;
                try {
                    texto = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
                } catch (_) {
                    texto = new TextDecoder('windows-1252').decode(buffer);
                }
                aoLer(texto.replace(/^\uFEFF/, ''), arquivo.name);
            } catch (erro) {
                console.error('Erro ao importar arquivo:', erro);
                alert('Não foi possível importar o arquivo. Confira o formato.');
            } finally {
                input.value = '';
            }
        });
    }

    function ligarImportacao(idBotao, idInput, aoLer) {
        const botao = document.getElementById(idBotao);
        const input = document.getElementById(idInput);
        if (!botao || !input) return;

        botao.classList.remove('hidden');
        botao.addEventListener('click', () => input.click());
        lerArquivoTexto(input, aoLer);
    }

    function limparCelula(valor) {
        let t = String(valor || '').trim();
        // remove o apóstrofo de proteção que o export coloca antes de = + - @
        if (/^'[=+\-@]/.test(t)) t = t.slice(1);
        return t;
    }

    function converterPreco(valor) {
        let t = String(valor || '').replace(/R\$/gi, '').replace(/\s/g, '');
        if (!t) return NaN;
        if (t.includes(',')) {
            t = t.replace(/\./g, '').replace(',', '.');          // 1.250,50 -> 1250.50
        } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
            t = t.replace(/\./g, '');                            // 1.250 -> 1250
        }
        const n = Number(t);
        return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
    }

    function formatarTelefone(digitos) {
        return digitos.length === 11
            ? digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            : digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    function gerarSenhaTemporaria() {
        const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        const bytes = new Uint32Array(8);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => alfabeto[b % alfabeto.length]).join('');
    }

    function mostrarResumo(titulo, adicionados, atualizados, ignorados, extras = []) {
        let msg = `${titulo}\n\nAdicionados: ${adicionados}\nAtualizados: ${atualizados}\nIgnorados: ${ignorados.length}`;
        if (ignorados.length) {
            msg += '\n\nMotivos:\n' + ignorados.slice(0, 8).map(m => '• ' + m).join('\n');
            if (ignorados.length > 8) msg += `\n• ... e mais ${ignorados.length - 8}`;
        }
        if (extras.length) msg += '\n\n' + extras.join('\n');
        alert(msg);
    }

    // ---------- leitura de CSV ----------
    // Aceita separador ";", "," ou tab, campos entre aspas e quebras de linha dentro de aspas.
    function analisarCsv(texto) {
        const primeira = texto.split(/\r?\n/)[0] || '';
        const contagem = { ';': 0, ',': 0, '\t': 0 };
        let aspas = false;

        for (const c of primeira) {
            if (c === '"') aspas = !aspas;
            else if (!aspas && c in contagem) contagem[c]++;
        }

        const separador = Object.keys(contagem).reduce((a, b) => contagem[b] > contagem[a] ? b : a);
        const linhas = [];
        let linha = [];
        let campo = '';
        aspas = false;

        const fecharCampo = () => { linha.push(limparCelula(campo)); campo = ''; };
        const fecharLinha = () => {
            fecharCampo();
            if (linha.some(v => v !== '')) linhas.push(linha);
            linha = [];
        };

        for (let i = 0; i < texto.length; i++) {
            const c = texto[i];

            if (c === '"') {
                if (aspas && texto[i + 1] === '"') { campo += '"'; i++; }
                else aspas = !aspas;
            } else if (c === separador && !aspas) {
                fecharCampo();
            } else if ((c === '\n' || c === '\r') && !aspas) {
                if (c === '\r' && texto[i + 1] === '\n') i++;
                fecharLinha();
            } else {
                campo += c;
            }
        }
        fecharLinha();
        return linhas;
    }

    // Converte o CSV em uma lista de registros { linha, nome, telefone, ... }
    function registrosDeCsv(texto, colunas, obrigatorias) {
        const linhas = analisarCsv(texto);
        if (linhas.length < 2) {
            return { erro: 'O arquivo está vazio ou não tem linhas de dados.' };
        }

        const cabecalho = linhas[0].map(normalizarCabecalho);
        const indices = {};
        Object.entries(colunas).forEach(([campo, nomes]) => {
            indices[campo] = cabecalho.findIndex(c => nomes.includes(c));
        });

        const faltando = obrigatorias.filter(c => indices[c] < 0);
        if (faltando.length) {
            return {
                erro: `Colunas obrigatórias não encontradas: ${faltando.join(', ')}.\n` +
                      `Colunas lidas no arquivo: ${linhas[0].join(' | ')}`
            };
        }

        const registros = linhas.slice(1).map((cols, i) => {
            const r = { linha: i + 2 };
            Object.keys(indices).forEach(campo => {
                r[campo] = indices[campo] >= 0 ? (cols[indices[campo]] || '') : undefined;
            });
            return r;
        });

        return { registros };
    }

    // ---------- leitura de TXT (mesmo formato do export) ----------
    // USUÁRIO 1 / Nome: ... / Telefone: ... / ----------
    const CHAVES_TXT = {
        nome: 'nome', telefone: 'telefone', email: 'email', cargo: 'cargo', senha: 'senha',
        id: 'id', categoria: 'categoria', preco: 'preco', descricao: 'descricao'
    };

    function registrosDeTxt(texto) {
        const registros = [];
        let atual = null;

        texto.split(/\r?\n/).forEach((bruta, i) => {
            const linha = bruta.trim();

            if (/^[-=_]{3,}$/.test(linha)) { atual = null; return; }

            const m = linha.match(/^([^:]+):\s*(.*)$/);
            if (!m) return;

            const chave = CHAVES_TXT[normalizarCabecalho(m[1])];
            if (!chave) return;                       // ignora "Total de usuários", "Data da exportação"...

            const valor = m[2].trim() === '-' ? '' : m[2].trim();

            // Um novo "Nome:" inicia um novo registro
            if (chave === 'nome' && (!atual || atual.nome !== undefined)) {
                atual = { linha: i + 1 };
                registros.push(atual);
            }
            if (atual) atual[chave] = valor;
        });

        return registros;
    }

    // ---------- importar USUÁRIOS ----------
    function importarUsuarios(registros) {
        const usuarios = batatibaGetUsers();
        const telefones = new Set(usuarios.map(u => String(u.phone || '').replace(/\D/g, '')).filter(Boolean));
        const emails = new Set(usuarios.map(u => String(u.email || '').trim().toLowerCase()).filter(Boolean));

        // Mapa de nome do cargo -> chave (usa BATATIBA_ROLES, aceita chave ou rótulo)
        const cargos = {};
        Object.entries(BATATIBA_ROLES).forEach(([chave, info]) => {
            cargos[normalizarCabecalho(chave)] = chave;
            cargos[normalizarCabecalho(info.label)] = chave;
        });
        if (BATATIBA_ROLES.admin) cargos.administrador = 'admin';

        const ignorados = [];
        const senhasGeradas = [];
        let adicionados = 0;
        let adminRebaixados = 0;

        registros.forEach(r => {
            const nome = (r.nome || '').trim().replace(/\s+/g, ' ');
            const rotulo = `Linha ${r.linha}${nome ? ` (${nome})` : ''}`;

            if (nome.split(' ').filter(Boolean).length < 2) {
                ignorados.push(`${rotulo}: informe o nome completo`);
                return;
            }

            let digitos = (r.telefone || '').replace(/\D/g, '');
            if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
                digitos = digitos.slice(2);
            }
            if (digitos.length < 10 || digitos.length > 11) {
                ignorados.push(`${rotulo}: telefone inválido`);
                return;
            }
            if (telefones.has(digitos)) {
                ignorados.push(`${rotulo}: telefone já cadastrado`);
                return;
            }

            const email = (r.email || '').trim();
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                ignorados.push(`${rotulo}: e-mail inválido`);
                return;
            }
            if (email && emails.has(email.toLowerCase())) {
                ignorados.push(`${rotulo}: e-mail já cadastrado`);
                return;
            }

            let role = cargos[normalizarCabecalho(r.cargo)] || 'cliente';
            if (role === 'admin' && !IMPORTAR_ADMIN_COMO_ADMIN) {
                role = 'cliente';
                adminRebaixados++;
            }

            let senha = (r.senha || '').trim();
            if (senha.length < 6) {
                senha = gerarSenhaTemporaria();
                senhasGeradas.push({ nome, telefone: formatarTelefone(digitos), senha });
            }

            usuarios.push({
                name: nome,
                phone: formatarTelefone(digitos),
                email,
                password: senha,
                avatar: '',
                role
            });

            telefones.add(digitos);
            if (email) emails.add(email.toLowerCase());
            adicionados++;
        });

        if (adicionados) {
            batatibaSaveUsers(usuarios);
            rerenderUsuarios();
        }

        const extras = [];
        if (adminRebaixados) {
            extras.push(`${adminRebaixados} pessoa(s) com cargo Administrador foram importadas como Cliente. Ajuste o cargo na tabela, se necessário.`);
        }
        if (senhasGeradas.length) {
            extras.push('Foram geradas senhas temporárias. O arquivo com as senhas será baixado agora.');
        }

        mostrarResumo('Importação de usuários concluída.', adicionados, 0, ignorados, extras);

        if (senhasGeradas.length) {
            let txt = 'BATATIBA - SENHAS TEMPORÁRIAS (guarde com cuidado e apague depois)\n';
            txt += '========================================\n\n';
            senhasGeradas.forEach(s => {
                txt += `Nome: ${s.nome}\nTelefone: ${s.telefone}\nSenha: ${s.senha}\n----------------------------------------\n`;
            });
            baixarTxt('batatiba-senhas-temporarias.txt', txt);
        }
    }

    // ---------- importar CARDÁPIO ----------
    function importarCardapio(registros) {
        const menu = batatibaGetMenu();

        const categorias = {};
        Object.entries(rotulosCategoria).forEach(([chave, rotulo]) => {
            categorias[normalizarCabecalho(chave)] = chave;
            categorias[normalizarCabecalho(rotulo)] = chave;
        });
        categorias.torre = 'torres';
        categorias.porcao = 'porcoes';
        categorias.bebida = 'bebidas';

        const chaveNome = (nome, categoria) => `${normalizarCabecalho(nome)}|${categoria}`;
        const porId = new Map(menu.map(i => [String(i.id), i]));
        const porNome = new Map(menu.map(i => [chaveNome(i.nome, i.categoria), i]));

        const ignorados = [];
        let adicionados = 0;
        let atualizados = 0;
        let semImagem = 0;

        registros.forEach((r, indice) => {
            const nome = (r.nome || '').trim();
            const rotulo = `Linha ${r.linha}${nome ? ` (${nome})` : ''}`;
            const categoria = categorias[normalizarCabecalho(r.categoria)];
            const preco = converterPreco(r.preco);

            if (!nome) { ignorados.push(`${rotulo}: nome vazio`); return; }
            if (!categoria) { ignorados.push(`${rotulo}: categoria inválida ("${r.categoria || ''}")`); return; }
            if (!Number.isFinite(preco) || preco < 0) { ignorados.push(`${rotulo}: preço inválido ("${r.preco || ''}")`); return; }

            const idOriginal = (r.id || '').trim();
            const descricao = (r.descricao || '').trim();
            const imagem = (r.imagem || '').trim();

            const existente = (idOriginal && porId.get(idOriginal)) || porNome.get(chaveNome(nome, categoria));

            if (existente) {
                let mudou = false;
                const novosValores = { nome, categoria, preco };
                if (descricao) novosValores.descricao = descricao;
                if (imagem) novosValores.imagem = imagem;

                Object.entries(novosValores).forEach(([campo, valor]) => {
                    if (existente[campo] !== valor) { existente[campo] = valor; mudou = true; }
                });

                if (mudou) atualizados++;
                return;
            }

            let id = idOriginal || (typeof batatibaGerarIdItem === 'function'
                ? batatibaGerarIdItem(nome)
                : `importado-${Date.now()}-${indice}`);
            while (porId.has(String(id))) id = `${id}-${indice}`;

            const novo = { id, nome, categoria, preco, imagem, descricao };
            menu.push(novo);
            porId.set(String(id), novo);
            porNome.set(chaveNome(nome, categoria), novo);
            if (!imagem) semImagem++;
            adicionados++;
        });

        if (adicionados || atualizados) {
            batatibaSaveMenu(menu);
            renderizarCardapioAdmin();
        }

        const extras = [];
        if (semImagem) {
            extras.push(`${semImagem} item(ns) novo(s) ficaram sem imagem. Use "Editar" para enviar a foto.`);
        }
        mostrarResumo('Importação do cardápio concluída.', adicionados, atualizados, ignorados, extras);
    }

    // ---------- ligar botões ----------
    if (ehAdministrador) {
        if (podeGerenciarUsuarios) {
            ligarImportacao('btnImportarUsuariosCSV', 'inputImportarUsuariosCSV', texto => {
                const { registros, erro } = registrosDeCsv(texto, COLUNAS_USUARIO, ['nome', 'telefone']);
                if (erro) { alert(erro); return; }
                importarUsuarios(registros);
            });

            ligarImportacao('btnImportarUsuariosTXT', 'inputImportarUsuariosTXT', texto => {
                const registros = registrosDeTxt(texto);
                if (!registros.length) {
                    alert('Nenhum usuário encontrado. Use o mesmo formato do arquivo exportado (Nome:, Telefone:, E-mail:, Cargo:).');
                    return;
                }
                importarUsuarios(registros);
            });
        }

        ligarImportacao('btnImportarCardapioCSV', 'inputImportarCardapioCSV', texto => {
            const { registros, erro } = registrosDeCsv(texto, COLUNAS_ITEM, ['nome', 'categoria', 'preco']);
            if (erro) { alert(erro); return; }
            importarCardapio(registros);
        });

        ligarImportacao('btnImportarCardapioTXT', 'inputImportarCardapioTXT', texto => {
            const registros = registrosDeTxt(texto);
            if (!registros.length) {
                alert('Nenhum item encontrado. Use o mesmo formato do arquivo exportado (Nome:, Categoria:, Preço:, Descrição:).');
                return;
            }
            importarCardapio(registros);
        });
    }
});