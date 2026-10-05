// 주 메뉴 하위 패널 — disclosure 패턴 (드롭다운·메가 메뉴 공통)
// 버튼(aria-expanded + aria-controls)이 패널을 열고 닫는다. role="menu"를 쓰지 않으므로
// 방향키 운용은 없다 — Tab 이 링크를 순서대로 지나간다.
;(function () {
  'use strict'

  var TOGGLE = '.main-menu__toggle'

  function panelOf(toggle) {
    return document.getElementById(toggle.getAttribute('aria-controls'))
  }

  function setOpen(toggle, open) {
    var panel = panelOf(toggle)
    if (!panel) return
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    panel.hidden = !open
  }

  function closeAll(except) {
    var opened = document.querySelectorAll(TOGGLE + '[aria-expanded="true"]')
    opened.forEach(function (toggle) {
      if (toggle !== except) setOpen(toggle, false)
    })
  }

  // 이벤트 위임 — 클릭: 토글 열기/닫기, 바깥 클릭 시 모두 닫기
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest(TOGGLE)
    if (toggle) {
      var willOpen = toggle.getAttribute('aria-expanded') !== 'true'
      closeAll(toggle)
      setOpen(toggle, willOpen)
      return
    }
    if (!e.target.closest('.main-menu')) closeAll(null)
  })

  // 이벤트 위임 — Esc: 열린 패널을 닫고 초점을 토글 버튼으로 되돌린다
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    var opened = document.querySelector(TOGGLE + '[aria-expanded="true"]')
    if (!opened) return
    setOpen(opened, false)
    opened.focus()
  })

  // 이벤트 위임 — 초점이 열린 항목 밖으로 나가면(Tab 이동) 패널을 닫는다
  document.addEventListener('focusin', function (e) {
    var opened = document.querySelector(TOGGLE + '[aria-expanded="true"]')
    if (!opened) return
    var item = opened.closest('.main-menu__item')
    if (item && !item.contains(e.target)) setOpen(opened, false)
  })
})()
