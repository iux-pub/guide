// clipboard.js 초기화 -- 코드 블록에 복사 버튼 자동 추가
;(function() {
  'use strict'

  document.addEventListener('DOMContentLoaded', function() {
    // 모든 코드 블록에 복사 버튼 추가
    var pres = document.querySelectorAll('pre[class*="language-"]')

    pres.forEach(function(pre) {
      var btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.textContent = '복사'
      btn.setAttribute('aria-label', '코드 복사')
      btn.setAttribute('type', 'button')
      pre.appendChild(btn)
    })

    // ClipboardJS 초기화
    if (typeof ClipboardJS !== 'undefined') {
      var clipboard = new ClipboardJS('.copy-btn', {
        target: function(trigger) {
          return trigger.closest('pre').querySelector('code')
        }
      })

      clipboard.on('success', function(e) {
        var btn = e.trigger
        btn.textContent = '복사됨'
        btn.setAttribute('aria-label', '코드 복사됨')
        e.clearSelection()

        setTimeout(function() {
          btn.textContent = '복사'
          btn.setAttribute('aria-label', '코드 복사')
        }, 2000)
      })
    }
  })
})()
