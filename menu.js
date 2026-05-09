/**
 * menu.js — Navegación dinámica del Portal IO · UTN
 *
 * Inyecta el <nav class="site-nav"> en el #nav-container de la página actual
 * y marca automáticamente el enlace activo según window.location.pathname.
 */
(function () {
  'use strict';

  // ── Detectar la página actual ──────────────────────────────────────────────
  // Funciona tanto en file:// como en http://
  const pathname = window.location.pathname;
  const currentPage = pathname.split('/').pop() || 'index.html';

  // ── Definición de todos los enlaces del portal ─────────────────────────────
  // unit: 'u1' | 'u2' | 'u4'
  const NAV_LINKS = [
    // Unidad 1 · Procesos Estocásticos / Markov
    { href: 'simulador_markov.html',           label: 'Simulador',         unit: 'u1' },
    { href: 'ejercicio_call_center.html',      label: 'Call Center',       unit: 'u1' },
    { href: 'resolvedor_markov.html',          label: 'Resolvedor',        unit: 'u1' },
    { href: 'resolvedor_nacimiento_muerte.html', label: 'Nac. y Muerte',    unit: 'u1' },
    // Unidad 2 · Teoría de Colas
    { href: 'simulador_mmk.html',              label: 'Simulador M/M/k',  unit: 'u2' },
    // Unidad 4 · Simulación
    { href: 'simulador_montecarlo.html',       label: 'Isla de Soldadura', unit: 'u4' },
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function buildLink(link) {
    const isActive = currentPage === link.href;
    // Clase base + clase de unidad (u2 / u4) si aplica + active si corresponde
    const unitClass = (link.unit !== 'u1') ? ` ${link.unit}` : '';
    const activeClass = isActive ? ' active' : '';
    return `<a href="${link.href}" class="nav-link${unitClass}${activeClass}">${link.label}</a>`;
  }

  // ── Construir el HTML completo del nav ─────────────────────────────────────
  const currentLink = NAV_LINKS.find(l => l.href === currentPage);
  const currentUnit = currentLink ? currentLink.unit : 'u1';

  const u1Links = NAV_LINKS.filter(l => l.unit === 'u1').map(buildLink).join('\n  ');
  const u2Links = NAV_LINKS.filter(l => l.unit === 'u2').map(buildLink).join('\n  ');
  const u4Links = NAV_LINKS.filter(l => l.unit === 'u4').map(buildLink).join('\n  ');

  const navHTML = `<nav class="site-nav">
  <a href="index.html" class="nav-logo">
    <div class="dot ${currentUnit}"></div>
    IO · UTN
  </a>
  <span class="nav-unit">U1 · Markov</span>
  ${u1Links}
  <div class="nav-sep"></div>
  <span class="nav-unit u2">U2 · Colas</span>
  ${u2Links}
  <div class="nav-sep"></div>
  <span class="nav-unit u4">U4 · Simulación</span>
  ${u4Links}
</nav>`;

  // ── Inyectar en #nav-container ─────────────────────────────────────────────
  // outerHTML reemplaza el <div> placeholder por el <nav> real
  const container = document.getElementById('nav-container');
  if (container) {
    container.outerHTML = navHTML;
  } else {
    console.warn('[menu.js] No se encontró #nav-container en el DOM.');
  }
})();
