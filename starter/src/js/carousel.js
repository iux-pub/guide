// 캐러셀 — KRDS 캐러셀(component_04_09) 동작
// - 자동 회전이면 정지/재생 버튼이 첫 상호작용 요소다(마크업 순서로 보장)
// - 키보드 초점이 캐러셀에 들어오면 정지하고, 사용자가 재생을 누르기 전에는 다시 시작하지 않는다
// - 마우스를 올리면 멈추고, 내리면 이어 간다(사용자가 정지하지 않았을 때만)
// - 현재 슬라이드 밖은 inert + aria-hidden으로 초점·보조기기에서 뺀다
// - prefers-reduced-motion: reduce이면 자동 회전을 시작하지 않는다(R-22)
// - 슬라이드가 1개면 컨트롤을 숨긴다
;(function () {
  'use strict'

  var LABEL_STOP = '자동 넘김 정지'
  var LABEL_PLAY = '자동 넘김 시작'
  var MAX_SLIDES = 5
  var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

  function isKeyboardFocus(el) {
    try {
      return el.matches(':focus-visible')
    } catch (err) {
      return true
    }
  }

  function init(root) {
    var track = root.querySelector('.carousel__track')
    if (!track) return
    var slides = Array.prototype.slice.call(track.children)
    var controls = root.querySelector('.carousel__controls')
    var toggle = root.querySelector('[data-carousel-toggle]')
    var currentText = root.querySelector('[data-carousel-current]')
    var totalText = root.querySelector('[data-carousel-total]')
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-goto]'))
    var delay = parseInt(root.getAttribute('data-carousel-autoplay'), 10) || 0
    var index = 0
    var timer = null
    var hovered = false
    var autoplay = delay > 0 && !(reduced && reduced.matches)
    var scrollTimer = null

    if (slides.length > MAX_SLIDES && window.console) {
      console.warn('[carousel] 슬라이드가 ' + slides.length + '개다. KRDS는 5개 이내 — 많으면 목록으로 바꾼다.', root)
    }
    if (slides.length <= 1) {
      if (controls) controls.hidden = true
      return
    }
    if (toggle) toggle.hidden = delay <= 0
    if (totalText) totalText.textContent = String(slides.length)

    function setCurrent(i) {
      index = i
      slides.forEach(function (slide, j) {
        if (j === i) {
          slide.removeAttribute('inert')
          slide.removeAttribute('aria-hidden')
        } else {
          slide.setAttribute('inert', '')
          slide.setAttribute('aria-hidden', 'true')
        }
      })
      if (currentText) currentText.textContent = String(i + 1)
      dots.forEach(function (dot, j) {
        if (j === i) dot.setAttribute('aria-current', 'true')
        else dot.removeAttribute('aria-current')
      })
    }

    function goTo(i) {
      var n = (i + slides.length) % slides.length
      track.scrollTo({
        left: slides[n].offsetLeft - slides[0].offsetLeft,
        behavior: reduced && reduced.matches ? 'auto' : 'smooth'
      })
      setCurrent(n)
    }

    function renderToggle() {
      if (!toggle) return
      var label = toggle.querySelector('.sr-only')
      if (label) label.textContent = autoplay ? LABEL_STOP : LABEL_PLAY
      var use = toggle.querySelector('use')
      if (use) {
        var href = use.getAttribute('href') || ''
        use.setAttribute('href', href.replace(/#(pause|play)$/, autoplay ? '#pause' : '#play'))
      }
    }

    // 사용자 의사(autoplay)와 일시 상태(호버·숨은 탭)를 합쳐 실제 회전 여부를 정한다
    function run() {
      var shouldPlay = autoplay && !hovered && !document.hidden
      if (shouldPlay && !timer) {
        timer = window.setInterval(function () { goTo(index + 1) }, delay)
        track.setAttribute('aria-live', 'off')
      } else if (!shouldPlay && timer) {
        window.clearInterval(timer)
        timer = null
      }
      if (!autoplay) track.setAttribute('aria-live', 'polite')
    }

    function stopByUser() {
      if (!autoplay) return
      autoplay = false
      renderToggle()
      run()
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        autoplay = !autoplay
        renderToggle()
        run()
      })
    }

    var prev = root.querySelector('[data-carousel-prev]')
    var next = root.querySelector('[data-carousel-next]')
    if (prev) prev.addEventListener('click', function () { goTo(index - 1) })
    if (next) next.addEventListener('click', function () { goTo(index + 1) })

    dots.forEach(function (dot, j) {
      dot.addEventListener('click', function () { goTo(j) })
      // KRDS: 식별자 그룹에 초점이 있을 때 ←→로 이전/다음 항목을 고른다
      dot.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
        if (!step) return
        e.preventDefault()
        var n = (index + step + slides.length) % slides.length
        goTo(n)
        if (dots[n]) dots[n].focus()
      })
    })

    // 키보드 초점이 들어오면 정지 — 마우스 클릭으로 생긴 초점은 호버가 이미 멈춰 두므로 제외
    root.addEventListener('focusin', function (e) {
      if (isKeyboardFocus(e.target)) stopByUser()
    })
    root.addEventListener('mouseenter', function () { hovered = true; run() })
    root.addEventListener('mouseleave', function () { hovered = false; run() })
    document.addEventListener('visibilitychange', run)
    if (reduced) {
      var onReduced = function (e) { if (e.matches) stopByUser() }
      if (reduced.addEventListener) reduced.addEventListener('change', onReduced)
      else if (reduced.addListener) reduced.addListener(onReduced)
    }

    // 스와이프·드래그로 넘긴 경우 현재 슬라이드를 다시 맞춘다
    track.addEventListener('scroll', function () {
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(function () {
        var width = track.clientWidth || 1
        var n = Math.round(track.scrollLeft / width)
        if (n !== index && n >= 0 && n < slides.length) setCurrent(n)
      }, 120)
    })

    setCurrent(0)
    renderToggle()
    run()
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), init)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll)
  else initAll()
})()
