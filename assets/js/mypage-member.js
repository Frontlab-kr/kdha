$(function () {
  // 마이페이지 회원정보 수정(/mypage/member/*) 전용 동작
  // 다이얼로그 열기·전환(data-dialog-open / data-dialog-switch), 날짜 선택기, 커스텀 셀렉트, 이메일 직접입력은 common.js,
  // 파일 첨부와 취업현황 상세 연동은 mypage.js 공통 동작을 사용합니다.

  // 저장하기: 폼을 바로 전송하지 않고 저장 확인 알림(data-confirm)을 엽니다. 확인 → 저장 완료 알림으로 전환합니다.
  $(document).on('submit', '[data-mypage-member-form]', function (event) {
    event.preventDefault();
    var dialog = document.getElementById($(this).data('confirm'));
    if (dialog && !dialog.open) dialog.showModal();
  });

  // 학력현황 · 협회임직경력 반복 카드 추가 및 삭제 (회원가입 화면과 같은 마크업)
  function cleanRepeatCardForTemplate($card) {
    $card.find('.datepicker').remove();
    $card.find('.ds-select').remove();
    $card.find('select[data-custom-select]').each(function () {
      $(this)
        .removeClass('ds-select__native')
        .removeAttr('aria-hidden tabindex data-custom-required')
        .removeData('custom-select-ready')
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

  $('.mypage-member [data-repeat-section]').each(function () {
    var $section = $(this);
    var $source = $section.find('[data-repeat-list] > [data-repeat-card]').first();
    if (!$source.length) return;

    var $template = cleanRepeatCardForTemplate($source.clone(false, false));
    $section.data('repeat-template', $template.prop('outerHTML'));
    updateRepeatCardNumbers($section);
  });

  $(document).on('click', '.mypage-member [data-repeat-add]', function () {
    var $section = $(this).closest('[data-repeat-section]');
    var template = $section.data('repeat-template');
    if (!template) return;

    var $card = $(template);
    $section.find('[data-repeat-list]').append($card);
    window.KDHAComponents?.initCustomSelects?.($card[0]);
    window.KDHAComponents?.initDateRangePickers?.($card[0]);
    updateRepeatCardNumbers($section);
    // 새 카드의 첫 입력 항목(셀렉트 버튼·입력칸)으로 초점을 옮깁니다. 삭제 버튼보다 입력이 먼저입니다.
    $card
      .find('.account-repeat-card__form')
      .find('button, input, select')
      .filter(':visible:enabled')
      .first()
      .trigger('focus');
  });

  $(document).on('click', '.mypage-member [data-repeat-remove]', function () {
    var $section = $(this).closest('[data-repeat-section]');
    if ($section.find('[data-repeat-list] > [data-repeat-card]').length <= 1) return;

    var $card = $(this).closest('[data-repeat-card]');
    $card.find('[data-datepicker-range]').each(function () {
      this.rangepicker?.destroy();
    });
    $card.remove();
    updateRepeatCardNumbers($section);
    $section.find('[data-repeat-add]').trigger('focus');
  });
});
