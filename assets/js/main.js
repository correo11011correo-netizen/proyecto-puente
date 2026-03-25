document.addEventListener('DOMContentLoaded', () => {
  // --- Función Global: Obtener clase CSS para Badges ---
  const getBadgeClass = (status) => {
      switch(status) {
          case 'Recibido en CDE': return 'status-received';
          case 'Despachando': return 'status-received';
          case 'En tránsito': return 'status-transit';
          case 'Llegó a destino': return 'status-transit';
          case 'Listo para retirar': return 'status-delivered';
          case 'Entregado': return 'status-delivered';
          default: return 'status-received';
      }
  };

  // --- Lógica del Modal de WhatsApp ---
  const modal = document.getElementById('wa-modal');
  const closeBtn = document.getElementById('close-wa-modal');
  const waForm = document.getElementById('wa-form');
  const openWaBtns = document.querySelectorAll('.open-wa-modal');

  if (openWaBtns.length > 0 && modal) {
    openWaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
      });
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('wa-nombre').value.trim();
      const monto = document.getElementById('wa-monto').value.trim();
      const cantidad = document.getElementById('wa-cantidad').value.trim();
      const phone = '595987188642';
      const message = `Hola, soy *${nombre}*.%0AQuiero solicitar un envío con Puente Paraguay.%0A📦 *Cantidad de productos:* ${cantidad}%0A💰 *Valor estimado de compra:* USD ${monto}%0A%0A¿Podrían brindarme más información?`;
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      modal.style.display = 'none';
      waForm.reset();
    });
  }

  // --- Lógica de FAQ ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    }
  });

  // --- Sistema de Datos de Paquetes (localStorage) ---
  const getPackages = () => {
      const savedData = localStorage.getItem('puentePackages');
      if (!savedData) {
          // Datos iniciales de prueba si está vacío
          const initialData = [
              { tracking: '#PP-1045', client: 'Juan Pérez', destination: 'CABA', status: 'En tránsito', history: [{date: new Date().toLocaleDateString(), status: 'Recibido en CDE', notes: 'Recibido en oficina Paraguay'}, {date: new Date().toLocaleDateString(), status: 'En tránsito', notes: 'Cruzando hacia Puerto Iguazú'}] },
              { tracking: '#PP-1046', client: 'María Gómez', destination: 'Rosario', status: 'Recibido en CDE', history: [{date: new Date().toLocaleDateString(), status: 'Recibido en CDE', notes: 'Esperando despacho'}] }
          ];
          localStorage.setItem('puentePackages', JSON.stringify(initialData));
          return initialData;
      }
      return JSON.parse(savedData);
  };

  const savePackages = (packages) => {
      localStorage.setItem('puentePackages', JSON.stringify(packages));
  };

  // --- Lógica del Cliente: Seguimiento de Paquete (index.html) ---
  const trackingForm = document.getElementById('tracking-form');
  if (trackingForm) {
      trackingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const trackingNumber = document.getElementById('tracking-input').value.trim().toUpperCase();
          const packages = getPackages();
          const pkg = packages.find(p => p.tracking.toUpperCase() === trackingNumber);
          
          const resultDiv = document.getElementById('tracking-result');
          const errorDiv = document.getElementById('tracking-error');
          
          if (pkg) {
              errorDiv.style.display = 'none';
              resultDiv.style.display = 'block';
              
              document.getElementById('res-tracking-id').textContent = pkg.tracking;
              document.getElementById('res-cliente').textContent = pkg.client;
              document.getElementById('res-destino').textContent = pkg.destination;
              
              const historyList = document.getElementById('res-historial');
              historyList.innerHTML = '';
              pkg.history.forEach((step, index) => {
                  const li = document.createElement('li');
                  li.style.position = 'relative';
                  li.style.padding = '10px 0 10px 20px';
                  li.style.marginBottom = '10px';
                  
                  // Dot en la línea de tiempo
                  const dot = document.createElement('span');
                  dot.style.position = 'absolute';
                  dot.style.left = '-6px';
                  dot.style.top = '15px';
                  dot.style.width = '10px';
                  dot.style.height = '10px';
                  dot.style.borderRadius = '50%';
                  dot.style.backgroundColor = (index === pkg.history.length - 1) ? 'var(--secondary-color)' : '#ccc';
                  
                  li.appendChild(dot);
                  li.innerHTML += `<strong>${step.status}</strong> <br><small style="color: #666;">${step.date} - ${step.notes || ''}</small>`;
                  historyList.appendChild(li);
              });
          } else {
              resultDiv.style.display = 'none';
              errorDiv.style.display = 'block';
          }
      });
  }

  // --- Lógica de Administración (admin.html) ---
  const form = document.getElementById('new-package-form');
  const tableBody = document.getElementById('packages-table-body');
  const clientsTableBody = document.getElementById('clients-table-body');
  const updateModal = document.getElementById('update-modal');
  const updateForm = document.getElementById('update-status-form');

  // Navegación por pestañas
  const adminTabs = document.querySelectorAll('#admin-tabs a');
  const adminSections = document.querySelectorAll('.admin-section');
  
  if (adminTabs.length > 0) {
      adminTabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
              if (tab.hasAttribute('data-target')) {
                  e.preventDefault();
                  
                  // Cambiar clase activa en menú
                  adminTabs.forEach(t => t.classList.remove('active'));
                  tab.classList.add('active');
                  
                  // Mostrar sección correspondiente
                  const targetId = tab.getAttribute('data-target');
                  adminSections.forEach(sec => {
                      sec.style.display = (sec.id === targetId) ? 'block' : 'none';
                  });
              }
          });
      });
  }

  // Actualizar métricas del Dashboard
  const updateDashboardMetrics = (packages) => {
      const cdeCount = packages.filter(p => p.status === 'Recibido en CDE' || p.status === 'Despachando').length;
      const transitCount = packages.filter(p => p.status === 'En tránsito').length;
      const deliveredCount = packages.filter(p => p.status === 'Entregado' || p.status === 'Listo para retirar').length;
      
      const elCde = document.getElementById('metric-cde');
      const elTransit = document.getElementById('metric-transit');
      const elDelivered = document.getElementById('metric-delivered');
      
      if(elCde) elCde.textContent = cdeCount;
      if(elTransit) elTransit.textContent = transitCount;
      if(elDelivered) elDelivered.textContent = deliveredCount;
  };

  // Actualizar Tabla de Clientes
  const updateClientsTable = (packages) => {
      if (!clientsTableBody) return;
      
      // Agrupar por cliente
      const clientsMap = {};
      packages.forEach(pkg => {
          if (!clientsMap[pkg.client]) {
              clientsMap[pkg.client] = { packages: [], lastDestination: pkg.destination };
          }
          clientsMap[pkg.client].packages.push(pkg.tracking);
          // Actualizar último destino si es necesario (simplificado)
          clientsMap[pkg.client].lastDestination = pkg.destination; 
      });

      clientsTableBody.innerHTML = '';
      Object.keys(clientsMap).forEach(clientName => {
          const clientData = clientsMap[clientName];
          const tr = document.createElement('tr');
          
          // Formatear los IDs de los paquetes con badges
          const badges = clientData.packages.map(id => `<span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${id}</span>`).join('');
          
          tr.innerHTML = `
              <td><strong>${clientName}</strong></td>
              <td>${badges}</td>
              <td>${clientData.lastDestination}</td>
          `;
          clientsTableBody.appendChild(tr);
      });
  };

  if (tableBody) {
    const addPackageToTable = (pkg) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${pkg.tracking}</strong></td>
            <td>${pkg.client}</td>
            <td>${pkg.destination}</td>
            <td><span class="status-badge ${getBadgeClass(pkg.status)}">${pkg.status}</span></td>
            <td><button class="btn btn-update-status" data-id="${pkg.tracking}" style="padding: 5px 10px; font-size: 0.8rem;">Actualizar</button></td>
        `;
        tableBody.appendChild(tr); 
    };

    const renderData = () => {
        const packages = getPackages();
        
        // Tabla de Paquetes
        if (tableBody) {
            tableBody.innerHTML = ''; 
            packages.forEach(pkg => addPackageToTable(pkg));
        }
        
        // Actualizar el resto del sistema
        updateDashboardMetrics(packages);
        updateClientsTable(packages);

        // Eventos para botones de Actualizar
        document.querySelectorAll('.btn-update-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackingId = e.target.getAttribute('data-id');
                document.getElementById('update-tracking-id').textContent = trackingId;
                document.getElementById('update-tracking-input').value = trackingId;
                
                const pkg = getPackages().find(p => p.tracking === trackingId);
                document.getElementById('update-status-select').value = pkg.status;
                document.getElementById('update-location').value = ''; // Limpiar
                
                updateModal.style.display = 'flex';
            });
        });
    };

    renderData();

    // Evento Formulario Nuevo Paquete
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const client = document.getElementById('pkg-client').value;
        const destination = document.getElementById('pkg-destination').value;
        const status = document.getElementById('pkg-status').value;
        
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const tracking = '#PP-' + randomNum;

        // Crear paquete con historial inicial
        const newPackage = { 
            tracking, 
            client, 
            destination, 
            status,
            history: [
                { date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: status, notes: 'Paquete ingresado al sistema' }
            ]
        };

        const packages = getPackages();
        packages.unshift(newPackage);
        savePackages(packages);

        renderData(); // Recargar todas las tablas y métricas
        form.reset();
        
        // Mostrar Alerta con el ID Generado
        const alertBox = document.getElementById('generated-id-alert');
        const idSpan = document.getElementById('new-generated-id');
        if (alertBox && idSpan) {
            idSpan.textContent = tracking;
            alertBox.style.display = 'block';
            
            // Ocultar alerta después de unos segundos
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 8000);
        }
        
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '¡Registrado!';
        btn.style.backgroundColor = '#28a745'; 
        btn.style.color = 'white';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }, 2500);
      });
    }

    // Cerrar Update Modal
    document.getElementById('close-update-modal')?.addEventListener('click', () => {
        updateModal.style.display = 'none';
    });

    // Guardar actualización de estado
    if (updateForm) {
        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const trackingId = document.getElementById('update-tracking-input').value;
            const newStatus = document.getElementById('update-status-select').value;
            const newLocation = document.getElementById('update-location').value;

            const packages = getPackages();
            const pkgIndex = packages.findIndex(p => p.tracking === trackingId);
            
            if (pkgIndex > -1) {
                packages[pkgIndex].status = newStatus;
                packages[pkgIndex].history.push({
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    status: newStatus,
                    notes: newLocation
                });
                
                savePackages(packages);
                renderData(); // Recargar todo el sistema
                updateModal.style.display = 'none';
                
                alert(`Estado del paquete ${trackingId} actualizado con éxito.`);
            }
        });
    }
  }
});