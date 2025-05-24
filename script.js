// A constante `db` (firebase.firestore()) é inicializada no dashboard.html, antes deste script.

let lastActiveSection = 'home'; // Valor padrão

document.addEventListener('DOMContentLoaded', async function () {
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

  if (document.getElementById('product-type')) {
    await loadProductTypes();
  }

  if (document.getElementById('dashboard-container')) {
    const storedSection = localStorage.getItem('lastActiveSection');
    if (storedSection) {
      lastActiveSection = storedSection;
    }
    await showSection(lastActiveSection);
  }

  const productForm = document.getElementById('product-registration-form');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProduct();
    });
  }

  // Bootstrap Toggle para o Sidebar (opcional, mas comum com este layout)
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.getElementById('wrapper').classList.toggle('toggled');
    });
  }
});

function toggleSubmenu() {
  // Bootstrap cuida do colapso com data-bs-toggle="collapse" e href="#produtos-submenu"
  // Não precisamos mais manipular o estilo diretamente aqui
  // A classe 'active' no link principal pode ser adicionada/removida no showSection para feedback visual
}

async function showSection(sectionId) {
  localStorage.setItem('lastActiveSection', sectionId);
  lastActiveSection = sectionId;

  // Atualiza título da seção
  const sectionTitle = document.getElementById('section-title');
  if (sectionTitle) {
      sectionTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  }


  // Esconde todas as seções e remove 'active'
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => section.classList.remove('active'));

  // Mostra a seção selecionada
  const selected = document.getElementById(sectionId);
  if (selected) selected.classList.add('active');

  // Remove 'active' de todos os itens do menu
  const menuItems = document.querySelectorAll('.list-group-item-action');
  menuItems.forEach((item) => item.classList.remove('active'));

  // Adiciona 'active' ao item de menu correto
  const selectedMenuItem = document.querySelector(`.list-group-item-action[onclick*="showSection('${sectionId}')"]`);
  if (selectedMenuItem) {
    selectedMenuItem.classList.add('active');
  }

  // Se a seção 'cadastro', 'consulta' ou 'relatorio' for ativada, abra o submenu 'produtos'.
  if (['cadastro', 'consulta', 'relatorio'].includes(sectionId)) {
    const produtosSubmenu = new bootstrap.Collapse(document.getElementById('produtos-submenu'), {
      toggle: false // Não alterna, apenas garante que esteja aberto
    });
    if (!document.getElementById('produtos-submenu').classList.contains('show')) {
        produtosSubmenu.show();
    }
    // Adiciona a classe 'active' ao link principal do "Produtos"
    const produtosLink = document.querySelector('.list-group-item-action[data-bs-toggle="collapse"]');
    if (produtosLink) produtosLink.classList.add('active');
  } else {
     // Se não é uma seção de produto, garante que o submenu esteja fechado e o link "Produtos" não esteja ativo
     const produtosSubmenu = new bootstrap.Collapse(document.getElementById('produtos-submenu'), {
      toggle: false
    });
    produtosSubmenu.hide();
    const produtosLink = document.querySelector('.list-group-item-action[data-bs-toggle="collapse"]');
    if (produtosLink) produtosLink.classList.remove('active');
  }


  if (sectionId === 'consulta') {
    await renderProductList();
  }
}

function logout() {
  alert('Você saiu do sistema.');
  localStorage.removeItem('lastActiveSection');
  window.location.href = 'index.html';
}

function openNewProductTypeModal() {
  const newProductTypeModal = new bootstrap.Modal(document.getElementById('new-product-type-modal'));
  newProductTypeModal.show();
  document.getElementById('new-product-type-input').value = '';
}

// Bootstrap cuida de fechar o modal com data-bs-dismiss="modal" no botão de fechar
// A função closeNewProductTypeModal não é mais necessária explicitamente para fechar o modal
// Mas pode ser útil se você precisar fazer algo extra ao fechar.
function closeNewProductTypeModal() {
  const newProductTypeModal = bootstrap.Modal.getInstance(document.getElementById('new-product-type-modal'));
  if (newProductTypeModal) {
    newProductTypeModal.hide();
  }
}


async function saveNewProductTypeToFirestore() {
  const newTypeInput = document.getElementById('new-product-type-input');
  const newType = newTypeInput.value.trim();

  if (!newType) {
    alert('Por favor, insira um nome para o novo tipo de produto.');
    return;
  }

  try {
    const existingTypes = await db.collection('productTypes').where('name', '==', newType).get();
    if (!existingTypes.empty) {
        alert(`O tipo de produto "${newType}" já existe.`);
        return;
    }

    await db.collection('productTypes').add({
      name: newType,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert(`Tipo de Produto "${newType}" salvo com sucesso!`);
    await loadProductTypes();
    closeNewProductTypeModal(); // Fecha o modal após salvar
  } catch (error) {
    console.error("Erro ao salvar novo tipo de produto: ", error);
    alert("Ocorreu um erro ao salvar o tipo de produto. Verifique o console.");
  }
}


async function loadProductTypes() {
  const productTypeSelect = document.getElementById('product-type');
  if (!productTypeSelect) return;

  productTypeSelect.innerHTML = '<option value="">Selecione ou Cadastre</option>';

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

async function saveProduct() {
  const productType = document.getElementById('product-type').value.trim();
  const productName = document.getElementById('product-name').value.trim();
  const productDescription = document.getElementById('product-description').value.trim();
  const productPrice = parseFloat(document.getElementById('product-price').value);

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
      const productRef = db.collection('products').doc(editingProductId);
      await productRef.update({
        tipo: productType,
        nome: productName,
        descricao: productDescription,
        preco: productPrice.toFixed(2)
      });
      alert(`Produto "${productName}" atualizado com sucesso no Firebase!`);
      delete form.dataset.editingProductId;
    } else {
      await db.collection('products').add({
        tipo: productType,
        nome: productName,
        descricao: productDescription,
        preco: productPrice.toFixed(2),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert(`Produto "${productName}" salvo com sucesso no Firebase!`);
    }

    form.reset();
    document.getElementById('product-type').value = '';

    await renderProductList();
  } catch (error) {
    console.error("Erro ao salvar/atualizar produto: ", error);
    alert("Ocorreu um erro ao salvar/atualizar o produto. Verifique o console para mais detalhes.");
  }
}

async function renderProductList() {
  const productListBody = document.getElementById('product-list-body');
  const noProductsMessage = document.getElementById('no-products-message');

  if (!productListBody) return;

  productListBody.innerHTML = '';

  try {
    const productsCollection = await db.collection('products').orderBy('createdAt', 'asc').get();
    const products = productsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      noProductsMessage.style.display = 'block';
      return;
    } else {
      noProductsMessage.style.display = 'none';
    }

    products.forEach((product, index) => {
      const row = productListBody.insertRow();
      row.insertCell().textContent = index + 1;
      row.insertCell().textContent = product.tipo || 'N/A';
      row.insertCell().textContent = product.nome;
      row.insertCell().textContent = product.descricao || 'Sem descrição';
      row.insertCell().textContent = `R$ ${String(product.preco).replace('.', ',')}`;

      const actionsCell = row.insertCell();
      actionsCell.classList.add('action-buttons');

      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.classList.add('btn', 'btn-sm', 'btn-outline-warning', 'me-1');
      editButton.onclick = () => editProductFromList(product.id);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
      deleteButton.onclick = () => deleteProductFromList(product.id);
      actionsCell.appendChild(deleteButton);
    });
  } catch (error) {
    console.error("Erro ao buscar produtos do Firebase: ", error);
    alert("Ocorreu um erro ao carregar os produtos. Verifique o console para mais detalhes.");
  }
}

async function editProductFromList(productId) {
  try {
    const productDoc = await db.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const productToEdit = { id: productDoc.id, ...productDoc.data() };

      document.getElementById('product-type').value = productToEdit.tipo || '';
      document.getElementById('product-name').value = productToEdit.nome || '';
      document.getElementById('product-description').value = productToEdit.descricao || '';
      document.getElementById('product-price').value = parseFloat(productToEdit.preco);

      document.getElementById('product-registration-form').dataset.editingProductId = productToEdit.id;

      alert(`Dados do produto "${productToEdit.nome}" carregados para edição. Altere os campos e clique em "Salvar" para atualizar.`);
      await showSection('cadastro');
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
      await renderProductList();
    } catch (error) {
      console.error("Erro ao excluir produto: ", error);
      alert("Ocorreu um erro ao excluir o produto. Verifique o console para mais detalhes.");
    }
  }
}

function editProduct() {
  alert('Para editar um produto, use o botão "Editar" na tabela de "Consulta de Produtos".');
}

function deleteProduct() {
  alert('Para excluir um produto, use o botão "Excluir" na tabela de "Consulta de Produtos".');
}

async function generateProductReportPDF() {
  const { jsPDF } = window.jspdf;
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
        index + 1,
        product.tipo || 'N/A',
        product.nome,
        product.descricao || 'Sem descrição',
        `R$ ${String(product.preco).replace('.', ',')}`
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      headStyles: { fillColor: [50, 50, 50] }, // Tons de cinza escuro
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0] // Preto para o texto da tabela
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Cinza claro para linhas alternadas
      },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didDrawPage: function (data) {
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