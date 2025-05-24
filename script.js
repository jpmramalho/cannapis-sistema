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
    await loadAssociateTypes(); // Carrega tipos de associado
  }

  if (document.getElementById('dashboard-container')) {
    // Esconde todas as seções e mostra a inicial (home)
    document.querySelectorAll('.content-section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById('home-section').style.display = 'block';

    // Event listeners para os itens do menu lateral
    document.querySelectorAll('.list-group-item-action').forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const sectionToShow = this.dataset.section;

        // Esconde a seção ativa anterior
        document.getElementById(`${lastActiveSection}-section`).style.display = 'none';

        // Mostra a nova seção
        document.getElementById(`${sectionToShow}-section`).style.display = 'block';
        lastActiveSection = sectionToShow; // Atualiza a última seção ativa

        // Carrega dados específicos da seção, se houver
        if (sectionToShow === 'products') {
          loadProducts();
        } else if (sectionToShow === 'associates') {
          loadAssociates();
        } else if (sectionToShow === 'suppliers') {
          loadSuppliersTable(); // Certifique-se de que esta função existe para carregar a tabela de fornecedores
        } else if (sectionToShow === 'add-product') {
          loadProductTypes(); // Recarrega para o caso de ter adicionado novo tipo
          loadSuppliers(); // Recarrega para o caso de ter adicionado novo fornecedor
        } else if (sectionToShow === 'register-associate') {
          loadAssociateTypes(); // Recarrega para o caso de ter adicionado novo tipo de associado
        }
      });
    });

    // Logout button functionality
    document.getElementById('logout-button').addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'index.html'; // Redireciona para a página de login
    });

    // Load initial data for home if needed, or simply display home section
    // For now, it's just showing the home section by default
  }

  // Event listener para o formulário de adicionar produto
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', addProduct);
  }

  // Event listener para o formulário de adicionar fornecedor
  const addSupplierForm = document.getElementById('add-supplier-form');
  if (addSupplierForm) {
    addSupplierForm.addEventListener('submit', addSupplier);
  }

  // Event listener para o formulário de cadastrar associado
  const registerAssociateForm = document.getElementById('register-associate-form');
  if (registerAssociateForm) {
      registerAssociateForm.addEventListener('submit', registerAssociate);
  }

  // Event listener para o botão de salvar tipo de produto no modal
  const saveProductTypeButton = document.getElementById('save-product-type');
  if (saveProductTypeButton) {
    saveProductTypeButton.addEventListener('click', addProductType);
  }

  // Event listener para o botão de salvar fornecedor no modal
  const saveSupplierButton = document.getElementById('save-supplier');
  if (saveSupplierButton) {
    saveSupplierButton.addEventListener('click', addSupplierFromModal);
  }

  // Event listener para o botão de salvar tipo de associado no modal
  const saveAssociateTypeButton = document.getElementById('save-associate-type');
  if (saveAssociateTypeButton) {
      saveAssociateTypeButton.addEventListener('click', addAssociateType);
  }

  // Event listeners para pesquisa
  const searchProductInput = document.getElementById('search-product');
  if (searchProductInput) {
    searchProductInput.addEventListener('keyup', filterProducts);
  }

  const searchAssociateInput = document.getElementById('search-associate');
  if (searchAssociateInput) {
    searchAssociateInput.addEventListener('keyup', filterAssociates);
  }

  const searchSupplierInput = document.getElementById('search-supplier');
  if (searchSupplierInput) {
    searchSupplierInput.addEventListener('keyup', filterSuppliers);
  }

});

// Funções para carregar e adicionar dados (já existentes e novas)

// Load Product Types
async function loadProductTypes() {
  const productTypeSelect = document.getElementById('product-type');
  if (!productTypeSelect) return;
  productTypeSelect.innerHTML = '<option value="">Selecione um tipo</option>';
  try {
    const snapshot = await db.collection('productTypes').get();
    snapshot.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = doc.data().name;
      productTypeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar tipos de produto:", error);
  }
}

// Add Product Type
async function addProductType() {
  const newProductTypeName = document.getElementById('new-product-type-name').value;
  if (newProductTypeName.trim() === '') {
    alert('Por favor, insira um nome para o tipo de produto.');
    return;
  }
  try {
    await db.collection('productTypes').add({ name: newProductTypeName });
    alert('Tipo de produto adicionado com sucesso!');
    document.getElementById('new-product-type-name').value = '';
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductTypeModal'));
    modal.hide();
    loadProductTypes(); // Recarrega os tipos de produto no dropdown
  } catch (error) {
    console.error("Erro ao adicionar tipo de produto:", error);
    alert('Erro ao adicionar tipo de produto. Tente novamente.');
  }
}

// Load Suppliers for dropdown
async function loadSuppliers() {
  const productSupplierSelect = document.getElementById('product-supplier');
  if (!productSupplierSelect) return;
  productSupplierSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
  try {
    const snapshot = await db.collection('suppliers').get();
    snapshot.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = doc.data().name;
      productSupplierSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar fornecedores:", error);
  }
}

// Load Suppliers for table
async function loadSuppliersTable() {
  const suppliersTableBody = document.getElementById('suppliers-table-body');
  if (!suppliersTableBody) return;
  suppliersTableBody.innerHTML = ''; // Clear existing rows
  try {
    const snapshot = await db.collection('suppliers').get();
    let index = 1;
    snapshot.forEach(doc => {
      const supplier = doc.data();
      const row = suppliersTableBody.insertRow();
      row.insertCell(0).textContent = index++;
      row.insertCell(1).textContent = supplier.name;
      row.insertCell(2).textContent = supplier.contactPerson || 'N/A';
      row.insertCell(3).textContent = supplier.phone || 'N/A';
      row.insertCell(4).textContent = supplier.email || 'N/A';

      const actionsCell = row.insertCell(5);
      actionsCell.innerHTML = `
                <button class="btn btn-sm btn-info me-2" onclick="editSupplier('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
    });
    // Initialize tooltips for newly added buttons
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
  } catch (error) {
    console.error("Erro ao carregar fornecedores para a tabela:", error);
  }
}

// Add Supplier from modal
async function addSupplierFromModal() {
  const newSupplierName = document.getElementById('new-supplier-name').value;
  const newSupplierContact = document.getElementById('new-supplier-contact').value;
  const newSupplierPhone = document.getElementById('new-supplier-phone').value;
  const newSupplierEmail = document.getElementById('new-supplier-email').value;
  const newSupplierAddress = document.getElementById('new-supplier-address').value;

  if (newSupplierName.trim() === '') {
    alert('Por favor, insira o nome do fornecedor.');
    return;
  }

  try {
    await db.collection('suppliers').add({
      name: newSupplierName,
      contactPerson: newSupplierContact,
      phone: newSupplierPhone,
      email: newSupplierEmail,
      address: newSupplierAddress,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Fornecedor adicionado com sucesso!');
    document.getElementById('new-supplier-name').value = '';
    document.getElementById('new-supplier-contact').value = '';
    document.getElementById('new-supplier-phone').value = '';
    document.getElementById('new-supplier-email').value = '';
    document.getElementById('new-supplier-address').value = '';
    const modal = bootstrap.Modal.getInstance(document.getElementById('addSupplierModal'));
    modal.hide();
    loadSuppliers(); // Recarrega os fornecedores no dropdown
    loadSuppliersTable(); // Recarrega a tabela de fornecedores
  } catch (error) {
    console.error("Erro ao adicionar fornecedor:", error);
    alert('Erro ao adicionar fornecedor. Tente novamente.');
  }
}

// Add Product
async function addProduct(e) {
  e.preventDefault();
  const productName = document.getElementById('product-name').value;
  const productTypeId = document.getElementById('product-type').value;
  const productSupplierId = document.getElementById('product-supplier').value;
  const productQuantity = parseInt(document.getElementById('product-quantity').value);
  const purchasePrice = parseFloat(document.getElementById('purchase-price').value);
  const salePrice = parseFloat(document.getElementById('sale-price').value);

  if (!productName || !productTypeId || !productSupplierId || isNaN(productQuantity) || isNaN(purchasePrice) || isNaN(salePrice)) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  try {
    // Buscar o nome do tipo de produto
    const productTypeDoc = await db.collection('productTypes').doc(productTypeId).get();
    const productTypeName = productTypeDoc.exists ? productTypeDoc.data().name : 'Desconhecido';

    // Buscar o nome do fornecedor
    const supplierDoc = await db.collection('suppliers').doc(productSupplierId).get();
    const supplierName = supplierDoc.exists ? supplierDoc.data().name : 'Desconhecido';

    await db.collection('products').add({
      name: productName,
      typeId: productTypeId, // Armazena o ID
      typeName: productTypeName, // Armazena o nome para facilitar consultas
      supplierId: productSupplierId, // Armazena o ID
      supplierName: supplierName, // Armazena o nome para facilitar consultas
      quantity: productQuantity,
      purchasePrice: purchasePrice,
      salePrice: salePrice,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Produto adicionado com sucesso!');
    document.getElementById('add-product-form').reset();
    // Opcional: redirecionar ou recarregar a lista de produtos
    loadProducts();
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    alert('Erro ao adicionar produto. Tente novamente.');
  }
}

// Load Products
async function loadProducts() {
  const productsTableBody = document.getElementById('products-table-body');
  if (!productsTableBody) return;
  productsTableBody.innerHTML = ''; // Clear existing rows
  try {
    const snapshot = await db.collection('products').get();
    let index = 1;
    snapshot.forEach(doc => {
      const product = doc.data();
      const row = productsTableBody.insertRow();
      row.insertCell(0).textContent = index++;
      row.insertCell(1).textContent = product.name;
      row.insertCell(2).textContent = product.typeName || 'N/A'; // Usa o nome do tipo
      row.insertCell(3).textContent = product.supplierName || 'N/A'; // Usa o nome do fornecedor
      row.insertCell(4).textContent = product.quantity;
      row.insertCell(5).textContent = product.purchasePrice.toFixed(2);
      row.insertCell(6).textContent = product.salePrice.toFixed(2);

      const actionsCell = row.insertCell(7);
      actionsCell.innerHTML = `
                <button class="btn btn-sm btn-info me-2" onclick="editProduct('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
    });
    // Initialize tooltips for newly added buttons
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

// Delete Product
async function deleteProduct(productId) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await db.collection('products').doc(productId).delete();
      alert('Produto excluído com sucesso!');
      loadProducts(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert('Erro ao excluir produto. Tente novamente.');
    }
  }
}

// Edit Product (Placeholder - requires a modal or separate form)
async function editProduct(productId) {
  alert('Funcionalidade de edição de produto ainda não implementada. ID: ' + productId);
  // Implementar modal ou redirecionamento para edição
}

// Delete Supplier
async function deleteSupplier(supplierId) {
  if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
    try {
      await db.collection('suppliers').doc(supplierId).delete();
      alert('Fornecedor excluído com sucesso!');
      loadSuppliersTable(); // Recarregar a lista
      loadSuppliers(); // Recarregar o dropdown
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      alert('Erro ao excluir fornecedor. Tente novamente.');
    }
  }
}

// Edit Supplier (Placeholder - requires a modal or separate form)
async function editSupplier(supplierId) {
  alert('Funcionalidade de edição de fornecedor ainda não implementada. ID: ' + supplierId);
  // Implementar modal ou redirecionamento para edição
}


// Filter Products
function filterProducts() {
  const input = document.getElementById('search-product');
  const filter = input.value.toLowerCase();
  const table = document.getElementById('products-table-body');
  const tr = table.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const tdName = tr[i].getElementsByTagName('td')[1]; // Coluna Nome
    const tdType = tr[i].getElementsByTagName('td')[2]; // Coluna Tipo
    const tdSupplier = tr[i].getElementsByTagName('td')[3]; // Coluna Fornecedor

    if (tdName || tdType || tdSupplier) {
      if ((tdName && tdName.textContent.toLowerCase().indexOf(filter) > -1) ||
        (tdType && tdType.textContent.toLowerCase().indexOf(filter) > -1) ||
        (tdSupplier && tdSupplier.textContent.toLowerCase().indexOf(filter) > -1)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Filter Suppliers
function filterSuppliers() {
  const input = document.getElementById('search-supplier');
  const filter = input.value.toLowerCase();
  const table = document.getElementById('suppliers-table-body');
  const tr = table.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const tdName = tr[i].getElementsByTagName('td')[1]; // Coluna Nome do Fornecedor
    const tdContact = tr[i].getElementsByTagName('td')[2]; // Coluna Contato
    const tdEmail = tr[i].getElementsByTagName('td')[4]; // Coluna Email

    if (tdName || tdContact || tdEmail) {
      if ((tdName && tdName.textContent.toLowerCase().indexOf(filter) > -1) ||
        (tdContact && tdContact.textContent.toLowerCase().indexOf(filter) > -1) ||
        (tdEmail && tdEmail.textContent.toLowerCase().indexOf(filter) > -1)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Report Generation (Product)
async function generateProductReport() {
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

    const tableColumn = ["#", "Nome", "Tipo", "Fornecedor", "Quantidade", "Preço Compra (R$)", "Preço Venda (R$)"];
    const tableRows = [];

    products.forEach((product, index) => {
      const productData = [
        index + 1,
        product.name,
        product.typeName || 'N/A',
        product.supplierName || 'N/A',
        product.quantity,
        product.purchasePrice.toFixed(2),
        product.salePrice.toFixed(2)
      ];
      tableRows.push(productData);
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
        // Footer
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('relatorio_produtos.pdf');
  } catch (error) {
    console.error("Erro ao gerar relatório de produtos:", error);
    alert('Erro ao gerar relatório de produtos. Verifique o console para mais detalhes.');
  }
}

// Report Generation (Supplier)
async function generateSupplierReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório de Fornecedores", 10, 10);

  const suppliers = [];
  try {
    const suppliersSnapshot = await db.collection('suppliers').get();
    suppliersSnapshot.forEach(doc => {
      suppliers.push(doc.data());
    });

    const tableColumn = ["#", "Nome do Fornecedor", "Contato", "Telefone", "Email", "Endereço"];
    const tableRows = [];

    suppliers.forEach((supplier, index) => {
      const supplierData = [
        index + 1,
        supplier.name,
        supplier.contactPerson || 'N/A',
        supplier.phone || 'N/A',
        supplier.email || 'N/A',
        supplier.address || 'N/A'
      ];
      tableRows.push(supplierData);
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
        // Footer
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('relatorio_fornecedores.pdf');
  } catch (error) {
    console.error("Erro ao gerar relatório de fornecedores:", error);
    alert('Erro ao gerar relatório de fornecedores. Verifique o console para mais detalhes.');
  }
}

// Report Generation (Associate)
async function generateAssociateReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório de Associados", 10, 10);

  const associates = [];
  try {
    const associatesSnapshot = await db.collection('associates').get();
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
        // Footer
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('relatorio_associados.pdf');
  } catch (error) {
    console.error("Erro ao gerar relatório de associados:", error);
    alert('Erro ao gerar relatório de associados. Verifique o console para mais detalhes.');
  }
}

// NEW FUNCTIONS FOR ASSOCIATES

// Load Associate Types for dropdown
async function loadAssociateTypes() {
    const associateTypeSelect = document.getElementById('associate-type');
    if (!associateTypeSelect) return;
    associateTypeSelect.innerHTML = '<option value="">Selecione um tipo</option>';
    try {
        const snapshot = await db.collection('associateTypes').get();
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            associateTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar tipos de associado:", error);
    }
}

// Add Associate Type from modal
async function addAssociateType() {
    const newAssociateTypeName = document.getElementById('new-associate-type-name').value;
    if (newAssociateTypeName.trim() === '') {
        alert('Por favor, insira um nome para o tipo de associado.');
        return;
    }
    try {
        await db.collection('associateTypes').add({ name: newAssociateTypeName });
        alert('Tipo de associado adicionado com sucesso!');
        document.getElementById('new-associate-type-name').value = '';
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAssociateTypeModal'));
        modal.hide();
        loadAssociateTypes(); // Recarrega os tipos de associado no dropdown
    } catch (error) {
        console.error("Erro ao adicionar tipo de associado:", error);
        alert('Erro ao adicionar tipo de associado. Tente novamente.');
    }
}

// Register Associate
async function registerAssociate(e) {
    e.preventDefault();

    const fullName = document.getElementById('associate-full-name').value;
    const cpf = document.getElementById('associate-cpf').value;
    const phone = document.getElementById('associate-phone').value;
    const dob = document.getElementById('associate-dob').value;
    const address = document.getElementById('associate-address').value;
    const number = document.getElementById('associate-number').value;
    const cep = document.getElementById('associate-cep').value;
    const city = document.getElementById('associate-city').value;
    const state = document.getElementById('associate-state').value;
    const country = document.getElementById('associate-country').value;
    const email = document.getElementById('associate-email').value;
    const associateTypeId = document.getElementById('associate-type').value;
    const associateStatus = document.getElementById('associate-status').value;
    const documentFile = document.getElementById('associate-document-upload').files[0]; // Get the file

    if (!fullName || !cpf || !associateTypeId || !associateStatus) {
        alert('Por favor, preencha os campos obrigatórios: Nome Completo, CPF, Tipo de Associado e Status.');
        return;
    }

    try {
        // Buscar o nome do tipo de associado
        const associateTypeDoc = await db.collection('associateTypes').doc(associateTypeId).get();
        const associateTypeName = associateTypeDoc.exists ? associateTypeDoc.data().name : 'N/A';

        let documentUrl = '';
        if (documentFile) {
            const storageRef = storage.ref();
            const documentName = `${Date.now()}_${documentFile.name}`;
            const fileRef = storageRef.child(`associate_documents/${documentName}`);
            await fileRef.put(documentFile);
            documentUrl = await fileRef.getDownloadURL();
            console.log('Documento carregado:', documentUrl);
        }

        await db.collection('associates').add({
            nomeCompleto: fullName,
            cpf: cpf,
            telefone: phone,
            dataNascimento: dob,
            enderecoCompleto: address,
            numeroEndereco: number,
            cep: cep,
            cidade: city,
            estado: state,
            pais: country,
            email: email,
            tipoAssociadoId: associateTypeId,
            tipoAssociado: associateTypeName, // Armazena o nome para facilitar consultas
            statusAssociado: associateStatus,
            documentoUrl: documentUrl, // Armazena a URL do documento
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Associado cadastrado com sucesso!');
        document.getElementById('register-associate-form').reset();
        document.getElementById('uploaded-documents-preview').innerHTML = ''; // Clear preview
        loadAssociates(); // Recarrega a lista de associados
    } catch (error) {
        console.error("Erro ao cadastrar associado:", error);
        alert('Erro ao cadastrar associado. Tente novamente.');
    }
}

// Load Associates for table
async function loadAssociates() {
  const associatesTableBody = document.getElementById('associates-table-body');
  if (!associatesTableBody) return;
  associatesTableBody.innerHTML = ''; // Clear existing rows
  try {
    const snapshot = await db.collection('associates').get();
    let index = 1;
    snapshot.forEach(doc => {
      const associate = doc.data();
      const row = associatesTableBody.insertRow();
      row.insertCell(0).textContent = index++;
      row.insertCell(1).textContent = associate.nomeCompleto;
      row.insertCell(2).textContent = associate.cpf;
      row.insertCell(3).textContent = associate.telefone || 'N/A';
      row.insertCell(4).textContent = associate.tipoAssociado || 'N/A'; // Usa o nome do tipo
      row.insertCell(5).textContent = associate.statusAssociado;

      const actionsCell = row.insertCell(6);
      actionsCell.innerHTML = `
                <button class="btn btn-sm btn-info me-2" onclick="editAssociate('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAssociate('${doc.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${associate.documentoUrl ? `<a href="${associate.documentoUrl}" target="_blank" class="btn btn-sm btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Ver Documento"><i class="fas fa-eye"></i></a>` : ''}
            `;
    });
    // Initialize tooltips for newly added buttons
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
  } catch (error) {
    console.error("Erro ao carregar associados:", error);
  }
}

// Delete Associate
async function deleteAssociate(associateId) {
    if (confirm('Tem certeza que deseja excluir este associado?')) {
        try {
            // Opcional: Excluir o documento associado do Storage, se existir
            const associateDoc = await db.collection('associates').doc(associateId).get();
            const associateData = associateDoc.data();
            if (associateData && associateData.documentoUrl) {
                const fileRef = storage.refFromURL(associateData.documentoUrl);
                await fileRef.delete().catch(error => {
                    console.warn("Aviso: Não foi possível excluir o arquivo do Storage (pode já ter sido excluído ou URL inválida).", error);
                });
            }

            await db.collection('associates').doc(associateId).delete();
            alert('Associado excluído com sucesso!');
            loadAssociates(); // Recarregar a lista
        } catch (error) {
            console.error("Erro ao excluir associado:", error);
            alert('Erro ao excluir associado. Tente novamente.');
        }
    }
}

// Edit Associate (Placeholder - requires a modal or separate form)
async function editAssociate(associateId) {
  alert('Funcionalidade de edição de associado ainda não implementada. ID: ' + associateId);
  // Implementar modal ou redirecionamento para edição
}

// Filter Associates
function filterAssociates() {
    const input = document.getElementById('search-associate');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('associates-table-body');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const tdName = tr[i].getElementsByTagName('td')[1]; // Coluna Nome Completo
        const tdCpf = tr[i].getElementsByTagName('td')[2];  // Coluna CPF
        const tdType = tr[i].getElementsByTagName('td')[4]; // Coluna Tipo de Associado
        const tdStatus = tr[i].getElementsByTagName('td')[5]; // Coluna Status

        if (tdName || tdCpf || tdType || tdStatus) {
            if ((tdName && tdName.textContent.toLowerCase().indexOf(filter) > -1) ||
                (tdCpf && tdCpf.textContent.toLowerCase().indexOf(filter) > -1) ||
                (tdType && tdType.textContent.toLowerCase().indexOf(filter) > -1) ||
                (tdStatus && tdStatus.textContent.toLowerCase().indexOf(filter) > -1)) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}