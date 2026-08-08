/**
 * menu.js — Navegación dinámica con desplegable de unidades del Portal IO · UTN
 *
 * Inyecta el <nav class="site-nav"> en el #nav-container de la página actual,
 * provee un menú desplegable para cambiar de Unidad y muestra en la barra superior
 * únicamente las subunidades / herramientas asociadas a la Unidad activa.
 */
(function () {
  'use strict';

  // ── CONFIGURACIÓN DE BLOQUEO POR EXAMEN ───────────────────────────────────
  const IS_LOCKED = false; 

  if (IS_LOCKED) {
    const blockPage = () => {
      document.title = "Acceso Restringido — Examen en Curso";
      document.body.style.overflow = "hidden";
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: radial-gradient(circle at center, #111827 0%, #030712 100%);
          color: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          z-index: 999999;
          padding: 2rem;
          text-align: center;
          box-sizing: border-box;
        ">
          <div style="
            background: rgba(17, 24, 39, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              width: 80px; height: 80px; border-radius: 50%;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              display: flex; align-items: center; justify-content: center;
              margin-bottom: 2rem; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
            ">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            
            <h1 style="
              font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem;
              background: linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%);
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            ">Acceso Restringido</h1>
            
            <p style="font-size: 1rem; line-height: 1.6; color: #9ca3af; margin-bottom: 0;">
              El simulador y las herramientas de Investigación Operativa se encuentran <strong>desactivados temporalmente</strong> por examen en curso. 
              <br><br>El portal volverá a estar disponible automáticamente al finalizar el examen.
            </p>
          </div>
        </div>
      `;
    };
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", blockPage);
    } else {
      blockPage();
    }
    return;
  }

  // ── Detectar la página actual ──────────────────────────────────────────────
  const pathname = window.location.pathname;
  const currentPage = pathname.split('/').pop() || 'index.html';

  // ── Definición de Unidades del Cursado ─────────────────────────────────────
  const UNITS = [
    { id: 'u1', name: 'U1 · Markov',       defaultHref: 'simulador_markov.html' },
    { id: 'u2', name: 'U2 · Colas',        defaultHref: 'simulador_mmk.html' },
    { id: 'u3', name: 'U3 · Proyectos',    defaultHref: 'simulador_pert_cpm.html' },
    { id: 'u4', name: 'U4 · Simulación',   defaultHref: 'simulador_montecarlo.html' },
    { id: 'u5', name: 'U5 · Inventarios',  defaultHref: 'simulador_inventarios.html' },
  ];

  // ── Definición de Subunidades / Herramientas por Unidad ───────────────────
  const NAV_LINKS = [
    // U1
    { href: 'simulador_markov.html',           label: 'Simulador Markov',   unit: 'u1' },
    { href: 'ejercicio_call_center.html',      label: 'Call Center',         unit: 'u1' },
    { href: 'resolvedor_markov.html',          label: 'Resolvedor Markov',  unit: 'u1' },
    { href: 'resolvedor_nacimiento_muerte.html', label: 'Nac. y Muerte',      unit: 'u1' },
    // U2
    { href: 'simulador_mmk.html',              label: 'Simulador M/M/k',    unit: 'u2' },
    // U3
    { href: 'simulador_pert_cpm.html',         label: 'Simulador PERT / CPM', unit: 'u3' },
    // U4
    { href: 'simulador_montecarlo.html',       label: 'Filas de Espera',    unit: 'u4' },
    { href: 'tutorial_excel_montecarlo.html',  label: 'Guía Excel',         unit: 'u4' },
    // U5
    { href: 'simulador_inventarios.html',      label: 'Simulador EOQ',      unit: 'u5' },
  ];

  // Identificar unidad activa
  const currentLink = NAV_LINKS.find(l => l.href === currentPage);
  const currentUnitId = currentLink ? currentLink.unit : (currentPage === 'index.html' ? 'home' : 'u1');

  // ── Opciones del Selector Desplegable de Unidad ────────────────────────────
  const selectOptionsHTML = UNITS.map(u => {
    const isSelected = u.id === currentUnitId ? 'selected' : '';
    return `<option value="${u.defaultHref}" ${isSelected}>${u.name}</option>`;
  }).join('');

  const homeOption = `<option value="index.html" ${currentUnitId === 'home' ? 'selected' : ''}>📍 Portal Principal (Inicio)</option>`;
  const dropdownHTML = `
    <div class="unit-select-wrapper">
      <select class="unit-select ${currentUnitId !== 'home' ? currentUnitId : 'u1'}" onchange="window.location.href=this.value;">
        ${homeOption}
        ${selectOptionsHTML}
      </select>
    </div>
  `;

  // ── Filtrar Subunidades / Pestañas de la Unidad Activa ─────────────────────
  let subLinksHTML = '';
  if (currentUnitId === 'home') {
    // Si estamos en la Home, mostrar accesos directos principales de cada unidad
    subLinksHTML = UNITS.map(u => {
      return `<a href="${u.defaultHref}" class="nav-link ${u.id}">${u.name}</a>`;
    }).join('');
  } else {
    // Si estamos en una unidad, mostrar ÚNICAMENTE sus pestañas/herramientas
    subLinksHTML = NAV_LINKS
      .filter(l => l.unit === currentUnitId)
      .map(l => {
        const isActive = currentPage === l.href;
        return `<a href="${l.href}" class="nav-link ${l.unit}${isActive ? ' active' : ''}">${l.label}</a>`;
      })
      .join('');
  }

  // ── Construir HTML final del Navbar ────────────────────────────────────────
  const navHTML = `
<nav class="site-nav">
  <a href="index.html" class="nav-logo" title="Ir al Portal Principal">
    <div class="dot ${currentUnitId !== 'home' ? currentUnitId : 'u1'}"></div>
    IO · UTN
  </a>
  
  ${dropdownHTML}

  <div class="nav-sep"></div>

  <div style="display: flex; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none;">
    ${subLinksHTML}
  </div>
</nav>
  `;

  // ── Inyectar en el DOM ─────────────────────────────────────────────────────
  const container = document.getElementById('nav-container');
  if (container) {
    container.outerHTML = navHTML;
  } else {
    console.warn('[menu.js] No se encontró #nav-container en el DOM.');
  }
})();
