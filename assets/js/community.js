(function () {
  'use strict';

  document.querySelectorAll('[data-community-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      var status = document.querySelector('[data-community-action-status]');
      if (status) {
        status.hidden = false;
        status.textContent = button.dataset.communityAction;
      }
    });
  });

  document.querySelectorAll('[data-volunteer-write]').forEach(function (form) {
    var regions = Array.from(form.querySelectorAll('[name="region"]'));
    function validate() {
      regions[0].setCustomValidity(
        regions.some(function (input) {
          return input.checked;
        })
          ? ''
          : '지역을 하나 이상 선택해 주세요.',
      );
      ['volunteer', 'apply'].forEach(function (key) {
        var start = form.elements[key + 'Start'];
        var end = form.elements[key + 'End'];
        end.min = start.value;
        end.setCustomValidity(
          start.value && end.value && end.value < start.value ? '종료일은 시작일 이후로 선택해 주세요.' : '',
        );
      });
    }
    form.addEventListener('change', validate);
    validate();
  });

  // 서버 연동 전에는 게시물·댓글 및 첨부파일을 전송하거나 저장하지 않습니다.
  document.querySelectorAll('[data-community-draft]').forEach(function (form) {
    var input = form.querySelector('input[type="file"]');
    var files = [];
    var organizationField = form.elements.organization;
    if (organizationField) {
      var key = new URLSearchParams(location.search).get('organization');
      organizationField.value = { health: '보건회', clinical: '임상회', military: '군진회' }[key] || '보건회';
    }
    if (input) {
      var list = form.querySelector('[data-upload-list]');
      var status = form.querySelector('[data-upload-status]');
      var drop = form.querySelector('.community-upload__drop');
      drop.addEventListener('dragover', function (event) {
        event.preventDefault();
      });
      drop.addEventListener('drop', function (event) {
        event.preventDefault();
        input.files = event.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      });
      input.addEventListener('change', function () {
        var chosen = Array.from(input.files);
        var allowed = /\.(hwp|hwpx|pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|zip)$/i;
        if (
          files.length + chosen.length > 5 ||
          chosen.some(function (file) {
            return file.size > 10 * 1024 * 1024 || !allowed.test(file.name);
          })
        ) {
          status.classList.remove('sr-only');
          status.textContent = '파일 형식과 용량을 확인해 주세요. 파일당 10MB 이하, 최대 5개까지 선택할 수 있습니다.';
          input.value = '';
          return;
        }
        files = files.concat(chosen);
        input.value = '';
        // 선택 결과는 파일 목록으로 보이므로 안내 문구는 스크린리더에만 읽힙니다.
        status.classList.add('sr-only');
        status.textContent = files.length + '개 파일을 선택했습니다.';
        renderFiles();
      });
      function renderFiles() {
        list.replaceChildren();
        files.forEach(function (file, index) {
          // 공통 파일 항목(account-file-upload__item) 구조
          var row = document.createElement('li');
          row.className = 'account-file-upload__item';
          var name = document.createElement('span');
          name.setAttribute('data-file-name', '');
          name.textContent = file.name;
          var meta = document.createElement('span');
          meta.className = 'account-file-upload__meta';
          var size = document.createElement('small');
          size.textContent = (file.size / 1024 / 1024).toFixed(1) + 'MB';
          var remove = document.createElement('button');
          remove.type = 'button';
          remove.setAttribute('aria-label', file.name + ' 삭제');
          var icon = document.createElement('span');
          icon.className = 'material-symbols-rounded';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = 'close';
          remove.append(icon);
          remove.addEventListener('click', function () {
            files.splice(index, 1);
            renderFiles();
            status.textContent = files.length + '개 파일을 선택했습니다.';
            var buttons = list.querySelectorAll('button');
            (buttons[Math.min(index, buttons.length - 1)] || input).focus();
          });
          meta.append(size, remove);
          row.append(name, meta);
          list.append(row);
        });
      }
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = form.querySelector('[data-draft-status]');
      status.hidden = false;
      status.textContent = '등록 기능은 준비 중입니다.';
    });
  });

  // 정적 공개 목록의 검색·페이지 수 변경·페이지 이동. 서버 연동 시 같은 상태 구조를 유지합니다.
  document.querySelectorAll('[data-community-board]').forEach(function (board) {
    var form = board.querySelector('form');
    var rows = Array.from(board.querySelectorAll('[data-community-row]'));
    var limit = board.querySelector('[data-community-limit]');
    var pagination = board.querySelector('[data-community-pagination]');
    var page = 1;
    var matches = rows;
    var surveyState = 'all';
    var eventFilter = board.querySelector('[data-event-filter][aria-pressed="true"]');
    var eventCategory = eventFilter ? eventFilter.dataset.eventFilter : '';
    var organization = board.querySelector('[data-organization-filter][aria-pressed="true"]');
    var organizationKey = organization ? organization.dataset.organizationFilter : '';
    var query = '';
    var field = 'all';
    function filterRows() {
      matches = rows.filter(function (row) {
        if (eventCategory && row.dataset.eventCategory !== eventCategory) return false;
        if (organizationKey && row.dataset.organization !== organizationKey) return false;
        if (surveyState !== 'all' && row.dataset.surveyState !== surveyState) return false;
        var value =
          field === 'author'
            ? row.dataset.author
            : field === 'title'
              ? row.querySelector('[data-community-title], .ds-board__title').textContent
              : row.textContent;
        return value.toLocaleLowerCase().includes(query);
      });
      page = 1;
      render(true);
    }
    board.querySelectorAll('[data-survey-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        surveyState = button.dataset.surveyFilter;
        board.querySelectorAll('[data-survey-filter]').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        filterRows();
      });
    });
    board.querySelectorAll('[data-event-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        eventCategory = button.dataset.eventFilter;
        board.querySelectorAll('[data-event-filter]').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        filterRows();
      });
    });
    board.querySelectorAll('[data-organization-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        organizationKey = button.dataset.organizationFilter;
        board.querySelectorAll('[data-organization-filter]').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        var writeLink = board.querySelector('.community-list-tools--write a');
        if (writeLink) writeLink.href = '/kdha/community/organizations/write/?organization=' + organizationKey;
        filterRows();
      });
    });
    function render(announce) {
      var size = Number(limit.value);
      var pages = Math.max(1, Math.ceil(matches.length / size));
      page = Math.min(page, pages);
      rows.forEach(function (row) {
        row.hidden = true;
      });
      matches.slice((page - 1) * size, page * size).forEach(function (row) {
        row.hidden = false;
      });
      board.querySelector('.community-empty').hidden = matches.length !== 0;
      pagination.replaceChildren();
      pagination.hidden = matches.length === 0;
      function add(label, target, name, disabled, current, icon) {
        var button = document.createElement('button');
        button.type = 'button';
        if (icon) {
          var glyph = document.createElement('span');
          glyph.className = 'material-symbols-rounded';
          glyph.setAttribute('aria-hidden', 'true');
          glyph.textContent = icon;
          button.append(glyph);
        } else {
          button.textContent = label;
        }
        button.setAttribute('aria-label', name);
        button.disabled = disabled;
        if (current) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', function () {
          page = target;
          render(true);
          pagination.querySelector('[aria-current]').focus();
        });
        pagination.append(button);
      }
      add('', page - 1, '이전 페이지', page === 1, false, 'arrow_back_ios_new');
      var start = Math.max(1, Math.min(page - 2, pages - 4));
      for (var i = start; i <= Math.min(pages, start + 4); i++) add(String(i), i, i + '페이지', false, i === page);
      add('', page + 1, '다음 페이지', page === pages, false, 'arrow_forward_ios');
      if (announce)
        board.querySelector('[data-community-status]').textContent =
          '검색 결과 ' + matches.length + '건, ' + page + ' / ' + pages + '페이지';
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      query = form.elements.query.value.trim().toLocaleLowerCase();
      field = form.elements.field.value;
      filterRows();
    });
    // 공통 커스텀 셀렉트는 jQuery change 이벤트를 발생시킵니다.
    window.jQuery(limit).on('change', function () {
      page = 1;
      render(true);
    });
    render(false);
  });

  // 설문은 퍼블리싱 단계에서 유효성 검사만 수행하며 응답을 전송하거나 저장하지 않습니다.
  var surveyForm = document.querySelector('[data-survey-form]');
  if (surveyForm) {
    surveyForm.addEventListener('submit', function (event) {
      event.preventDefault();
      // 필수 문항 응답 여부에 따라 제출 완료·실패 알림을 표시합니다.
      var isValid = surveyForm.checkValidity();
      var alertDialog = document.getElementById(isValid ? 'survey-complete-dialog' : 'survey-required-dialog');
      if (isValid) surveyForm.closest('dialog').close();
      if (alertDialog) alertDialog.showModal();
    });
  }

  // 기존 공통 탭의 키보드 전환을 유지하면서 현재 분류의 질문·답변을 검색합니다.
  // URL hash로 지정된 질문의 분류 탭을 선택하고 해당 질문을 펼칩니다. (예: 푸터 원격지원 → #faq-remote-support)
  var faqTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (faqTarget && faqTarget.matches('.community-faq__item')) {
    // 공통 탭 스크립트가 초기화된 뒤 실행
    $(function () {
      var faqPanel = faqTarget.closest('[role="tabpanel"]');
      var faqTab = faqPanel && document.querySelector('[aria-controls="' + faqPanel.id + '"]');
      if (faqTab) faqTab.click();
      faqTarget.open = true;
      faqTarget.scrollIntoView({ block: 'start' });
    });
  }

  var faq = document.querySelector('[data-community-faq]');
  var faqForm = document.querySelector('[data-faq-search]');
  if (faq && faqForm) {
    var faqQuery = '';
    function filterFaq() {
      var panel = faq.querySelector('[role="tabpanel"]:not([hidden])');
      var count = 0;
      panel.querySelectorAll('details').forEach(function (item) {
        var match = item.textContent.toLocaleLowerCase().includes(faqQuery);
        item.hidden = !match;
        if (match) count++;
      });
      faq.querySelector('[data-faq-empty]').hidden = count > 0;
      faq.querySelector('[data-faq-empty]').textContent = faqQuery
        ? '검색 결과가 없습니다.'
        : '등록된 질문이 없습니다.';
      faq.querySelector('[data-faq-status]').textContent = '현재 분류 검색 결과 ' + count + '건';
    }
    faqForm.addEventListener('submit', function (event) {
      event.preventDefault();
      faqQuery = faqForm.elements.query.value.trim().toLocaleLowerCase();
      filterFaq();
    });
    new MutationObserver(filterFaq).observe(faq.querySelector('[role="tablist"]'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected'],
    });
    faq.querySelectorAll('details').forEach(function (item) {
      item.setAttribute('name', item.closest('[role="tabpanel"]').id + '-accordion');
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        item.parentElement.querySelectorAll('details').forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }
})();
