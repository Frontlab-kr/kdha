$(function () {
  // 교육 목록 카테고리 필터
  $('.edu-filter button').on('click', function () {
    var category = $(this).data('filter');
    $(this).addClass('is-active').siblings().removeClass('is-active');
    $('[data-category]').each(function () {
      $(this).toggle(category === 'all' || $(this).data('category') === category);
    });
  });

  $('.edu-search').on('submit', function (event) {
    event.preventDefault();
  });

  // 정적 주소검색 샘플에서는 검색 제출로 페이지가 새로고침되지 않도록 처리
  $('.edu-address-search').on('submit', function (event) {
    event.preventDefault();
    $(this).siblings('.edu-address-results').prop('hidden', false);
  });

  // 교육원 페이지의 공통 dialog 열기·닫기 및 배경 클릭 닫기
  $(document).on('click', '[data-dialog-open]', function () {
    var dialog = document.getElementById($(this).data('dialog-open'));
    if (dialog && !dialog.open) dialog.showModal();
  });

  $(document).on('click', '[data-dialog-close]', function () {
    var dialog = $(this).closest('dialog')[0];
    if (dialog?.open) dialog.close();
  });

  // 현재 dialog를 닫고 연결된 다음 dialog를 엽니다.
  $(document).on('click', '[data-dialog-switch]', function () {
    var currentDialog = $(this).closest('dialog')[0];
    var nextDialog = document.getElementById($(this).data('dialog-switch'));

    if (currentDialog?.open) currentDialog.close();
    if (nextDialog && !nextDialog.open) nextDialog.showModal();
  });

  $(document).on('click', 'dialog.edu-dialog, dialog.dialog', function (event) {
    if (event.target !== this || !this.open) return;

    var bounds = this.getBoundingClientRect();
    var clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) this.close();
  });

  // 주소검색 결과를 하나씩 펼치는 아코디언 및 주소 선택
  $(document).on('click', '.edu-address-result__toggle', function () {
    var currentResult = $(this).closest('.edu-address-result');
    var accordion = currentResult.closest('[data-address-accordion]');
    var isOpen = currentResult.hasClass('is-open');

    accordion.find('.edu-address-result').removeClass('is-open');
    accordion.find('.edu-address-result__toggle').attr('aria-expanded', 'false');
    accordion.find('.edu-address-result__panel').prop('hidden', true);

    if (!isOpen) {
      currentResult.addClass('is-open');
      $(this).attr('aria-expanded', 'true');
      currentResult.find('.edu-address-result__panel').prop('hidden', false);
    }
  });

  $(document).on('click', '[data-address-select]', function () {
    var dialog = $(this).closest('dialog');
    var selectedResult = dialog.find('.edu-address-result.is-open');
    var targetId = dialog.data('address-target');

    if (!selectedResult.length || !targetId) return;
    $('#' + targetId).val(selectedResult.data('address-value'));
    dialog[0].close();
  });

  function formatUploadFileSize(file) {
    var fileSize = file.size / (1024 * 1024);
    return fileSize >= 1 ? fileSize.toFixed(fileSize >= 10 ? 0 : 1) + 'MB' : Math.ceil(file.size / 1024) + 'KB';
  }

  // 면허증 파일을 선택하거나 드롭하면 파일 행을 추가
  $('#license-file').on('change', function () {
    var file = this.files?.[0];
    var $field = $(this).closest('.edu-field');
    var $item = $field.find('[data-file-item]');

    if (!file) {
      $item.prop('hidden', true);
      return;
    }

    $item.find('[data-file-name]').text(file.name);
    $item.find('[data-file-size]').text(formatUploadFileSize(file));
    $item.find('[data-file-remove]').attr('aria-label', file.name + ' 삭제');
    $item.prop('hidden', false);
  });

  $('.account-file-upload').on('dragover', function (event) {
    event.preventDefault();
  });

  $('.account-file-upload').on('drop', function (event) {
    event.preventDefault();
    var fileInput = $(this).find('input[type="file"]')[0];
    var files = event.originalEvent?.dataTransfer?.files;
    if (!fileInput || !files?.length) return;

    fileInput.files = files;
    $(fileInput).trigger('change');
  });

  $(document).on('click', '[data-file-remove]', function () {
    var $item = $(this).closest('[data-file-item]');
    var fileInput = $item.siblings('.account-file-upload').find('input[type="file"]')[0];
    if (fileInput) fileInput.value = '';
    $item.find('[data-file-name], [data-file-size]').empty();
    $item.prop('hidden', true);
  });

  // 이메일 도메인의 목록 선택과 직접입력 상태 전환
  $(document).on('click', '[data-email-domain-toggle]', function () {
    var $field = $(this).siblings('.account-email-domain__field');
    var $select = $field.find('.ds-select');
    var $input = $field.find('[data-email-domain-input]');
    var showDirectInput = $input.prop('hidden');

    $select.prop('hidden', showDirectInput);
    $input.prop('hidden', !showDirectInput);
    $(this).text(showDirectInput ? '목록선택' : '직접입력');
    if (showDirectInput) $input.trigger('focus');
    else $select.find('.ds-select__button').trigger('focus');
  });

  // 학력·협회임직경력 반복 카드 추가 및 삭제
  function cleanRepeatCardForTemplate($card) {
    $card.find('.ds-select').remove();
    $card.find('select[data-custom-select]').each(function () {
      $(this)
        .removeClass('ds-select__native')
        .removeAttr('aria-hidden tabindex data-custom-required')
        .prop('selectedIndex', 0);
    });
    $card.find('input').val('').removeClass('datepicker-input');
    $card.find('[data-datepicker-range]').removeAttr('data-datepicker-range-ready');
    return $card;
  }

  function updateRepeatCardNumbers($section) {
    var label = String($section.data('repeat-label') || '항목');
    var $cards = $section.find('[data-repeat-list] > [data-repeat-card]');
    var hasSingleCard = $cards.length === 1;

    $cards.each(function (index) {
      var title = label + ' ' + (index + 1);
      $(this).find('.account-repeat-card__heading > strong').text(title);
      $(this)
        .find('[data-repeat-remove]')
        .attr('aria-label', title + ' 삭제')
        .prop('disabled', hasSingleCard);
    });
  }

  $('[data-repeat-section]').each(function () {
    var $section = $(this);
    var $source = $section.find('[data-repeat-list] > [data-repeat-card]').first();
    if (!$source.length) return;

    var $template = cleanRepeatCardForTemplate($source.clone(false, false));
    $section.data('repeat-template', $template.prop('outerHTML'));
    updateRepeatCardNumbers($section);
  });

  $(document).on('click', '[data-repeat-add]', function () {
    var $section = $(this).closest('[data-repeat-section]');
    var template = $section.data('repeat-template');
    if (!template) return;

    var $card = $(template);
    $section.find('[data-repeat-list]').append($card);
    window.KDHAComponents?.initCustomSelects?.($card[0]);
    window.KDHAComponents?.initDateRangePickers?.($card[0]);
    updateRepeatCardNumbers($section);
    $card.find('button, input, select').filter(':visible:enabled').first().trigger('focus');
  });

  $(document).on('click', '[data-repeat-remove]', function () {
    var $section = $(this).closest('[data-repeat-section]');
    if ($section.find('[data-repeat-list] > [data-repeat-card]').length <= 1) return;

    $(this).closest('[data-repeat-card]').remove();
    updateRepeatCardNumbers($section);
    $section.find('[data-repeat-add]').trigger('focus');
  });

  // URL의 page 값에 따른 페이지네이션 상태 및 이동 링크 설정
  $('[data-pagination]').each(function () {
    var pagination = $(this);
    var lastPage = Number(pagination.data('last-page')) || 1;
    var requestedPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
    var currentPage = Math.min(Math.max(requestedPage, 1), lastPage);
    var basePath = window.location.pathname;

    pagination.find('[data-page]').each(function () {
      var isCurrent = Number($(this).data('page')) === currentPage;
      $(this).toggleClass('is-current', isCurrent);
      if (isCurrent) $(this).attr('aria-current', 'page');
      else $(this).removeAttr('aria-current');
    });

    pagination.find('[data-page-control="first"]').attr('href', basePath + '?page=1');
    pagination.find('[data-page-control="prev"]').attr('href', basePath + '?page=' + Math.max(currentPage - 1, 1));
    pagination
      .find('[data-page-control="next"]')
      .attr('href', basePath + '?page=' + Math.min(currentPage + 1, lastPage));
    pagination.find('[data-page-control="last"]').attr('href', basePath + '?page=' + lastPage);
  });

  // 주소검색 dialog를 연 입력 필드 저장
  $(document).on('click', '[data-dialog-open][data-address-target]', function () {
    var dialog = document.getElementById($(this).data('dialog-open'));
    if (dialog) $(dialog).data('address-target', $(this).data('address-target'));
  });

  // 화면 확인 메뉴에서 다른 페이지의 dialog 레이어 불러오기
  $('.account-layer-menu a[href*="#"], [data-dialog-link][href*="#"]').on('click', function (event) {
    event.preventDefault();

    var link = new URL(this.href, window.location.href);
    var dialogId = link.hash.slice(1);
    var currentDialog = document.getElementById(dialogId);

    if (currentDialog) {
      currentDialog.showModal();
      return;
    }

    fetch(link.pathname)
      .then(function (response) {
        if (!response.ok) throw new Error('레이어 화면을 불러오지 못했습니다.');
        return response.text();
      })
      .then(function (html) {
        var source = new DOMParser().parseFromString(html, 'text/html');
        var sourceDialog = source.getElementById(dialogId);
        if (!sourceDialog || sourceDialog.tagName !== 'DIALOG') throw new Error('레이어가 없습니다.');

        var importedDialog = document.importNode(sourceDialog, true);
        document.body.appendChild(importedDialog);
        importedDialog.showModal();
      })
      .catch(function () {
        alert('레이어 화면을 불러오지 못했습니다.');
      });
  });

  // URL hash로 지정된 회원 dialog 레이어 열기
  function openAccountDialogFromHash() {
    var dialogId = window.location.hash.slice(1);
    var dialog = document.getElementById(dialogId);
    if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
  }

  openAccountDialogFromHash();
  $(window).on('hashchange', openAccountDialogFromHash);

  // 로그인 필수 입력값 검증
  $('.edu-login-form').on('submit', function (event) {
    event.preventDefault();
    var $form = $(this);
    var $requiredFields = $form.find('[required]');
    var $password = $form.find('[name="password"]');
    var $passwordField = $password.closest('.edu-field');
    var $passwordError = $passwordField.find('small');
    $form.find('.edu-field').removeClass('has-error');
    $requiredFields.removeAttr('aria-invalid aria-describedby');
    $passwordError.text('비밀번호를 입력해 주세요.');
    var hasError = false;
    $requiredFields.each(function () {
      if (!this.value.trim()) {
        var $field = $(this).closest('.edu-field');
        var errorId = $field.find('small').attr('id');
        $field.addClass('has-error');
        $(this).attr({ 'aria-invalid': 'true', 'aria-describedby': errorId });
        hasError = true;
      }
    });

    // 퍼블리싱 화면에서는 값이 모두 입력되면 계정정보 불일치 상태를 확인합니다.
    if (!hasError) {
      $passwordField.addClass('has-error');
      $passwordError.text('입력하신 정보가 일치하지 않습니다.');
      $password.attr({ 'aria-invalid': 'true', 'aria-describedby': 'login-password-error' }).trigger('focus');
    }
  });

  // 아이디·비밀번호 찾기 결과 레이어 전환
  $('.edu-find-form').on('submit', function (event) {
    event.preventDefault();
    var resultId = $(this).data('result');
    var currentDialog = $(this).closest('dialog')[0];
    currentDialog.close();
    if (resultId) document.getElementById(resultId).showModal();
  });

  // 회원가입 약관 전체 선택 및 필수 약관 검증
  $('[data-terms-all]').on('change', function () {
    $('.edu-terms-card input[type="radio"][value="' + (this.checked ? 'yes' : 'no') + '"]').prop('checked', true);
  });

  $('.edu-terms-card').on('submit', function (event) {
    if ($(this).find('[data-required-term]:checked').length !== 2) {
      event.preventDefault();
      alert('필수 약관에 모두 동의해 주세요.');
    }
  });

  // 신규 회원가입 약관 화면의 필수 동의 여부 검증
  $('[data-terms-all]').on('change', function () {
    $(this)
      .closest('form')
      .find('input[type="radio"][value="' + (this.checked ? 'yes' : 'no') + '"]')
      .prop('checked', true);
  });

  $('.account-join-terms input[type="radio"], .account-join-pre-member-form input[type="radio"]').on(
    'change',
    function () {
      var form = $(this).closest('form');
      var requiredCount = form.find('[data-required-term]').length;
      var agreedCount = form.find('[data-required-term]:checked').length;
      form.find('[data-terms-all]').prop('checked', requiredCount === agreedCount);
    },
  );

  $('.account-join-pre-member-form').on('submit', function (event) {
    if ($(this).find('[data-required-term]:checked').length !== 2) {
      event.preventDefault();
      alert('필수 약관에 모두 동의해 주세요.');
    }
  });

  $('.account-join-terms').on('submit', function (event) {
    if ($(this).find('[data-required-term]:checked').length !== 2) {
      event.preventDefault();
      alert('필수 약관에 모두 동의해 주세요.');
    }
  });
});
