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

// Roda a inicialização assim que este arquivo é carregado, em
// qualquer página que o inclua.
batatibaSeedDados();
