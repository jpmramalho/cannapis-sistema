// A constante `db` (firebase.firestore()) e `storage` (firebase.storage()) são inicializadas no dashboard.html, antes deste script.

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

  // Inicializa tooltips do Bootstrap 5
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  // NOVO: Chamada para carregar os dropdowns ao carregar a página
  if (document.getElementById('product-type')) { // Verifica se estamos na página do dashboard
    await loadProductTypes();
    await loadSuppliers();
    await loadAssociateTypes();
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

  // Bootstrap Toggle para o Sidebar
  var sidebarToggle = document.getElementById('menu-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('wrapper').classList.toggle('toggled');
    });
  }
});


// Funções de navegação do Dashboard
async function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  document.getElementById(sectionId).classList.add('active');
  localStorage.setItem('lastActiveSection', sectionId);

  // Atualizar a lista de produtos apenas se for a seção de consulta
  if (sectionId === 'consulta') {
    await renderProductList();
  }
  // Atualizar o contador de produtos na home
  if (sectionId === 'home') {
    await updateProductCount();
  }
}

// Função para atualizar o contador de produtos na Home
async function updateProductCount() {
  try {
    const productsSnapshot = await db.collection('products').get();
    document.getElementById('total-products').textContent = productsSnapshot.size;
  } catch (error) {
    console.error("Erro ao carregar contagem de produtos: ", error);
    document.getElementById('total-products').textContent = 'Erro';
  }
}


// Funções para Tipos de Produto
async function loadProductTypes() {
  const productTypeSelect = document.getElementById('product-type');
  if (!productTypeSelect) return;

  productTypeSelect.innerHTML = '<option value="">Selecione ou Cadastre</option>'; // Limpa e adiciona opção padrão

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

function openNewProductTypeModal() {
  const newProductTypeModal = new bootstrap.Modal(document.getElementById('new-product-type-modal'));
  newProductTypeModal.show();
}

async function saveNewProductTypeToFirestore() {
  const newProductTypeInput = document.getElementById('new-product-type-input');
  const newTypeName = newProductTypeInput.value.trim();

  if (!newTypeName) {
    alert('Por favor, insira um nome para o novo tipo de produto.');
    return;
  }

  try {
    // Verifica se o tipo já existe
    const existingType = await db.collection('productTypes').where('name', '==', newTypeName).get();
    if (!existingType.empty) {
      alert('Este tipo de produto já existe.');
      return;
    }

    await db.collection('productTypes').add({ name: newTypeName, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Tipo "${newTypeName}" salvo com sucesso!`);
    newProductTypeInput.value = ''; // Limpa o input
    const newProductTypeModal = bootstrap.Modal.getInstance(document.getElementById('new-product-type-modal'));
    newProductTypeModal.hide(); // Fecha o modal
    await loadProductTypes(); // Recarrega os tipos na lista
  } catch (error) {
    console.error("Erro ao salvar novo tipo de produto: ", error);
    alert("Ocorreu um erro ao salvar o novo tipo de produto.");
  }
}


// NOVAS FUNÇÕES PARA FORNECEDORES
async function loadSuppliers() {
  const supplierSelect = document.getElementById('product-supplier');
  if (!supplierSelect) return;

  supplierSelect.innerHTML = '<option value="">Selecione...</option>'; // Limpa e adiciona opção padrão

  try {
    const suppliersSnapshot = await db.collection('suppliers').orderBy('name').get();
    suppliersSnapshot.forEach(doc => {
      const supplier = doc.data();
      const option = document.createElement('option');
      option.value = supplier.name;
      option.textContent = supplier.name;
      supplierSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar fornecedores: ", error);
    // alert("Ocorreu um erro ao carregar os fornecedores."); // Opcional: alertar o usuário
  }
}

function openNewSupplierModal() {
  const newSupplierModal = new bootstrap.Modal(document.getElementById('new-supplier-modal'));
  newSupplierModal.show();
}

async function saveNewSupplierToFirestore() {
  const newSupplierInput = document.getElementById('new-supplier-input');
  const newSupplierName = newSupplierInput.value.trim();

  if (!newSupplierName) {
    alert('Por favor, insira um nome para o novo fornecedor.');
    return;
  }

  try {
    // Verifica se o fornecedor já existe
    const existingSupplier = await db.collection('suppliers').where('name', '==', newSupplierName).get();
    if (!existingSupplier.empty) {
      alert('Este fornecedor já existe.');
      return;
    }

    await db.collection('suppliers').add({ name: newSupplierName, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Fornecedor "${newSupplierName}" salvo com sucesso!`);
    newSupplierInput.value = ''; // Limpa o input
    const newSupplierModal = bootstrap.Modal.getInstance(document.getElementById('new-supplier-modal'));
    newSupplierModal.hide(); // Fecha o modal
    await loadSuppliers(); // Recarrega os fornecedores na lista
  } catch (error) {
    console.error("Erro ao salvar novo fornecedor: ", error);
    alert("Ocorreu um erro ao salvar o novo fornecedor.");
  }
}

// Funções para Tipos de Associados
async function loadAssociateTypes() {
  const associateTypeSelect = document.getElementById('segment-by-associate-type');
  if (!associateTypeSelect) return;

  associateTypeSelect.innerHTML = '<option value="nenhum">Nenhum</option>';

  try {
    const typesSnapshot = await db.collection('associateTypes').orderBy('name').get(); // Assumindo uma coleção 'associateTypes'
    typesSnapshot.forEach(doc => {
      const type = doc.data();
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      associateTypeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar tipos de associado: ", error);
    // alert("Ocorreu um erro ao carregar os tipos de associado."); // Opcional: alertar o usuário
  }
}


// Funções de CRUD de Produtos
async function saveProduct() {
  const productType = document.getElementById('product-type').value.trim();
  const productName = document.getElementById('product-name').value.trim();
  const productDescriptionSummary = document.getElementById('product-description-summary').value.trim();
  const productDescriptionFull = document.getElementById('product-description-full').value.trim();
  const productStatus = document.getElementById('product-status').value;
  const productOnline = document.getElementById('product-online').checked;
  const productRestricted = document.getElementById('product-restricted').checked;
  const productSupplier = document.getElementById('product-supplier').value.trim();

  const availableFor = document.querySelector('input[name="available-for"]:checked').value;
  const segmentByAssociateType = document.getElementById('segment-by-associate-type').value;
  const isCourtesy = document.getElementById('is-courtesy').value;
  const allowConfigurableValue = document.getElementById('allow-configurable-value').value;
  const enableStockControl = document.getElementById('enable-stock-control').checked;
  const qtyLimitPerOrder = parseInt(document.getElementById('qty-limit-per-order').value) || 0;

  const hasDelivery = document.getElementById('has-delivery').value;
  const insertTaxes = document.getElementById('insert-taxes').value;
  const accountingCode = document.getElementById('accounting-code').value.trim();

  const productPhotosInput = document.getElementById('product-photos');
  const productPhotosFiles = productPhotosInput ? productPhotosInput.files : []; // Verifica se o input existe

  // Validações básicas
  if (!productType) {
      alert('Por favor, selecione um Tipo de Produto.');
      return;
  }
  if (!productName) {
    alert('Nome do Produto é obrigatório!');
    return;
  }
  // Adicione mais validações aqui para os novos campos, se necessário

  const form = document.getElementById('product-registration-form');
  const editingProductId = form.dataset.editingProductId;
  let photoUrls = [];

  try {
    // Lógica para upload de fotos (exemplo básico, você precisará de mais robustez)
    if (productPhotosFiles.length > 0) {
      for (const file of productPhotosFiles) {
        const storageRef = storage.ref('product_images/' + file.name);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        photoUrls.push(downloadURL);
      }
      alert('Imagens carregadas com sucesso!');
    }

    const productData = {
      tipo: productType,
      nome: productName,
      descricaoResumida: productDescriptionSummary,
      descricaoCompleta: productDescriptionFull,
      status: productStatus,
      online: productOnline,
      restrito: productRestricted,
      fornecedor: productSupplier,
      disponivelPara: availableFor,
      segmentarPorTipoAssociado: segmentByAssociateType,
      cortesia: isCourtesy,
      permitirValorConfiguravel: allowConfigurableValue,
      habilitarControleEstoque: enableStockControl,
      qtdLimitePorPedido: qtyLimitPerOrder,
      temEntrega: hasDelivery,
      inserirImpostos: insertTaxes,
      codigoContabil: accountingCode,
      fotos: photoUrls, // Armazena as URLs das fotos
      // Preço é um campo que não está no formulário da imagem, mas existia antes.
      // Se você quiser adicionar, inclua aqui. Ex: preco: parseFloat(document.getElementById('product-price').value) || 0,
    };

    if (editingProductId) {
      const productRef = db.collection('products').doc(editingProductId);
      // Se houver fotos novas, você pode optar por sobrescrever ou adicionar às existentes
      // Aqui, estamos apenas atualizando as que foram carregadas no momento
      await productRef.update(productData);
      alert(`Produto "${productName}" atualizado com sucesso no Firebase!`);
      delete form.dataset.editingProductId;
    } else {
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(productData);
      alert(`Produto "${productName}" salvo com sucesso no Firebase!`);
    }

    form.reset();
    document.getElementById('product-type').value = ''; // Resetar o select de tipo
    // Limpar o input de fotos após o upload
    if (productPhotosInput) productPhotosInput.value = '';

    await renderProductList(); // Atualizar a lista de produtos na consulta
    await updateProductCount(); // Atualizar o contador na home
  } catch (error) {
    console.error("Erro ao salvar/atualizar produto: ", error);
    alert("Ocorreu um erro ao salvar/atualizar o produto. Verifique o console para mais detalhes.");
  }
}

async function renderProductList() {
  const productListDiv = document.getElementById('product-list');
  if (!productListDiv) return;

  productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Carregando produtos...</td></tr>';

  try {
    const productsSnapshot = await db.collection('products').orderBy('nome').get();
    productListDiv.innerHTML = ''; // Limpa antes de adicionar

    if (productsSnapshot.empty) {
      productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    productsSnapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.tipo || 'N/A'}</td>
        <td>${product.nome}</td>
        <td>${product.descricaoResumida || 'Sem descrição resumida'}</td>
        <td class="action-buttons">
          <button class="btn btn-outline-warning btn-sm me-2" onclick="editProductFromList('${product.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteProductFromList('${product.id}')">
            <i class="fas fa-trash-alt"></i> Excluir
          </button>
        </td>
      `;
      productListDiv.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao renderizar lista de produtos: ", error);
    productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar produtos.</td></tr>';
  }
}

async function editProductFromList(productId) {
  try {
    const productDoc = await db.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const productToEdit = { id: productDoc.id, ...productDoc.data() };

      document.getElementById('product-type').value = productToEdit.tipo || '';
      document.getElementById('product-name').value = productToEdit.nome || '';
      document.getElementById('product-description-summary').value = productToEdit.descricaoResumida || '';
      document.getElementById('product-description-full').value = productToEdit.descricaoCompleta || '';
      document.getElementById('product-status').value = productToEdit.status || 'ativo';
      document.getElementById('product-online').checked = productToEdit.online || false;
      document.getElementById('product-restricted').checked = productToEdit.restrito || false;
      document.getElementById('product-supplier').value = productToEdit.fornecedor || '';

      // Selecionar o radio button correto para 'available-for'
      const availableForRadios = document.querySelectorAll('input[name="available-for"]');
      availableForRadios.forEach(radio => {
          if (radio.value === (productToEdit.disponivelPara || 'todos')) {
              radio.checked = true;
          }
      });
      document.getElementById('segment-by-associate-type').value = productToEdit.segmentarPorTipoAssociado || 'nenhum';
      document.getElementById('is-courtesy').value = productToEdit.cortesia || 'nao';
      document.getElementById('allow-configurable-value').value = productToEdit.permitirValorConfiguravel || 'nao';
      document.getElementById('enable-stock-control').checked = productToEdit.habilitarControleEstoque || false;
      document.getElementById('qty-limit-per-order').value = productToEdit.qtdLimitePorPedido || 0;

      document.getElementById('has-delivery').value = productToEdit.temEntrega || 'nao';
      document.getElementById('insert-taxes').value = productToEdit.inserirImpostos || 'nao';
      document.getElementById('accounting-code').value = productToEdit.codigoContabil || '';

      // NOTA: Para fotos, você precisaria de uma lógica para exibir as fotos existentes
      // e permitir a remoção/adição de novas. Isso é mais complexo e não está incluído aqui.

      document.getElementById('product-registration-form').dataset.editingProductId = productToEdit.id;

      alert(`Dados do produto "${productToEdit.nome}" carregados para edição. Altere os campos e clique em "Salvar" para atualizar.`);
      await showSection('cadastro'); // Volta para a seção de cadastro
    } else {
      alert("Produto não encontrado para edição.");
    }
  } catch (error) {
    console.error("Erro ao carregar produto para edição: ", error);
    alert("Ocorreu um erro ao carregar o produto para edição. Verifique o console para mais detalhes.");
  }
}

async function deleteProductFromList(productId) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await db.collection('products').doc(productId).delete();
      alert('Produto excluído com sucesso!');
      await renderProductList(); // Atualiza a lista após exclusão
      await updateProductCount(); // Atualiza o contador na home
    } catch (error) {
      console.error("Erro ao excluir produto: ", error);
      alert("Ocorreu um erro ao excluir o produto. Verifique o console para mais detalhes.");
    }
  }
}

async function searchProducts() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const productListDiv = document.getElementById('product-list');
  productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Buscando produtos...</td></tr>';

  try {
    const productsSnapshot = await db.collection('products').orderBy('nome').get();
    productListDiv.innerHTML = '';

    let found = false;
    productsSnapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      const productName = product.nome.toLowerCase();
      const productType = product.tipo ? product.tipo.toLowerCase() : '';

      if (productName.includes(searchInput) || productType.includes(searchInput)) {
        found = true;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.tipo || 'N/A'}</td>
          <td>${product.nome}</td>
          <td>${product.descricaoResumida || 'Sem descrição resumida'}</td>
          <td class="action-buttons">
            <button class="btn btn-outline-warning btn-sm me-2" onclick="editProductFromList('${product.id}')">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteProductFromList('${product.id}')">
              <i class="fas fa-trash-alt"></i> Excluir
            </button>
          </td>
        `;
        productListDiv.appendChild(row);
      }
    });

    if (!found) {
      productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum produto encontrado.</td></tr>';
    }
  } catch (error) {
    console.error("Erro ao pesquisar produtos: ", error);
    productListDiv.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao pesquisar produtos.</td></tr>';
  }
}

async function generateProductReport() {
  try {
    const productsSnapshot = await db.collection('products').orderBy('nome').get();
    const products = productsSnapshot.docs.map(doc => doc.data());

    if (products.length === 0) {
      alert("Não há produtos para gerar o relatório.");
      return;
    }

    const doc = new jspdf.jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Produtos Cannapis", 14, 15);

    const tableColumn = ["Cód.", "Tipo", "Nome", "Descrição Resumida", "Status", "Online", "Restrito", "Fornecedor"]; // Adicione as novas colunas
    const tableRows = [];

    products.forEach((product, index) => {
      const productData = [
        index + 1,
        product.tipo || 'N/A',
        product.nome,
        product.descricaoResumida || 'Sem descrição',
        product.status || 'N/A',
        product.online ? 'Sim' : 'Não',
        product.restrito ? 'Sim' : 'Não',
        product.fornecedor || 'N/A'
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
        // rodapé
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('relatorio_produtos_cannapis.pdf');
    alert("Relatório PDF gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar relatório: ", error);
    alert("Ocorreu um erro ao gerar o relatório. Verifique o console para mais detalhes.");
  }
}