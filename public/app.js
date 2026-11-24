/**
 * PROMETHEIAX — LÓGICA DEL FRONTEND (FIGMA DESIGN IMPLEMENTATION)
 * Conexión completa con la API REST por capas en Express
 */

const AppState = {
  parametroN: 10,
  porcentajeRecargo: 20,
  turnos: [],
  foroPosts: [],
  categoriaActiva: 'all'
};

const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacionSidebar();
  configurarBuscadorGlobal();
  configurarModificadorFechaAgenda();
  cargarConfiguracionBackend();
  configurarCalculadoraCotizacion();
  configurarFormularioRegistro();
  configurarBuscadorId();
  configurarForo();
  establecerFechaPorDefecto();
  cargarTurnos();
  cargarForo();
});

// 1. NAVEGACIÓN ENTRE SECCIONES (SIDEBAR & LINKS)
function inicializarNavegacionSidebar() {
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      irATab(tabId);
    });
  });
}

window.irATab = function(tabId, preserveFilter = false) {
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
  const viewTabs = document.querySelectorAll('.view-tab');

  navItems.forEach(i => i.classList.remove('active'));
  viewTabs.forEach(t => t.classList.remove('active'));

  const activeBtn = document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  if (tabId === 'tab-solicitudes') {
    if (!preserveFilter) cargarTurnos();
  } else if (tabId === 'tab-foro') {
    if (!preserveFilter) cargarForo();
  }
};

// 2. CARGA DE CONFIGURACIÓN DE NEGOCIO (N Y RECARGO)
async function cargarConfiguracionBackend() {
  try {
    const res = await fetch('/api/turnos/configuracion');
    if (res.ok) {
      const json = await res.json();
      if (json.exito && json.datos) {
        AppState.parametroN = json.datos.parametroN;
        AppState.porcentajeRecargo = json.datos.porcentajeRecargo;

        // Actualizar textos en la UI según Figma
        const elNRule = document.getElementById('nRuleText');
        if (elNRule) elNRule.innerText = `Equipo N = ${AppState.parametroN} · Recargo: ${AppState.porcentajeRecargo}%`;
        const elMetric = document.getElementById('metricRecargoVal');
        if (elMetric) elMetric.innerText = `${AppState.porcentajeRecargo}%`;
        document.getElementById('priorityExplain').innerText = `Activa un recargo del ${AppState.porcentajeRecargo}% sobre el precio base con la regla N × 2%`;
        document.getElementById('quotationRecargoLabel').innerText = `Recargo prioritario · ${AppState.porcentajeRecargo}%`;
        document.getElementById('quotationFormulaText').innerText = `Equipo N = ${AppState.parametroN} × 2% = ${AppState.porcentajeRecargo}%. El recargo solo aplica con prioridad activa.`;

        actualizarCotizacionEnVivo();
      }
    }
  } catch (err) {
    console.warn('Usando configuración por defecto N=7:', err);
  }
}

// 3. MODIFICADOR DE FECHA EN PRÓXIMA ASESORÍA RECOMENDADA
function configurarModificadorFechaAgenda() {
  const pill = document.getElementById('agendaSchedulePill');
  const inputFecha = document.getElementById('inputModificarFechaAgenda');
  const display = document.getElementById('agendaFechaDisplay');

  if (!pill || !inputFecha || !display) return;

  // Abrir el selector de fecha al hacer clic en la píldora o botón
  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    if (inputFecha.showPicker) {
      try { inputFecha.showPicker(); } catch (err) { inputFecha.focus(); }
    } else {
      inputFecha.focus();
    }
  });

  // Al seleccionar una nueva fecha y hora
  inputFecha.addEventListener('change', () => {
    const valor = inputFecha.value;
    if (!valor) return;

    const fechaObj = new Date(valor);
    if (isNaN(fechaObj.getTime())) return;

    const opciones = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    // Formatear al estilo legible en español: "24 nov. 2026 · 3:00 p. m."
    const fechaTexto = fechaObj.toLocaleDateString('es-CO', opciones);
    display.innerText = fechaTexto.replace(',', ' ·');

    // Sincronizar también con el formulario de nueva asesoría
    const inputFormFecha = document.getElementById('inputFechaHora');
    if (inputFormFecha) {
      inputFormFecha.value = valor;
    }
  });
}

// 4. FECHA POR DEFECTO DEL FORMULARIO (TOTALMENTE MODIFICABLE)
function establecerFechaPorDefecto() {
  const inputFecha = document.getElementById('inputFechaHora');
  if (inputFecha) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(15, 0, 0, 0); // 3:00 PM por defecto
    const yyyy = manana.getFullYear();
    const mm = String(manana.getMonth() + 1).padStart(2, '0');
    const dd = String(manana.getDate()).padStart(2, '0');
    const hh = String(manana.getHours()).padStart(2, '0');
    const min = String(manana.getMinutes()).padStart(2, '0');
    inputFecha.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }
}

// 4. CALCULADORA Y TARJETA DE COTIZACIÓN (FIGMA 2:1325)
function configurarCalculadoraCotizacion() {
  const inputPrecio = document.getElementById('inputPrecioBase');
  const checkPrioritario = document.getElementById('checkPrioritario');
  const selectServicio = document.getElementById('inputTipoServicio');

  if (inputPrecio) inputPrecio.addEventListener('input', actualizarCotizacionEnVivo);
  if (checkPrioritario) checkPrioritario.addEventListener('change', actualizarCotizacionEnVivo);
  if (selectServicio) selectServicio.addEventListener('change', actualizarCotizacionEnVivo);

  actualizarCotizacionEnVivo();
}

function actualizarCotizacionEnVivo() {
  const inputPrecio = document.getElementById('inputPrecioBase');
  const checkPrioritario = document.getElementById('checkPrioritario');
  const selectServicio = document.getElementById('inputTipoServicio');

  const quotationServiceTitle = document.getElementById('quotationServiceTitle');
  const quotationBase = document.getElementById('quotationBase');
  const quotationRecargoVal = document.getElementById('quotationRecargoVal');
  const quotationTotal = document.getElementById('quotationTotal');
  const quotationTagPrioridad = document.getElementById('quotationTagPrioridad');

  if (!inputPrecio || !checkPrioritario) return;

  const precio = parseFloat(inputPrecio.value) || 0;
  const esPrioritario = checkPrioritario.checked;
  const servicio = selectServicio ? selectServicio.value : 'Asesoría académica';

  let recargo = 0;
  if (esPrioritario && precio > 0) {
    recargo = Math.round((precio * AppState.porcentajeRecargo) / 100);
  }
  const total = precio + recargo;

  if (quotationServiceTitle) quotationServiceTitle.innerText = servicio;
  if (quotationBase) quotationBase.innerText = formateadorCOP.format(precio);
  
  if (quotationRecargoVal) {
    quotationRecargoVal.innerText = esPrioritario ? `+${formateadorCOP.format(recargo)}` : '$0 (Sin prioridad)';
    quotationRecargoVal.className = esPrioritario ? 'line-val text-amber' : 'line-val text-dim';
  }

  if (quotationTotal) quotationTotal.innerText = formateadorCOP.format(total);

  if (quotationTagPrioridad) {
    if (esPrioritario) {
      quotationTagPrioridad.style.display = 'inline-block';
      quotationTagPrioridad.innerText = '★ Atención prioritaria';
      quotationTagPrioridad.style.backgroundColor = '#FEF3C7';
      quotationTagPrioridad.style.color = '#B45309';
      quotationTagPrioridad.style.borderColor = '#FDE68A';
    } else {
      quotationTagPrioridad.style.display = 'inline-block';
      quotationTagPrioridad.innerText = 'Modalidad normal';
      quotationTagPrioridad.style.backgroundColor = '#F1F5F9';
      quotationTagPrioridad.style.color = '#64748B';
      quotationTagPrioridad.style.borderColor = '#E2E8F0';
    }
  }
}

window.seleccionarTemaRapido = function(tema, btn = null) {
  const inputTema = document.getElementById('inputTema');
  if (inputTema) inputTema.value = tema;

  const tagChips = document.querySelectorAll('.tag-chip');
  tagChips.forEach(c => c.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const matching = Array.from(tagChips).find(c => c.textContent.trim().toLowerCase().includes(tema.toLowerCase().slice(0, 5)));
    if (matching) matching.classList.add('active');
  }
  actualizarCotizacionEnVivo();
};

// Alternar entre los pasos del formulario (01 Detalles / 02 Confirmación)
window.cambiarPasoFormulario = function(paso) {
  const btnStep1 = document.getElementById('btnStep1');
  const btnStep2 = document.getElementById('btnStep2');
  const cardCotizacion = document.querySelector('.card-quotation');
  const inputEstudiante = document.getElementById('inputEstudiante');
  const btnEnviar = document.getElementById('btnEnviarTurno');

  if (paso === 1) {
    if (btnStep1) btnStep1.classList.add('active');
    if (btnStep2) btnStep2.classList.remove('active');
    if (inputEstudiante) {
      inputEstudiante.focus();
      inputEstudiante.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else if (paso === 2) {
    if (btnStep2) btnStep2.classList.add('active');
    if (btnStep1) btnStep1.classList.remove('active');
    
    // Sincronizamos la cotización con la regla N
    actualizarCotizacionEnVivo();

    // Hacemos scroll y animación de pulso a la tarjeta de confirmación / cotización
    if (cardCotizacion) {
      cardCotizacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardCotizacion.classList.remove('highlight-pulse');
      void cardCotizacion.offsetWidth; // Reflow para reiniciar animación
      cardCotizacion.classList.add('highlight-pulse');
    }
    if (btnEnviar) {
      btnEnviar.focus();
    }
  }
};

// Navegar a la asesoría recomendada desde la tarjeta del Overview
window.verProximaAsesoria = function() {
  irATab('tab-solicitudes', true);
  const inputId = document.getElementById('inputIdBusqueda');
  if (inputId) inputId.value = 'Arquitectura';
  const filtrados = AppState.turnos.filter(t => 
    (t.tema || '').toLowerCase().includes('arquitectura') || 
    (t.tipoServicio || '').toLowerCase().includes('arquitectura')
  );
  renderizarTablaTurnos(filtrados.length ? filtrados : AppState.turnos, 'Arquitectura');
};

// 5. REGISTRO DE TURNO (POST /api/turnos)
function configurarFormularioRegistro() {
  const form = document.getElementById('formTurnosFigma');
  const alerta = document.getElementById('formFeedbackAlerta');
  const btnSubmit = document.getElementById('btnEnviarTurno');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const estudiante = document.getElementById('inputEstudiante').value.trim();
    const tipoServicio = document.getElementById('inputTipoServicio').value.trim();
    const tema = document.getElementById('inputTema').value.trim();
    const fechaHora = document.getElementById('inputFechaHora').value;
    const precioBase = Number(document.getElementById('inputPrecioBase').value);
    const prioritario = document.getElementById('checkPrioritario').checked;

    const payload = {
      estudiante,
      tipoServicio,
      tema,
      fechaHora,
      precioBase,
      prioritario
    };

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Procesando en POST /api/turnos...</span>`;

    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      alerta.classList.remove('hidden', 'success', 'error');

      if (res.status === 201) {
        alerta.classList.add('success');
        alerta.innerHTML = `
          <strong>✔ ¡Solicitud #${data.datos.id} registrada con éxito (HTTP 201 Created)!</strong><br>
          Estudiante: <strong>${data.datos.estudiante}</strong> | Total calculado: <strong>${formateadorCOP.format(data.datos.totalPagar)}</strong> (Recargo: ${data.datos.porcentajeRecargo}%)
        `;
        cargarTurnos();
      } else {
        alerta.classList.add('error');
        alerta.innerHTML = `
          <strong>✖ Error (${res.status} Bad Request):</strong><br>
          ${data.mensaje || 'Error en los datos de la solicitud.'}
          ${data.detalles ? `<br><small>${data.detalles.join('<br>')}</small>` : ''}
        `;
      }
    } catch (err) {
      alerta.classList.remove('hidden');
      alerta.classList.add('error');
      alerta.innerText = `Error de conexión: ${err.message}`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span>Registrar Solicitud en la API REST</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
    }
  });
}

// 6. BUSCADOR GLOBAL Y EN TIEMPO REAL (NAVBAR)
function configurarBuscadorGlobal() {
  const inputGlobal = document.getElementById('globalSearchInput');
  const btnClear = document.getElementById('btnClearGlobalSearch');
  const resultsDropdown = document.getElementById('navSearchResults');
  const searchContainer = document.getElementById('navSearchContainer');

  if (!inputGlobal) return;

  function ejecutarBusquedaGlobal(query) {
    const q = (query || '').trim().toLowerCase();

    // Mostrar/ocultar botón de limpiar (✕)
    if (btnClear) {
      if (q.length > 0) btnClear.classList.remove('hidden');
      else btnClear.classList.add('hidden');
    }

    // Si el texto está vacío, ocultamos dropdown y restauramos vistas completas
    if (!q) {
      if (resultsDropdown) resultsDropdown.classList.add('hidden');
      renderizarTablaTurnos(AppState.turnos);
      renderizarForo();
      return;
    }

    // 1. Filtrar solicitudes de asesoría por ID, estudiante, tema o tipo
    const turnosCoincidentes = AppState.turnos.filter(t => {
      const matchId = String(t.id).toLowerCase().includes(q) || `#${t.id}`.includes(q);
      const matchEstudiante = (t.estudiante || '').toLowerCase().includes(q);
      const matchTema = (t.tema || '').toLowerCase().includes(q);
      const matchTipo = (t.tipoServicio || '').toLowerCase().includes(q);
      return matchId || matchEstudiante || matchTema || matchTipo;
    });

    // 2. Filtrar publicaciones del foro por título, autor, categoría o contenido
    const foroCoincidentes = AppState.foroPosts.filter(p => {
      const matchTitulo = (p.titulo || '').toLowerCase().includes(q);
      const matchAutor = (p.autor || '').toLowerCase().includes(q);
      const matchCat = (p.categoria || '').toLowerCase().includes(q);
      const matchCont = (p.contenido || '').toLowerCase().includes(q);
      return matchTitulo || matchAutor || matchCat || matchCont;
    });

    // Si el usuario está viendo la pestaña "Mis Solicitudes", actualizamos la tabla en vivo
    const tabSolicitudes = document.getElementById('tab-solicitudes');
    if (tabSolicitudes && tabSolicitudes.classList.contains('active')) {
      renderizarTablaTurnos(turnosCoincidentes, q);
    }

    // Si el usuario está en el "Foro Académico", actualizamos el grid del foro en vivo
    const tabForo = document.getElementById('tab-foro');
    if (tabForo && tabForo.classList.contains('active')) {
      renderizarForoFiltrado(foroCoincidentes, q);
    }

    if (!resultsDropdown) return;

    const totalResultados = turnosCoincidentes.length + foroCoincidentes.length;

    if (totalResultados === 0) {
      resultsDropdown.innerHTML = `
        <div class="search-no-results">
          🔍 No se encontraron solicitudes ni temas para <strong>"${escapeHTML(query)}"</strong>
        </div>
      `;
      resultsDropdown.classList.remove('hidden');
      return;
    }

    let html = '';

    // Sección Solicitudes de Asesoría
    if (turnosCoincidentes.length > 0) {
      html += `
        <div class="search-results-section">
          <div class="search-group-header">
            <span>🎓 Solicitudes de Asesoría (${turnosCoincidentes.length})</span>
            <small>Clic para ver en tabla</small>
          </div>
      `;
      turnosCoincidentes.slice(0, 4).forEach(t => {
        html += `
          <div class="search-result-row" onclick="irAResultadoTurno('${t.id}')">
            <div class="search-result-info">
              <span class="search-result-title">#${t.id} · ${resaltarTexto(t.estudiante, q)}</span>
              <span class="search-result-sub">${resaltarTexto(t.tema, q)} · ${t.tipoServicio}</span>
            </div>
            <div class="search-result-meta">
              <span class="search-result-price">${formateadorCOP.format(t.totalPagar)}</span>
              ${t.prioritario 
                ? '<span class="badge-tag-priority" style="font-size: 0.65rem; padding: 2px 6px;">Prioritaria</span>' 
                : '<span class="badge-tag-normal" style="font-size: 0.65rem; padding: 2px 6px;">Normal</span>'}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // Sección Foro Académico
    if (foroCoincidentes.length > 0) {
      html += `
        <div class="search-results-section">
          <div class="search-group-header">
            <span>💬 Foro Académico (${foroCoincidentes.length})</span>
            <small>Clic para ir al foro</small>
          </div>
      `;
      foroCoincidentes.slice(0, 3).forEach(p => {
        html += `
          <div class="search-result-row" onclick="irAResultadoForo('${p.id}')">
            <div class="search-result-info">
              <span class="search-result-title">${resaltarTexto(p.titulo, q)}</span>
              <span class="search-result-sub">Por ${resaltarTexto(p.autor, q)} en <strong style="color: var(--brand-primary);">${p.categoria}</strong></span>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    resultsDropdown.innerHTML = html;
    resultsDropdown.classList.remove('hidden');
  }

  // Evento Input (búsqueda interactiva en tiempo real)
  inputGlobal.addEventListener('input', (e) => {
    ejecutarBusquedaGlobal(e.target.value);
  });

  inputGlobal.addEventListener('focus', () => {
    if (inputGlobal.value.trim()) {
      ejecutarBusquedaGlobal(inputGlobal.value);
    }
  });

  // Al presionar Enter: navegar a la pestaña adecuada
  inputGlobal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = inputGlobal.value.trim().toLowerCase();
      if (!q) return;

      if (resultsDropdown) resultsDropdown.classList.add('hidden');

      const matchTurno = AppState.turnos.some(t => 
        String(t.id).includes(q) || (t.estudiante || '').toLowerCase().includes(q) || (t.tema || '').toLowerCase().includes(q)
      );

      if (matchTurno) {
        irATab('tab-solicitudes', true);
        const inputId = document.getElementById('inputIdBusqueda');
        if (inputId) inputId.value = inputGlobal.value;
        const filtrados = AppState.turnos.filter(t => 
          String(t.id).includes(q) || (t.estudiante || '').toLowerCase().includes(q) || (t.tema || '').toLowerCase().includes(q) || (t.tipoServicio || '').toLowerCase().includes(q)
        );
        renderizarTablaTurnos(filtrados, q);
      } else {
        irATab('tab-foro', true);
        const filtrados = AppState.foroPosts.filter(p =>
          (p.titulo || '').toLowerCase().includes(q) || (p.autor || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q) || (p.contenido || '').toLowerCase().includes(q)
        );
        renderizarForoFiltrado(filtrados, q);
      }
    } else if (e.key === 'Escape') {
      if (resultsDropdown) resultsDropdown.classList.add('hidden');
    }
  });

  // Botón Limpiar (✕)
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inputGlobal.value = '';
      const inputId = document.getElementById('inputIdBusqueda');
      if (inputId) inputId.value = '';
      const box = document.getElementById('boxResultadoId');
      if (box) box.classList.add('hidden');
      ejecutarBusquedaGlobal('');
      inputGlobal.focus();
    });
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      if (resultsDropdown) resultsDropdown.classList.add('hidden');
    }
  });
}

// Navegar a un turno seleccionado desde la búsqueda
window.irAResultadoTurno = function(id) {
  const resultsDropdown = document.getElementById('navSearchResults');
  if (resultsDropdown) resultsDropdown.classList.add('hidden');
  irATab('tab-solicitudes', true);
  const inputId = document.getElementById('inputIdBusqueda');
  if (inputId) inputId.value = `#${id}`;
  const turno = AppState.turnos.find(t => String(t.id) === String(id));
  if (turno) {
    renderizarTablaTurnos([turno], String(id));
  }
};

// Navegar a un hilo del foro seleccionado desde la búsqueda
window.irAResultadoForo = function(id) {
  const resultsDropdown = document.getElementById('navSearchResults');
  if (resultsDropdown) resultsDropdown.classList.add('hidden');
  irATab('tab-foro', true);
};

// Resaltar coincidencias de texto
function resaltarTexto(texto, query) {
  if (!texto) return '';
  if (!query) return escapeHTML(texto);
  const escaped = escapeHTML(texto);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escaped.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 7. CARGAR Y RENDERIZAR LISTA DE TURNOS (GET /api/turnos)
async function cargarTurnos() {
  const tbody = document.getElementById('tbodyTurnos');
  const countBadge = document.getElementById('sidebarBadgeCount');
  const totalFilas = document.getElementById('labelTotalFilas');
  const metricTotal = document.getElementById('metricTotalTurnos');

  if (!tbody) return;

  try {
    const res = await fetch('/api/turnos');
    const data = await res.json();

    if (res.ok && data.exito) {
      AppState.turnos = data.datos || [];
      const total = AppState.turnos.length;

      if (countBadge) countBadge.innerText = total;
      if (metricTotal) metricTotal.innerText = total;
      if (totalFilas) totalFilas.innerText = `${total} solicitudes en almacenamiento`;

      // Renderizamos la tabla completa
      renderizarTablaTurnos(AppState.turnos);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state" style="color: var(--accent-rose);">Error al conectar con GET /api/turnos: ${err.message}</td></tr>`;
  }
}

// Renderizador parametrizado de la tabla de turnos
function renderizarTablaTurnos(listaTurnos, queryFiltro = '') {
  const tbody = document.getElementById('tbodyTurnos');
  if (!tbody) return;

  if (!listaTurnos || listaTurnos.length === 0) {
    if (queryFiltro) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No se encontraron solicitudes que coincidan con <strong>"${escapeHTML(queryFiltro)}"</strong>. <button class="btn btn-secondary btn-sm" style="margin-left: 8px;" onclick="cargarTurnos()">Ver todas</button></td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No hay solicitudes registradas aún. Registra una en el formulario.</td></tr>`;
    }
    return;
  }

  tbody.innerHTML = listaTurnos.map(t => {
    const fecha = new Date(t.fechaHora).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const idLabel = queryFiltro ? resaltarTexto(`#${t.id}`, queryFiltro) : `#${t.id}`;
    const estudianteLabel = queryFiltro ? resaltarTexto(t.estudiante, queryFiltro) : t.estudiante;
    const temaLabel = queryFiltro ? resaltarTexto(t.tema, queryFiltro) : t.tema;
    const tipoLabel = queryFiltro ? resaltarTexto(t.tipoServicio, queryFiltro) : t.tipoServicio;

    return `
      <tr>
        <td><strong>${idLabel}</strong></td>
        <td><strong>${estudianteLabel}</strong></td>
        <td>
          <div>${tipoLabel}</div>
          <small style="color: var(--text-dim);">${temaLabel}</small>
        </td>
        <td>${fecha}</td>
        <td>${formateadorCOP.format(t.precioBase)}</td>
        <td>
          ${t.prioritario 
            ? '<span class="badge-tag-priority">Prioritaria</span>' 
            : '<span class="badge-tag-normal">Normal</span>'}
        </td>
        <td>
          ${t.prioritario 
            ? `<span style="color: var(--accent-amber); font-weight: 600;">+${t.porcentajeRecargo}% (${formateadorCOP.format(t.valorRecargo)})</span>`
            : '<span style="color: var(--text-dim);">$0</span>'}
        </td>
        <td><strong style="color: var(--accent-emerald); font-size: 0.95rem;">${formateadorCOP.format(t.totalPagar)}</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="consultarDetalle('${t.id}')">
            Ver 200
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 8. BUSCADOR EN TABLA Y CONSULTA POR ID (GET /api/turnos/:id)
function configurarBuscadorId() {
  const btnBuscar = document.getElementById('btnBuscarPorId');
  const inputId = document.getElementById('inputIdBusqueda');
  const btnRefrescar = document.getElementById('btnRefrescarTabla');

  if (btnRefrescar) {
    btnRefrescar.addEventListener('click', () => {
      if (inputId) inputId.value = '';
      const inputGlobal = document.getElementById('globalSearchInput');
      if (inputGlobal) inputGlobal.value = '';
      const btnClear = document.getElementById('btnClearGlobalSearch');
      if (btnClear) btnClear.classList.add('hidden');
      const box = document.getElementById('boxResultadoId');
      if (box) box.classList.add('hidden');
      cargarTurnos();
    });
  }

  if (inputId) {
    // Filtrado interactivo en tiempo real al escribir en la tabla
    inputId.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        renderizarTablaTurnos(AppState.turnos);
        const box = document.getElementById('boxResultadoId');
        if (box) box.classList.add('hidden');
        return;
      }
      const filtrados = AppState.turnos.filter(t => 
        String(t.id).includes(q) || 
        (t.estudiante || '').toLowerCase().includes(q) || 
        (t.tema || '').toLowerCase().includes(q) ||
        (t.tipoServicio || '').toLowerCase().includes(q)
      );
      renderizarTablaTurnos(filtrados, q);
    });

    inputId.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const val = inputId.value.trim();
        if (val) {
          // Si es numérico, realiza la prueba HTTP contra el endpoint GET /api/turnos/:id
          if (!isNaN(Number(val))) {
            ejecutarConsultaId(val);
          }
        }
      }
    });
  }

  if (btnBuscar && inputId) {
    btnBuscar.addEventListener('click', () => {
      const id = inputId.value.trim();
      if (id) ejecutarConsultaId(id);
    });
  }
}

async function ejecutarConsultaId(id) {
  const box = document.getElementById('boxResultadoId');
  box.classList.remove('hidden');
  box.innerHTML = `Consultando <code>GET /api/turnos/${id}</code>...`;

  try {
    const res = await fetch(`/api/turnos/${id}`);
    const data = await res.json();

    if (res.status === 200) {
      box.innerHTML = `
        <div style="color: #10B981; font-weight: 700; margin-bottom: 6px;">
          ✔ HTTP 200 OK — Solicitud #${id} Encontrada en el Backend
        </div>
        <pre class="json-viewer">${JSON.stringify(data, null, 2)}</pre>
      `;
    } else if (res.status === 404) {
      box.innerHTML = `
        <div style="color: #EF4444; font-weight: 700; margin-bottom: 6px;">
          ✖ HTTP 404 Not Found — Identificador Inexistente
        </div>
        <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 6px;">${data.mensaje || 'Recurso no encontrado'}</p>
        <pre class="json-viewer">${JSON.stringify(data, null, 2)}</pre>
      `;
    }
  } catch (err) {
    box.innerHTML = `<span style="color: var(--accent-rose);">Error de red: ${err.message}</span>`;
  }
}

window.consultarDetalle = function(id) {
  irATab('tab-consola');
  probarEndpoint('get-uno-custom', id);
};

// 8. CONSOLA DE SUSTENTACIÓN EN VIVO (PRUEBAS RÁPIDAS RÚBRICA CIAF)
window.probarEndpoint = async function(tipo, customId = null) {
  const termSummaryUrl = document.getElementById('termSummaryUrl');
  const termSummaryStatus = document.getElementById('termSummaryStatus');
  const termLatency = document.getElementById('termLatency');
  const termReqBody = document.getElementById('termReqBody');
  const termResBody = document.getElementById('termResBody');

  let metodo = 'GET';
  let url = '/api/turnos';
  let body = null;

  switch (tipo) {
    case 'get-todos':
      metodo = 'GET';
      url = '/api/turnos';
      break;
    case 'get-uno':
      metodo = 'GET';
      url = '/api/turnos/1';
      break;
    case 'get-uno-custom':
      metodo = 'GET';
      url = `/api/turnos/${customId}`;
      break;
    case 'get-inexistente':
      metodo = 'GET';
      url = '/api/turnos/999999';
      break;
    case 'post-prioritario':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "Valentina Gómez",
        tipoServicio: "Tutoría de código",
        tema: "Arquitectura por capas en Express",
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        precioBase: 150000,
        prioritario: true
      };
      break;
    case 'post-normal':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "Santiago Ríos",
        tipoServicio: "Asesoría académica",
        tema: "Bases de datos relacionales",
        fechaHora: new Date(Date.now() + 172800000).toISOString(),
        precioBase: 80000,
        prioritario: false
      };
      break;
    case 'post-incompleto':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "",
        tipoServicio: "Tutoría",
        precioBase: 100000
      };
      break;
    case 'post-precio-invalido':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "Valentina Gómez",
        tipoServicio: "Asesoría académica",
        tema: "Normalización",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: -50000,
        prioritario: true
      };
      break;
  }

  termSummaryUrl.innerText = `${metodo} ${url}`;
  termReqBody.innerText = body ? JSON.stringify(body, null, 2) : '// No aplica (Sin cuerpo)';
  termResBody.innerText = 'Consultando backend Express...';
  termSummaryStatus.innerText = 'Enviando...';
  termSummaryStatus.className = 'term-pill-status';

  const t0 = performance.now();

  try {
    const opts = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const ms = Math.round(performance.now() - t0);
    termLatency.innerText = `${ms} ms`;

    const json = await res.json();
    termSummaryStatus.innerText = `${res.status} ${res.statusText || ''}`;
    termResBody.innerText = JSON.stringify(json, null, 2);

    if (res.status === 200 || res.status === 201) {
      termSummaryStatus.className = 'term-pill-status sc-200';
    } else if (res.status === 400) {
      termSummaryStatus.className = 'term-pill-status sc-400';
    } else if (res.status === 404) {
      termSummaryStatus.className = 'term-pill-status sc-404';
    }

    if (res.status === 201) cargarTurnos();
  } catch (err) {
    const ms = Math.round(performance.now() - t0);
    termLatency.innerText = `${ms} ms`;
    termSummaryStatus.innerText = 'Error de red';
    termSummaryStatus.className = 'term-pill-status sc-404';
    termResBody.innerText = `Error: ${err.message}`;
  }
};

// 9. FORO ACADÉMICO
function configurarForo() {
  const pills = document.querySelectorAll('.foro-cat-pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      AppState.categoriaActiva = p.getAttribute('data-cat');
      renderizarForo();
    });
  });

  const modal = document.getElementById('modalPreguntaForo');
  const btnAbrir = document.getElementById('btnModalPregunta');
  const btnCerrar = document.getElementById('btnCerrarModalPregunta');
  const btnCancelar = document.getElementById('btnCancelarModal');
  const formModal = document.getElementById('formModalPregunta');

  if (btnAbrir) btnAbrir.addEventListener('click', () => modal.classList.remove('hidden'));
  if (btnCerrar) btnCerrar.addEventListener('click', () => modal.classList.add('hidden'));
  if (btnCancelar) btnCancelar.addEventListener('click', () => modal.classList.add('hidden'));

  if (formModal) {
    formModal.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('modalTitulo').value;
      const autor = document.getElementById('modalAutor').value;
      const categoria = document.getElementById('modalCat').value;
      const contenido = document.getElementById('modalDesc').value;

      try {
        const res = await fetch('/api/foro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, autor, categoria, contenido })
        });
        if (res.ok) {
          formModal.reset();
          modal.classList.add('hidden');
          cargarForo();
        }
      } catch (err) {
        alert('Error al publicar: ' + err.message);
      }
    });
  }
}

async function cargarForo() {
  try {
    const res = await fetch('/api/foro');
    const data = await res.json();
    if (res.ok && data.exito) {
      AppState.foroPosts = data.datos || [];
      const totalP = document.getElementById('metricTotalPreguntas');
      if (totalP) totalP.innerText = AppState.foroPosts.length;
      renderizarForo();
    }
  } catch (err) {
    console.warn('Error al cargar foro:', err);
  }
}

function renderizarForo() {
  const container = document.getElementById('foroPostsGrid');
  if (!container) return;

  const posts = AppState.categoriaActiva === 'all'
    ? AppState.foroPosts
    : AppState.foroPosts.filter(p => p.categoria === AppState.categoriaActiva);

  if (posts.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-dim);">No hay publicaciones en esta categoría.</div>`;
    return;
  }

  renderizarGridForo(posts, '');
}

function renderizarForoFiltrado(postsFiltrados, query = '') {
  const container = document.getElementById('foroPostsGrid');
  if (!container) return;

  if (!postsFiltrados || postsFiltrados.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-dim);">No se encontraron temas en el foro para <strong>"${escapeHTML(query)}"</strong>. <button class="btn btn-secondary btn-sm" style="margin-left: 8px;" onclick="renderizarForo()">Ver todos</button></div>`;
    return;
  }

  renderizarGridForo(postsFiltrados, query);
}

function renderizarGridForo(posts, query) {
  const container = document.getElementById('foroPostsGrid');
  if (!container) return;

  container.innerHTML = posts.map(post => {
    const fecha = new Date(post.fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const tituloHtml = query ? resaltarTexto(post.titulo, query) : escapeHTML(post.titulo);
    const autorHtml = query ? resaltarTexto(post.autor, query) : escapeHTML(post.autor);
    const contenidoHtml = query ? resaltarTexto(post.contenido, query) : escapeHTML(post.contenido);

    return `
      <div class="foro-thread-card">
        <div class="thread-meta">
          <span class="thread-tag">${post.categoria}</span>
          <span class="thread-author">${autorHtml}</span>
          <span class="thread-date">• ${fecha}</span>
        </div>
        <h3 class="thread-title">${tituloHtml}</h3>
        <p class="thread-excerpt">${contenidoHtml}</p>
        <div class="thread-footer">
          <button class="btn-upvote" onclick="votarHilo('${post.id}')">
            ▲ Útil (${post.votos || 0})
          </button>
          <span style="color: var(--text-dim);">${(post.respuestas || []).length} respuestas</span>
        </div>
      </div>
    `;
  }).join('');
}

window.votarHilo = async function(id) {
  try {
    const res = await fetch(`/api/foro/${id}/voto`, { method: 'POST' });
    if (res.ok) cargarForo();
  } catch (err) {
    console.error('Error al votar:', err);
  }
};
