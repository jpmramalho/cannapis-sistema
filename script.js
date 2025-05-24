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

  // Chamada para carregar os dropdowns ao carregar a página
  if (document.getElementById('product-type')) { // Verifica se estamos na página do dashboard
    await loadProductTypes();
    await loadSuppliers();
    await loadAssociateTypes();
  }

  if (document.getElementById('dashboard-container')) {
    // Esconder todas as seções exceto a home ao carregar
    document.querySelectorAll('.content-section').forEach(section => {
      if (section.id !== 'home') {
        section.style.display = 'none';
      }
    });

    document.getElementById('sidebar-wrapper').addEventListener('click', async function (e) {
      const target = e.target.closest('.list-group-item');
      if (target && target.dataset.target) {
        e.preventDefault();
        const targetSectionId = target.dataset.target;

        // Remove a classe 'active' de todos os itens do menu
        document.querySelectorAll('.list-group-item').forEach(item => {
          item.classList.remove('active');
        });

        // Adiciona a classe 'active' ao item clicado (se não for um item pai de colapso)
        if (!target.dataset.bsToggle) { // Garante que não adiciona 'active' ao item pai (Produtos, Associados)
          target.classList.add('active');
        }

        showSection(targetSectionId); // Mostra a seção

        // Ações específicas ao abrir certas seções
        if (targetSectionId === 'cadastro-produtos') {
          await loadProductTypes();
          await loadSuppliers();
        } else if (targetSectionId === 'listar-produtos') {
          await loadProductsToList();
        } else if (targetSectionId === 'cadastro-associados') {
          await loadAssociateTypes();
        } else if (targetSectionId === 'em-admissao') {
          // Lógica para carregar associados "Em Admissão"
          await loadAssociatesFilteredToList('Em Admissão', 'associates-em-admissao-table-body');
        } else if (targetSectionId === 'admitidos') {
          // Lógica para carregar associados "Admitidos" (Ativos)
          await loadAssociatesFilteredToList('ativo', 'associates-admitidos-table-body');
        }
        // Removed a antiga chamada para loadAssociatesToList() na seção 'listar-associados'
        // pois ela foi substituída pelos novos submenus
      }
    });

    // Toggle do sidebar
    document.getElementById('menu-toggle').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('wrapper').classList.toggle('toggled');
    });

    // Logout
    document.getElementById('logout-button').addEventListener('click', function () {
      if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = 'index.html';
      }
    });

    // Event listeners para os botões e formulários (sem alterações aqui)
    const newProductBtn = document.getElementById('new-product-btn');
    if (newProductBtn) {
      newProductBtn.addEventListener('click', openNewProductTypeModal);
    }

    const saveNewProductTypeBtn = document.getElementById('save-new-product-type-btn');
    if (saveNewProductTypeBtn) {
      saveNewProductTypeBtn.addEventListener('click', saveNewProductTypeToFirestore);
    }

    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', handleProductFormSubmit);
    }

    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    if (generatePdfBtn) {
      generatePdfBtn.addEventListener('click', generateProductsPdf);
    }

    const associateForm = document.getElementById('associate-form');
    if (associateForm) {
      associateForm.addEventListener('submit', handleAssociateFormSubmit);
    }

    const newAssociateTypeBtn = document.getElementById('new-associate-type-btn');
    if (newAssociateTypeBtn) {
      newAssociateTypeBtn.addEventListener('click', openNewAssociateTypeModal);
    }

    const saveNewAssociateTypeBtn = document.getElementById('save-new-associate-type-btn');
    if (saveNewAssociateTypeBtn) {
      saveNewAssociateTypeBtn.addEventListener('click', saveNewAssociateTypeToFirestore);
    }

    const newSupplierBtn = document.getElementById('new-supplier-btn');
    if (newSupplierBtn) {
      newSupplierBtn.addEventListener('click', openNewSupplierModal);
    }

    const saveNewSupplierBtn = document.getElementById('save-new-supplier-btn');
    if (saveNewSupplierBtn) {
      saveNewSupplierBtn.addEventListener('click', saveNewSupplierToFirestore);
    }

    const generateAssociatesPdfBtn = document.getElementById('generate-associates-pdf-btn');
    if (generateAssociatesPdfBtn) {
      generateAssociatesPdf.addEventListener('click', generateAssociatesPdf);
    }
  }
});


function showSection(sectionId) {
  // Esconder a seção atualmente ativa, se houver
  const currentActiveSection = document.getElementById(lastActiveSection);
  if (currentActiveSection) {
    currentActiveSection.style.display = 'none';
  }

  // Mostrar a nova seção
  const newActiveSection = document.getElementById(sectionId);
  if (newActiveSection) {
    newActiveSection.style.display = 'block';
    lastActiveSection = sectionId; // Atualizar a última seção ativa
  }
}

// Funções para Tipos de Produto (sem alterações)
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
    // Verifica se o tipo já existe, agora de forma insensível a maiúsculas e minúsculas
    const existingTypeSnapshot = await db.collection('productTypes').get();
    const typeExists = existingTypeSnapshot.docs.some(doc => doc.data().name.toLowerCase() === newTypeName.toLowerCase());

    if (typeExists) {
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

// Funções para Fornecedores (sem alterações)
async function loadSuppliers() {
  const supplierSelect = document.getElementById('supplier');
  if (!supplierSelect) return;

  supplierSelect.innerHTML = '<option value="">Selecione ou Cadastre</option>';

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
    alert("Ocorreu um erro ao carregar os fornecedores.");
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
    // Verifica se o fornecedor já existe, insensível a maiúsculas e minúsculas
    const existingSupplierSnapshot = await db.collection('suppliers').get();
    const supplierExists = existingSupplierSnapshot.docs.some(doc => doc.data().name.toLowerCase() === newSupplierName.toLowerCase());

    if (supplierExists) {
      alert('Este fornecedor já existe.');
      return;
    }

    await db.collection('suppliers').add({ name: newSupplierName, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Fornecedor "${newSupplierName}" salvo com sucesso!`);
    newSupplierInput.value = '';
    const newSupplierModal = bootstrap.Modal.getInstance(document.getElementById('new-supplier-modal'));
    newSupplierModal.hide();
    await loadSuppliers();
  } catch (error) {
    console.error("Erro ao salvar novo fornecedor: ", error);
    alert("Ocorreu um erro ao salvar o novo fornecedor.");
  }
}

// Funções para Tipos de Associado (sem alterações)
async function loadAssociateTypes() {
  const associateTypeSelect = document.getElementById('associate-type');
  if (!associateTypeSelect) return;

  associateTypeSelect.innerHTML = '<option value="">Selecione ou Cadastre</option>';

  try {
    const typesSnapshot = await db.collection('associateTypes').orderBy('name').get();
    typesSnapshot.forEach(doc => {
      const type = doc.data();
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      associateTypeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar tipos de associado: ", error);
    alert("Ocorreu um erro ao carregar os tipos de associado.");
  }
}

function openNewAssociateTypeModal() {
  const newAssociateTypeModal = new bootstrap.Modal(document.getElementById('new-associate-type-modal'));
  newAssociateTypeModal.show();
}

async function saveNewAssociateTypeToFirestore() {
  const newAssociateTypeInput = document.getElementById('new-associate-type-input');
  const newTypeName = newAssociateTypeInput.value.trim();

  if (!newTypeName) {
    alert('Por favor, insira um nome para o novo tipo de associado.');
    return;
  }

  try {
    // Verifica se o tipo já existe, insensível a maiúsculas e minúsculas
    const existingTypeSnapshot = await db.collection('associateTypes').get();
    const typeExists = existingTypeSnapshot.docs.some(doc => doc.data().name.toLowerCase() === newTypeName.toLowerCase());

    if (typeExists) {
      alert('Este tipo de associado já existe.');
      return;
    }

    await db.collection('associateTypes').add({ name: newTypeName, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Tipo "${newTypeName}" salvo com sucesso!`);
    newAssociateTypeInput.value = '';
    const newAssociateTypeModal = bootstrap.Modal.getInstance(document.getElementById('new-associate-type-modal'));
    newAssociateTypeModal.hide();
    await loadAssociateTypes();
  } catch (error) {
    console.error("Erro ao salvar novo tipo de associado: ", error);
    alert("Ocorreu um erro ao salvar o novo tipo de associado.");
  }
}

// Funções para Cadastro de Produtos (sem alterações)
async function handleProductFormSubmit(event) {
  event.preventDefault();

  const productForm = event.target;
  const productId = productForm.dataset.productId; // Para edição

  const productData = {
    tipo: productForm.querySelector('#product-type').value,
    nome: productForm.querySelector('#product-name').value.trim(),
    descricaoDetalhada: productForm.querySelector('#product-description-detailed').value.trim(),
    descricaoResumida: productForm.querySelector('#product-description-short').value.trim(),
    status: productForm.querySelector('input[name="product-status"]:checked').value,
    online: productForm.querySelector('#product-online').checked,
    restrito: productForm.querySelector('#product-restricted').checked,
    // Imagem será tratada separadamente
    dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
    fornecedor: productForm.querySelector('#supplier').value,
  };

  // Coleta os atributos dinâmicos
  const attributesContainer = document.getElementById('dynamic-attributes-container');
  productData.atributos = [];
  attributesContainer.querySelectorAll('.attribute-group').forEach(group => {
    const attributeName = group.querySelector('.attribute-name-input').value.trim();
    const attributeValue = group.querySelector('.attribute-value-input').value.trim();
    if (attributeName && attributeValue) {
      productData.atributos.push({ name: attributeName, value: attributeValue });
    }
  });

  const productImagesInput = document.getElementById('product-images');
  const files = productImagesInput.files;

  try {
    if (productId) {
      // Atualizar produto existente
      await db.collection('products').doc(productId).update(productData);
      alert('Produto atualizado com sucesso!');
    } else {
      // Adicionar novo produto
      const docRef = await db.collection('products').add(productData);
      alert('Produto cadastrado com sucesso!');

      // Upload de imagens
      if (files.length > 0) {
        const imageUrls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageRef = storage.ref('product_images/' + docRef.id + '/' + file.name);
          const uploadTask = storageRef.put(file);

          await uploadTask;
          const downloadURL = await storageRef.getDownloadURL();
          imageUrls.push(downloadURL);
        }
        await docRef.update({ imageUrls: firebase.firestore.FieldValue.arrayUnion(...imageUrls) });
      }
    }
    productForm.reset();
    document.getElementById('dynamic-attributes-container').innerHTML = ''; // Limpa atributos
    showSection('listar-produtos'); // Redireciona para a lista de produtos
    await loadProductsToList(); // Recarrega a lista
  } catch (error) {
    console.error("Erro ao salvar produto: ", error);
    alert("Ocorreu um erro ao salvar o produto.");
  }
}

// Funções para atributos dinâmicos (sem alterações)
function addAttributeField() {
  const container = document.getElementById('dynamic-attributes-container');
  const attributeGroup = document.createElement('div');
  attributeGroup.classList.add('row', 'mb-2', 'attribute-group');
  attributeGroup.innerHTML = `
    <div class="col-5">
      <input type="text" class="form-control attribute-name-input" placeholder="Nome do Atributo">
    </div>
    <div class="col-5">
      <input type="text" class="form-control attribute-value-input" placeholder="Valor do Atributo">
    </div>
    <div class="col-2">
      <button type="button" class="btn btn-danger btn-sm" onclick="removeAttributeField(this)">Remover</button>
    </div>
  `;
  container.appendChild(attributeGroup);
}

function removeAttributeField(button) {
  button.closest('.attribute-group').remove();
}

// Funções para listar produtos (sem alterações)
async function loadProductsToList() {
  const productsTableBody = document.getElementById('products-table-body');
  productsTableBody.innerHTML = ''; // Limpa a tabela

  try {
    const productsSnapshot = await db.collection('products').get();
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      const row = productsTableBody.insertRow();

      row.insertCell(0).textContent = product.nome;
      row.insertCell(1).textContent = product.tipo || 'N/A';
      row.insertCell(2).textContent = product.status;
      row.insertCell(3).textContent = product.online ? 'Sim' : 'Não';
      row.insertCell(4).textContent = product.restrito ? 'Sim' : 'Não';
      row.insertCell(5).textContent = product.fornecedor || 'N/A';
      row.insertCell(6).textContent = product.descricaoResumida || 'Sem descrição';

      const actionsCell = row.insertCell(7);
      actionsCell.innerHTML = `
        <button class="btn btn-info btn-sm me-2" onclick="editProduct('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Excluir</button>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar produtos: ", error);
    alert("Ocorreu um erro ao carregar os produtos.");
  }
}

// Funções de edição e exclusão de produtos (sem alterações)
async function editProduct(productId) {
  try {
    const doc = await db.collection('products').doc(productId).get();
    if (doc.exists) {
      const product = doc.data();
      const productForm = document.getElementById('product-form');

      // Preenche o formulário
      productForm.dataset.productId = doc.id; // Salva o ID para atualização
      productForm.querySelector('#product-type').value = product.tipo || '';
      productForm.querySelector('#product-name').value = product.nome;
      productForm.querySelector('#product-description-detailed').value = product.descricaoDetalhada || '';
      productForm.querySelector('#product-description-short').value = product.descricaoResumida || '';
      productForm.querySelector(`input[name="product-status"][value="${product.status}"]`).checked = true;
      productForm.querySelector('#product-online').checked = product.online || false;
      productForm.querySelector('#product-restricted').checked = product.restrito || false;
      productForm.querySelector('#supplier').value = product.fornecedor || '';

      // Preenche atributos dinâmicos
      const attributesContainer = document.getElementById('dynamic-attributes-container');
      attributesContainer.innerHTML = ''; // Limpa antes de preencher
      if (product.atributos && product.atributos.length > 0) {
        product.atributos.forEach(attr => {
          const attributeGroup = document.createElement('div');
          attributeGroup.classList.add('row', 'mb-2', 'attribute-group');
          attributeGroup.innerHTML = `
            <div class="col-5">
              <input type="text" class="form-control attribute-name-input" placeholder="Nome do Atributo" value="${attr.name}">
            </div>
            <div class="col-5">
              <input type="text" class="form-control attribute-value-input" placeholder="Valor do Atributo" value="${attr.value}">
            </div>
            <div class="col-2">
              <button type="button" class="btn btn-danger btn-sm" onclick="removeAttributeField(this)">Remover</button>
            </div>
          `;
          attributesContainer.appendChild(attributeGroup);
        });
      }

      // Mostra a seção de cadastro para edição
      showSection('cadastro-produtos');
      alert('Produto carregado para edição.');
    } else {
      alert('Produto não encontrado.');
    }
  } catch (error) {
    console.error("Erro ao carregar produto para edição: ", error);
    alert("Ocorreu um erro ao carregar o produto para edição.");
  }
}

async function deleteProduct(productId) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await db.collection('products').doc(productId).delete();
      alert('Produto excluído com sucesso!');
      await loadProductsToList(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao excluir produto: ", error);
      alert("Ocorreu um erro ao excluir o produto.");
    }
  }
}

// Geração de PDF de Produtos (sem alterações)
async function generateProductsPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório de Produtos", 10, 10);

  const products = [];
  try {
    const productsSnapshot = await db.collection('products').get();
    productsSnapshot.forEach(doc => {
      products.push(doc.data());
    });

    const tableColumn = ["#", "Tipo", "Nome", "Descrição Resumida", "Status", "Online", "Restrito", "Fornecedor"]; // Adicione as novas colunas
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

    doc.save('produtos_cannapis.pdf');
  } catch (error) {
    console.error("Erro ao gerar PDF de produtos: ", error);
    alert("Ocorreu um erro ao gerar o PDF de produtos.");
  }
}

// Funções para cadastro de associados (sem alterações no formulário em si)
async function handleAssociateFormSubmit(event) {
  event.preventDefault();

  const associateForm = event.target;
  const associateId = associateForm.dataset.associateId; // Para edição

  const associateData = {
    nomeCompleto: associateForm.querySelector('#associate-full-name').value.trim(),
    dataNascimento: associateForm.querySelector('#associate-dob').value,
    genero: associateForm.querySelector('input[name="associate-gender"]:checked').value,
    rg: associateForm.querySelector('#associate-rg').value.trim(),
    cpf: associateForm.querySelector('#associate-cpf').value.trim(),
    endereco: associateForm.querySelector('#associate-address').value.trim(),
    cep: associateForm.querySelector('#associate-cep').value.trim(),
    telefone: associateForm.querySelector('#associate-phone').value.trim(),
    email: associateForm.querySelector('#associate-email').value.trim(),
    tipoAssociado: associateForm.querySelector('#associate-type').value,
    dataAssociacao: associateForm.querySelector('#associate-association-date').value,
    statusAssociado: associateForm.querySelector('input[name="associate-status"]:checked').value,
    dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (associateId) {
      // Atualizar associado existente
      await db.collection('associates').doc(associateId).update(associateData);
      alert('Associado atualizado com sucesso!');
    } else {
      // Adicionar novo associado
      await db.collection('associates').add(associateData);
      alert('Associado cadastrado com sucesso!');
    }
    associateForm.reset();
    // Após salvar, verificar para qual lista o associado vai e recarregar
    if (associateData.statusAssociado.toLowerCase() === 'ativo') {
      showSection('admitidos');
      await loadAssociatesFilteredToList('ativo', 'associates-admitidos-table-body');
    } else if (associateData.statusAssociado.toLowerCase() === 'em admissão') { // Supondo que você use 'Em Admissão' como status
      showSection('em-admissao');
      await loadAssociatesFilteredToList('Em Admissão', 'associates-em-admissao-table-body');
    } else { // Se for outro status, recarrega a lista de admitidos por padrão ou ajusta conforme sua lógica
      showSection('admitidos');
      await loadAssociatesFilteredToList('ativo', 'associates-admitidos-table-body');
    }
  } catch (error) {
    console.error("Erro ao salvar associado: ", error);
    alert("Ocorreu um erro ao salvar o associado.");
  }
}

// Funções para listar associados (AGORA COM FILTRO)
async function loadAssociatesFilteredToList(statusFilter = null, tableBodyId = 'associates-admitidos-table-body') {
  const associatesTableBody = document.getElementById(tableBodyId);
  if (!associatesTableBody) {
    console.error(`Tabela com ID ${tableBodyId} não encontrada.`);
    return;
  }
  associatesTableBody.innerHTML = ''; // Limpa a tabela

  try {
    let query = db.collection('associates');
    if (statusFilter) {
      query = query.where('statusAssociado', '==', statusFilter);
    }

    const associatesSnapshot = await query.get();
    if (associatesSnapshot.empty) {
      associatesTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum associado com status "${statusFilter || 'qualquer'}" encontrado.</td></tr>`;
      return;
    }

    associatesSnapshot.forEach(doc => {
      const associate = doc.data();
      const row = associatesTableBody.insertRow();

      row.insertCell(0).textContent = associate.nomeCompleto;
      row.insertCell(1).textContent = associate.cpf;
      row.insertCell(2).textContent = associate.telefone;
      row.insertCell(3).textContent = associate.tipoAssociado || 'N/A';
      row.insertCell(4).textContent = associate.statusAssociado;

      const actionsCell = row.insertCell(5);
      actionsCell.innerHTML = `
        <button class="btn btn-info btn-sm me-2" onclick="editAssociate('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAssociate('${doc.id}')">Excluir</button>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar associados: ", error);
    alert("Ocorreu um erro ao carregar os associados.");
  }
}


// Funções de edição e exclusão de associados (mantidas, mas a navegação após edição precisa ser pensada)
async function editAssociate(associateId) {
  try {
    const doc = await db.collection('associates').doc(associateId).get();
    if (doc.exists) {
      const associate = doc.data();
      const associateForm = document.getElementById('associate-form');

      // Preenche o formulário
      associateForm.dataset.associateId = doc.id;
      associateForm.querySelector('#associate-full-name').value = associate.nomeCompleto;
      associateForm.querySelector('#associate-dob').value = associate.dataNascimento;
      associateForm.querySelector(`input[name="associate-gender"][value="${associate.genero}"]`).checked = true;
      associateForm.querySelector('#associate-rg').value = associate.rg;
      associateForm.querySelector('#associate-cpf').value = associate.cpf;
      associateForm.querySelector('#associate-address').value = associate.endereco;
      associateForm.querySelector('#associate-cep').value = associate.cep;
      associateForm.querySelector('#associate-phone').value = associate.telefone;
      associateForm.querySelector('#associate-email').value = associate.email;
      associateForm.querySelector('#associate-type').value = associate.tipoAssociado || '';
      associateForm.querySelector('#associate-association-date').value = associate.dataAssociacao;
      associateForm.querySelector(`input[name="associate-status"][value="${associate.statusAssociado}"]`).checked = true;

      showSection('cadastro-associados');
      alert('Associado carregado para edição.');
    } else {
      alert('Associado não encontrado.');
    }
  } catch (error) {
    console.error("Erro ao carregar associado para edição: ", error);
    alert("Ocorreu um erro ao carregar o associado para edição.");
  }
}

async function deleteAssociate(associateId) {
  if (confirm('Tem certeza que deseja excluir este associado?')) {
    try {
      await db.collection('associates').doc(associateId).delete();
      alert('Associado excluído com sucesso!');
      // Após a exclusão, recarrega a lista de associados admitidos
      await loadAssociatesFilteredToList('ativo', 'associates-admitidos-table-body');
      showSection('admitidos'); // Redireciona para a lista de admitidos
    } catch (error) {
      console.error("Erro ao excluir associado: ", error);
      alert("Ocorreu um erro ao excluir o associado.");
    }
  }
}

// Geração de PDF de Associados (sem alterações, mas pode ser adaptada para filtros futuros)
async function generateAssociatesPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório de Associados", 10, 10);

  const associates = [];
  try {
    const associatesSnapshot = await db.collection('associates').get(); // Pega todos para o PDF
    associatesSnapshot.forEach(doc => {
      associates.push(doc.data());
    });

    const tableColumn = ["#", "Nome Completo", "CPF", "Telefone", "Tipo de Associado", "Status"];
    const tableRows = [];

    associates.forEach((associate, index) => {
      const associateData = [
        index + 1,
        associate.nomeCompleto,
        associate.cpf,
        associate.telefone,
        associate.tipoAssociado || 'N/A',
        associate.statusAssociado
      ];
      tableRows.push(associateData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      headStyles: { fillColor: [50, 50, 50] },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didDrawPage: function (data) {
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('associados_cannapis.pdf');
  } catch (error) {
    console.error("Erro ao gerar PDF de associados: ", error);
    alert("Ocorreu um erro ao gerar o PDF de associados.");
  }
}