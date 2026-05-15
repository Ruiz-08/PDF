document.addEventListener("DOMContentLoaded", function () {

  /* ─── FRASE MOTIVADORA ─────────────────────────────────────── */
  const frases = [
    "¡En la vida y en las finanzas, el riesgo es inevitable!",
    "¡El ahorro de hoy es la libertad de mañana!",
    "¡No gastes lo que no tienes para impresionar a quien no importa!",
    "¡Invertir en conocimiento es la mejor inversión!",
    "¡Controlar tus finanzas es controlar tu futuro!",
  ];
  const elementoFrase = document.getElementById("frase_motivadora");
  if (elementoFrase) {
    elementoFrase.textContent = frases[Math.floor(Math.random() * frases.length)];
  }

  /* ─── NOMBRE USUARIO ───────────────────────────────────────── */
  const generarAvatarLetra = (nombre) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const colores = ['#cfb53b', '#b38b00', '#001524', '#2c3e50', '#8e44ad', '#2980b9', '#16a34a'];
    let hash = 0;
    const nombreLimpio = (nombre || "Usuario").trim();
    for (let i = 0; i < nombreLimpio.length; i++) {
        hash = nombreLimpio.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorFondo = colores[Math.abs(hash) % colores.length];
    // Dibujar fondo circular
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = colorFondo;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    if (colorFondo === '#cfb53b') ctx.fillStyle = '#000000';
    ctx.font = 'bold 100px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const inicial = nombreLimpio.charAt(0).toUpperCase();
    ctx.fillText(inicial, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL('image/png');
  };

  const elementoNombre = document.getElementById("nombre_usuario");
  const elementoNombreHeader = document.getElementById("nombreUsuarioHeader");
  const nombreGuardado = localStorage.getItem("nombre_usuario") || "Usuario";
  const nombreCapitalizado = nombreGuardado.charAt(0).toUpperCase() + nombreGuardado.slice(1);

  if (elementoNombre) elementoNombre.textContent = nombreCapitalizado;
  if (elementoNombreHeader) elementoNombreHeader.textContent = nombreCapitalizado;

  const avatarPrincipal = document.getElementById("avatarPrincipal");
  const botonPerfilImg = document.querySelector("#botonPerfil img");
  const avatarGuardado = localStorage.getItem("pesa-tus-pesos-avatar");

  if (avatarPrincipal) {
    avatarPrincipal.src = avatarGuardado ? avatarGuardado : generarAvatarLetra(nombreCapitalizado);
  }

  if (botonPerfilImg) {
    botonPerfilImg.src = avatarGuardado ? avatarGuardado : generarAvatarLetra(nombreCapitalizado);
  }

  /* ─── BOTÓN CONFIGURACIÓN ──────────────────────────────────── */
  const botonConfiguracion = document.getElementById("botonConfiguracion");
  const contenedorFlotante = document.querySelector(".contenedor-flotante");
  const botonesOpciones    = document.querySelectorAll(".boton-opcion");

  if (botonConfiguracion) {
    botonConfiguracion.addEventListener("click", (e) => {
      e.stopPropagation();
      contenedorFlotante.classList.toggle("active");
    });
  }
  botonesOpciones.forEach(b => b.addEventListener("click", () => contenedorFlotante.classList.remove("active")));
  document.addEventListener("click", (e) => {
    if (contenedorFlotante && !contenedorFlotante.contains(e.target))
      contenedorFlotante.classList.remove("active");
  });

  /* ─── PANEL USUARIO ────────────────────────────────────────── */
  const cerrarPanelBtn = document.getElementById("cerrarPanel");
  if (cerrarPanelBtn) {
    cerrarPanelBtn.addEventListener("click", () => {
      document.getElementById("panelUsuario").classList.remove("activo");
    });
  }
  const botonCerrar = document.querySelector(".boton-cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      window.location.href = "../Inicio/inicio.html";
    });
  }

  /* ═══════════════════════════════════════════════════════════════
                      ESTADO GLOBAL DEL DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
  let deudas  = [];
  let pagos   = [];

  let chartEvolucionInst  = null;
  let chartPagosMesInst   = null;
  let confirmCallback     = null;

  let paginaDeudas = 1;
  let paginaPagos  = 1;
  const REG_POR_PAG = 6;

  /* ─── INICIALIZAR ───────────────────────────────────────────── */
  inicializarDashboard();

  function inicializarDashboard() {
    configurarEventosModalDeuda();
    configurarEventosModalPago();
    configurarEventosModalConfirm();
    configurarFormateoInputs();
    poblarFiltrosEntidad();
    
    actualizarKPIs();
    renderTablaDeudas(1);
    renderHistorialPagos(1);
    initCharts();
  }

  function configurarFormateoInputs() {
    const ids = ['saldoInicial', 'saldoActual', 'montoPago'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          let value = e.target.value.replace(/[^\d]/g, '');
          if (value === '') {
            e.target.value = '';
            return;
          }
          const num = parseInt(value, 10);
          e.target.value = new Intl.NumberFormat('de-DE').format(num);
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
                            KPIs
   ═══════════════════════════════════════════════════════════════ */
  function actualizarKPIs() {
    const total   = deudas.reduce((s, d) => s + parseMoney(d.actual), 0);
    const abonado = pagos.reduce((s, p) => s + parseMoney(p.monto), 0);

    const mesActual = new Date().getMonth();
    const anoActual = new Date().getFullYear();
    const pagosMes  = pagos
      .filter(p => {
        const f = new Date(p.fecha);
        return f.getMonth() === mesActual && f.getFullYear() === anoActual;
      })
      .reduce((s, p) => s + parseMoney(p.monto), 0);

    setEl("valDeudaTotal",    formatCurrency(total));
    setEl("valSaldoPendiente", formatCurrency(total));
    setEl("valPagosMes",       formatCurrency(pagosMes));
    setEl("valTotalAbonado",   formatCurrency(abonado));

    // Próximo vencimiento
    const hoy = new Date();
    const proximas = deudas
      .filter(d => d.venc)
      .map(d => ({ ...d, diff: Math.ceil((new Date(d.venc) - hoy) / 86400000) }))
      .filter(d => d.diff >= 0)
      .sort((a, b) => a.diff - b.diff);

    if (proximas.length > 0) {
      setEl("valProxVenc", `${proximas[0].diff} días`);
      document.querySelectorAll('.status-date').forEach(el => {
        el.textContent = formatFecha(proximas[0].venc);
      });
    }
  }

  function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function poblarFiltrosEntidad() {
    const selEntidad = document.getElementById('filtroEntidad');
    if (!selEntidad) return;
    const valorActual = selEntidad.value;
    const entidades = [...new Set(deudas.map(d => d.acreedor))].sort();
    selEntidad.innerHTML = '<option>Todas</option>' + 
      entidades.map(e => `<option ${e === valorActual ? 'selected' : ''}>${e}</option>`).join('');
  }

  /* ═══════════════════════════════════════════════════════════════
                      TABLA DEUDAS (con paginación)
   ═══════════════════════════════════════════════════════════════ */
  function renderTablaDeudas(pagina) {
    const body = document.getElementById('tablaDeudasBody');
    if (!body) return;

    const filtroEntidad = document.getElementById('filtroEntidad') ? document.getElementById('filtroEntidad').value : 'Todas';
    const filtroTipo = document.getElementById('filtroTipo') ? document.getElementById('filtroTipo').value : 'Todas';
    const filtroEstado = document.getElementById('filtroEstado') ? document.getElementById('filtroEstado').value : 'Todos';

    const deudasFiltradas = deudas.filter(d => {
      let ok = true;
      if (filtroEntidad !== 'Todas' && d.acreedor !== filtroEntidad) ok = false;
      if (filtroTipo !== 'Todas' && d.tipo !== filtroTipo) ok = false;
      if (filtroEstado !== 'Todos' && d.estado !== filtroEstado) ok = false;
      return ok;
    });

    paginaDeudas = pagina;
    const inicio = (pagina - 1) * REG_POR_PAG;
    const slice  = deudasFiltradas.slice(inicio, inicio + REG_POR_PAG);

    if (slice.length === 0) {
      body.innerHTML = `<tr><td colspan="8" class="td-empty">Sin deudas registradas</td></tr>`;
    } else {
      body.innerHTML = slice.map((d, i) => {
        const gi = inicio + i;
        return `
          <tr>
            <td><b>${d.acreedor}</b></td>
            <td><span style="color:var(--dash-blue)">${d.tipo}</span></td>
            <td>${d.inicial}</td>
            <td><b>${d.actual}</b></td>
            <td>${d.tasa ? d.tasa + '%' : '-'}</td>
            <td>${formatFecha(d.venc)}</td>
            <td><span class="badge ${d.badge}">${capitalize(d.estado)}</span></td>
            <td class="acciones-cell">
              <button class="btn-edit" title="Editar" onclick="abrirModalDeuda(${gi})">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="btn-delete" title="Eliminar" onclick="eliminarDeuda(${gi})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`;
      }).join('');
    }

    renderPaginacion('paginacionDeudas', deudasFiltradas.length, paginaDeudas, 'cambiarPaginaDeudas');
  }

  window.cambiarPaginaDeudas = (n) => renderTablaDeudas(n);

  window.eliminarDeuda = function(index) {
    showConfirmModal(
      '¿Eliminar Deuda?', 
      `¿Estás seguro de que deseas eliminar la deuda con "${deudas[index].acreedor}"? Esta acción es permanente.`,
      () => {
        deudas.splice(index, 1);
        const total = Math.ceil(deudas.length / REG_POR_PAG);
        if (paginaDeudas > total && total > 0) paginaDeudas = total;
        renderTablaDeudas(paginaDeudas);
        poblarFiltrosEntidad();
        actualizarKPIs();
        actualizarGraficas();
      }
    );
  };

  /* ═══════════════════════════════════════════════════════════════
               HISTORIAL DE PAGOS (CRUD + paginación)
   ═══════════════════════════════════════════════════════════════ */
  function renderHistorialPagos(pagina) {
    const body = document.getElementById('tablaHistorialPagosBody');
    if (!body) return;
    paginaPagos = pagina;
    const inicio = (pagina - 1) * REG_POR_PAG;
    const slice  = pagos.slice(inicio, inicio + REG_POR_PAG);

    if (slice.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="td-empty">No hay pagos registrados</td></tr>`;
    } else {
      body.innerHTML = slice.map((p, i) => {
        const gi = inicio + i;
        const notaIcon = p.notas
          ? `<div class="nota-wrapper">
               <button class="btn-nota" data-nota="${escapeHtml(p.notas)}" title="${escapeHtml(p.notas)}">
                 <i class="fa-solid fa-bell nota-icon"></i>
               </button>
               <div class="nota-popover">${escapeHtml(p.notas)}</div>
             </div>`
          : `<span class="sin-nota">—</span>`;
        return `
          <tr>
            <td>${formatFecha(p.fecha)}</td>
            <td><b>${p.monto}</b></td>
            <td><span class="badge metodo-badge">${capitalize(p.metodo)}</span></td>
            <td>${notaIcon}</td>
            <td class="acciones-cell">
              <button class="btn-edit" title="Editar" onclick="abrirModalPago(${gi})">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="btn-delete" title="Eliminar" onclick="eliminarPago(${gi})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`;
      }).join('');
    }

    renderPaginacion('paginacionPagos', pagos.length, paginaPagos, 'cambiarPaginaPagos');
    bindNotaPopovers();
  }

  window.cambiarPaginaPagos = (n) => renderHistorialPagos(n);

  window.eliminarPago = function(index) {
    showConfirmModal(
      '¿Eliminar Pago?',
      `¿Deseas eliminar el registro de pago por valor de ${pagos[index].monto}?`,
      () => {
        pagos.splice(index, 1);
        const total = Math.ceil(pagos.length / REG_POR_PAG);
        if (paginaPagos > total && total > 0) paginaPagos = total;
        renderHistorialPagos(paginaPagos);
        actualizarKPIs();
        actualizarGraficas();
      }
    );
  };

  /* ─── Popover de notas ──────────────────────────────────────── */
  function bindNotaPopovers() {
    document.querySelectorAll('.btn-nota').forEach(btn => {
      const wrapper = btn.closest('.nota-wrapper');
      const popover = wrapper.querySelector('.nota-popover');

      btn.addEventListener('mouseenter', () => popover.classList.add('visible'));
      btn.addEventListener('mouseleave', () => popover.classList.remove('visible'));
      btn.addEventListener('click', () => popover.classList.toggle('visible'));
    });
  }

  /* ─── Helpers de paginación ─────────────────────────────────── */
  function renderPaginacion(containerId, total, actual, fnName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPags = Math.max(Math.ceil(total / REG_POR_PAG), 1);
    let html = `<button class="btn-page" ${actual === 1 ? 'disabled' : ''} onclick="${fnName}(${actual - 1})">
                  <i class="fa-solid fa-chevron-left"></i></button>`;
    
    html += `<button class="btn-page active">${actual}</button>`;
    
    html += `<button class="btn-page" ${actual === totalPags ? 'disabled' : ''} onclick="${fnName}(${actual + 1})">
               <i class="fa-solid fa-chevron-right"></i></button>`;
    container.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════════════
                      MODAL DEUDA
   ═══════════════════════════════════════════════════════════════ */
  function configurarEventosModalDeuda() {
    const modal     = document.getElementById('modalDeuda');
    const btnAbrir  = document.getElementById('btnAbrirModalDeuda');
    const btnCerrar = document.getElementById('btnCerrarModalDeuda');
    const btnCancel = document.getElementById('btnCancelarDeuda');
    const form      = document.getElementById('formDeuda');

    if (btnAbrir)  btnAbrir.onclick  = () => abrirModalDeuda();
    if (btnCerrar) btnCerrar.onclick = cerrarModalDeuda;
    if (btnCancel) btnCancel.onclick = cerrarModalDeuda;
    if (form)      form.onsubmit     = (e) => { e.preventDefault(); guardarDeuda(); };

    window.addEventListener('click', (e) => { if (e.target === modal) cerrarModalDeuda(); });
  }

  window.abrirModalDeuda = function(index = null) {
    const modal  = document.getElementById('modalDeuda');
    const titulo = document.getElementById('modalDeudaTitulo');
    document.getElementById('formDeuda').reset();
    document.getElementById('deudaIndex').value = index !== null ? index : '';

    if (index !== null) {
      titulo.textContent = 'Editar Deuda';
      const d = deudas[index];
      document.getElementById('acreedor').value    = d.acreedor;
      document.getElementById('tipo').value         = d.tipo;
      document.getElementById('saldoInicial').value = parseMoney(d.inicial);
      document.getElementById('saldoActual').value  = parseMoney(d.actual);
      document.getElementById('tasa').value         = d.tasa || '';

      document.getElementById('vencimiento').value  = d.venc;
      document.getElementById('estado').value       = d.estado;
    } else {
      titulo.textContent = 'Nueva Deuda';
    }
    modal.classList.add('activo');
  };

  function cerrarModalDeuda() {
    document.getElementById('modalDeuda').classList.remove('activo');
  }

  function guardarDeuda() {
    const index   = document.getElementById('deudaIndex').value;
    const acreedor = capitalize(document.getElementById('acreedor').value);
    const tipo     = document.getElementById('tipo').value;
    const inicial  = parseMoney(document.getElementById('saldoInicial').value);
    const actual   = parseMoney(document.getElementById('saldoActual').value);
    const tasa     = document.getElementById('tasa').value;

    const venc     = document.getElementById('vencimiento').value;
    const estado   = document.getElementById('estado').value;
    const badge    = estado === 'Al día' ? 'success' : (estado === 'Próximo' ? 'warning' : 'danger');

    const nuevaDeuda = {
      acreedor, tipo,
      inicial: formatCurrency(inicial),
      actual:  formatCurrency(actual),
      tasa,
      venc, estado, badge
    };

    if (index !== '') {
      deudas[parseInt(index)] = nuevaDeuda;
    } else {
      deudas.push(nuevaDeuda);
      paginaDeudas = Math.ceil(deudas.length / REG_POR_PAG);
    }

    renderTablaDeudas(paginaDeudas);
    actualizarKPIs();
    actualizarGraficas();
    poblarFiltrosEntidad();
    cerrarModalDeuda();
  }

  /* ═══════════════════════════════════════════════════════════════
                      MODAL PAGO
   ═══════════════════════════════════════════════════════════════ */
  function configurarEventosModalPago() {
    const modal     = document.getElementById('modalPago');
    const btnAbrir  = document.getElementById('btnAbrirModalPago');
    const btnCerrar = document.getElementById('btnCerrarModalPago');
    const btnCancel = document.getElementById('btnCancelarPago');
    const form      = document.getElementById('formPago');

    if (btnAbrir)  btnAbrir.onclick  = () => abrirModalPago();
    if (btnCerrar) btnCerrar.onclick = cerrarModalPago;
    if (btnCancel) btnCancel.onclick = cerrarModalPago;
    if (form)      form.onsubmit     = (e) => { e.preventDefault(); guardarPago(); };

    window.addEventListener('click', (e) => { if (e.target === modal) cerrarModalPago(); });
  }

  window.abrirModalPago = function(index = null) {
    const modal  = document.getElementById('modalPago');
    const titulo = document.getElementById('modalPagoTitulo');
    document.getElementById('formPago').reset();
    document.getElementById('pagoIndex').value = index !== null ? index : '';
    
    const selectDeuda = document.getElementById('deudaAsociada');
    if (selectDeuda) {
      if (deudas.length === 0) {
        selectDeuda.innerHTML = '<option value="">No hay deudas registradas</option>';
      } else {
        selectDeuda.innerHTML = '<option value="">Seleccione una deuda</option>' + deudas.map((d, i) => `<option value="${i}">${d.acreedor} - ${d.actual}</option>`).join('');
      }
    }

    if (index !== null) {
      titulo.textContent = 'Editar Pago';
      const p = pagos[index];
      document.getElementById('fechaPago').value   = p.fecha;
      document.getElementById('montoPago').value   = parseMoney(p.monto);
      document.getElementById('metodoPago').value  = p.metodo;
      document.getElementById('notasPago').value   = p.notas || '';
      if (selectDeuda && p.deudaIdx !== undefined) selectDeuda.value = p.deudaIdx;
    } else {
      titulo.textContent = 'Nuevo Pago';
      // Prefill fecha de hoy
      document.getElementById('fechaPago').value = new Date().toISOString().split('T')[0];
    }
    modal.classList.add('activo');
  };

  function cerrarModalPago() {
    document.getElementById('modalPago').classList.remove('activo');
  }

  function guardarPago() {
    const index  = document.getElementById('pagoIndex').value;
    const fecha  = document.getElementById('fechaPago').value;
    const monto  = parseMoney(document.getElementById('montoPago').value);
    const metodo = capitalize(document.getElementById('metodoPago').value);
    let notas  = capitalize(document.getElementById('notasPago').value.trim());
    const selectDeuda = document.getElementById('deudaAsociada');
    const deudaIdx = selectDeuda ? selectDeuda.value : '';

    if (index === '' && deudaIdx !== '' && deudas[deudaIdx] && !notas) {
        notas = `Abono a ${deudas[deudaIdx].acreedor}`;
    }

    const nuevoPago = {
      fecha,
      monto: formatCurrency(monto),
      metodo,
      notas,
      deudaIdx
    };

    if (index !== '') {
      pagos[parseInt(index)] = nuevoPago;
    } else {
      pagos.push(nuevoPago);
      paginaPagos = Math.ceil(pagos.length / REG_POR_PAG);
      
      if (deudaIdx !== '' && deudas[deudaIdx]) {
        let actualVal = parseMoney(deudas[deudaIdx].actual);
        actualVal -= monto;
        if (actualVal < 0) actualVal = 0;
        deudas[deudaIdx].actual = formatCurrency(actualVal);
        renderTablaDeudas(paginaDeudas);
      }
    }

    renderHistorialPagos(paginaPagos);
    actualizarKPIs();
    actualizarGraficas();
    cerrarModalPago();
  }

  /* ═══════════════════════════════════════════════════════════════
                      MODAL CONFIRMACIÓN (PREMIUM)
   ═══════════════════════════════════════════════════════════════ */
  function configurarEventosModalConfirm() {
    const btnOk     = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');
    const modal     = document.getElementById('modalConfirm');

    if (btnOk) {
      btnOk.onclick = () => {
        if (confirmCallback) confirmCallback();
        cerrarConfirmModal();
      };
    }
    if (btnCancel) btnCancel.onclick = cerrarConfirmModal;

    window.addEventListener('click', (e) => { 
      if (e.target === modal) cerrarConfirmModal(); 
    });
  }

  window.showConfirmModal = function(title, message, callback) {
    const modal = document.getElementById('modalConfirm');
    if (!modal) return;
    
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    confirmCallback = callback;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('activo'), 10);
  }

  function cerrarConfirmModal() {
    const modal = document.getElementById('modalConfirm');
    if (!modal) return;
    
    modal.classList.remove('activo');
    setTimeout(() => {
      modal.style.display = 'none';
      confirmCallback = null;
    }, 300);
  }

  /* ═══════════════════════════════════════════════════════════════
                         GRÁFICAS
   ═══════════════════════════════════════════════════════════════ */
  function initCharts() {
    // Global defaults for dark background
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Montserrat', sans-serif";
    
    initChartEvolucion();
    initChartPagosMes();
  }

  function actualizarGraficas() {
    actualizarChartPagosMes();
    actualizarChartEvolucion();
  }

  /* --- Evolución de la Deuda (barras + línea) --- */
  function initChartEvolucion() {
    const ctx = document.getElementById('chartEvolucion');
    if (!ctx) return;
    chartEvolucionInst = new Chart(ctx, {
      type: 'line',
      data: buildDatosEvolucion(12),
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top',
            labels: { color: '#f3d989', font: { size: 12, weight: 'bold' } } }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: 'rgba(255, 255, 255, 0.5)', 
              callback: v => formatCurrency(v) 
            } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' }
          }
        }
      }
    });

    const sel = document.getElementById('selectEvolucion');
    if (sel) sel.addEventListener('change', () => {
      const meses = parseInt(sel.value);
      const data  = buildDatosEvolucion(meses);
      chartEvolucionInst.data = data;
      chartEvolucionInst.update();
    });
  }

  function buildDatosEvolucion(n) {
    const mesesNombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const ahora = new Date();
    const labels = [], dataDeuda = [], dataPagos = [];

    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      labels.push(mesesNombres[d.getMonth()]);

      const pagosMes = pagos
        .filter(p => {
          const f = new Date(p.fecha);
          return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear();
        })
        .reduce((s, p) => s + parseMoney(p.monto), 0);

      const deudaMes = deudas.reduce((s, dd) => s + parseMoney(dd.actual), 0);
      dataDeuda.push(deudaMes);
      dataPagos.push(pagosMes);
    }
    return {
      labels,
      datasets: [
        {
          label: 'Saldo Deuda',
          type: 'line',
          data: dataDeuda,
          borderColor: '#cfb53c',
          backgroundColor: 'rgba(207, 181, 60, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#cfb53c',
          pointBorderColor: '#000d1a',
          pointBorderWidth: 2,
          borderWidth: 3
        },
        {
          label: 'Pagos realizados',
          type: 'line',
          data: dataPagos,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
  }

  function actualizarChartEvolucion() {
    if (!chartEvolucionInst) return;
    const sel = document.getElementById('selectEvolucion');
    const n   = sel ? parseInt(sel.value) : 12;
    chartEvolucionInst.data = buildDatosEvolucion(n);
    chartEvolucionInst.update();
  }

  /* --- Pagos por Mes (barras) --- */
  function initChartPagosMes() {
    const ctx = document.getElementById('chartPagosMes');
    if (!ctx) return;
    chartPagosMesInst = new Chart(ctx, {
      type: 'bar',
      data: buildDatosPagosMes(),
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: 'rgba(255, 255, 255, 0.5)', 
              callback: v => formatCurrency(v) 
            } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' }
          }
        }
      }
    });
  }

  function buildDatosPagosMes() {
    const mesesNombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const ahora = new Date();
    const labels = [], data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      labels.push(mesesNombres[d.getMonth()]);
      const suma = pagos
        .filter(p => {
          const f = new Date(p.fecha);
          return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear();
        })
        .reduce((s, p) => s + parseMoney(p.monto), 0);
      data.push(suma);
    }
    return {
      labels,
      datasets: [{
        label: 'Monto abonado',
        data,
        backgroundColor: 'rgba(207, 181, 60, 0.15)',
        borderColor: '#cfb53c',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#cfb53c'
      }]
    };
  }

  function actualizarChartPagosMes() {
    if (!chartPagosMesInst) return;
    chartPagosMesInst.data = buildDatosPagosMes();
    chartPagosMesInst.update();
  }



  /* ═══════════════════════════════════════════════════════════════
                      FILTROS / EXPORTAR
   ═══════════════════════════════════════════════════════════════ */
  const btnApp = document.getElementById('btnAplicarFiltros');
  const btnCle = document.getElementById('btnLimpiarFiltros');
  const btnPdf = document.getElementById('btnDescargarPDF');
  const btnExc = document.getElementById('btnExportarExcel');

  if (btnApp) btnApp.addEventListener('click', () => {
    renderTablaDeudas(1);
    // You can also add filter logic for Pagos if you want here, but we mainly applied it to Deudas
    renderHistorialPagos(1);
  });
  if (btnCle) btnCle.addEventListener('click', () => {
    document.getElementById('filtroEntidad').value = 'Todas';
    document.getElementById('filtroTipo').value = 'Todas';
    document.getElementById('filtroEstado').value = 'Todos';
    document.getElementById('filtroFecha').value = 'Este año';

    renderTablaDeudas(1);
    renderHistorialPagos(1);
  });
  if (btnPdf) btnPdf.addEventListener('click', () => {
    // Redirige al endpoint de Django que genera y descarga el PDF directamente
    // sin abrir el cuadro de impresión del navegador
    window.location.href = '/reporte/deudas/pdf/';
  });

  if (btnExc) btnExc.addEventListener('click', () => {
    if (deudas.length === 0 && pagos.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Encabezados combinados
    let csv = "--- RESUMEN DE DEUDAS ---\n";
    csv += "Acreedor,Tipo,Saldo Inicial,Saldo Actual,Tasa,Vencimiento,Estado\n";
    deudas.forEach(d => {
      csv += `"${d.acreedor}",${d.tipo},"${d.inicial}","${d.actual}",${d.tasa},${d.venc},${d.estado}\n`;
    });

    csv += "\n--- HISTORIAL DE PAGOS ---\n";
    csv += "Fecha Pago,Monto Abonado,Método de Pago,Notas\n";
    pagos.forEach(p => {
      csv += `${p.fecha},"${p.monto}",${p.metodo},"${(p.notas || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Deuda_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  /* ═══════════════════════════════════════════════════════════════
                        UTILIDADES
   ═══════════════════════════════════════════════════════════════ */
  function parseMoney(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Remove everything except numbers and commas, then convert comma to dot for parseFloat
    // Also remove dots if they are thousand separators
    let clean = String(str).replace(/[^\d,]/g, '');
    clean = clean.replace(/,/g, '.');
    return parseFloat(clean) || 0;
  }

  function formatCurrency(n) {
    if (n === undefined || n === null) return '---';
    const num = typeof n === 'number' ? n : parseMoney(n);
    // Force dot as thousand separator using 'de-DE' or similar, then add $
    const formatted = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(num));
    return `$ ${formatted}`;
  }

  function formatFecha(str) {
    if (!str) return '---';
    const p = str.split('-');
    if (p.length !== 3) return str;
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function poblarFiltrosEntidad() {
    const sel = document.getElementById('filtroEntidad');
    if (!sel) return;
    const entidades = [...new Set(deudas.map(d => d.acreedor))];
    const actual = sel.value;
    sel.innerHTML = '<option>Todas</option>' + entidades.map(e => `<option>${e}</option>`).join('');
    // Restaurar selección si sigue existiendo
    if ([...sel.options].some(o => o.value === actual)) sel.value = actual;
    else sel.value = 'Todas';
  }

}); // DOMContentLoaded

/* ─── Desplegar panel de usuario (fuera de DOMContentLoaded) ─── */
const botonPerfil  = document.getElementById("botonPerfil");
const panelUsuario = document.getElementById("panelUsuario");
if (botonPerfil) {
  botonPerfil.addEventListener("click", () => panelUsuario.classList.toggle("activo"));
}
