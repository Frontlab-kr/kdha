(function () {
  'use strict';

  // 구인구직(KD-US-REC · KD-US-FIN) 화면 동작. 서버 연동 전에는 값을 전송·저장하지 않습니다.

  function openDialog(id) {
    var dialog = document.getElementById(id);
    if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
  }

  // 한 그룹 안에서 하나만 선택(정렬 · 1단계 목록)
  document.querySelectorAll('[data-jobs-toggle-group]').forEach(function (group) {
    group.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button || !group.contains(button)) return;
      group.querySelectorAll('button').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      // 2단계 목록 제목(예: 서울 · 시군구)을 선택한 1단계 항목으로 바꿉니다.
      var heading = group.parentElement.querySelector('[data-jobs-group-heading]');
      if (heading) heading.textContent = button.textContent.trim() + heading.dataset.jobsGroupHeading;
    });
  });

  // 검색 조건 옵션: 여러 개 선택
  document.querySelectorAll('[data-jobs-options]').forEach(function (options) {
    options.addEventListener('click', function (event) {
      var button = event.target.closest('.jobs-option');
      if (!button) return;
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    });
  });

  // 검색 조건 단계 탭(근무지역 · 지하철노선 · 근무형태 · 업무 · 근무시간)
  document.querySelectorAll('[data-jobs-filter]').forEach(function (filter) {
    var steps = Array.from(filter.querySelectorAll('[role="tab"]'));

    function select(step) {
      steps.forEach(function (item) {
        var selected = item === step;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    }

    steps.forEach(function (step, index) {
      step.tabIndex = step.getAttribute('aria-selected') === 'true' ? 0 : -1;
      step.addEventListener('click', function () {
        select(step);
      });
      step.addEventListener('keydown', function (event) {
        var next = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (!next) return;
        event.preventDefault();
        var target = steps[(index + next + steps.length) % steps.length];
        select(target);
        target.focus();
      });
    });

    // 화면 확인용: /career/jobs/#jobs-filter-region 처럼 패널 id로 열기
    function fromHash() {
      var panel = window.location.hash && filter.querySelector(window.location.hash + '[role="tabpanel"]');
      if (panel) select(document.getElementById(panel.getAttribute('aria-labelledby')));
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);

    var chips = filter.querySelector('.jobs-chips');
    if (chips) {
      chips.addEventListener('click', function (event) {
        var chip = event.target.closest('button');
        if (chip) chip.remove();
      });
    }
    var reset = filter.querySelector('[data-jobs-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        filter.querySelectorAll('.jobs-option[aria-pressed="true"]').forEach(function (button) {
          button.setAttribute('aria-pressed', 'false');
        });
        filter.querySelectorAll('.jobs-filter__value').forEach(function (value) {
          value.textContent = '';
        });
        // 선택 칩만 지우고 '선택한 조건이 없습니다' 안내 문구는 남깁니다.
        if (chips) {
          chips.querySelectorAll('button').forEach(function (chip) {
            chip.remove();
          });
        }
      });
    }
  });

  // 글자 수 표시(병원소개 100자)
  document.querySelectorAll('[data-jobs-count]').forEach(function (field) {
    var output = document.getElementById(field.dataset.jobsCount);
    function update() {
      output.textContent = field.value.length + ' / ' + field.maxLength;
    }
    field.addEventListener('input', update);
    update();
  });

  // 첨부 파일 이름 표시
  document.querySelectorAll('[data-jobs-drop]').forEach(function (drop) {
    var input = drop.querySelector('input[type="file"]');
    var list = drop.querySelector('[data-jobs-drop-list]');
    input.addEventListener('change', function () {
      list.textContent = Array.from(input.files)
        .map(function (file) {
          return file.name;
        })
        .join(', ');
    });
  });

  // 학력·경력 행 추가/삭제(제목 행의 추가 버튼 · 행의 삭제 버튼)
  var repeatSequence = 0;
  document.querySelectorAll('[data-jobs-repeat]').forEach(function (repeat) {
    var template = repeat.querySelector('[data-jobs-repeat-row]').cloneNode(true);
    repeat.addEventListener('click', function (event) {
      if (event.target.closest('[data-jobs-repeat-add]')) {
        var row = template.cloneNode(true);
        var rows = repeat.querySelectorAll('[data-jobs-repeat-row]');
        repeatSequence += 1;
        row.querySelectorAll('input').forEach(function (input) {
          input.value = '';
        });
        // 복제한 행의 id와 연결 속성이 겹치지 않게 번호를 붙입니다.
        row.querySelectorAll('[id]').forEach(function (node) {
          node.id = node.id + '-' + repeatSequence;
        });
        row.querySelectorAll('[aria-labelledby]').forEach(function (node) {
          node.setAttribute('aria-labelledby', node.getAttribute('aria-labelledby') + '-' + repeatSequence);
        });
        // 복제한 행의 셀렉트는 공통 커스텀 셀렉트를 다시 만듭니다.
        row.querySelectorAll('.ds-select').forEach(function (custom) {
          custom.remove();
        });
        row.querySelectorAll('select.ds-select__native').forEach(function (native) {
          native.classList.remove('ds-select__native');
          native.removeAttribute('tabindex');
          native.removeAttribute('aria-hidden');
          native.selectedIndex = 0;
        });
        rows[rows.length - 1].after(row);
        if (window.KDHAComponents && window.KDHAComponents.initCustomSelects) {
          window.KDHAComponents.initCustomSelects(row);
        }
        return;
      }
      var remove = event.target.closest('[data-jobs-repeat-remove]');
      if (remove && repeat.querySelectorAll('[data-jobs-repeat-row]').length > 1) {
        remove.closest('[data-jobs-repeat-row]').remove();
      }
    });
  });

  // 업무능력 점수(0~10)
  document.querySelectorAll('[data-jobs-skill]').forEach(function (skill) {
    var meter = skill.querySelector('progress');
    var value = skill.querySelector('[data-jobs-skill-value]');
    var input = skill.querySelector('input[type="hidden"]');
    var buttons = skill.querySelectorAll('[data-jobs-skill-step]');
    function render(score) {
      meter.value = score;
      meter.textContent = score + ' / 10';
      value.textContent = score;
      input.value = score;
      buttons[0].disabled = score <= 0;
      buttons[1].disabled = score >= 10;
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var score = Math.min(10, Math.max(0, Number(input.value) + Number(button.dataset.jobsSkillStep)));
        render(score);
      });
    });
    render(Number(input.value));
  });

  // 등록 폼: 필수 항목 확인 후 알림(서버 전송 없음)
  document.querySelectorAll('[data-jobs-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        openDialog(form.dataset.jobsInvalid);
        return;
      }
      if (form.dataset.jobsSuccess) openDialog(form.dataset.jobsSuccess);
    });
  });
})();
