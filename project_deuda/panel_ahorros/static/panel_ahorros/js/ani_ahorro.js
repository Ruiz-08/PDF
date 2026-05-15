document.addEventListener("DOMContentLoaded", function () {
  // RESET TEMPORAL PARA PRUEBAS: Comprar moto
  localStorage.removeItem("progreso_meta_Comprar moto");
  localStorage.removeItem("historial_meta_Comprar moto");
  localStorage.removeItem("historial_detallado_meta_Comprar moto");
  localStorage.removeItem("finalizada_meta_Comprar moto");
  if(localStorage.getItem("metaSeleccionadaTitulo") === "Comprar moto") {
      localStorage.setItem("metaSeleccionadaActual", "0");
  }
  /* FRASE*/

  const frases = [
    "¡En la vida y en las finanzas, el riesgo es inevitable!",
    "¡El ahorro de hoy es la libertad de mañana!",
    "¡No gastes lo que no tienes para impresionar a quien no importa!",
    "¡Invertir en conocimiento es la mejor inversión!",
    "¡Controlar tus finanzas es controlar tu futuro!",
  ];

  const elementoFrase = document.getElementById("frase_motivadora");

  const indice = Math.floor(Math.random() * frases.length);

  elementoFrase.textContent = frases[indice];

  /* ===============================
       MODAL DE AVISO Y CIERRE GLOBAL
    =============================== */
  const modalAviso = document.getElementById("modalAviso");
  const mensajeAviso = document.getElementById("mensajeAviso");
  const btnAceptarAviso = document.getElementById("btnAceptarAviso");
  const modalCrearMeta = document.getElementById("modalCrearMeta");
  
  let metaEditando = null; // Título de la meta que se está editando
  let originalMetaTitle = ""; // Título original para referencia al guardar
  let metaAEliminar = null; // Meta pendiente de eliminación
  let originalValues = {}; // Para detectar cambios al editar
  let onAlertaClose = null;

  function mostrarAlerta(mensaje, callback) {
    if (mensajeAviso && modalAviso) {
      mensajeAviso.textContent = mensaje;
      modalAviso.classList.add("activo");
      document.body.style.overflow = 'hidden'; // Bloquear scroll
      onAlertaClose = callback;
    } else {
      alert(mensaje);
      if (callback) callback();
    }
  }

  if (btnAceptarAviso && modalAviso) {
    btnAceptarAviso.addEventListener("click", () => {
      modalAviso.classList.remove("activo");
      document.body.style.overflow = ''; // Restaurar scroll
      if (onAlertaClose) {
          onAlertaClose();
          onAlertaClose = null;
      }
    });
  }

  /* ===============================
       MODAL DE CONFIRMACIÓN
     =============================== */
  const modalConfirmar = document.getElementById("modalConfirmar");
  const mensajeConfirmar = document.getElementById("mensajeConfirmar");
  const btnConfirmarAceptar = document.getElementById("btnConfirmarAceptar");
  const btnConfirmarCancelar = document.getElementById("btnConfirmarCancelar");
  let onConfirmCallback = null;

  function mostrarConfirmacion(mensaje, callback) {
    if (mensajeConfirmar && modalConfirmar) {
      mensajeConfirmar.textContent = mensaje;
      modalConfirmar.classList.add("activo");
      document.body.style.overflow = 'hidden';
      onConfirmCallback = callback;
    } else {
      if (confirm(mensaje)) callback();
    }
  }

  if (btnConfirmarAceptar) {
    btnConfirmarAceptar.addEventListener("click", () => {
      modalConfirmar.classList.remove("activo");
      document.body.style.overflow = '';
      if (onConfirmCallback) {
        onConfirmCallback();
        onConfirmCallback = null;
      }
    });
  }

  if (btnConfirmarCancelar) {
    btnConfirmarCancelar.addEventListener("click", () => {
      modalConfirmar.classList.remove("activo");
      document.body.style.overflow = '';
      onConfirmCallback = null;
    });
  }

  /* ===============================
       MODAL DE ÉXITO (NUEVA META)
     =============================== */
  const modalExitoMeta = document.getElementById("modalExitoMeta");
  const btnIrAMetas = document.getElementById("btnIrAMetas");

  function mostrarExitoMeta() {
    if (modalExitoMeta) {
      modalExitoMeta.classList.add("activo");
      document.body.style.overflow = 'hidden';
    }
  }

  if (btnIrAMetas) {
    btnIrAMetas.addEventListener("click", () => {
      modalExitoMeta.classList.remove("activo");
      document.body.style.overflow = '';
      // Redirigir a la vista de carrusel (panel principal)
      if (typeof setView === 'function') {
        setView('carrusel');
      }
    });
  }

  // Cierre de modales al hacer clic fuera del contenido
  document.addEventListener("click", (e) => {
    // Si el clic fue directamente en el overlay oscuro del modal de crear
    if (modalCrearMeta && e.target === modalCrearMeta) {
      modalCrearMeta.classList.remove("activo");
      document.body.style.overflow = '';
    }
    // Si el clic fue directamente en el overlay oscuro del modal de aviso
    if (modalAviso && e.target === modalAviso) {
      modalAviso.classList.remove("activo");
      document.body.style.overflow = '';
    }
    // Si el clic fue directamente en el overlay oscuro del modal de confirmación
    if (modalConfirmar && e.target === modalConfirmar) {
      modalConfirmar.classList.remove("activo");
      document.body.style.overflow = '';
      onConfirmCallback = null;
    }
    // Si el clic fue directamente en el overlay oscuro del modal de eliminar
    const modalEliminar = document.getElementById("modalEliminarMeta");
    if (modalEliminar && e.target === modalEliminar) {
      modalEliminar.classList.remove("activo");
      document.body.style.overflow = '';
      metaAEliminar = null;
    }

    // Si el clic fue directamente en el overlay oscuro del modal de éxito
    if (modalExitoMeta && e.target === modalExitoMeta) {
      modalExitoMeta.classList.remove("activo");
      document.body.style.overflow = '';
      if (typeof setView === 'function') setView('carrusel');
    }

    // --- Lógica de Menú de Acciones (Tres Puntos) ---
    const btnMenu = e.target ? e.target.closest(".card-menu-btn") : null;
    if (btnMenu) {
      e.stopPropagation();
      const dropdown = btnMenu.parentElement.querySelector(".card-dropdown");
      
      // Cerrar otros dropdowns abiertos
      document.querySelectorAll('.card-dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });
      
      if (dropdown) {
        dropdown.classList.toggle('active');
      }
      return;
    } else if (e.target && !e.target.closest(".card-dropdown")) {
      // Cerrar todos los dropdowns si se hace clic fuera
      document.querySelectorAll('.card-dropdown.active').forEach(d => d.classList.remove('active'));
    }

    // --- Manejo de opción Editar ---
    if (e.target && (e.target.classList.contains("edit") || e.target.closest(".edit"))) {
      const btnEdit = e.target.classList.contains("edit") ? e.target : e.target.closest(".edit");
      const cardEdit = btnEdit.closest(".meta-card") || btnEdit.closest(".lista-meta-item");
      if (cardEdit) {
        const titleEl = cardEdit.querySelector(".meta-titulo, .lista-meta-nombre");
        const titulo = titleEl ? titleEl.textContent : "";
        const total = cardEdit.getAttribute("data-total") || "0";
        const aporte = cardEdit.getAttribute("data-aporte") || "0";
        const frecuencia = cardEdit.getAttribute("data-frecuencia") || "3";
        let bgUrl = cardEdit.style.backgroundImage;
        if (!bgUrl) {
            const thumb = cardEdit.querySelector('.lista-meta-thumb');
            if (thumb) bgUrl = thumb.style.backgroundImage;
        }

        // Cargar datos al modal
        if (tituloMetaInput) tituloMetaInput.value = titulo;
        if (montoTotalInput) {
            montoTotalInput.value = parseInt(total, 10).toLocaleString('es-CO');
            if (typeof calculateAporte === 'function') calculateAporte();
        }
        if (frecuenciaSlider) {
            frecuenciaSlider.value = frecuencia;
            frecuenciaSlider.dispatchEvent(new Event('input'));
        }
        
        if (btnSubirFoto) {
            btnSubirFoto.style.backgroundImage = bgUrl;
            btnSubirFoto.classList.add('has-photo');
            const cbFoto = document.getElementById("contenidoBotonFoto");
            if (cbFoto) cbFoto.style.display = "none";
        }

        const hTitle = document.querySelector('.crear-header h2');
        if (hTitle) hTitle.textContent = "EDITAR META";
        if (btnGuardarMeta) btnGuardarMeta.textContent = "GUARDAR CAMBIOS";

        metaEditando = titulo.trim();
        originalMetaTitle = titulo.trim();
        
        originalValues = {
            titulo: titulo.trim(),
            montoTotal: parseFloat(total),
            duracion: duracionSlider.value,
            frecuencia: frecuenciaSlider.value,
            foto: bgUrl
        };

        if (modalCrearMeta) {
            modalCrearMeta.classList.add("activo");
            document.body.style.overflow = 'hidden';
        }
        checkModalValidity();
      }
    }

    // --- Manejo de opción Eliminar ---
    if (e.target && (e.target.classList.contains("delete") || e.target.closest(".delete") || e.target.classList.contains("btn-eliminar-meta") || e.target.closest(".btn-eliminar-meta"))) {
      const cardDel = e.target.closest(".meta-card") || e.target.closest(".lista-meta-item");
      if (cardDel) {
        const titleEl = cardDel.querySelector(".meta-titulo, .lista-meta-nombre");
        const titulo = titleEl ? titleEl.textContent : "";
        
        // Obtener el índice real en el track original
        let trackIndex = cardDel.dataset.trackIndex;
        if (trackIndex === undefined) {
          const allTrackCards = Array.from(document.querySelectorAll('#carouselTrack .meta-card'));
          const foundIndex = allTrackCards.indexOf(cardDel);
          if (foundIndex !== -1) trackIndex = foundIndex;
        }

        metaAEliminar = {
          titulo: titulo,
          elemento: cardDel,
          trackIndex: trackIndex
        };
        const modalDel = document.getElementById("modalEliminarMeta");
        if (modalDel) {
            modalDel.classList.add("activo");
            document.body.style.overflow = 'hidden';
        }
      }
    }

    // --- Manejo de botón Aportar ---
    if (e.target && e.target.classList.contains("boton-aportar")) {
      const cardAp = e.target.closest(".meta-card");
      if (cardAp) {
        const titleEl = cardAp.querySelector(".meta-titulo");
        const titulo = titleEl ? titleEl.textContent : "Mi Meta";
        const actual = cardAp.getAttribute("data-actual") || "0";
        const total = cardAp.getAttribute("data-total") || "0";
        const aporte = cardAp.getAttribute("data-aporte") || "0";
        const frecuencia = cardAp.getAttribute("data-frecuencia") || "3";
        const bg = cardAp.style.backgroundImage;
        
        localStorage.setItem("metaSeleccionadaTitulo", titulo);
        localStorage.setItem("metaSeleccionadaImagen", bg);
        localStorage.setItem("metaSeleccionadaActual", actual);
        localStorage.setItem("metaSeleccionadaTotal", total);
        localStorage.setItem("metaSeleccionadaAporte", aporte);
        localStorage.setItem("metaSeleccionadaFrecuencia", frecuencia);
        
        window.location.href = "panel_aporte/aporte.html";
      }
    }
  });

  /* ===============================
       MOSTRAR NOMBRE DEL USUARIO
    =============================== */

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

  /* ===============================
       BOTÓN CONFIGURACIÓN ⚙️
    =============================== */

  const botonConfiguracion = document.getElementById("botonConfiguracion");

  const contenedorFlotante = document.querySelector(".contenedor-flotante");

  const botonesOpciones = document.querySelectorAll(".boton-opcion");

  if (botonConfiguracion) {
    botonConfiguracion.addEventListener("click", function (evento) {
      evento.stopPropagation();

      contenedorFlotante.classList.toggle("active");
    });
  }

  botonesOpciones.forEach(function (boton) {
    boton.addEventListener("click", function () {
      contenedorFlotante.classList.remove("active");
    });
  });

  document.addEventListener("click", function (evento) {
    if (contenedorFlotante && !contenedorFlotante.contains(evento.target)) {
      contenedorFlotante.classList.remove("active");
    }
  });

  const opcionesAvatar = document.querySelectorAll(".opcion-avatar");
  const contenedorAvatar = document.getElementById("contenedorAvatar");
  const panelEdicion = document.getElementById("panelEdicion");
  const inputNombre = document.getElementById("inputNombre");

  /* Toggle panel de edición al clickear el avatar */
  if (contenedorAvatar) {
    contenedorAvatar.addEventListener("click", function () {
      panelEdicion.classList.toggle("activo");
      if (panelEdicion.classList.contains("activo")) {
        inputNombre.value = elementoNombre.textContent;
        inputNombre.focus();
      }
    });
  }

  /* Cambiar nombre en tiempo real */
  if (inputNombre) {
    inputNombre.addEventListener("input", function () {
      const nuevoNombre = inputNombre.value || "Usuario";
      if (elementoNombre) elementoNombre.textContent = nuevoNombre;
      if (elementoNombreHeader) elementoNombreHeader.textContent = nuevoNombre;
      localStorage.setItem("nombre_usuario", nuevoNombre);
    });
  }

  /*X para cerrar panel de usuario */
  const cerrarPanelBtn = document.getElementById("cerrarPanel");
  if (cerrarPanelBtn) {
    cerrarPanelBtn.addEventListener("click", function () {
      document.getElementById("panelUsuario").classList.remove("activo");
      if (panelEdicion) panelEdicion.classList.remove("activo");
    });
  }
  /* ===============================
       BOTÓN CERRAR SESIÓN
    =============================== */

  const botonCerrar = document.querySelector(".boton-cerrar");

  if (botonCerrar) {
    botonCerrar.addEventListener("click", function () {
      window.location.href = "../Inicio/inicio.html";
    });
  }

  const pieAnio = document.getElementById("pie-anio");
  if (pieAnio) pieAnio.textContent = String(new Date().getFullYear());

  /* ===============================
       LÓGICA DEL CARRUSEL DE METAS
     =============================== */
  const track = document.getElementById('carouselTrack');
  let prevBtn = document.getElementById('prevBtn');
  let nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('carouselIndicators');
  let updateCarouselParams = null;

  function initCarousel() {
    if (!track || !prevBtn || !nextBtn) return;

    indicatorsContainer.innerHTML = "";
    if (updateCarouselParams) {
      window.removeEventListener('resize', updateCarouselParams);
      const prevClone = prevBtn.cloneNode(true);
      const nextClone = nextBtn.cloneNode(true);
      prevBtn.replaceWith(prevClone);
      nextBtn.replaceWith(nextClone);
      prevBtn = prevClone;
      nextBtn = nextClone;
    }

    const cards = Array.from(track.children);
    let currentIndex = 0;

    // Apply state to initial cards
    cards.forEach((card, index) => {
      const isCrear = card.classList.contains('card-crear');
      if (!isCrear) {
        const actual = card.getAttribute('data-actual') || "0";
        const total = card.getAttribute('data-total') || "0";
        const titulo = card.querySelector('.meta-titulo') ? card.querySelector('.meta-titulo').textContent : 'Mi Meta';
        applyMetaState(card, actual, total, titulo);
      }

      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      indicatorsContainer.appendChild(dot);
    });

    const dots = Array.from(indicatorsContainer.children);

    // Dynamically determine how many cards fit on screen
    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    function updateCarousel() {
      if (cards.length === 0) return;

      const visibleCount = getVisibleCount();
      const gap = 30;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const containerWidth = track.parentElement.getBoundingClientRect().width;
      const totalWidthNeeded = (cards.length * cardWidth) + ((cards.length - 1) * gap);

      // Clamp currentIndex so we never scroll past the last visible set
      const maxIndex = Math.max(0, cards.length - visibleCount);
      if (currentIndex > maxIndex) currentIndex = maxIndex;

      // Prev button state
      prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
      prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

      // Next button state
      const atEnd = currentIndex >= cards.length - visibleCount;
      nextBtn.style.opacity = (atEnd || totalWidthNeeded <= containerWidth + 5) ? '0.3' : '1';
      nextBtn.style.pointerEvents = (atEnd || totalWidthNeeded <= containerWidth + 5) ? 'none' : 'auto';

      // Show dots only when there are more cards than can be shown
      indicatorsContainer.style.display = cards.length <= visibleCount ? 'none' : 'flex';

      // Apply transform
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function goToSlide(index) {
      if (index < 0 || index >= cards.length) return;
      currentIndex = index;
      updateCarousel();
    }

    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCount();
      const maxIndex = cards.length - visibleCount;
      if (currentIndex < maxIndex) currentIndex++;
      else currentIndex = 0;
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCount();
      const maxIndex = cards.length - visibleCount;
      if (currentIndex > 0) currentIndex--;
      else currentIndex = maxIndex;
      updateCarousel();
    });

    updateCarouselParams = updateCarousel;
    window.addEventListener('resize', updateCarousel);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const trackContainer = track.parentElement;

    trackContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    trackContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        const visibleCount = getVisibleCount();
        const maxIndex = cards.length - visibleCount;
        if (diff > 0) {
          // swiped left → go next
          if (currentIndex < maxIndex) currentIndex++;
          else currentIndex = 0;
        } else {
          // swiped right → go prev
          if (currentIndex > 0) currentIndex--;
          else currentIndex = maxIndex;
        }
        updateCarousel();
      }
    }, { passive: true });

    updateCarousel();
  }

  initCarousel();

  /* ===============================
       PANEL DE USUARIO
     =============================== */
  const botonPerfil = document.getElementById("botonPerfil");
  const panelUsuario = document.getElementById("panelUsuario");

  if (botonPerfil) {
    botonPerfil.addEventListener("click", function () {
      panelUsuario.classList.toggle("activo");
    });
  }
  /* ===============================
       MODAL CREAR META
     =============================== */
  const cardCrear = document.querySelector(".card-crear");
  const cerrarModalCrear = document.getElementById("cerrarModalCrear");
  const btnCancelarCrear = document.getElementById("btnCancelarCrear");
  const btnGuardarMeta = document.getElementById("btnGuardarMeta");
  const tituloMetaInput = document.getElementById("tituloMeta");
  const montoTotalInput = document.getElementById("montoTotal");
  const btnSubirFoto = document.getElementById("btnSubirFoto");
  const duracionSlider = document.getElementById("duracionMeses");
  const frecuenciaSlider = document.getElementById("frecuenciaAporte");
  const inicioMes = document.getElementById("inicioMes");
  const inicioAno = document.getElementById("inicioAno");
  const metaMes = document.getElementById("metaMes");
  const metaAno = document.getElementById("metaAno");
  const montoAporte = document.getElementById("montoAporte");
  const duracionText = document.getElementById("duracionText");

  /** Sistema de validación visual */
  function setFieldError(input, message) {
    if (!input) return;
    input.classList.add("invalid");
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-msg")) {
      errorEl = document.createElement("span");
      errorEl.className = "error-msg";
      input.insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove("invalid");
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-msg")) {
      errorEl.textContent = "";
    }
  }

  function checkModalValidity() {
    if (!btnGuardarMeta) return;
    let isValid = true;

    // 1. Validar Título
    const tit = (tituloMetaInput.value || "").trim();
    if (tit.length < 3 || tit.length > 60) {
      isValid = false;
    }

    // 2. Validar Monto Total
    const totalStr = montoTotalInput.value.replace(/\D/g, "");
    const total = parseFloat(totalStr) || 0;
    if (total < 1000) {
      isValid = false;
    }

    // 3. Validar Fechas (Meta posterior a Inicio)
    const startM = parseInt(inicioMes.value, 10);
    const startY = parseInt(inicioAno.value, 10);
    const endM = parseInt(metaMes.value, 10);
    const endY = parseInt(metaAno.value, 10);
    const startDate = new Date(startY, startM, 1);
    const endDate = new Date(endY, endM, 1);

    if (endDate <= startDate) {
      setFieldError(metaMes, "La fecha meta debe ser posterior al inicio");
      isValid = false;
    } else {
      clearFieldError(metaMes);
    }

    // 4. Lógica de botón según Modo (Crear o Editar)
    if (metaEditando) {
      // Validar que el nuevo total no sea menor a lo ya ahorrado
      const actual = parseFloat(localStorage.getItem(`progreso_meta_${originalMetaTitle}`) || "0");
      if (total < actual) {
        setFieldError(montoTotalInput, "El monto objetivo no puede ser menor al ya ahorrado");
        isValid = false;
      }

      // Comprobar si realmente hubo cambios para habilitar el botón
      const hasChanged = 
        tit !== originalValues.titulo ||
        total !== originalValues.montoTotal ||
        duracionSlider.value !== originalValues.duracion ||
        frecuenciaSlider.value !== originalValues.frecuencia ||
        btnSubirFoto.style.backgroundImage !== originalValues.foto;

      btnGuardarMeta.disabled = !(isValid && hasChanged);
    } else {
      // Modo Crear: solo importa que sea válido
      btnGuardarMeta.disabled = !isValid;
    }

    // Advertencia de lógica (opcional)
    validatePlanLogic();

    return isValid;
  }

  function validatePlanLogic() {
    const total = parseFloat(montoTotalInput.value.replace(/\D/g, "")) || 0;
    const months = parseInt(duracionSlider.value, 10);
    const freq = parseInt(frecuenciaSlider.value, 10);
    
    let pagos = months;
    if (freq === 1) pagos = months * 4;
    else if (freq === 2) pagos = months * 2;
    
    const aporteCalculado = Math.ceil(total / (pagos || 1));
    const warningEl = document.getElementById("warningLogica");
    
    // Si por alguna razón el aporte es 0 pero hay meta, mostrar advertencia
    if (warningEl) {
      if (total > 0 && aporteCalculado <= 0) {
        warningEl.style.display = "block";
      } else {
        warningEl.style.display = "none";
      }
    }
  }

  function setupRealTimeValidation() {
    const inputs = [tituloMetaInput, montoTotalInput];
    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener("input", () => {
        if (input === tituloMetaInput) {
          const val = input.value.trim();
          if (val.length === 0) setFieldError(input, "Este campo es obligatorio");
          else if (val.length < 3) setFieldError(input, "Mínimo 3 caracteres");
          else if (val.length > 60) setFieldError(input, "Máximo 60 caracteres");
          else clearFieldError(input);
        } else if (input === montoTotalInput) {
          const val = parseFloat(input.value.replace(/\D/g, "")) || 0;
          if (val < 1000) setFieldError(input, "El monto debe ser mayor a 1.000");
          else clearFieldError(input);
        }
        checkModalValidity();
      });
    });

    duracionSlider.addEventListener("input", checkModalValidity);
    frecuenciaSlider.addEventListener("input", checkModalValidity);
    
    [inicioMes, inicioAno, metaMes, metaAno].forEach(sel => {
      if (sel) sel.addEventListener("change", checkModalValidity);
    });
  }

  setupRealTimeValidation();

  const closeModal = () => {
    if (modalCrearMeta) modalCrearMeta.classList.remove("activo");
    document.body.style.overflow = ''; // Restaurar scroll
  };

  const resetModal = () => {
    metaEditando = null;
    originalMetaTitle = "";
    const headerTitle = document.querySelector('.crear-header h2');
    if (headerTitle) headerTitle.textContent = "CREAR NUEVA META";
    if (btnGuardarMeta) btnGuardarMeta.textContent = "GUARDAR Y CREAR META";
    
    if (tituloMetaInput) tituloMetaInput.value = "";
    if (montoTotalInput) montoTotalInput.value = "";
    if (btnSubirFoto) {
      btnSubirFoto.style.backgroundImage = "";
      btnSubirFoto.classList.remove('has-photo');
      const contBoton = document.getElementById("contenidoBotonFoto");
      if (contBoton) contBoton.style.display = "flex";
      const txtBoton = document.getElementById("textoSubirFoto");
      if (txtBoton) txtBoton.innerHTML = "SUBIR<br>FOTO";
    }

    // Limpiar errores visuales
    document.querySelectorAll(".crear-input").forEach(clearFieldError);
    checkModalValidity();
  };

  if (cardCrear) {
    cardCrear.addEventListener("click", () => {
      resetModal();
      if (modalCrearMeta) modalCrearMeta.classList.add("activo");
      document.body.style.overflow = 'hidden'; // Bloquear scroll
    });
  }

  if (cerrarModalCrear) cerrarModalCrear.addEventListener("click", closeModal);
  if (btnCancelarCrear) btnCancelarCrear.addEventListener("click", closeModal);

  if (btnGuardarMeta) {
    btnGuardarMeta.addEventListener("click", () => {
        const titulo = tituloMetaInput && tituloMetaInput.value.trim() ? tituloMetaInput.value : "Mi Meta";
        const metaMontoStr = montoTotalInput && montoTotalInput.value.trim() ? montoTotalInput.value : "0";
        
        const montoTotalNum = parseFloat(metaMontoStr.replace(/[^0-9]/g, "")) || 0;

        let bgImage = "url('img/default_meta.png')"; // Imagen por defecto (moneda y degrade)
        if (btnSubirFoto && btnSubirFoto.style.backgroundImage && btnSubirFoto.style.backgroundImage !== 'initial' && btnSubirFoto.style.backgroundImage !== 'none') {
          bgImage = btnSubirFoto.style.backgroundImage;
        }

        const montoAporteNum = montoAporte ? parseFloat(montoAporte.value.replace(/[^0-9]/g, "")) || 0 : 0;
        const frecuenciaVal = frecuenciaSlider ? frecuenciaSlider.value : "3";

        const ejecutarGuardado = () => {
            if (metaEditando) {
                // LÓGICA DE EDICIÓN
                const cards = Array.from(document.querySelectorAll('.meta-card:not(.card-crear), .lista-meta-item:not(.lista-crear)'));
                const cardAEditar = cards.find(c => {
                    const titleEl = c.querySelector('.meta-titulo') || c.querySelector('.lista-meta-nombre');
                    return titleEl && titleEl.textContent.trim() === originalMetaTitle;
                });
                
                if (cardAEditar) {
                    // Actualizar atributos y visual
                    cardAEditar.style.backgroundImage = bgImage;
                    cardAEditar.setAttribute("data-total", montoTotalNum);
                    cardAEditar.setAttribute("data-aporte", montoAporteNum);
                    cardAEditar.setAttribute("data-frecuencia", frecuenciaVal);
                    
                    const titleEl = cardAEditar.querySelector('.meta-titulo');
                    if (titleEl) titleEl.textContent = titulo;
                    
                    // Si el título cambió, actualizar localStorage
                    if (titulo !== originalMetaTitle) {
                        // Migrar datos de progreso e historial si es necesario
                        const progreso = localStorage.getItem(`progreso_meta_${originalMetaTitle}`);
                        if (progreso) {
                            localStorage.setItem(`progreso_meta_${titulo}`, progreso);
                            localStorage.removeItem(`progreso_meta_${originalMetaTitle}`);
                        }
                        const historial = localStorage.getItem(`historial_meta_${originalMetaTitle}`);
                        if (historial) {
                            localStorage.setItem(`historial_meta_${titulo}`, historial);
                            localStorage.removeItem(`historial_meta_${originalMetaTitle}`);
                        }
                        const historialDet = localStorage.getItem(`historial_detallado_meta_${originalMetaTitle}`);
                        if (historialDet) {
                            localStorage.setItem(`historial_detallado_meta_${titulo}`, historialDet);
                            localStorage.removeItem(`historial_detallado_meta_${originalMetaTitle}`);
                        }
                    }
                    
                    const actual = parseFloat(cardAEditar.getAttribute('data-actual') || '0');
                    applyMetaState(cardAEditar, actual, montoTotalNum, titulo, !!cardAEditar.closest('#cardGrid'));
                    
                    saveMetasToStorage(); // Persistir cambios tras editar
                    mostrarAlerta("Meta actualizada exitosamente");
                }
            } else {
                // LÓGICA DE CREACIÓN (Dinámica)
                const metaData = {
                  titulo: titulo,
                  actual: "0",
                  total: String(montoTotalNum),
                  aporte: String(montoAporteNum),
                  frecuencia: frecuenciaVal,
                  imagen: bgImage
                };

                const newCard = createMetaCardElement(metaData);

                if (track) {
                  track.insertBefore(newCard, cardCrear);
                }

                saveMetasToStorage(); // Persistir cambios

                if (typeof closeModal === 'function') closeModal();
                mostrarExitoMeta();
            }

            // Actualizar vista y carrusel
            if (typeof initCarousel === 'function') initCarousel();
            
            // Si estábamos editando, actualizamos los valores originales para que el botón se deshabilite
            if (metaEditando) {
                originalValues = {
                    titulo: titulo,
                    montoTotal: montoTotalNum,
                    duracion: duracionSlider.value,
                    frecuencia: frecuenciaVal,
                    foto: bgImage
                };
                originalMetaTitle = titulo;
                metaEditando = titulo;
                checkModalValidity();
            } else {
                // Si era una creación nueva, sí reseteamos para permitir crear otra si se desea
                resetModal();
            }
        };

        if (metaEditando) {
            // Validar cambios críticos antes de proceder
            const isCriticalChange = 
                montoTotalNum !== originalValues.montoTotal ||
                duracionSlider.value !== originalValues.duracion ||
                frecuenciaVal !== originalValues.frecuencia;

            if (isCriticalChange) {
                mostrarConfirmacion("Estos cambios afectarán el cálculo de tu meta. ¿Deseas continuar?", ejecutarGuardado);
                return;
            }
        }

        ejecutarGuardado();
      });
    }


  /* ===============================
       LOGICA DE ELIMINACION DE META
     =============================== */
  const modalEliminar = document.getElementById("modalEliminarMeta");
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminarMeta");
  const btnCancelarEliminar = document.getElementById("btnCancelarEliminarMeta");
  const btnCancelarEliminarX = document.getElementById("btnCancelarEliminarMetaX");
  const btnDescargarHistorial = document.getElementById("btnDescargarHistorialEliminar");

  const closeDeleteModal = () => {
    if (modalEliminar) modalEliminar.classList.remove("activo");
    document.body.style.overflow = ''; // Restaurar scroll
    metaAEliminar = null;
  };

  if (btnCancelarEliminar) btnCancelarEliminar.addEventListener("click", closeDeleteModal);
  if (btnCancelarEliminarX) btnCancelarEliminarX.addEventListener("click", closeDeleteModal);

  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener("click", () => {
      if (metaAEliminar) {
        const { titulo, trackIndex } = metaAEliminar;
        
        // Obtener todas las tarjetas originales del track
        const trackCards = Array.from(document.querySelectorAll('#carouselTrack .meta-card'));
        let originalCard;

        if (trackIndex !== undefined) {
          originalCard = trackCards[parseInt(trackIndex, 10)];
        } else {
          // Fallback por título si el índice fallara por alguna razón
          originalCard = trackCards.find(c => {
            const t = c.querySelector(".meta-titulo");
            return t && t.textContent === titulo;
          });
        }

        if (originalCard) originalCard.remove();
        
        saveMetasToStorage(); // Persistir tras eliminar

        // Limpiar localStorage de metadatos específicos
        localStorage.removeItem(`progreso_meta_${titulo}`);
        localStorage.removeItem(`historial_meta_${titulo}`);
        localStorage.removeItem(`historial_detallado_meta_${titulo}`);

        // Refrescar vistas
        const currentView = localStorage.getItem('vistaMetas') || 'carrusel';
        if (currentView === 'lista') buildListaView();
        else if (currentView === 'card') buildCardGridView();
        else if (typeof initCarousel === 'function') initCarousel();

        modalEliminar.classList.remove("activo");
        document.body.style.overflow = ''; // Restaurar scroll
        metaAEliminar = null;
        mostrarAlerta("Meta eliminada exitosamente");
      }
    });
  }

  if (btnDescargarHistorial) {
    btnDescargarHistorial.addEventListener("click", () => {
      if (metaAEliminar) {
        const { titulo } = metaAEliminar;
        // Aquí llamaríamos a la lógica de exportación que ya existe en aporte.html
        // Por ahora simulamos la intención
        mostrarAlerta(`Descargando historial de ${titulo}... (Función en desarrollo)`);
      }
    });
  }

  function applyMetaState(card, actual, total, titulo, isGrid = false) {
    const isFinalized = localStorage.getItem(`finalizada_meta_${titulo}`) === "true";
    const isCompleted = (parseFloat(actual) >= parseFloat(total) && parseFloat(total) > 0) || isFinalized;
    const overlay = card.querySelector(".card-overlay");
    const footer = card.querySelector(".card-footer");
    
    if (isCompleted) {
      card.classList.add("completada");
      
      // Bloquear/Ocultar el menú de acciones en metas completadas
      const menuBtn = card.querySelector(".card-menu-container");
      if (menuBtn) menuBtn.style.display = "none";

      // Añadir contenedor de éxito en el centro si no existe
      if (!card.querySelector(".success-center-container")) {
        const successContainer = document.createElement("div");
        successContainer.className = "success-center-container";
        
        // Solo mostramos el badge superior si NO estamos en vista Grid (según solicitud)
        const badgeHTML = isGrid ? '' : '<div class="meta-completada-badge">Meta completada</div>';
        
        successContainer.innerHTML = `
          ${badgeHTML}
          <div class="trophy-icon">
            <img src="img/logro.png" alt="Logro" />
          </div>
        `;
        card.appendChild(successContainer);
      } else if (isGrid) {
        // Si ya existe pero estamos en grid, nos aseguramos de quitar el badge si estuviera
        const badge = card.querySelector(".meta-completada-badge");
        if (badge) badge.remove();
      }

      // El badge antiguo lo removemos si existiera (limpieza)
      const oldBadge = card.querySelector(".badge-completada");
      if (oldBadge) oldBadge.remove();

      // Modificar footer
      if (footer) {
        // Cambiar texto para vista grid
        const footerLabel = isGrid ? '<span style="color: #2ecc71; font-weight: 700;">✔ Meta completada</span>' : 'Objetivo logrado';
        
        footer.innerHTML = `
          <div class="progreso-info">
            <div class="progreso-texto">
              <span>${footerLabel}</span>
              <span>100%</span>
            </div>
            <div class="progreso-bar">
              <div class="progreso-fill" style="width: 100%; background: linear-gradient(90deg, #b8860b, #cfb53c, #b8860b);"></div>
            </div>
          </div>
          <button class="btn-eliminar-meta"><i class="fas fa-trash-alt"></i> Eliminar</button>
        `;
      }
    } else {
      // Si no está completada, nos aseguramos de que no tenga estilos de completada
      card.classList.remove("completada");
      const successContainer = card.querySelector(".success-center-container");
      if (successContainer) successContainer.remove();
      
      // Mostrar el menú de nuevo si estaba oculto
      const menuBtn = card.querySelector(".card-menu-container");
      if (menuBtn) menuBtn.style.display = "block";

      const pct = total > 0 ? Math.min(100, Math.round((actual / total) * 100)) : 0;
      
      // Determinar color de barra según progreso
      let colorBarra = "linear-gradient(90deg, #ff4d4d, #cfb53c)"; // Bajo (Rojo/Dorado)
      if (pct >= 100) {
        colorBarra = "linear-gradient(90deg, #b8860b, #cfb53c, #b8860b)"; // 100% (Oro)
      } else if (pct >= 40) {
        colorBarra = "linear-gradient(90deg, #2ecc71, #cfb53c)"; // Medio (Verde/Dorado)
      }

      // Restaurar footer si era el de completada
      if (footer && (card.querySelector(".btn-eliminar-meta") || footer.innerHTML.includes("Objetivo logrado"))) {
        footer.innerHTML = `
          <div class="progreso-info">
            <div class="progreso-texto">
              ${isGrid ? `<span>Progreso</span><span class="monto-dinamico">${pct}%</span>` : `Progreso: <span class="monto-dinamico">${pct}%</span>`}
            </div>
            <div class="progreso-bar">
              <div class="progreso-fill" style="width: ${pct}%; background: ${colorBarra};"></div>
            </div>
          </div>
          <button class="boton-aportar">Aportar</button>
        `;
      } else {
        const textoProgreso = card.querySelector(".monto-dinamico") || card.querySelector(".progreso-texto span:last-child");
        if (textoProgreso) textoProgreso.textContent = `${pct}%`;
        const fill = card.querySelector(".progreso-fill");
        if (fill) {
          fill.style.width = `${pct}%`;
          fill.style.background = colorBarra;
        }
      }
    }
  }

  /* ===============================
       BOTON SUBIR FOTO META
     =============================== */
  const inputFotoMeta = document.getElementById("inputFotoMeta");
  const contenidoBotonFoto = document.getElementById("contenidoBotonFoto");
  const textoSubirFoto = document.getElementById("textoSubirFoto");

  if (btnSubirFoto && inputFotoMeta) {
    btnSubirFoto.addEventListener("click", () => {
      inputFotoMeta.click();
    });

    inputFotoMeta.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        // Validar tamaño (2MB)
        if (file.size > 2 * 1024 * 1024) {
          mostrarAlerta("La imagen es demasiado grande. Máximo 2MB.");
          e.target.value = "";
          return;
        }
        // Validar formato
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) {
          mostrarAlerta("Formato no permitido. Usa JPG, PNG o WEBP.");
          e.target.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = function (evento) {
          btnSubirFoto.style.background = `url('${evento.target.result}') center/cover no-repeat`;
          if (contenidoBotonFoto) contenidoBotonFoto.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        btnSubirFoto.style.background = "";
        if (contenidoBotonFoto) contenidoBotonFoto.style.display = "flex";
        if (textoSubirFoto) textoSubirFoto.innerHTML = "SUBIR<br>FOTO";
      }
    });
  }

   /* LÓGICA DE CALCULADORA DE METAS */

  const mesesArray = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  if (montoTotalInput && duracionSlider && inicioMes && metaMes) {
    const currentDate = new Date();
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth();

    // Populate Months
    [inicioMes, metaMes].forEach(select => {
      select.innerHTML = "";
      mesesArray.forEach((m, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = m;
        select.appendChild(option);
      });
    });

    // Populate Years
    [inicioAno, metaAno].forEach(select => {
      select.innerHTML = "";
      for (let i = 0; i <= 10; i++) {
        const option = document.createElement("option");
        option.value = curYear + i;
        option.textContent = curYear + i;
        select.appendChild(option);
      }
    });

    // Set Initials
    inicioMes.value = curMonth;
    inicioAno.value = curYear;

    function formatCurrency(val) {
      val = val.replace(/\D/g, "");
      if (val === "") return "";
      return parseInt(val, 10).toLocaleString("es-CO");
    }

    function calculateAporte() {
      let total = parseFloat(montoTotalInput.value.replace(/\D/g, "")) || 0;
      let months = parseInt(duracionSlider.value, 10) || 1;
      let freq = parseInt(frecuenciaSlider.value, 10) || 3;

      let pagos = months;
      if (freq === 1) pagos = months * 4; // SEMANAL
      else if (freq === 2) pagos = months * 2; // QUINCENAL
      else if (freq === 3) pagos = months * 1; // MENSUAL

      let aporte = total / (pagos || 1);
      montoAporte.value = total === 0 ? "0" : Math.ceil(aporte).toLocaleString("es-CO");
    }

    function updateMetaDateFromSlider() {
      let monthsToAdd = parseInt(duracionSlider.value, 10);
      let startM = parseInt(inicioMes.value, 10);
      let startY = parseInt(inicioAno.value, 10);

      let endM = (startM + monthsToAdd) % 12;
      let endY = startY + Math.floor((startM + monthsToAdd) / 12);

      if (endY > curYear + 10) {
        endY = curYear + 10;
        endM = 11;
      }

      metaMes.value = endM;
      metaAno.value = endY;

      duracionText.textContent = `${monthsToAdd} M`;
      calculateAporte();
    }

    function updateSliderFromMetaDate() {
      let startM = parseInt(inicioMes.value, 10);
      let startY = parseInt(inicioAno.value, 10);
      let endM = parseInt(metaMes.value, 10);
      let endY = parseInt(metaAno.value, 10);

      let diffMonths = (endY - startY) * 12 + (endM - startM);
      if (diffMonths < 1) {
        diffMonths = 1;
        endM = (startM + 1) % 12;
        endY = startY + Math.floor((startM + 1) / 12);
        metaMes.value = endM;
        metaAno.value = endY;
      }
      if (diffMonths > 120) diffMonths = 120;

      duracionSlider.value = diffMonths;
      duracionText.textContent = `${diffMonths} M`;
      calculateAporte();
    }

    montoTotalInput.addEventListener("input", (e) => {
      let rawVal = e.target.value.replace(/\D/g, "");
      e.target.value = formatCurrency(rawVal);
      calculateAporte();
    });

    duracionSlider.addEventListener("input", updateMetaDateFromSlider);
    inicioMes.addEventListener("change", updateSliderFromMetaDate);
    inicioAno.addEventListener("change", updateSliderFromMetaDate);
    metaMes.addEventListener("change", updateSliderFromMetaDate);
    metaAno.addEventListener("change", updateSliderFromMetaDate);
    frecuenciaSlider.addEventListener("input", calculateAporte);

    updateMetaDateFromSlider();
  }

  /* ===============================
       SELECTOR DE VISTA (Carrusel / Cards / Lista)
     =============================== */

  const seccionMetas = document.querySelector('.seccion-metas');
  const listaMetas   = document.getElementById('listaMetas');
  const cardGrid     = document.getElementById('cardGrid');
  const viewBtns     = document.querySelectorAll('.view-btn');

  // Paginación
  let currentPage = 1;
  const itemsPerPage = 8;
  const paginationContainer = document.getElementById('paginationContainer');

  // Vista guardada en localStorage (default: carrusel)
  const vistaGuardada = localStorage.getItem('vistaMetas') || 'carrusel';

  /** Renderiza los controles de paginación */
  function renderPagination(totalItems, vista) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    
    // Si la vista es carrusel o no hay suficientes items, se oculta
    if (vista === 'carrusel' || totalItems <= itemsPerPage) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    paginationContainer.style.display = 'flex';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn page-nav';
    prevBtn.innerHTML = '&lt;';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        if (vista === 'lista') buildListaView();
        else if (vista === 'card') buildCardGridView();
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        if (vista === 'lista') buildListaView();
        else if (vista === 'card') buildCardGridView();
      });
      paginationContainer.appendChild(pageBtn);
    }

    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn page-nav';
    nextBtn.innerHTML = '&gt;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        if (vista === 'lista') buildListaView();
        else if (vista === 'card') buildCardGridView();
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  /** Construye la vista lista a partir de las tarjetas del track */
  function buildListaView() {
    listaMetas.innerHTML = '';
    const allCards = Array.from(document.querySelectorAll('#carouselTrack .meta-card'));
    renderPagination(allCards.length, 'lista');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const cards = allCards.slice(startIndex, startIndex + itemsPerPage);

    cards.forEach((card, indexInView) => {
      const isCrear = card.classList.contains('card-crear');

      if (isCrear) {
        const row = document.createElement('div');
        row.className = 'lista-meta-item lista-crear';
        row.innerHTML = '<div class="lista-crear-inner"><div class="lista-crear-icon"><i class="fa-solid fa-plus"></i></div><span>Crear tu propia meta</span></div>';
        row.addEventListener('click', () => card.click());
        listaMetas.appendChild(row);
        return;
      }

      const titulo = card.querySelector('.meta-titulo') ? card.querySelector('.meta-titulo').textContent : 'Mi Meta';
      const actual = parseFloat(card.getAttribute('data-actual') || '0');
      const total  = parseFloat(card.getAttribute('data-total') || '0');
      const pct    = total > 0 ? Math.min(100, Math.round((actual / total) * 100)) : 0;
      const bgImage = card.style.backgroundImage || '';

      const isFinalized = localStorage.getItem(`finalizada_meta_${titulo}`) === "true";
      const isCompleted = (actual >= total && total > 0) || isFinalized;
      
      // Determinar color de barra según progreso
      let colorBarra = "linear-gradient(90deg, #ff4d4d, #cfb53c)"; 
      if (pct >= 100) {
        colorBarra = "linear-gradient(90deg, #b8860b, #cfb53c, #b8860b)";
      } else if (pct >= 40) {
        colorBarra = "linear-gradient(90deg, #2ecc71, #cfb53c)";
      }

      const row = document.createElement('div');
      row.className = `lista-meta-item ${isCompleted ? 'completada' : ''}`;
      row.dataset.trackIndex = startIndex + indexInView;

      // Creamos el thumb por separado para evitar conflicto de comillas en atributos inline
      const thumb = document.createElement('div');
      thumb.className = 'lista-meta-thumb';
      thumb.style.backgroundImage = bgImage || "url('img/default_meta.png')";

      const info = document.createElement('div');
      info.className = 'lista-meta-info';
      info.innerHTML = `
        <div class="lista-meta-nombre">${titulo}</div>
        <div class="lista-meta-progreso-wrap">
          <div class="lista-meta-texto">
            <span class="${isCompleted ? 'texto-meta-completada' : ''}">${isCompleted ? '✔ Meta completada' : 'Progreso'}</span>
            <span>${pct}%</span>
          </div>
          <div class="lista-meta-bar">
            <div class="lista-meta-fill" style="width: ${pct}%; background: ${colorBarra};"></div>
          </div>
        </div>
      `;

      // Si está completada, añadimos el icono de logro al thumb
      if (isCompleted) {
        thumb.innerHTML = `
          <div class="trophy-icon-list-container">
            <img src="img/logro.png" class="trophy-icon-list" alt="Logro">
          </div>
        `;
      }

      const actions = document.createElement('div');
      actions.className = 'card-menu-container';
      actions.innerHTML = `
        <button class="card-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
        <div class="card-dropdown">
          <button class="dropdown-item edit"><i class="fas fa-edit"></i> Editar</button>
          <button class="dropdown-item delete"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </div>
      `;
      if (isCompleted) {
        actions.style.pointerEvents = 'none';
        actions.style.opacity = '0.5';
      }
      const btn = document.createElement('button');
      if (isCompleted) {
        btn.className = 'btn-eliminar-meta';
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
      } else {
        btn.className = 'lista-meta-btn';
        btn.textContent = 'Aportar';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const ap = card.getAttribute('data-aporte') || "0";
          const fr = card.getAttribute('data-frecuencia') || "3";
          localStorage.setItem('metaSeleccionadaTitulo', titulo);
          localStorage.setItem('metaSeleccionadaImagen', bgImage);
          localStorage.setItem('metaSeleccionadaActual', String(actual));
          localStorage.setItem('metaSeleccionadaTotal', String(total));
          localStorage.setItem('metaSeleccionadaAporte', ap);
          localStorage.setItem('metaSeleccionadaFrecuencia', fr);
          window.location.href = 'panel_aporte/aporte.html';
        });
      }

      row.appendChild(thumb);
      row.appendChild(info);
      row.appendChild(actions);
      row.appendChild(btn);

      listaMetas.appendChild(row);
    });
  }

  /** Construye la vista card-grid clonando las tarjetas del track */
  function buildCardGridView() {
    cardGrid.innerHTML = '';
    const allCards = Array.from(document.querySelectorAll('#carouselTrack .meta-card'));
    renderPagination(allCards.length, 'card');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const cards = allCards.slice(startIndex, startIndex + itemsPerPage);

    cards.forEach((card, indexInView) => {
      const clone = card.cloneNode(true);
      clone.dataset.trackIndex = startIndex + indexInView;
      const isCrear = clone.classList.contains('card-crear');

      if (!isCrear) {
        const actual = clone.getAttribute('data-actual') || "0";
        const total = clone.getAttribute('data-total') || "0";
        const titulo = clone.querySelector('.meta-titulo') ? clone.querySelector('.meta-titulo').textContent : 'Mi Meta';
        applyMetaState(clone, actual, total, titulo, true);
      }

      const btnAportar = clone.querySelector('.boton-aportar');
      if (btnAportar) {
        btnAportar.addEventListener('click', (e) => {
          e.stopPropagation();
          const t  = clone.querySelector('.meta-titulo') ? clone.querySelector('.meta-titulo').textContent : 'Mi Meta';
          const ac = clone.getAttribute('data-actual') || '0';
          const to = clone.getAttribute('data-total') || '0';
          const ap = clone.getAttribute('data-aporte') || '0';
          const fr = clone.getAttribute('data-frecuencia') || '3';
          const bg = clone.style.backgroundImage;
          localStorage.setItem('metaSeleccionadaTitulo', t);
          localStorage.setItem('metaSeleccionadaImagen', bg);
          localStorage.setItem('metaSeleccionadaActual', ac);
          localStorage.setItem('metaSeleccionadaTotal', to);
          localStorage.setItem('metaSeleccionadaAporte', ap);
          localStorage.setItem('metaSeleccionadaFrecuencia', fr);
          window.location.href = 'panel_aporte/aporte.html';
        });
      }

      if (isCrear) {
        clone.addEventListener('click', () => {
          if (typeof resetModal === 'function') resetModal();
          const m = document.getElementById('modalCrearMeta');
          if (m) m.classList.add('activo');
        });
      }

      cardGrid.appendChild(clone);
    });
  }

  /** Activa una vista */
  function setView(vista) {
    const vistaAnterior = localStorage.getItem('vistaMetas');
    if (vistaAnterior !== vista) {
      currentPage = 1; // Reiniciar a página 1 si cambia la vista
    }
    
    localStorage.setItem('vistaMetas', vista);
    seccionMetas.classList.remove('vista-lista', 'vista-card');
    viewBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === vista));

    if (vista === 'lista') {
      seccionMetas.classList.add('vista-lista');
      buildListaView();
    } else if (vista === 'card') {
      seccionMetas.classList.add('vista-card');
      buildCardGridView();
    } else if (vista === 'carrusel') {
      if (paginationContainer) paginationContainer.style.display = 'none';
    }
  }

  viewBtns.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

  // Aplicar vista guardada al cargar
  setView(vistaGuardada);

  /* ===============================
       SISTEMA DINÁMICO DE PERSISTENCIA
     =============================== */

  function createMetaCardElement(data) {
    const { titulo, actual, total, aporte, frecuencia, imagen } = data;
    const newCard = document.createElement("div");
    newCard.className = "meta-card";
    newCard.style.backgroundImage = imagen || "url('img/default_meta.png')";
    newCard.setAttribute("data-actual", actual || "0");
    newCard.setAttribute("data-total", total || "0");
    newCard.setAttribute("data-aporte", aporte || "0");
    newCard.setAttribute("data-frecuencia", frecuencia || "3");

    newCard.innerHTML = `
      <div class="card-menu-container">
        <button class="card-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
        <div class="card-dropdown">
          <button class="dropdown-item edit"><i class="fas fa-edit"></i> Editar</button>
          <button class="dropdown-item delete"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </div>
      </div>
      <div class="card-overlay">
        <div class="card-header">
          <span class="meta-label">Mi meta:</span>
          <h2 class="meta-titulo">${titulo}</h2>
        </div>
        <div class="card-footer">
          <div class="progreso-info">
            <div class="progreso-texto">Progreso: <span class="monto-dinamico">0%</span></div>
            <div class="progreso-bar">
              <div class="progreso-fill" style="width: 0%;"></div>
            </div>
          </div>
          <button class="boton-aportar">Aportar</button>
        </div>
      </div>
    `;

    applyMetaState(newCard, parseFloat(actual || 0), parseFloat(total || 0), titulo);
    return newCard;
  }

  function saveMetasToStorage() {
    const track = document.getElementById("carouselTrack");
    if (!track) return;
    const cards = Array.from(track.querySelectorAll(".meta-card:not(.card-crear)"));
    const metasData = cards.map(card => ({
      titulo: card.querySelector(".meta-titulo").textContent.trim(),
      actual: card.getAttribute("data-actual"),
      total: card.getAttribute("data-total"),
      aporte: card.getAttribute("data-aporte"),
      frecuencia: card.getAttribute("data-frecuencia"),
      imagen: card.style.backgroundImage
    }));
    localStorage.setItem("metas_usuario_lista", JSON.stringify(metasData));
  }

  function loadMetasFromStorage() {
    const track = document.getElementById("carouselTrack");
    const cardCrear = document.getElementById("cardCrear");
    if (!track || !cardCrear) return;

    // Limpiar track (excepto cardCrear)
    Array.from(track.querySelectorAll(".meta-card:not(.card-crear)")).forEach(c => c.remove());

    const data = localStorage.getItem("metas_usuario_lista");
    if (data) {
      const metasData = JSON.parse(data);
      metasData.forEach(meta => {
        const newCard = createMetaCardElement(meta);
        track.insertBefore(newCard, cardCrear);
      });
    }

    // Inicializar carrusel y refrescar vistas
    if (typeof initCarousel === 'function') initCarousel();
    const currentView = localStorage.getItem('vistaMetas') || 'carrusel';
    if (currentView === 'lista') buildListaView();
    else if (currentView === 'card') buildCardGridView();
  }

  // Cargar metas al iniciar
  loadMetasFromStorage();

});

