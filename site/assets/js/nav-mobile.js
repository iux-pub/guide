;(function() {
  'use strict'

  var toggle = document.getElementById('mobile-menu-toggle')
  var sidebar = document.getElementById('sidebar')
  var overlay = document.getElementById('docs-overlay')

  if (!toggle || !sidebar) return

  function openMenu() {
    sidebar.classList.add('docs-layout__sidebar--open')
    toggle.setAttribute('aria-expanded', 'true')
    toggle.setAttribute('aria-label', '메뉴 닫기')
    if (overlay) overlay.classList.add('docs-overlay--active')
  }

  function closeMenu() {
    sidebar.classList.remove('docs-layout__sidebar--open')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-label', '메뉴 열기')
    if (overlay) overlay.classList.remove('docs-overlay--active')
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true'
  }

  toggle.addEventListener('click', function() {
    if (isOpen()) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  if (overlay) {
    overlay.addEventListener('click', function() {
      closeMenu()
    })
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen()) {
      closeMenu()
      toggle.focus()
    }
  })
})()
