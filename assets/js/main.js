document.addEventListener('DOMContentLoaded', () => {
  // Lógica de FAQ (Preguntas Frecuentes)
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