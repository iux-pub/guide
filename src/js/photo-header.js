// photo-header — 첫 화면 사진(.photo-gate) 위에 있을 때 머리글(.photo-header)에 data-on-photo를 붙여 투명 · 흰 글자로 둔다 (블록 카탈로그 photo-gate)
// 스크롤하면(8px 넘게) 속성을 떼어 카탈로그 기본인 흰 바탕 머리글로 돌아간다.
// 스크립트가 없으면 속성이 붙지 않아 흰 머리글로 남는다 — 글자가 사진에 묻히지 않는다.
;(function () {
  'use strict'

  var header = document.querySelector('.photo-header')
  var photo = document.querySelector('.photo-gate')
  if (!header || !photo) return

  function update() {
    if (window.scrollY > 8) header.removeAttribute('data-on-photo')
    else header.setAttribute('data-on-photo', '')
  }

  window.addEventListener('scroll', update, { passive: true })
  update()
})()
