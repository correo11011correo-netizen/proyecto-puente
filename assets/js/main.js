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
          const initialData = [
              { 
                  tracking: '#PP-1045', client: 'Juan Pérez', destination: 'CABA', status: 'En tránsito', 
                  history: [{date: new Date().toLocaleDateString(), role: 'Recepción CDE', status: 'Recibido en CDE', notes: 'Recibido en oficina Paraguay'}, {date: new Date().toLocaleDateString(), role: 'Transporte Paraguay', status: 'En tránsito', notes: 'Cruzando hacia Puerto Iguazú'}],
                  messages: []
              }
          ];
          localStorage.setItem('puentePackages', JSON.stringify(initialData));
          return initialData;
      }
      return JSON.parse(savedData);
  };

  const savePackages = (packages) => {
      localStorage.setItem('puentePackages', JSON.stringify(packages));
  };

  // --- Lógica del Cliente: Seguimiento y Mensajes (index.html) ---
  const trackingForm = document.getElementById('tracking-form');
  const clientMessageForm = document.getElementById('client-message-form');

  if (trackingForm) {
      trackingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const trackingNumber = document.getElementById('tracking-input').value.trim().toUpperCase();
          const packages = getPackages();
          const pkg = packages.find(p => p.tracking.toUpperCase() === trackingNumber);
          
          const resultDiv = document.getElementById('tracking-result');
          const errorDiv = document.getElementById('tracking-error');
          const messageFormId = document.getElementById('msg-tracking-id');
          
          if (pkg) {
              errorDiv.style.display = 'none';
              resultDiv.style.display = 'block';
              messageFormId.value = pkg.tracking; // Asociar el formulario de mensajes a este ID
              
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
                  
                  const dot = document.createElement('span');
                  dot.style.position = 'absolute';
                  dot.style.left = '-6px';
                  dot.style.top = '15px';
                  dot.style.width = '10px';
                  dot.style.height = '10px';
                  dot.style.borderRadius = '50%';
                  dot.style.backgroundColor = (index === pkg.history.length - 1) ? 'var(--secondary-color)' : '#ccc';
                  
                  li.appendChild(dot);
                  
                  // Mostrar el ROL si existe
                  const roleHtml = step.role ? `<span style="font-size: 0.8rem; background: #e9ecef; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${step.role}</span>` : '';
                  
                  li.innerHTML += `<strong>${step.status}</strong> <br><small style="color: #666;">${roleHtml}${step.date} - ${step.notes || ''}</small>`;
                  historyList.appendChild(li);
              });
              
              // Resetear form de mensajes visualmente
              document.getElementById('client-message-success').style.display = 'none';
              clientMessageForm.style.display = 'block';
              
          } else {
              resultDiv.style.display = 'none';
              errorDiv.style.display = 'block';
          }
      });
  }

  if (clientMessageForm) {
      clientMessageForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const trackingId = document.getElementById('msg-tracking-id').value;
          const messageText = document.getElementById('client-message-text').value;
          
          const packages = getPackages();
          const pkgIndex = packages.findIndex(p => p.tracking === trackingId);
          
          if (pkgIndex > -1) {
              if (!packages[pkgIndex].messages) packages[pkgIndex].messages = [];
              
              packages[pkgIndex].messages.push({
                  date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                  text: messageText
              });
              
              savePackages(packages);
              
              document.getElementById('client-message-text').value = '';
              clientMessageForm.style.display = 'none';
              document.getElementById('client-message-success').style.display = 'block';
          }
      });
  }

  // --- Lógica de Administración (admin.html) ---
  const form = document.getElementById('new-package-form');
  const tableBody = document.getElementById('packages-table-body');
  const clientsTableBody = document.getElementById('clients-table-body');
  const updateModal = document.getElementById('update-modal');
  const updateForm = document.getElementById('update-status-form');

  const adminTabs = document.querySelectorAll('#admin-tabs a');
  const adminSections = document.querySelectorAll('.admin-section');
  
  if (adminTabs.length > 0) {
      adminTabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
              if (tab.hasAttribute('data-target')) {
                  e.preventDefault();
                  adminTabs.forEach(t => t.classList.remove('active'));
                  tab.classList.add('active');
                  const targetId = tab.getAttribute('data-target');
                  adminSections.forEach(sec => {
                      sec.style.display = (sec.id === targetId) ? 'block' : 'none';
                  });
              }
          });
      });
  }

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

  const updateClientsTable = (packages) => {
      if (!clientsTableBody) return;
      
      const clientsMap = {};
      packages.forEach(pkg => {
          if (!clientsMap[pkg.client]) {
              clientsMap[pkg.client] = { packages: [], lastDestination: pkg.destination };
          }
          clientsMap[pkg.client].packages.push(pkg.tracking);
          clientsMap[pkg.client].lastDestination = pkg.destination; 
      });

      clientsTableBody.innerHTML = '';
      Object.keys(clientsMap).forEach(clientName => {
          const clientData = clientsMap[clientName];
          const tr = document.createElement('tr');
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
        // Fila principal
        const trMain = document.createElement('tr');
        trMain.innerHTML = `
            <td><strong>${pkg.tracking}</strong></td>
            <td>${pkg.client}</td>
            <td>${pkg.destination}</td>
            <td><span class="status-badge ${getBadgeClass(pkg.status)}">${pkg.status}</span></td>
            <td><button class="btn btn-toggle-details" style="padding: 5px 10px; font-size: 0.8rem; background-color: var(--primary-color);">Gestionar ▾</button></td>
        `;
        tableBody.appendChild(trMain); 

        // Fila de detalles (desplegable debajo)
        const trDetails = document.createElement('tr');
        trDetails.style.display = 'none';
        trDetails.style.backgroundColor = '#fcfcfc';
        
        // Renderizar mensajes del cliente
        let messagesHtml = '<p style="color: #999; font-size: 0.85rem; font-style: italic;">No hay mensajes del cliente.</p>';
        if (pkg.messages && pkg.messages.length > 0) {
            messagesHtml = '<ul style="list-style-type: none; padding-left: 0; margin-bottom: 10px; font-size: 0.85rem;">';
            pkg.messages.forEach(msg => {
                messagesHtml += `<li style="margin-bottom: 5px; background: #fff3cd; border-left: 3px solid #ffc107; padding: 5px 10px;">
                    <strong>💬 Cliente (${msg.date}):</strong> ${msg.text}
                </li>`;
            });
            messagesHtml += '</ul>';
        }

        trDetails.innerHTML = `
            <td colspan="5" style="padding: 15px; border-top: 1px dashed #ddd; border-bottom: 2px solid var(--primary-color);">
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 5px;">Quejas y Mensajes del Cliente:</h4>
                        ${messagesHtml}
                    </div>
                    <div>
                        <button class="btn btn-update-status btn-outline" data-id="${pkg.tracking}" style="padding: 5px 15px; font-size: 0.85rem; width: 100%;">⚙️ Actualizar Estado</button>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(trDetails);

        // Lógica para desplegar detalles
        const toggleBtn = trMain.querySelector('.btn-toggle-details');
        toggleBtn.addEventListener('click', () => {
            if (trDetails.style.display === 'none') {
                trDetails.style.display = 'table-row';
                toggleBtn.textContent = 'Cerrar ▴';
                toggleBtn.style.backgroundColor = '#666';
            } else {
                trDetails.style.display = 'none';
                toggleBtn.textContent = 'Gestionar ▾';
                toggleBtn.style.backgroundColor = 'var(--primary-color)';
            }
        });
    };

    const renderData = () => {
        const packages = getPackages();
        
        if (tableBody) {
            tableBody.innerHTML = ''; 
            packages.forEach(pkg => addPackageToTable(pkg));
        }
        
        updateDashboardMetrics(packages);
        updateClientsTable(packages);

        // Eventos para el botón "Actualizar Estado" dentro del desplegable
        document.querySelectorAll('.btn-update-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackingId = e.target.getAttribute('data-id');
                document.getElementById('update-tracking-id').textContent = trackingId;
                document.getElementById('update-tracking-input').value = trackingId;
                
                const pkg = getPackages().find(p => p.tracking === trackingId);
                document.getElementById('update-status-select').value = pkg.status;
                document.getElementById('update-location').value = ''; 
                
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

        const newPackage = { 
            tracking, 
            client, 
            destination, 
            status,
            history: [
                { 
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                    role: 'Administración Central',
                    status: status, 
                    notes: 'Paquete ingresado al sistema' 
                }
            ],
            messages: []
        };

        const packages = getPackages();
        packages.unshift(newPackage);
        savePackages(packages);

        renderData(); 
        form.reset();
        
        const alertBox = document.getElementById('generated-id-alert');
        const idSpan = document.getElementById('new-generated-id');
        if (alertBox && idSpan) {
            idSpan.textContent = tracking;
            alertBox.style.display = 'block';
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

    // Guardar actualización de estado con el ROL
    if (updateForm) {
        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const trackingId = document.getElementById('update-tracking-input').value;
            const newRole = document.getElementById('update-role-select').value;
            const newStatus = document.getElementById('update-status-select').value;
            const newLocation = document.getElementById('update-location').value;

            const packages = getPackages();
            const pkgIndex = packages.findIndex(p => p.tracking === trackingId);
            
            if (pkgIndex > -1) {
                packages[pkgIndex].status = newStatus;
                packages[pkgIndex].history.push({
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    role: newRole,
                    status: newStatus,
                    notes: newLocation
                });
                
                savePackages(packages);
                renderData();
                updateModal.style.display = 'none';
                
                alert(`Estado del paquete ${trackingId} actualizado con éxito.`);
            }
        });
    }
  }
});