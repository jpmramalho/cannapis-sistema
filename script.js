// Simulação de "banco de dados" de produtos
// Em um sistema real, isso viria de um backend (API, banco de dados)
let products = [];
let nextProductId = 1; // Para simular IDs únicos para cada produto

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

  // Adicionar um event listener para o submit do formulário de produto
  const productForm = document.getElementById('product-registration-form');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o envio padrão do formulário
      saveProduct(); // Chama a função de salvar
    });
  }

  // Fechar o modal clicando fora dele
  const modal = document.getElementById('product-type-modal');
  if (modal) { // Verifica se o modal existe na página (só no dashboard)
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  // Carregar a lista de produtos quando a página for carregada ou a seção de consulta for mostrada
  if (document.getElementById('product-list-body')) {
    renderProductList();
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
  const item = Array.from(menuItems).find((el) => {
      // Verifica o texto do item ou o texto dentro de um submenu
      if (el.textContent.toLowerCase() === sectionId) return true;
      const submenuItems = el.querySelectorAll('ul li');
      return Array.from(submenuItems).some(subItem => subItem.textContent.toLowerCase() === sectionId);
  });
  if (item) item.classList.add('active');

  // Se a seção 'cadastro', 'consulta' ou 'relatorio' for ativada, abra o submenu 'produtos'.
  if (sectionId === 'cadastro' || sectionId === 'consulta' || sectionId === 'relatorio') {
    const produtosSubmenu = document.getElementById('produtos-submenu');
    if (produtosSubmenu.style.display === 'none') {
      produtosSubmenu.style.display = 'block';
    }
  }

  // Se a seção de consulta for mostrada, renderiza a lista de produtos
  if (sectionId === 'consulta') {
    renderProductList();
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
  const newType = newTypeInput.value.trim();

  if (newType) {
    alert(`Tipo de Produto "${newType}" salvo (neste exemplo, apenas alerta). Em um sistema real, isso enviaria para um banco de dados.`);
    document.getElementById('product-type').value = newType;
    closeProductTypeModal();
    newTypeInput.value = '';
  } else {
    alert('Por favor, insira um nome para o novo tipo de produto.');
  }
}

// Funções para os botões do formulário de produto
function saveProduct() {
  const productType = document.getElementById('product-type').value.trim();
  const productName = document.getElementById('product-name').value.trim();
  const productDescription = document.getElementById('product-description').value.trim();
  const productPrice = parseFloat(document.getElementById('product-price').value); // Converte para número

  if (!productName) {
    alert('Nome do Produto é obrigatório!');
    return;
  }
  if (isNaN(productPrice) || productPrice < 0) {
      alert('Por favor, insira um preço válido para o produto.');
      return;
  }

  // Cria um novo objeto produto
  const newProduct = {
    id: nextProductId++, // Atribui um ID único
    tipo: productType,
    nome: productName,
    descricao: productDescription,
    preco: productPrice.toFixed(2) // Formata o preço com 2 casas decimais
  };

  products.push(newProduct); // Adiciona o produto ao array de simulação

  alert(`Produto "${productName}" salvo com sucesso!\n(Visualizável na seção "Consulta")`);

  // Limpa o formulário após salvar
  document.getElementById('product-registration-form').reset();
  document.getElementById('product-type').value = ''; // Campo readonly precisa ser limpo separadamente

  renderProductList(); // Atualiza a lista de produtos na seção de consulta
}

// Renderiza a lista de produtos na tabela
function renderProductList() {
  const productListBody = document.getElementById('product-list-body');
  const noProductsMessage = document.getElementById('no-products-message');
  productListBody.innerHTML = ''; // Limpa a tabela antes de renderizar

  if (products.length === 0) {
    noProductsMessage.style.display = 'block'; // Mostra a mensagem
    return;
  } else {
    noProductsMessage.style.display = 'none'; // Esconde a mensagem
  }

  products.forEach(product => {
    const row = productListBody.insertRow();
    row.insertCell().textContent = product.tipo || 'N/A'; // N/A se não houver tipo
    row.insertCell().textContent = product.nome;
    row.insertCell().textContent = product.descricao || 'Sem descrição';
    row.insertCell().textContent = `R$ ${product.preco.replace('.', ',')}`; // Formato BR

    const actionsCell = row.insertCell();
    actionsCell.classList.add('action-buttons');

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('edit-btn');
    editButton.onclick = () => editProductFromList(product.id);
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = () => deleteProductFromList(product.id);
    actionsCell.appendChild(deleteButton);
  });
}

function editProduct() {
  alert('Funcionalidade "Editar" no formulário de cadastro: Para editar um produto, primeiro selecione-o na lista de "Consulta".');
  // Em um sistema real, aqui você carregaria os dados de um produto existente
  // para preencher o formulário, e a função "Salvar" seria usada para atualizar.
}

function deleteProduct() {
  alert('Funcionalidade "Excluir" no formulário de cadastro: Para excluir um produto, selecione-o na lista de "Consulta" e use o botão "Excluir" lá.');
  // Em um sistema real, este botão aqui seria usado para excluir o produto que estivesse
  // atualmente carregado no formulário para edição.
}

// Funções para editar e excluir da lista de consulta
function editProductFromList(productId) {
  const productToEdit = products.find(p => p.id === productId);
  if (productToEdit) {
    alert(`Editando produto: ${productToEdit.nome} (ID: ${productId})\nNeste exemplo, você seria redirecionado para o formulário de cadastro com os dados preenchidos.`);
    // Em um sistema real, você preencheria o formulário de cadastro com esses dados:
    // document.getElementById('product-type').value = productToEdit.tipo;
    // document.getElementById('product-name').value = productToEdit.nome;
    // document.getElementById('product-description').value = productToEdit.descricao;
    // document.getElementById('product-price').value = productToEdit.preco;
    // E então mudaria para a seção de cadastro:
    // showSection('cadastro');
    // Você também precisaria de um mecanismo para saber que está editando (ex: um ID escondido)
    // para que a função 'saveProduct' atualize em vez de criar um novo.
  }
}

function deleteProductFromList(productId) {
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex > -1) {
    const productName = products[productIndex].nome;
    if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
      products.splice(productIndex, 1); // Remove o produto do array
      alert(`Produto "${productName}" excluído.`);
      renderProductList(); // Atualiza a lista na tela
    }
  }
}