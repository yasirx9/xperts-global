/* Global site feature switches. Set preloader to true to show the loader on each page load; set false to disable it. */
window.XG_CONFIG = window.XG_CONFIG || {};
window.XG_CONFIG.preloader = false;

/*
 * Site-wide visual mode.
 * true  = unified light theme inspired by the new Blog design.
 * false = the original page-by-page visual treatment.
 */
window.XG_CONFIG.unifiedLightTheme = true;
document.documentElement.classList.toggle('xg-blog-theme', window.XG_CONFIG.unifiedLightTheme === true);
