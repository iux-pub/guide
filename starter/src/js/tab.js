// 탭 컴포넌트 — KRDS 탭(component_04_10) 동작
// - 모든 탭이 Tab·Shift+Tab 순서에 들어간다(KRDS: 「모든 탭에 접근할 수 있어야 함」) — tabindex로 빼지 않는다
// - 탭은 클릭·Enter·Space로 고른다(수동 활성화). 버튼이라 Enter·Space는 click으로 들어온다
// - ←→·Home·End는 보조 수단으로 초점만 옮긴다(고르지 않는다)
;(function () {
  'use strict'

  function activateTab(tab) {
    var tablist = tab.closest('[role="tablist"]')
    var tabs = tablist.querySelectorAll('[role="tab"]')
    var tabContainer = tablist.closest('.tab')

    tabs.forEach(function (t) {
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false')
    })

    var panelId = tab.getAttribute('aria-controls')
    var panels = tabContainer.querySelectorAll('[role="tabpanel"]')
    panels.forEach(function (panel) {
      panel.hidden = panel.id !== panelId
    })
  }

  // 이벤트 위임 — 클릭(Enter·Space 포함)
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]')
    if (tab) activateTab(tab)
  })

  // 이벤트 위임 — 방향키는 초점만 옮긴다
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest('[role="tab"]')
    if (!tab) return

    var tablist = tab.closest('[role="tablist"]')
    var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'))
    var index = tabs.indexOf(tab)

    var target = null
    if (e.key === 'ArrowRight') {
      target = tabs[(index + 1) % tabs.length]
    } else if (e.key === 'ArrowLeft') {
      target = tabs[(index - 1 + tabs.length) % tabs.length]
    } else if (e.key === 'Home') {
      target = tabs[0]
    } else if (e.key === 'End') {
      target = tabs[tabs.length - 1]
    }

    if (target) {
      e.preventDefault()
      target.focus()
    }
  })
})()
