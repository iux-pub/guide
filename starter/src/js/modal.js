// 모달 컴포넌트 — hidden 속성으로 열고 닫기 + 포커스 트랩 + ESC 닫기
// - 상태는 hidden 속성 하나로 표현한다(R-17, 스니펫 src/snippets/modal.md 「동작」)
// - 여는 버튼: data-modal-open="모달 id", 닫는 버튼: data-modal-close
;(function () {
  'use strict'

  var FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

  function openModal(modal, trigger) {
    modal.removeAttribute('hidden')
    document.body.style.overflow = 'hidden'
    var firstFocusable = modal.querySelector(FOCUSABLE)
    if (firstFocusable) firstFocusable.focus()
    modal._trigger = trigger
  }

  function closeModal(modal) {
    modal.setAttribute('hidden', '')
    document.body.style.overflow = ''
    if (modal._trigger) modal._trigger.focus()
  }

  function findOpenModal() {
    return document.querySelector('.modal:not([hidden])')
  }

  function trapFocus(modal, e) {
    var focusables = modal.querySelectorAll(FOCUSABLE)
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
    var trigger = e.target.closest('[data-modal-open]')
    if (trigger) {
      var target = document.getElementById(trigger.dataset.modalOpen)
      if (target) openModal(target, trigger)
      return
    }
    var close = e.target.closest('[data-modal-close]')
    var modal = close ? close.closest('.modal') : null
    if (!modal && e.target.classList.contains('modal__overlay')) {
      modal = e.target.closest('.modal')
    }
    if (modal) closeModal(modal)
  })

  // 이벤트 위임 — 키보드
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Tab') return
    var modal = findOpenModal()
    if (!modal) return
    if (e.key === 'Escape') closeModal(modal)
    else trapFocus(modal, e)
  })
})()
