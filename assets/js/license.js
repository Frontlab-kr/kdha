(function () {
  'use strict';

  // 면허센터 > 면허신고(KD-US-LIC-01-01)

  // 연도 선택(ds-tabs--box): aria-pressed 버튼으로 대상 기준 패널 전환
  document.querySelectorAll('[data-license-year]').forEach(function (root) {
    var buttons = root.querySelectorAll('button[aria-controls]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          var selected = item === button;
          item.setAttribute('aria-pressed', String(selected));
          var panel = document.getElementById(item.getAttribute('aria-controls'));
          if (panel) panel.hidden = !selected;
        });
        // 모바일 가로 스크롤 칩에서 선택한 항목이 보이도록
        var list = button.parentElement;
        if (list && list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: button.offsetLeft - list.offsetLeft - 12, behavior: 'smooth' });
        }
      });
    });
  });

  // 면허신고 주기: 취득 년도(2014년~올해) 옵션 생성, 1~4차 신고 연도 계산(+3년)
  document.querySelectorAll('[data-license-cycle]').forEach(function (row) {
    var select = row.querySelector('[data-license-cycle-year]');
    var cells = row.querySelectorAll('[data-license-cycle-round]');
    var status = document.querySelector('[data-license-cycle-status]');
    if (!select || !cells.length) return;
    var FIRST_YEAR = 2014;
    // 2014년도 이전 취득자는 2015년 일괄신고부터 시작
    var FIRST_REPORT_YEAR = 2015;
    var currentYear = new Date().getFullYear();
    var selected = select.value || String(FIRST_YEAR);

    select.innerHTML = '';
    for (var year = FIRST_YEAR; year <= currentYear; year += 1) {
      var option = document.createElement('option');
      option.value = String(year);
      option.textContent = year + '년도';
      option.setAttribute('data-placeholder', 'false');
      option.selected = String(year) === selected;
      select.appendChild(option);
    }

    function render(announce) {
      var year = Number(select.value);
      var first = year <= FIRST_YEAR ? FIRST_REPORT_YEAR : year + 3;
      var years = [];
      cells.forEach(function (cell, index) {
        var reportYear = first + index * 3;
        cell.textContent = reportYear + '년';
        years.push(index + 1 + '차 ' + reportYear + '년');
      });
      if (announce && status) status.textContent = year + '년도 취득: ' + years.join(', ');
    }

    render(false);
    if (window.jQuery) {
      // 공통 셀렉트(common.js)는 jQuery change로 값을 알리므로 jQuery로 연결, 펼침 목록도 다시 맞춤
      window
        .jQuery(select)
        .trigger('change')
        .on('change', function () {
          render(true);
        });
    } else {
      select.addEventListener('change', function () {
        render(true);
      });
    }
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
      { passive: true },
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
