// 공지 띠 컴포넌트 — 닫기 + 닫은 공지 기억(localStorage) + 닫은 뒤 초점 이동
;(function () {
  'use strict'

  var KEY_PREFIX = 'infoux:notice-dismissed:'

  // 저장소를 못 쓰는 환경(시크릿 모드·차단)에서도 닫기 자체는 동작해야 한다
  function remember(id) {
    if (!id) return
    try {
      window.localStorage.setItem(KEY_PREFIX + id, '1')
    } catch (err) {
      // 기억하지 못하면 다음 방문에 다시 보일 뿐이다
    }
  }

  function wasDismissed(id) {
    if (!id) return false
    try {
      return window.localStorage.getItem(KEY_PREFIX + id) === '1'
    } catch (err) {
      return false
    }
  }

  // 이미 닫은 공지는 로드 때 숨긴다. 내용이 바뀌면 data-notice-id 도 바꿔 다시 보이게 한다
  document.querySelectorAll('.notice-bar[data-notice-id]').forEach(function (bar) {
    if (wasDismissed(bar.dataset.noticeId)) bar.hidden = true
  })

  // 이벤트 위임 — 닫기
  document.addEventListener('click', function (e) {
    var close = e.target.closest('.notice-bar__close')
    if (!close) return
    var bar = close.closest('.notice-bar')
    if (!bar) return
    bar.hidden = true
    remember(bar.dataset.noticeId)

    // 눌렀던 버튼이 사라지므로 초점이 문서 처음으로 날아가지 않게 헤더의 첫 요소로 옮긴다
    var next = document.querySelector('#header a[href], #header button')
    if (next) next.focus()
  })
})()
