// 모바일 전체 메뉴 컴포넌트 — 열기/닫기 + 포커스 트랩 + Esc 닫기 + 트리거로 초점 복귀
;(function () {
  'use strict'

  var FOCUSABLE = 'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  var PC_QUERY = '(min-width: 1280px)'

  // 닫힌 details 안의 링크는 렌더되지 않으므로(getClientRects 비어 있음) 트랩 대상에서 뺀다
  function visibleFocusables(menu) {
    return Array.prototype.filter.call(menu.querySelectorAll(FOCUSABLE), function (el) {
      return el.getClientRects().length > 0
    })
  }

  function openedMenu() {
    return document.querySelector('.mobile-menu:not([hidden])')
  }

  function openMenu(menu, trigger) {
    menu._trigger = trigger
    menu.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
    var first = visibleFocusables(menu)[0]
    if (first) first.focus()
  }

  function closeMenu(menu, restoreFocus) {
    menu.hidden = true
    document.body.style.overflow = ''
    var trigger = menu._trigger
    if (!trigger) return
    trigger.setAttribute('aria-expanded', 'false')
    if (restoreFocus) trigger.focus()
  }

  function trapFocus(menu, e) {
    var focusables = visibleFocusables(menu)
    if (focusables.length === 0) return
    var first = focusables[0]
    var last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // 이벤트 위임 — 클릭
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-mobile-menu-open]')
    if (open) {
      var menu = document.getElementById(open.dataset.mobileMenuOpen)
      if (menu) openMenu(menu, open)
      return
    }
    var current = openedMenu()
    if (!current) return
    if (e.target.closest('[data-mobile-menu-close]')) {
      closeMenu(current, true)
      return
    }
    // 같은 페이지 안 앵커 링크는 이동 뒤에도 메뉴가 남으므로 닫는다
    var link = e.target.closest('a[href^="#"]')
    if (link && current.contains(link)) closeMenu(current, false)
  })

  // 이벤트 위임 — 키보드
  document.addEventListener('keydown', function (e) {
    var current = openedMenu()
    if (!current) return
    if (e.key === 'Escape') {
      closeMenu(current, true)
    } else if (e.key === 'Tab') {
      trapFocus(current, e)
    }
  })

  // PC 폭으로 넓어지면 주 메뉴가 대신하므로 열려 있던 패널을 정리한다
  if (window.matchMedia) {
    var query = window.matchMedia(PC_QUERY)
    var onChange = function (e) {
      var current = openedMenu()
      if (e.matches && current) closeMenu(current, false)
    }
    if (query.addEventListener) query.addEventListener('change', onChange)
    else if (query.addListener) query.addListener(onChange)
  }
})()
