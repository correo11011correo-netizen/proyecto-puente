document.addEventListener('DOMContentLoaded', () => {
  // FAQ Logic for Client Page
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        // Close others
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        // Toggle current
        item.classList.toggle('active');
      });
    }
  });

  // Admin Form Submission (Mock)
  const form = document.getElementById('new-package-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('¡Paquete registrado con éxito! (Esto es una simulación)');
      form.reset();
    });
  }
});