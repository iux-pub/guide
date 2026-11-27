/**
 * scene-header — 장면 위 머리글(.scene-header)이 첫 화면을 벗어나면 바탕색을 입힌다 (블록 카탈로그 scene)
 *   첫 화면 높이의 60%를 넘겨 스크롤하면 header에 data-scrolled를 붙인다. 색은 CSS(scene-header.css)가 정한다.
 *   스크립트가 없으면 머리글은 계속 투명하다 — 짙은 면 위에서는 그대로 읽힌다.
 */
;(function () {
  'use strict'

  var header = document.querySelector('.scene-header')
  if (!header) return

  function update() {
    header.toggleAttribute('data-scrolled', window.scrollY > window.innerHeight * 0.6)
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
})()
