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
        // Redireciona para o dashboard
        window.location.href = 'dashboard.html';
      } else {
        errorMessage.textContent = 'Usuário ou senha incorretos.';
      }
    });
  }
});

// Navegação no dashboard
function showSection(sectionId) {
  // Atualiza o título da seção
  document.getElementById('section-title').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

  // Esconde todas as seções
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => {
    section.classList.remove('active');
  });

  // Remove a classe 'active' de todos os itens do menu
  const menuItems = document.querySelectorAll('.sidebar ul li');
  menuItems.forEach((item) => {
    item.classList.remove('active');
  });

  // Mostra a seção selecionada
  document.getElementById(sectionId).classList.add('active');

  // Adiciona a classe 'active' ao item do menu correspondente
  const selectedItem = Array.from(menuItems).find(item => item.textContent.toLowerCase() === sectionId);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }
}

// Função de logout
function logout() {
  alert('Você saiu do sistema.');
  window.location.href = 'index.html';
}
