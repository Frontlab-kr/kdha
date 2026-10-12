$(function () {
  // 정회원 안내: 분류 탭으로 혜택 카드 걸러 보기
  var $filter = $('[data-member-filter]');
  var $cards = $('[data-member-category]');
  var $status = $('[data-member-status]');

  $filter.on('click', '[data-member-filter-value]', function () {
    var value = $(this).data('member-filter-value');
    $filter.find('[data-member-filter-value]').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    $cards.each(function () {
      this.hidden = value !== 'all' && $(this).data('member-category') !== value;
    });
    $status.text($(this).text() + ' 혜택 ' + $cards.filter(':not([hidden])').length + '건');
  });
});
