$(function () {
  // 마이페이지 공통 동작 (다이얼로그 열기·닫기, 날짜 선택기, 커스텀 셀렉트, 이메일 직접입력은 common.js 공통 동작 사용)

  // 모바일 알약형 탭: 현재 섹션 탭이 가로 스크롤 영역의 왼쪽에 보이도록 위치를 맞춥니다(앞 탭이 12px 보이게).
  $('[data-mypage-tabs]').each(function () {
    var nav = this;
    var current = nav.querySelector('[aria-current="page"]');
    if (!current || nav.scrollWidth <= nav.clientWidth) return;
    var paddingLeft = parseFloat(window.getComputedStyle(nav).paddingLeft) || 0;
    var offset = current.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    nav.scrollLeft = Math.max(0, offset - paddingLeft - 12);
  });

  // 화면 확인 메뉴: 이미 같은 해시가 주소에 있어도 다시 누르면 레이어를 엽니다.
  $(document).on('click', '.account-layer-menu a[href*="#"]', function () {
    var url = new URL(this.href, window.location.href);
    if (url.pathname !== window.location.pathname || url.hash !== window.location.hash) return;
    var dialog = document.getElementById(url.hash.slice(1));
    if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
  });

  // 상태 필터 칩: aria-pressed 전환 + data-mypage-filter="목록 id"가 있으면 [data-filter-item] 행을 걸러 표시합니다.
  $(document).on('click', '[data-mypage-filter] > button', function () {
    var $button = $(this);
    var $group = $button.closest('[data-mypage-filter]');
    var value = String($button.data('filter-value') || 'all');
    var listId = $group.data('mypage-filter');

    $group.children('button').attr('aria-pressed', 'false');
    $button.attr('aria-pressed', 'true');
    if (!listId) return;

    var $items = $('#' + listId).find('[data-filter-item]');
    $items.each(function () {
      this.hidden = value !== 'all' && String($(this).data('filter-item')) !== value;
    });
    $('[data-mypage-filter-count="' + listId + '"]').text($items.filter(':not([hidden])').length);
  });

  // 파일 첨부(면허증 사본 등): 선택하거나 끌어다 놓으면 파일 행을 표시합니다.
  function formatUploadFileSize(file) {
    var fileSize = file.size / (1024 * 1024);
    return fileSize >= 1 ? fileSize.toFixed(fileSize >= 10 ? 0 : 1) + 'MB' : Math.ceil(file.size / 1024) + 'KB';
  }

  $(document).on('change', '[data-mypage-upload] input[type="file"]', function () {
    var file = this.files && this.files[0];
    var $item = $(this).closest('[data-mypage-upload]').find('[data-file-item]');

    if (!file) {
      $item.prop('hidden', true);
      return;
    }

    $item.find('[data-file-name]').text(file.name);
    $item.find('[data-file-size]').text(formatUploadFileSize(file));
    $item.find('[data-file-remove]').attr('aria-label', file.name + ' 삭제');
    $item.prop('hidden', false);
  });

  $(document).on('dragover', '[data-mypage-upload] .account-file-upload', function (event) {
    event.preventDefault();
  });

  $(document).on('drop', '[data-mypage-upload] .account-file-upload', function (event) {
    event.preventDefault();
    var fileInput = $(this).find('input[type="file"]')[0];
    var files = event.originalEvent && event.originalEvent.dataTransfer && event.originalEvent.dataTransfer.files;
    if (!fileInput || !files || !files.length) return;

    fileInput.files = files;
    $(fileInput).trigger('change');
  });

  $(document).on('click', '[data-mypage-upload] [data-file-remove]', function () {
    var $upload = $(this).closest('[data-mypage-upload]');
    var $item = $(this).closest('[data-file-item]');
    var fileInput = $upload.find('input[type="file"]')[0];
    if (fileInput) fileInput.value = '';
    $item.find('[data-file-name], [data-file-size]').empty();
    $item.prop('hidden', true);
    $upload.find('.account-file-upload label').trigger('focus');
  });

  // 취업현황: 구분에 따라 상세 선택지를 바꾸고 이전 선택은 초기화합니다. (회원가입 화면과 같은 목록)
  var employmentDetails = {
    '': ['취업현황상세'],
    clinical: ['취업현황상세', '종합병원', '치과병원', '요양병원', '치과의원', '기타'],
    'public-health': ['취업현황상세', '보건소', '보건지소', '기타'],
    other: ['기타'],
    unemployed: ['미취업'],
  };

  $(document).on('change', '[data-mypage-employment]', function () {
    var $detail = $(this).closest('.mypage-form__split').find('[data-mypage-employment-detail]');
    $detail.empty();
    (employmentDetails[this.value] || employmentDetails['']).forEach(function (label, index) {
      var isPlaceholder = index === 0 && label === '취업현황상세';
      var option = new Option(label, isPlaceholder ? '' : label);
      if (!isPlaceholder) option.setAttribute('data-placeholder', 'false');
      $detail.append(option);
    });
    $detail.prop('selectedIndex', 0).trigger('change');
  });
});
