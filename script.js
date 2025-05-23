// A constante `db` (firebase.firestore()) é inicializada no dashboard.html, antes deste script.

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
      saveProduct(); // Chama a função de salvar/atualizar
    });
  }

  // Fechar o modal clicando fora dele
  const modal = document.getElementById('product-type-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  // NOTA: renderProductList() será chamada por showSection('consulta')
  // ou você pode chamá-la aqui se quiser que a lista apareça na Home, por exemplo,
  // mas como o dashboard começa na Home, não é estritamente necessário.
});

// Alternar submenu de Produtos
function toggleSubmenu() {
  const submenu = document.getElementById('produtos-submenu');
  submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

// Mostrar seção selecionada
async function showSection(sectionId) { // Adicione 'async' aqui
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

  // Se a seção de consulta for mostrada, renderiza a lista de produtos do Firebase
  if (sectionId === 'consulta') {
    await renderProductList(); // Chame renderProductList como assíncrona
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
    alert(`Tipo de Produto "${newType}" salvo (Neste exemplo, isso apenas preenche o campo. Para persistir tipos, você precisaria de uma coleção separada no Firestore para tipos).`);
    document.getElementById('product-type').value = newType;
    closeProductTypeModal();
    newTypeInput.value = '';
  } else {
    alert('Por favor, insira um nome para o novo tipo de produto.');
  }
}

// Funções para os botões do formulário de produto (AGORA INTERAGEM COM FIRESTORE)
async function saveProduct() { // Adicione 'async' aqui
  const productType = document.getElementById('product-type').value.trim();
  const productName = document.getElementById('product-name').value.trim();
  const productDescription = document.getElementById('product-description').value.trim();
  const productPrice = parseFloat(document.getElementById('product-price').value);

  if (!productName) {
    alert('Nome do Produto é obrigatório!');
    return;
  }
  if (isNaN(productPrice) || productPrice < 0) {
      alert('Por favor, insira um preço válido para o produto.');
      return;
  }

  const form = document.getElementById('product-registration-form');
  const editingProductId = form.dataset.editingProductId;

  try {
    if (editingProductId) {
      // Lógica para EDIÇÃO
      const productRef = db.collection('products').doc(editingProductId);
      await productRef.update({
        tipo: productType,
        nome: productName,
        descricao: productDescription,
        preco: productPrice.toFixed(2)
      });
      alert(`Produto "${productName}" atualizado com sucesso no Firebase!`);
      delete form.dataset.editingProductId; // Remove o ID de edição
    } else {
      // Lógica para NOVO CADASTRO
      await db.collection('products').add({
        tipo: productType,
        nome: productName,
        descricao: productDescription,
        preco: productPrice.toFixed(2),
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Opcional: timestamp de criação
      });
      alert(`Produto "${productName}" salvo com sucesso no Firebase!`);
    }

    // Limpa o formulário após salvar/atualizar
    form.reset();
    document.getElementById('product-type').value = '';

    await renderProductList(); // Atualiza a lista na tela após a operação no DB
  } catch (error) {
    console.error("Erro ao salvar/atualizar produto: ", error);
    alert("Ocorreu um erro ao salvar/atualizar o produto. Verifique o console para mais detalhes.");
  }
}

// Renderiza a lista de produtos na tabela (AGORA BUSCA DO FIRESTORE)
async function renderProductList() { // Adicione 'async' aqui
  const productListBody = document.getElementById('product-list-body');
  const noProductsMessage = document.getElementById('no-products-message');

  if (!productListBody) return; // Garante que estamos na página correta (dashboard)

  productListBody.innerHTML = ''; // Limpa a tabela antes de renderizar

  try {
    const productsCollection = await db.collection('products').orderBy('createdAt', 'desc').get(); // Busca ordenada
    const products = productsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      noProductsMessage.style.display = 'block';
      return;
    } else {
      noProductsMessage.style.display = 'none';
    }

    products.forEach(product => {
      const row = productListBody.insertRow();
      row.insertCell().textContent = product.tipo || 'N/A';
      row.insertCell().textContent = product.nome;
      row.insertCell().textContent = product.descricao || 'Sem descrição';
      row.insertCell().textContent = `R$ ${String(product.preco).replace('.', ',')}`; // Garante que é string antes de replace

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
  } catch (error) {
    console.error("Erro ao buscar produtos do Firebase: ", error);
    alert("Ocorreu um erro ao carregar os produtos. Verifique o console para mais detalhes.");
  }
}

// Funções para editar e excluir da lista de consulta (AGORA INTERAGEM COM FIRESTORE)
async function editProductFromList(productId) { // Adicione 'async' aqui
  try {
    const productDoc = await db.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const productToEdit = { id: productDoc.id, ...productDoc.data() };
      
      document.getElementById('product-type').value = productToEdit.tipo || '';
      document.getElementById('product-name').value = productToEdit.nome || '';
      document.getElementById('product-description').value = productToEdit.descricao || '';
      document.getElementById('product-price').value = parseFloat(productToEdit.preco); // Converte de volta para número

      document.getElementById('product-registration-form').dataset.editingProductId = productToEdit.id;
      
      alert(`Dados do produto "${productToEdit.nome}" carregados para edição. Altere os campos e clique em "Salvar" para atualizar.`);
      showSection('cadastro'); // Redireciona para a seção de cadastro
    } else {
      alert("Produto não encontrado para edição.");
    }
  } catch (error) {
    console.error("Erro ao carregar produto para edição: ", error);
    alert("Ocorreu um erro ao carregar o produto para edição. Verifique o console para mais detalhes.");
  }
}

async function deleteProductFromList(productId) { // Adicione 'async' aqui
  if (confirm('Tem certeza que deseja excluir este produto do Firebase?')) {
    try {
      await db.collection('products').doc(productId).delete();
      alert('Produto excluído com sucesso do Firebase.');
      await renderProductList(); // Atualiza a lista após a exclusão
    } catch (error) {
      console.error("Erro ao excluir produto: ", error);
      alert("Ocorreu um erro ao excluir o produto. Verifique o console para mais detalhes.");
    }
  }
}

// Funções que eram placeholders no formulário, agora só alertam para usar a lista
function editProduct() {
  alert('Funcionalidade "Editar" no formulário de cadastro: Para editar um produto, primeiro selecione-o na lista de "Consulta" através do botão "Editar" na linha do produto.');
}

function deleteProduct() {
  alert('Funcionalidade "Excluir" no formulário de cadastro: Para excluir um produto, selecione-o na lista de "Consulta" através do botão "Excluir" na linha do produto.');
}