(function () {
  'use strict';

  // 면허센터 > 면허신고(KD-US-LIC-01-01)

  // 연도 선택: aria-pressed 버튼으로 대상 기준 패널 전환
  document.querySelectorAll('[data-license-year]').forEach(function (root) {
    var buttons = root.querySelectorAll('[aria-controls]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          var selected = item === button;
          item.setAttribute('aria-pressed', String(selected));
          var panel = document.getElementById(item.getAttribute('aria-controls'));
          if (panel) panel.hidden = !selected;
        });
      });
    });
  });

  // 앵커 탭: 클릭 시 해당 섹션으로 스크롤, 스크롤 위치에 따라 현재 섹션 표시(aria-current)
  document.querySelectorAll('[data-license-anchors]').forEach(function (nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links
      .map(function (link) {
        return document.getElementById(link.getAttribute('href').slice(1));
      })
      .filter(Boolean);
    if (!targets.length) return;

    function setCurrent(id) {
      links.forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
          link.setAttribute('aria-current', 'true');
          // 모바일 가로 스크롤 탭에서 현재 항목이 보이도록
          if (nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - 12, behavior: 'smooth' });
          }
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    var ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.3;
      var current = targets[0];
      targets.forEach(function (section) {
        if (section.getBoundingClientRect().top <= line) current = section;
      });
      // 페이지 끝에 닿으면 마지막 섹션
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = targets[targets.length - 1];
      }
      setCurrent(current.id);
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + target.id);
        setCurrent(target.id);
      });
    });

    update();
  });
})();
