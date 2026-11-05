/* =====================================================================
   auth-shared.js
   Módulo compartilhado de autenticação, cargos/funções e dados do
   cardápio do site Batatiba. Deve ser incluído ANTES de script.js,
   cardapio.js e admin.js em todas as páginas que precisem dessas
   funções (index.html, cardapio.html e admin.html).
   ===================================================================== */

/* ---------- CARGOS/FUNÇÕES DISPONÍVEIS ---------- */
/* Novos cargos podem ser adicionados aqui no futuro. Cada cargo define
   quais permissões ele possui dentro do site. */
const BATATIBA_ROLES = {
  cliente: {
    label: 'Cliente',
    descricao: 'Conta padrão de clientes do restaurante.',
    podeGerenciarCardapio: false,
    podeGerenciarUsuarios: false,
    podeAcessarPainel: false
  },
  funcionario: {
    label: 'Funcionário',
    descricao: 'Pode adicionar, editar e remover itens do cardápio e alterar preços.',
    podeGerenciarCardapio: true,
    podeGerenciarUsuarios: false,
    podeAcessarPainel: true
  },
  admin: {
    label: 'Administrador',
    descricao: 'Acesso completo: gerencia cardápio, preços e contas/cargos de outros usuários.',
    podeGerenciarCardapio: true,
    podeGerenciarUsuarios: true,
    podeAcessarPainel: true
  }
};

const BATATIBA_ROLE_PADRAO = 'cliente';

/* ---------- DADOS INICIAIS DO CARDÁPIO (seed) ---------- */
/* Usados apenas na primeira vez que o site roda no navegador, para
   popular o localStorage. Depois disso, o cardápio "real" passa a
   viver inteiramente em localStorage['batatiba_menu'] e pode ser
   alterado pelo painel administrativo ou diretamente na página do
   cardápio por quem tiver permissão. */
const BATATIBA_MENU_INICIAL = [
  { id: 'torre-palito', categoria: 'torres', nome: 'Torre de Batata Palito', preco: 59.90,
    descricao: 'Batata frita Palito crocante, queijo derretido, bacon em cubos e molho especial da casa.',
    imagem: 'img/Torre_BatataNormal.jpeg' },
  { id: 'torre-crincles', categoria: 'torres', nome: 'Torre de Batata Crincles', preco: 65.89,
    descricao: 'Batata frita Crincles crocante, queijo derretido, bacon em cubos e molho especial da casa.',
    imagem: 'img/Torre_Batata_Crincles.jpeg' },
  { id: 'porcao-batacon', categoria: 'porcoes', nome: 'Porção Batacon', preco: 42.00,
    descricao: 'Porção generosa de batata frita coberta com bastante bacon e molho cheddar.',
    imagem: 'img/Batata com Bacon.jpeg' },
  { id: 'porcao-crinkles-calabresa', categoria: 'porcoes', nome: 'Batata Crinkles com Calabresa', preco: 38.90,
    descricao: 'Batatas onduladas crocantes acompanhadas de fatias de calabresa acebolada.',
    imagem: 'img/Batata Crincles com Calabresa.jpeg' },
  { id: 'porcao-alcatra', categoria: 'porcoes', nome: 'Porção de Alcatra', preco: 69.00,
    descricao: 'Porção de Alcatra suculenta, macia e crocante, 400g.',
    imagem: 'img/Porcao_de_Alcatra.jpeg' },
  { id: 'porcao-bacon', categoria: 'porcoes', nome: 'Porção de Bacon', preco: 39.00,
    descricao: 'Porção de bacon macio, gostoso, delicioso e crocante, 290g.',
    imagem: 'img/Porcao_de_Bacon.jpeg' },
  { id: 'porcao-batata', categoria: 'porcoes', nome: 'Porção de Batata', preco: 29.00,
    descricao: 'Porção de batata tradicional, crocante e macia, 300g.',
    imagem: 'img/Porcao_de_Batata.jpeg' },
  { id: 'porcao-batata-cheddar-bacon', categoria: 'porcoes', nome: 'Porção de Batata com Cheddar e Bacon', preco: 42.00,
    descricao: 'Porção de batata com cheddar supremo cremoso e bacon crocante e gostoso, 450g.',
    imagem: 'img/Porcao_de_Batata_com_Cheddar_e_Bacon.jpeg' },
  { id: 'porcao-batata-crinkles', categoria: 'porcoes', nome: 'Porção de Batata Crinkles', preco: 42.00,
    descricao: 'Porção de batata crinkles, crocante, macia e gostosa, 420g.',
    imagem: 'img/Porcao_de_Batata_CRINCLES.jpeg' },
  { id: 'bebida-coca', categoria: 'bebidas', nome: 'Coca-Cola (350ml)', preco: 7.50,
    descricao: 'Coca-Cola (350ml)', imagem: 'img/Coca-cola.jpeg' },
  { id: 'bebida-guarana', categoria: 'bebidas', nome: 'Guaraná (350ml)', preco: 7.50,
    descricao: 'Guaraná (350ml)', imagem: 'img/Guaraná.jpeg' },
  { id: 'bebida-pepsi', categoria: 'bebidas', nome: 'Pepsi (350ml)', preco: 7.50,
    descricao: 'Pepsi (350ml)', imagem: 'img/Pepsi.jpeg' },
  { id: 'bebida-fanta', categoria: 'bebidas', nome: 'Fanta (350ml)', preco: 7.50,
    descricao: 'Fanta (350ml)', imagem: 'img/Fanta.jpeg' },
  { id: 'bebida-suco-uva', categoria: 'bebidas', nome: 'Suco de Uva (350ml)', preco: 11.00,
    descricao: 'Suco de Uva (350ml)', imagem: 'img/Suco de Uva.jpeg' },
  { id: 'bebida-suco-laranja', categoria: 'bebidas', nome: 'Suco de Laranja (350ml)', preco: 7.50,
    descricao: 'Suco de Laranja (350ml)', imagem: 'img/Suco de Laranja.jpeg' }
];

/* Conta administradora padrão criada automaticamente na primeira vez
   que o site é aberto em um navegador, para que sempre exista pelo
   menos um administrador capaz de gerenciar o site.
   IMPORTANTE: troque a senha desta conta assim que possível pelo
   próprio painel de perfil (Minha Conta). */
const BATATIBA_ADMIN_PADRAO = {
  name: 'Administrador Batatiba',
  email: 'admin@batatiba.com',
  phone: '(00) 00000-0000',
  password: 'admin123',
  avatar: '',
  role: 'admin'
};

/* ---------- SEED / INICIALIZAÇÃO ---------- */
function batatibaSeedDados() {
  // Usuários: garante que exista ao menos 1 admin e que todo usuário
  // já cadastrado tenha um campo "role" (contas antigas viram 'cliente').
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('batatiba_users')) || [];
  } catch (e) {
    users = [];
  }

  let alterou = false;
  users.forEach(u => {
    if (!u.role || !BATATIBA_ROLES[u.role]) {
      u.role = BATATIBA_ROLE_PADRAO;
      alterou = true;
    }
  });

  const existeAdmin = users.some(u => u.role === 'admin');
  if (!existeAdmin) {
    users.push({ ...BATATIBA_ADMIN_PADRAO });
    alterou = true;
  }

  if (alterou) {
    localStorage.setItem('batatiba_users', JSON.stringify(users));
  }

  // Cardápio: só cria os itens padrão se ainda não existir nada salvo.
  if (!localStorage.getItem('batatiba_menu')) {
    localStorage.setItem('batatiba_menu', JSON.stringify(BATATIBA_MENU_INICIAL));
  }
}

/* ---------- HELPERS DE SESSÃO / PERMISSÃO ---------- */
function batatibaGetLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem('batatiba_logged_user'));
  } catch (e) {
    return null;
  }
}

function batatibaGetUsers() {
  try {
    return JSON.parse(localStorage.getItem('batatiba_users')) || [];
  } catch (e) {
    return [];
  }
}

function batatibaSaveUsers(users) {
  localStorage.setItem('batatiba_users', JSON.stringify(users));
}

function batatibaGetMenu() {
  try {
    return JSON.parse(localStorage.getItem('batatiba_menu')) || [];
  } catch (e) {
    return [];
  }
}

function batatibaSaveMenu(menu) {
  localStorage.setItem('batatiba_menu', JSON.stringify(menu));
}

function batatibaRoleInfo(role) {
  return BATATIBA_ROLES[role] || BATATIBA_ROLES[BATATIBA_ROLE_PADRAO];
}

function batatibaPodeGerenciarCardapio(user) {
  return !!(user && batatibaRoleInfo(user.role).podeGerenciarCardapio);
}

function batatibaPodeGerenciarUsuarios(user) {
  return !!(user && batatibaRoleInfo(user.role).podeGerenciarUsuarios);
}

function batatibaPodeAcessarPainel(user) {
  return !!(user && batatibaRoleInfo(user.role).podeAcessarPainel);
}

function batatibaFormatarPreco(valor) {
  const numero = Number(valor) || 0;
  return 'R$ ' + numero.toFixed(2).replace('.', ',');
}

function batatibaGerarIdItem(nome) {
  const base = (nome || 'item')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${Date.now().toString(36)}`;
}


/* ---------- CONSULTA DO CARDÁPIO (busca, filtro, ordenação e contagem) ---------- */
/* Usada tanto pela página do cardápio quanto pelo Painel Administrativo,
   para que as duas telas sempre consultem os dados do mesmo jeito. */
const BATATIBA_CATEGORIAS = {
  torres: 'Torres de Batata',
  porcoes: 'Porções',
  bebidas: 'Bebidas'
};

// Remove acentos e deixa em minúsculas: "Porção" e "porcao" passam a ser iguais.
function batatibaNormalizarTexto(texto) {
  return String(texto === null || texto === undefined ? '' : texto)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/* filtros = { busca, categoria, precoMin, precoMax, ordem }
   ordem: 'padrao' | 'nome-asc' | 'nome-desc' | 'preco-asc' | 'preco-desc' | 'categoria'

   Retorna:
   {
     itens,          // itens que passam por TODOS os filtros, já ordenados
     totalGeral,     // total de itens cadastrados (sem filtro nenhum)
     porCategoria,   // contagem por categoria respeitando busca e preço (mas não a categoria)
     totalSemCategoria, // soma de porCategoria (usado no botão "Todos")
     precoMedio, precoMenor, precoMaior, // estatísticas dos itens exibidos
     faixaInvalida   // true se o preço mínimo for maior que o máximo
   } */
function batatibaConsultarMenu(menu, filtros) {
  const f = filtros || {};
  const lista = Array.isArray(menu) ? menu : [];

  const termos = batatibaNormalizarTexto(f.busca).split(/\s+/).filter(Boolean);

  const lerNumero = (valor) => {
    if (valor === '' || valor === null || valor === undefined) return null;
    const n = Number(String(valor).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  const min = lerNumero(f.precoMin);
  const max = lerNumero(f.precoMax);
  const faixaInvalida = min !== null && max !== null && min > max;

  const categoria = f.categoria || 'todos';
  const ordem = f.ordem || 'padrao';

  const passaSemCategoria = (item) => {
    if (faixaInvalida) return false;

    const preco = Number(item.preco) || 0;
    if (min !== null && preco < min) return false;
    if (max !== null && preco > max) return false;

    if (termos.length) {
      const alvo = batatibaNormalizarTexto(
        `${item.nome} ${item.descricao} ${BATATIBA_CATEGORIAS[item.categoria] || item.categoria}`
      );
      if (!termos.every(termo => alvo.includes(termo))) return false;
    }
    return true;
  };

  // Contagem por categoria (ignora a categoria selecionada, para os botões)
  const porCategoria = {};
  Object.keys(BATATIBA_CATEGORIAS).forEach(c => { porCategoria[c] = 0; });
  let totalSemCategoria = 0;

  lista.forEach(item => {
    if (!passaSemCategoria(item)) return;
    porCategoria[item.categoria] = (porCategoria[item.categoria] || 0) + 1;
    totalSemCategoria++;
  });

  const itens = lista.filter(item =>
    passaSemCategoria(item) && (categoria === 'todos' || item.categoria === categoria)
  );

  // Ordenação
  const precoDe = (i) => Number(i.preco) || 0;
  const porNome = (a, b) =>
    String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' });
  const ordemCategorias = Object.keys(BATATIBA_CATEGORIAS);

  switch (ordem) {
    case 'nome-asc':   itens.sort(porNome); break;
    case 'nome-desc':  itens.sort((a, b) => porNome(b, a)); break;
    case 'preco-asc':  itens.sort((a, b) => precoDe(a) - precoDe(b) || porNome(a, b)); break;
    case 'preco-desc': itens.sort((a, b) => precoDe(b) - precoDe(a) || porNome(a, b)); break;
    case 'categoria':
      itens.sort((a, b) =>
        (ordemCategorias.indexOf(a.categoria) - ordemCategorias.indexOf(b.categoria)) || porNome(a, b));
      break;
    default: break; // 'padrao' = ordem em que foram cadastrados
  }

  // Estatísticas dos itens exibidos
  const precos = itens.map(precoDe);
  const precoMedio = precos.length ? precos.reduce((s, p) => s + p, 0) / precos.length : 0;
  const precoMenor = precos.length ? Math.min(...precos) : 0;
  const precoMaior = precos.length ? Math.max(...precos) : 0;

  return {
    itens,
    totalGeral: lista.length,
    porCategoria,
    totalSemCategoria,
    precoMedio,
    precoMenor,
    precoMaior,
    faixaInvalida
  };
}

// Roda a inicialização assim que este arquivo é carregado, em
// qualquer página que o inclua.
batatibaSeedDados();
