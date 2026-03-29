// 접근성 체크리스트 인터랙션 — localStorage 저장/복원, 진행률 표시
;(function () {
  'use strict'

  var STORAGE_KEY = 'a11y-checklist-state'

  // 체크 상태를 localStorage에 저장
  function saveState() {
    var checkboxes = document.querySelectorAll('.a11y-checklist__check')
    var state = {}
    for (var i = 0; i < checkboxes.length; i++) {
      var cb = checkboxes[i]
      var id = cb.dataset.category + '-' + cb.dataset.id
      state[id] = cb.checked
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      // localStorage 사용 불가 시 무시
    }
  }

  // localStorage에서 체크 상태 복원
  function loadState() {
    var state
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch (e) {
      return
    }
    if (!state) return

    var checkboxes = document.querySelectorAll('.a11y-checklist__check')
    for (var i = 0; i < checkboxes.length; i++) {
      var cb = checkboxes[i]
      var id = cb.dataset.category + '-' + cb.dataset.id
      if (state[id]) {
        cb.checked = true
      }
    }
  }

  // 진행률 업데이트
  function updateProgress() {
    var total = document.querySelectorAll('.a11y-checklist__check').length
    var checked = document.querySelectorAll('.a11y-checklist__check:checked').length
    var percent = total > 0 ? Math.round((checked / total) * 100) : 0

    var progressbar = document.querySelector('.a11y-checklist__progress')
    var bar = document.querySelector('.a11y-checklist__progress-bar')
    var text = document.querySelector('.a11y-checklist__progress-text')

    if (progressbar) {
      progressbar.setAttribute('aria-valuenow', String(percent))
    }
    if (bar) {
      bar.style.width = percent + '%'
    }
    if (text) {
      text.textContent = checked + ' / ' + total + ' 완료'
    }
  }

  // 모든 체크박스 초기화
  function resetAll() {
    var checkboxes = document.querySelectorAll('.a11y-checklist__check')
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false
    }
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // localStorage 사용 불가 시 무시
    }
    updateProgress()
  }

  // 이벤트 위임 — 체크박스 변경
  document.addEventListener('change', function (e) {
    if (e.target.matches('.a11y-checklist__check')) {
      saveState()
      updateProgress()
    }
  })

  // 이벤트 위임 — 리셋 버튼 클릭
  document.addEventListener('click', function (e) {
    if (e.target.closest('.a11y-checklist__reset')) {
      var confirmed = window.confirm('체크리스트를 초기화하시겠습니까? 모든 체크가 해제됩니다.')
      if (confirmed) {
        resetAll()
      }
    }
  })

  // 페이지 로드 시 상태 복원 + 진행률 업데이트
  document.addEventListener('DOMContentLoaded', function () {
    loadState()
    updateProgress()
  })
})()
