/**
 * reveal — [data-reveal] 요소가 화면에 들어올 때 한 번만 data-revealed를 붙인다 (블록 카탈로그 news-deck의 due-track)
 *   움직임 줄이기 설정이거나 IntersectionObserver가 없으면 아무것도 하지 않는다 — 내용은 처음부터 보인다.
 *   html에 data-motion="on"을 붙여, CSS가 「스크립트가 돌 때만」 숨긴 상태에서 시작하게 한다.
 */
;(function () {
  'use strict'

  if (!('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var targets = document.querySelectorAll('[data-reveal]')
  if (!targets.length) return
  document.documentElement.setAttribute('data-motion', 'on')

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return
      entry.target.setAttribute('data-revealed', '')
      observer.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -10% 0px' })

  targets.forEach(function (el) { observer.observe(el) })
})()
