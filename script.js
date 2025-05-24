// A constante `db` (firebase.firestore()) é inicializada no dashboard.html, antes deste script.

// ALTERAÇÃO 1: Variável para armazenar a última seção ativa
let lastActiveSection = 'home'; // Valor padrão

// Autenticação simples
document.addEventListener('DOMContentLoaded', async function () { // Adicionado 'async'
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

  // Carregar tipos de produto para o SELECT
  await loadProductTypes(); // Garante que os tipos estejam carregados antes de mostrar a seção

  // ALTERAÇÃO 1: Restaurar a última seção ativa ao carregar o dashboard
  if (document.getElementById('dashboard-container')) {
    const storedSection = localStorage.getItem('lastActiveSection');
    if (storedSection) {
      lastActiveSection = storedSection;
    }
    await showSection(lastActiveSection); // Chama showSection que agora é async
  }

  // Adicionar um event listener para o submit do formulário de produto
  const productForm = document.getElementById('product-registration-form');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o envio padrão do formulário
      saveProduct(); // Chama a função de salvar/atualizar
    });
  }

  // Fechar o modal clicando fora dele (para o novo modal de tipo de produto)
  const newProductTypeModal = document.getElementById('new-product-type-modal');
  if (newProductTypeModal) {
    window.onclick = function(event) {
      if (event.target == newProductTypeModal) {
        newProductTypeModal.style.display = "none";
      }
    }
  }
});

// Alternar submenu de Produtos
function toggleSubmenu() {
  const submenu = document.getElementById('produtos-submenu');
  submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

// Mostrar seção selecionada
async function showSection(sectionId) { // Adicione 'async' aqui
  // ALTERAÇÃO 1: Salvar a seção atual no localStorage
  localStorage.setItem('lastActiveSection', sectionId);
  lastActiveSection = sectionId; // Atualiza a variável global

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
  localStorage.removeItem('lastActiveSection'); // Limpa a seção salva ao sair
  window.location.href = 'index.html';
}

// ALTERAÇÃO 2: Funções para o NOVO Modal de Tipo de Produto
function openNewProductTypeModal() {
  document.getElementById('new-product-type-modal').style.display = 'block';
  document.getElementById('new-product-type-input').value = ''; // Limpa o campo
}

function closeNewProductTypeModal() {
  document.getElementById('new-product-type-modal').style.display = 'none';
}

// ALTERAÇÃO 2: Salva um novo tipo de produto no Firestore
async function saveNewProductTypeToFirestore() {
  const newTypeInput = document.getElementById('new-product-type-input');
  const newType = newTypeInput.value.trim();

  if (!newType) {
    alert('Por favor, insira um nome para o novo tipo de produto.');
    return;
  }

  try {
    // Verifica se o tipo já existe para evitar duplicatas (case-insensitive)
    const existingTypes = await db.collection('productTypes').where('name', '==', newType).get();
    if (!existingTypes.empty) {
        alert(`O tipo de produto "${newType}" já existe.`);
        return;
    }

    await db.collection('productTypes').add({
      name: newType,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() // Opcional: timestamp de criação
    });
    alert(`Tipo de Produto "${newType}" salvo com sucesso!`);
    await loadProductTypes(); // Recarrega o SELECT com o novo tipo
    closeNewProductTypeModal();
  } catch (error) {
    console.error("Erro ao salvar novo tipo de produto: ", error);
    alert("Ocorreu um erro ao salvar o tipo de produto. Verifique o console.");
  }
}

// ALTERAÇÃO 2: Carrega os tipos de produto do Firestore e preenche o SELECT
async function loadProductTypes() {
  const productTypeSelect = document.getElementById('product-type');
  productTypeSelect.innerHTML = '<option value="">Selecione ou Cadastre</option>'; // Resetar opções

  try {
    const typesSnapshot = await db.collection('productTypes').orderBy('name').get();
    typesSnapshot.forEach(doc => {
      const type = doc.data();
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      productTypeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar tipos de produto: ", error);
    alert("Ocorreu um erro ao carregar os tipos de produto.");
  }
}

// Funções para os botões do formulário de produto (AGORA INTERAGEM COM FIRESTORE)
async function saveProduct() {
  const productType = document.getElementById('product-type').value.trim();
  const productName = document.getElementById('product-name').value.trim();
  const productDescription = document.getElementById('product-description').value.trim();
  const productPrice = parseFloat(document.getElementById('product-price').value);

  // ALTERAÇÃO 3: Validação de campo vazio para Tipo e Preço
  if (!productType) {
      alert('Por favor, selecione um Tipo de Produto.');
      return;
  }
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
    document.getElementById('product-type').value = ''; // Limpa o select

    await renderProductList(); // Atualiza a lista na tela após a operação no DB
  } catch (error) {
    console.error("Erro ao salvar/atualizar produto: ", error);
    alert("Ocorreu um erro ao salvar/atualizar o produto. Verifique o console para mais detalhes.");
  }
}

// Renderiza a lista de produtos na tabela (AGORA BUSCA DO FIRESTORE)
async function renderProductList() {
  const productListBody = document.getElementById('product-list-body');
  const noProductsMessage = document.getElementById('no-products-message');

  if (!productListBody) return; // Garante que estamos na página correta (dashboard)

  productListBody.innerHTML = ''; // Limpa a tabela antes de renderizar

  try {
    // Busca produtos ordenados por data de criação para ter uma "sequência"
    const productsCollection = await db.collection('products').orderBy('createdAt', 'asc').get();
    const products = productsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      noProductsMessage.style.display = 'block';
      return;
    } else {
      noProductsMessage.style.display = 'none';
    }

    products.forEach((product, index) => { // ALTERAÇÃO 5: Adicionado 'index'
      const row = productListBody.insertRow();
      row.insertCell().textContent = index + 1; // ALTERAÇÃO 5: Código sequencial para exibição
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

// Funções para editar e excluir da lista de consulta
async function editProductFromList(productId) {
  try {
    const productDoc = await db.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const productToEdit = { id: productDoc.id, ...productDoc.data() };
      
      // ALTERAÇÃO 2: Define o valor do SELECT
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

async function deleteProductFromList(productId) {
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

// ALTERAÇÃO 4: Função para gerar o relatório PDF
async function generateProductReportPDF() {
  const { jsPDF } = window.jspdf; // Acessa jsPDF do objeto window
  const doc = new jsPDF();

  doc.text("Relatório de Produtos - Cannapis", 10, 10);

  try {
    const productsCollection = await db.collection('products').orderBy('createdAt', 'asc').get();
    const products = productsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      alert("Não há produtos para gerar o relatório.");
      return;
    }

    const tableColumn = ["Cód.", "Tipo", "Nome", "Descrição", "Preço"];
    const tableRows = [];

    products.forEach((product, index) => {
      const productData = [
        index + 1, // Código sequencial para o PDF
        product.tipo || 'N/A',
        product.nome,
        product.descricao || 'Sem descrição',
        `R$ ${String(product.preco).replace('.', ',')}`
      ];
      tableRows.push(productData);
    });

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      headStyles: { fillColor: [50, 50, 50] },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didDrawPage: function (data) {
        // Footer com número da página
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('relatorio_produtos_cannapis.pdf');
    alert("Relatório PDF gerado com sucesso!");

  } catch (error) {
    console.error("Erro ao gerar relatório PDF: ", error);
    alert("Ocorreu um erro ao gerar o relatório PDF. Verifique o console.");
  }
}