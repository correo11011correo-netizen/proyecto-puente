document.addEventListener('DOMContentLoaded', () => {
  // --- Lógica del Modal de WhatsApp ---
  const modal = document.getElementById('wa-modal');
  const closeBtn = document.getElementById('close-wa-modal');
  const waForm = document.getElementById('wa-form');
  const openWaBtns = document.querySelectorAll('.open-wa-modal');

  // Abrir Modal
  if (openWaBtns.length > 0 && modal) {
    openWaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
      });
    });
  }

  // Cerrar Modal con la 'X'
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Cerrar Modal clickeando fuera de la caja
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Enviar el formulario a WhatsApp
  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nombre = document.getElementById('wa-nombre').value.trim();
      const monto = document.getElementById('wa-monto').value.trim();
      const cantidad = document.getElementById('wa-cantidad').value.trim();
      
      // Número de teléfono configurado previamente (+595 987 188642)
      const phone = '595987188642';
      
      // Armar el mensaje
      const message = `Hola, soy *${nombre}*.%0AQuiero solicitar un envío con Puente Paraguay.%0A📦 *Cantidad de productos:* ${cantidad}%0A💰 *Valor estimado de compra:* USD ${monto}%0A%0A¿Podrían brindarme más información?`;
      
      // Generar link de WhatsApp y abrirlo
      const waUrl = `https://wa.me/${phone}?text=${message}`;
      window.open(waUrl, '_blank');
      
      // Cerrar y limpiar el modal
      modal.style.display = 'none';
      waForm.reset();
    });
  }

  // --- Lógica de FAQ (Preguntas Frecuentes) ---
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        // Cerrar las otras pestañas
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        // Alternar la pestaña actual
        item.classList.toggle('active');
      });
    }
  });

  // Sistema de Datos (localStorage) para el Panel Admin
  const form = document.getElementById('new-package-form');
  const tableBody = document.getElementById('packages-table-body');

  if (tableBody) {
    // Función para obtener la clase de color según el estado
    const getBadgeClass = (status) => {
        if (status === 'Recibido en CDE') return 'status-received';
        if (status === 'En tránsito') return 'status-transit';
        if (status === 'Entregado') return 'status-delivered';
        return 'status-received';
    };

    // Inicializar datos simulados si está vacío el almacenamiento
    if (!localStorage.getItem('puentePackages')) {
        const initialData = [
            { tracking: '#PP-1045', client: 'Juan Pérez', destination: 'CABA', status: 'En tránsito' },
            { tracking: '#PP-1046', client: 'María Gómez', destination: 'Rosario', status: 'Recibido en CDE' },
            { tracking: '#PP-1042', client: 'Carlos López', destination: 'Córdoba', status: 'Entregado' }
        ];
        localStorage.setItem('puentePackages', JSON.stringify(initialData));
    }

    // Función para agregar una fila a la tabla
    const addPackageToTable = (pkg) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pkg.tracking}</td>
            <td>${pkg.client}</td>
            <td>${pkg.destination}</td>
            <td><span class="status-badge ${getBadgeClass(pkg.status)}">${pkg.status}</span></td>
        `;
        tableBody.appendChild(tr); 
    };

    // Cargar paquetes desde localStorage al entrar
    const loadPackages = () => {
        const savedData = localStorage.getItem('puentePackages');
        if (savedData) {
            const packages = JSON.parse(savedData);
            if (packages.length > 0) {
                tableBody.innerHTML = ''; // Limpiar datos en duro del HTML
                packages.forEach(pkg => {
                    addPackageToTable(pkg);
                });
            }
        }
    };

    loadPackages();

    // Evento al enviar el formulario (Registrar nuevo paquete)
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const client = document.getElementById('pkg-client').value;
        const destination = document.getElementById('pkg-destination').value;
        const status = document.getElementById('pkg-status').value;
        
        // Generar un número de tracking aleatorio
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const tracking = '#PP-' + randomNum;

        const newPackage = { tracking, client, destination, status };

        // Guardar en el almacenamiento del navegador
        const savedData = localStorage.getItem('puentePackages');
        let packages = savedData ? JSON.parse(savedData) : [];
        packages.unshift(newPackage); // Agregar al principio de la lista
        localStorage.setItem('puentePackages', JSON.stringify(packages));

        // Actualizar la interfaz (Agregar la fila arriba de todo en la tabla)
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${newPackage.tracking}</td>
            <td>${newPackage.client}</td>
            <td>${newPackage.destination}</td>
            <td><span class="status-badge ${getBadgeClass(newPackage.status)}">${newPackage.status}</span></td>
        `;
        tableBody.insertBefore(tr, tableBody.firstChild);
        
        // Resetear el formulario
        form.reset();
        
        // Pequeña animación visual de confirmación en el botón
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '¡Registrado con éxito!';
        btn.style.backgroundColor = '#28a745'; // Color verde de éxito
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }, 2500);
      });
    }
  }
});