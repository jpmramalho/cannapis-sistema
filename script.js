// Autenticação simples
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('error-message');

      if (username === '1' && password === '1') {
        window.location.href = 'dashboard.html';
      } else {
        errorMessage.textContent = 'Usuário ou senha incorretos.';
      }
    });
  }
});

// Alternar submenu de Produtos
function toggleSubmenu() {
  const submenu = document.getElementById('produtos-submenu');
  submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

// Mostrar seção selecionada
function showSection(sectionId) {
  // Atualiza título
  document.getElementById('section-title').textContent =
    sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

  // Esconde todas
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => section.classList.remove('active'));

  // Mostra a escolhida
  const selected = document.getElementById(sectionId);
  if (selected) selected.classList.add('active');

  // Remove 'active' do menu
  const menuItems = document.querySelectorAll('.sidebar ul > li');
  menuItems.forEach((item) => item.classList.remove('active'));

  // Marca 'Home', 'Pedidos' ou 'Sair' como ativo se aplicável
  const item = Array.from(menuItems).find((el) =>
    el.textContent.toLowerCase() === sectionId
  );
  if (item) item.classList.add('active');

  // Se a seção 'cadastro' for ativada e o submenu 'produtos' estiver fechado, abra-o.
  // Isso melhora a navegação UX.
  if (sectionId === 'cadastro' || sectionId === 'consulta' || sectionId === 'relatorio') {
    const produtosSubmenu = document.getElementById('produtos-submenu');
    if (produtosSubmenu.style.display === 'none') {
      produtosSubmenu.style.display = 'block';
    }
  }
}


// Logout
function logout() {
  alert('Você saiu do sistema.');
  window.location.href = 'index.html';
}

// Funções para o Modal de Tipo de Produto
function openProductTypeModal() {
  document.getElementById('product-type-modal').style.display = 'block';
}

function closeProductTypeModal() {
  document.getElementById('product-type-modal').style.display = 'none';
}

function saveNewProductType() {
  const newTypeInput = document.getElementById('new-product-type');
  const newType = newTypeInput.value.trim(); // .trim() remove espaços em branco extras

  if (newType) {
    alert(`Tipo de Produto "${newType}" salvo (neste exemplo, apenas alerta). Em um sistema real, isso enviaria para um banco de dados.`);
    // Em um sistema real, você adicionaria o tipo a uma lista (ex: um select)
    // ou faria uma chamada API para salvar no backend.
    document.getElementById('product-type').value = newType; // Preenche o campo principal
    closeProductTypeModal();
    newTypeInput.value = ''; // Limpa o campo do modal
  } else {
    alert('Por favor, insira um nome para o novo tipo de produto.');
  }
}

// Funções para os botões do formulário de produto
function saveProduct() {
  const productType = document.getElementById('product-type').value;
  const productName = document.getElementById('product-name').value;
  const productDescription = document.getElementById('product-description').value;
  const productPrice = document.getElementById('product-price').value;

  if (!productName.trim()) { // Valida se o nome não está vazio ou só com espaços
    alert('Nome do Produto é obrigatório!');
    return;
  }

  // Coletar todos os dados do formulário para demonstração
  const productData = {
    tipo: productType,
    nome: productName,
    descricao: productDescription,
    preco: productPrice
  };

  alert(`Produto salvo:\n${JSON.stringify(productData, null, 2)}\n(Neste exemplo, os dados são apenas exibidos. Em um sistema real, seriam enviados para um backend.)`);
  // Aqui você adicionaria a lógica para enviar `productData` para um servidor (ex: fetch API)
  // E talvez limpar o formulário após salvar com sucesso:
  // document.getElementById('product-registration-form').reset();
  // document.getElementById('product-type').value = ''; // Resetar campo readonly
}

function editProduct() {
  alert('Funcionalidade de Editar Produto: Primeiro, você precisaria selecionar um produto existente para editar.');
  // Em um sistema real, aqui você carregaria os dados de um produto existente (ex: por ID)
  // para preencher o formulário, e a função "Salvar" seria usada para atualizar.
}

function deleteProduct() {
  // Em um sistema real, você precisaria saber qual produto excluir.
  // Por exemplo, ter um ID de produto selecionado.
  if (confirm('Tem certeza que deseja excluir este produto?\n(Esta é uma demonstração. Em um sistema real, um produto específico seria excluído.)')) {
    alert('Funcionalidade de Excluir Produto (implementação real exige um ID de produto).');
    // Em um sistema real, aqui você implementaria a lógica para excluir o produto do backend
    // e possivelmente limpar o formulário ou redirecionar.
  }
}

// Adicionar um event listener para o submit do formulário de produto
document.addEventListener('DOMContentLoaded', function() {
  const productForm = document.getElementById('product-registration-form');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o envio padrão do formulário
      saveProduct(); // Chama a função de salvar
    });
  }

  // Fechar o modal clicando fora dele
  const modal = document.getElementById('product-type-modal');
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});