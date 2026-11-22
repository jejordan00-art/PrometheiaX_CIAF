/**
 * PROMETHEIAX - FRONTEND INTERACTIVO
 * Lógica del cliente, consumo de API REST real y simulador de reglas CIAF
 */

// Estado global de la aplicación
const AppState = {
  parametroN: 7,
  porcentajeRecargo: 14,
  turnos: [],
  foroPosts: [],
  categoriaActiva: 'all'
};

// Formateador de moneda en pesos colombianos
const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

// Inicialización cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacion();
  cargarConfiguracionNegocio();
  configurarSimuladorPrecios();
  configurarFormularioTurno();
  configurarBuscadorPorId();
  configurarConsolaSustentacion();
  configurarForoAcademico();
  cargarTurnos();
  cargarForo();
  establecerFechaPorDefecto();
});

// 1. GESTIÓN DE PESTAÑAS
function inicializarNavegacion() {
  const botonesNav = document.querySelectorAll('.nav-btn');
  const contenidos = document.querySelectorAll('.tab-content');

  botonesNav.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      botonesNav.forEach(b => b.classList.remove('active'));
      contenidos.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');

      if (tabId === 'tab-turnos') {
        cargarTurnos();
      } else if (tabId === 'tab-foro') {
        cargarForo();
      }
    });
  });
}

// 2. CARGAR CONFIGURACIÓN DE NEGOCIO (N Y RECARGO)
async function cargarConfiguracionNegocio() {
  try {
    const res = await fetch('/api/turnos/configuracion');
    if (res.ok) {
      const data = await res.json();
      if (data.exito && data.datos) {
        AppState.parametroN = data.datos.parametroN;
        AppState.porcentajeRecargo = data.datos.porcentajeRecargo;

        // Actualizar UI
        document.getElementById('badgeNInfo').innerText = `Equipo N = ${AppState.parametroN} (Recargo: ${AppState.porcentajeRecargo}%)`;
        document.getElementById('nValDisplay').innerText = `N = ${AppState.parametroN}`;
        document.getElementById('heroFormula').innerText = `${AppState.parametroN} × 2% = ${AppState.porcentajeRecargo}%`;
        document.getElementById('prioridadPorcentajeText').innerText = `${AppState.porcentajeRecargo}%`;
        document.getElementById('previewPorcentaje').innerText = `${AppState.porcentajeRecargo}%`;

        actualizarCalculoEnVivo();
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar /api/turnos/configuracion, usando valores por defecto:', err);
  }
}

// 3. ESTABLECER FECHA POR DEFECTO (MAÑANA A LAS 10:00 AM)
function establecerFechaPorDefecto() {
  const inputFecha = document.getElementById('fechaHora');
  if (inputFecha) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(10, 0, 0, 0);
    // Formato local YYYY-MM-DDTHH:mm
    const year = manana.getFullYear();
    const month = String(manana.getMonth() + 1).padStart(2, '0');
    const day = String(manana.getDate()).padStart(2, '0');
    const hours = String(manana.getHours()).padStart(2, '0');
    const minutes = String(manana.getMinutes()).padStart(2, '0');
    inputFecha.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

// 4. SIMULADOR DE CÁLCULO EN VIVO
function configurarSimuladorPrecios() {
  const inputPrecio = document.getElementById('precioBase');
  const checkPrioritario = document.getElementById('prioritario');

  if (inputPrecio) inputPrecio.addEventListener('input', actualizarCalculoEnVivo);
  if (checkPrioritario) checkPrioritario.addEventListener('change', actualizarCalculoEnVivo);

  actualizarCalculoEnVivo();
}

function actualizarCalculoEnVivo() {
  const inputPrecio = document.getElementById('precioBase');
  const checkPrioritario = document.getElementById('prioritario');
  const previewPrecioBase = document.getElementById('previewPrecioBase');
  const previewRecargo = document.getElementById('previewRecargo');
  const previewTotal = document.getElementById('previewTotal');

  if (!inputPrecio || !checkPrioritario) return;

  const precio = parseFloat(inputPrecio.value) || 0;
  const esPrioritario = checkPrioritario.checked;

  let recargo = 0;
  if (esPrioritario && precio > 0) {
    recargo = Math.round((precio * AppState.porcentajeRecargo) / 100);
  }
  const total = precio + recargo;

  previewPrecioBase.innerText = formateadorCOP.format(precio);
  previewRecargo.innerText = esPrioritario ? `+ ${formateadorCOP.format(recargo)}` : '$ 0 (Sin prioridad)';
  previewTotal.innerText = formateadorCOP.format(total);
}

// 5. FORMULARIO DE REGISTRO DE TURNO (POST /api/turnos)
function configurarFormularioTurno() {
  const form = document.getElementById('formTurno');
  const alerta = document.getElementById('resultadoAlerta');
  const btnSubmit = document.getElementById('btnSubmitTurno');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const estudiante = document.getElementById('estudiante').value.trim();
    const tipoServicio = document.getElementById('tipoServicio').value.trim();
    const tema = document.getElementById('tema').value.trim();
    const fechaHora = document.getElementById('fechaHora').value;
    const precioBase = Number(document.getElementById('precioBase').value);
    const prioritario = document.getElementById('prioritario').checked;

    const payload = {
      estudiante,
      tipoServicio,
      tema,
      fechaHora,
      precioBase,
      prioritario
    };

    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Enviando a POST /api/turnos...';

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
          <strong>✔ ¡Solicitud Registrada Exitosamente (HTTP 201 Created)!</strong><br>
          <strong>ID asignado:</strong> #${data.datos.id} | <strong>Estudiante:</strong> ${data.datos.estudiante}<br>
          <strong>Total a pagar:</strong> ${formateadorCOP.format(data.datos.totalPagar)} 
          (Recargo N aplicado: ${data.datos.porcentajeRecargo}%)
        `;
        form.reset();
        establecerFechaPorDefecto();
        document.getElementById('precioBase').value = "200000";
        document.getElementById('prioritario').checked = true;
        actualizarCalculoEnVivo();
        cargarTurnos();
      } else {
        alerta.classList.add('error');
        alerta.innerHTML = `
          <strong>✖ Error (${res.status} Bad Request):</strong><br>
          ${data.mensaje || 'Error al procesar la solicitud.'}
          ${data.detalles ? `<br><small>${data.detalles.join('<br>')}</small>` : ''}
        `;
      }
    } catch (err) {
      alerta.classList.remove('hidden');
      alerta.classList.add('error');
      alerta.innerText = `Error de red al conectar con el servidor: ${err.message}`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Registrar Solicitud en la API REST (POST /api/turnos)
      `;
    }
  });
}

// 6. CARGAR TURNOS (GET /api/turnos)
async function cargarTurnos() {
  const tbody = document.getElementById('turnosTableBody');
  const counter = document.getElementById('tableCounter');
  const badgeTotal = document.getElementById('totalTurnosBadge');

  if (!tbody) return;

  try {
    const res = await fetch('/api/turnos');
    const data = await res.json();

    if (res.ok && data.exito) {
      AppState.turnos = data.datos || [];
      counter.innerText = `${AppState.turnos.length} solicitudes`;
      badgeTotal.innerText = AppState.turnos.length;

      if (AppState.turnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="loading-cell">No hay solicitudes registradas aún. Registra una en el formulario.</td></tr>`;
        return;
      }

      tbody.innerHTML = AppState.turnos.map(t => {
        const fechaFormateada = new Date(t.fechaHora).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        return `
          <tr>
            <td><strong>#${t.id}</strong></td>
            <td><strong>${t.estudiante}</strong></td>
            <td>
              <div>${t.tipoServicio}</div>
              <small style="color: var(--text-dim);">${t.tema}</small>
            </td>
            <td>${fechaFormateada}</td>
            <td>${formateadorCOP.format(t.precioBase)}</td>
            <td>
              ${t.prioritario 
                ? '<span class="badge-prioritario">★ Prioritario</span>' 
                : '<span class="badge-normal">Normal</span>'}
            </td>
            <td>
              ${t.prioritario 
                ? `<span style="color: var(--accent-amber); font-weight: 600;">+${t.porcentajeRecargo}% (${formateadorCOP.format(t.valorRecargo)})</span>`
                : '<span style="color: var(--text-dim);">$ 0 (0%)</span>'}
            </td>
            <td><strong style="color: var(--accent-emerald); font-size: 0.95rem;">${formateadorCOP.format(t.totalPagar)}</strong></td>
            <td>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="consultarDetalleRapido('${t.id}')">
                Ver JSON (200)
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="loading-cell" style="color: var(--accent-rose);">Error al conectar con GET /api/turnos: ${err.message}</td></tr>`;
  }
}

// 7. BUSCADOR POR ID (GET /api/turnos/:id)
function configurarBuscadorPorId() {
  const btnBuscar = document.getElementById('btnBuscarId');
  const inputId = document.getElementById('buscarIdInput');
  const btnRecargar = document.getElementById('btnRecargarTurnos');

  if (btnRecargar) {
    btnRecargar.addEventListener('click', cargarTurnos);
  }

  if (btnBuscar && inputId) {
    btnBuscar.addEventListener('click', () => {
      const id = inputId.value.trim();
      if (!id) return;
      consultarIdDirecto(id);
    });

    inputId.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const id = inputId.value.trim();
        if (id) consultarIdDirecto(id);
      }
    });
  }
}

async function consultarIdDirecto(id) {
  const resultBox = document.getElementById('resultadoBusquedaId');
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = `Consultando <code>GET /api/turnos/${id}</code>...`;

  try {
    const res = await fetch(`/api/turnos/${id}`);
    const data = await res.json();

    if (res.status === 200) {
      resultBox.innerHTML = `
        <div style="color: #34d399; font-weight: 700; margin-bottom: 0.4rem;">
          ✔ HTTP 200 OK — Solicitud #${id} Encontrada
        </div>
        <pre class="json-code" style="max-height: 180px;">${JSON.stringify(data, null, 2)}</pre>
      `;
    } else if (res.status === 404) {
      resultBox.innerHTML = `
        <div style="color: #f87171; font-weight: 700; margin-bottom: 0.4rem;">
          ✖ HTTP 404 Not Found — Identificador Inexistente
        </div>
        <p style="color: var(--text-muted); font-size: 0.82rem;">${data.mensaje || 'Recurso no encontrado.'}</p>
        <pre class="json-code" style="max-height: 120px;">${JSON.stringify(data, null, 2)}</pre>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="color: #fbbf24; font-weight: 700;">HTTP ${res.status}</div>
        <pre class="json-code">${JSON.stringify(data, null, 2)}</pre>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = `<span style="color: var(--accent-rose);">Error de red: ${err.message}</span>`;
  }
}

window.consultarDetalleRapido = function(id) {
  // Cambiar a la pestaña de turnos o de sustentación
  const tabBtn = document.querySelector('[data-tab="tab-sustentacion"]');
  if (tabBtn) tabBtn.click();
  ejecutarPruebaSustentacion('get-id-custom', id);
};

// 8. CONSOLA DE SUSTENTACIÓN (PRUEBAS RÁPIDAS DE PROTOCOLOS HTTP)
function configurarConsolaSustentacion() {
  const testButtons = document.querySelectorAll('.test-btn');
  testButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tipoTest = btn.getAttribute('data-test');
      ejecutarPruebaSustentacion(tipoTest);
    });
  });
}

async function ejecutarPruebaSustentacion(tipo, customId = null) {
  const termRequest = document.getElementById('termRequest');
  const termStatus = document.getElementById('termStatus');
  const termRequestBody = document.getElementById('termRequestBody');
  const termResponseBody = document.getElementById('termResponseBody');
  const termTiming = document.getElementById('termTiming');

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

    case 'get-id-custom':
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
        estudiante: "Laura Ximena Sánchez",
        tipoServicio: "Asesoría académica",
        tema: "Arquitectura por Capas en Express",
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        precioBase: 200000,
        prioritario: true
      };
      break;

    case 'post-normal':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "Juan David Romero",
        tipoServicio: "Tutoría personalizada",
        tema: "Diseño de Base de Datos y Normalización",
        fechaHora: new Date(Date.now() + 172800000).toISOString(),
        precioBase: 150000,
        prioritario: false
      };
      break;

    case 'post-incompleto':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "",
        tipoServicio: "Asesoría",
        // tema omitido intencionalmente
        precioBase: 100000
      };
      break;

    case 'post-precio-invalido':
      metodo = 'POST';
      url = '/api/turnos';
      body = {
        estudiante: "Carlos Andrés Toro",
        tipoServicio: "Asesoría académica",
        tema: "Redes y Protocolos",
        fechaHora: "2026-12-15T11:00:00",
        precioBase: -50000, // Inválido (menor a cero)
        prioritario: true
      };
      break;
  }

  termRequest.innerText = `${metodo} ${url}`;
  termRequestBody.innerText = body ? JSON.stringify(body, null, 2) : '// No aplica (Petición sin cuerpo)';
  termResponseBody.innerText = 'Esperando respuesta del servidor...';
  termStatus.innerText = 'Enviando...';
  termStatus.className = 'status-pill-term';

  const inicio = performance.now();

  try {
    const fetchOptions = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) fetchOptions.body = JSON.stringify(body);

    const res = await fetch(url, fetchOptions);
    const duracion = Math.round(performance.now() - inicio);
    termTiming.innerText = `${duracion} ms`;

    let data;
    try {
      data = await res.json();
    } catch {
      data = { raw: await res.text() };
    }

    termStatus.innerText = `${res.status} ${res.statusText || ''}`;
    termResponseBody.innerText = JSON.stringify(data, null, 2);

    if (res.status === 200 || res.status === 201) {
      termStatus.className = 'status-pill-term status-200';
    } else if (res.status === 400) {
      termStatus.className = 'status-pill-term status-400';
    } else if (res.status === 404) {
      termStatus.className = 'status-pill-term status-404';
    }

    // Si fue un POST exitoso, refrescar la tabla de turnos
    if (res.status === 201) {
      cargarTurnos();
    }

  } catch (err) {
    const duracion = Math.round(performance.now() - inicio);
    termTiming.innerText = `${duracion} ms`;
    termStatus.innerText = 'Error de Conexión';
    termStatus.className = 'status-pill-term status-404';
    termResponseBody.innerText = `Error: ${err.message}`;
  }
}

// 9. FORO ACADÉMICO (COMUNIDAD, PREGUNTAS Y VOTOS)
function configurarForoAcademico() {
  const catPills = document.querySelectorAll('.cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      AppState.categoriaActiva = pill.getAttribute('data-cat');
      renderizarForoPosts();
    });
  });

  // Modal de nueva publicación
  const modal = document.getElementById('modalNuevoPost');
  const btnAbrir = document.getElementById('btnAbrirModalPost');
  const btnCerrar = document.getElementById('btnCerrarModalPost');
  const btnCancelar = document.getElementById('btnCancelarModalPost');
  const formPost = document.getElementById('formForoPost');

  if (btnAbrir) btnAbrir.addEventListener('click', () => modal.classList.remove('hidden'));
  if (btnCerrar) btnCerrar.addEventListener('click', () => modal.classList.add('hidden'));
  if (btnCancelar) btnCancelar.addEventListener('click', () => modal.classList.add('hidden'));

  if (formPost) {
    formPost.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('postTitulo').value;
      const autor = document.getElementById('postAutor').value;
      const categoria = document.getElementById('postCategoria').value;
      const contenido = document.getElementById('postContenido').value;

      try {
        const res = await fetch('/api/foro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, autor, categoria, contenido })
        });
        if (res.ok) {
          formPost.reset();
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
      renderizarForoPosts();
    }
  } catch (err) {
    console.warn('Error al cargar foro:', err);
  }
}

function renderizarForoPosts() {
  const container = document.getElementById('foroPostsContainer');
  if (!container) return;

  const postsFiltrados = AppState.categoriaActiva === 'all'
    ? AppState.foroPosts
    : AppState.foroPosts.filter(p => p.categoria === AppState.categoriaActiva);

  if (postsFiltrados.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; color: var(--text-dim); padding: 3rem;">
        No hay publicaciones en esta categoría. ¡Sé el primero en iniciar un debate académico!
      </div>
    `;
    return;
  }

  container.innerHTML = postsFiltrados.map(post => {
    const fecha = new Date(post.fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="foro-post-card">
        <div class="post-meta">
          <span class="post-cat-tag">${post.categoria}</span>
          <span class="post-author">${post.autor}</span>
          <span class="post-date">• ${fecha}</span>
        </div>
        <h3 class="post-title">${post.titulo}</h3>
        <p class="post-content">${post.contenido}</p>
        <div class="post-footer">
          <button class="btn-vote" onclick="votarPost('${post.id}')">
            ▲ Útil (${post.votos || 0})
          </button>
          <span class="replies-count">${(post.respuestas || []).length} respuestas de la comunidad</span>
        </div>
      </div>
    `;
  }).join('');
}

window.votarPost = async function(id) {
  try {
    const res = await fetch(`/api/foro/${id}/voto`, { method: 'POST' });
    if (res.ok) {
      cargarForo();
    }
  } catch (err) {
    console.error('Error al votar:', err);
  }
};
