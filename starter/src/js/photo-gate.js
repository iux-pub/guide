// photo-gate — 첫 화면 사진 장면 전환 (블록 카탈로그 photo-gate · design-intelligence §6-1 H7)
// - 사진(.photo-gate__photo)을 data-autoplay(ms, 6000 이상) 간격으로 천천히 겹쳐 바꾼다. 표제는 바꾸지 않는다
// - 정지·재생 단추([data-carousel-toggle])는 첫 화면의 첫 포커스 요소다(R-33 — 마크업 순서로 보장)
// - 장면 번호([data-scene-count])와 진행 막대([data-scene-bar])를 단추 옆에 함께 둔다. 막대는 Web Animations로 채우고, 정지하면 그 자리에서 멈춘다
// - prefers-reduced-motion이면 첫 장면에서 멈춘 채로 시작하고 단추는 「재생」이 된다. 막대는 움직이지 않는다(R-22)
// - 스크립트가 없거나 사진이 한 장이면 첫 장면(data-active)만 보이고 막대는 빈 선이다
;(function () {
  'use strict'

  var LABEL_STOP = '첫 화면 장면 전환 정지'
  var LABEL_PLAY = '첫 화면 장면 전환 재생'

  function init(root) {
    var photos = Array.prototype.slice.call(root.querySelectorAll('.photo-gate__photo'))
    var button = root.querySelector('[data-carousel-toggle]')
    if (!button || photos.length < 2) {
      if (button) button.hidden = true
      return
    }
    var label = button.querySelector('.sr-only')
    var icon = button.querySelector('use')
    var count = root.querySelector('[data-scene-count]')
    var bar = root.querySelector('[data-scene-bar]')
    var delay = Math.max(6000, parseInt(root.getAttribute('data-autoplay'), 10) || 7000)
    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    var index = 0
    var timer = null
    var run = null

    function fill() {
      if (!bar || !bar.animate || (reduce && reduce.matches)) return
      if (run) run.cancel()
      run = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: delay, easing: 'linear', fill: 'forwards' })
    }

    function show(next) {
      index = (next + photos.length) % photos.length
      photos.forEach(function (photo, i) {
        if (i === index) photo.setAttribute('data-active', '')
        else photo.removeAttribute('data-active')
      })
      if (count) count.textContent = (index + 1) + ' / ' + photos.length
    }

    function render(playing) {
      if (label) label.textContent = playing ? LABEL_STOP : LABEL_PLAY
      if (icon) {
        var href = icon.getAttribute('href') || ''
        icon.setAttribute('href', href.replace(/#.*$/, '') + '#' + (playing ? 'pause' : 'play'))
      }
    }

    function tick() {
      show(index + 1)
      fill()
    }

    function stop() {
      if (timer) window.clearInterval(timer)
      timer = null
      if (run) run.pause()
      render(false)
    }

    function play() {
      if (timer) window.clearInterval(timer)
      timer = window.setInterval(tick, delay)
      fill()
      render(true)
    }

    button.addEventListener('click', function () {
      if (timer) stop()
      else play()
    })

    if (count) count.textContent = '1 / ' + photos.length
    if (reduce && reduce.matches) stop()
    else play()
  }

  Array.prototype.forEach.call(document.querySelectorAll('.photo-gate[data-autoplay]'), init)
})()
