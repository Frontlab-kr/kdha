$(function () {
  // 마이페이지 결제관리(회비 내역) 전용 동작 — 탭·필터 칩·다이얼로그 열기는 mypage.js / common.js 공통 동작 사용

  // 회비 내역 전체 선택: 선택할 수 있는(비활성이 아닌) 행만 함께 체크합니다.
  function syncDuesCheckAll() {
    var $enabled = $('[data-dues-check]:not(:disabled)');
    var checkedCount = $enabled.filter(':checked').length;
    $('[data-dues-check-all]').prop({
      checked: $enabled.length > 0 && checkedCount === $enabled.length,
      indeterminate: checkedCount > 0 && checkedCount < $enabled.length,
    });
  }

  $(document).on('change', '[data-dues-check-all]', function () {
    $('[data-dues-check]:not(:disabled)').prop('checked', this.checked);
    syncDuesCheckAll();
  });

  $(document).on('change', '[data-dues-check]', syncDuesCheckAll);

  // 서버에서 일부 행을 선택된 상태로 내려줘도 전체 선택 상태가 맞도록 처음 한 번 맞춥니다.
  syncDuesCheckAll();

  // 환불 신청하기: 선택한 내역이 없으면 필수 항목 안내, 있으면 환불 신청 확인 얼럿을 엽니다.
  $(document).on('click', '[data-dues-refund]', function () {
    var hasSelection = $('[data-dues-check]:checked').length > 0;
    var dialog = document.getElementById(hasSelection ? 'dues-refund-item-alert' : 'dues-required-alert');
    if (dialog && !dialog.open) dialog.showModal();
  });
  // 결제 교육 상세: 전체 선택은 같은 표에서 선택할 수 있는(이수·환불완료로 비활성이 아닌) 교육만 함께 체크합니다.
  $(document).on('change', '[data-pay-check-all]', function () {
    $(this).closest('[role="table"]').find('[data-pay-check]:not(:disabled)').prop('checked', this.checked);
  });

  // 환불 요청 팝업(결제 내역 PAY-02-05P · 회비 내역 SB 31): 필수 입력이 비면 필수 항목 안내, 모두 입력하면 환불 신청 확인 얼럿으로 넘어갑니다.
  $(document).on('submit', '[data-pay-refund-form]', function (event) {
    event.preventDefault();
    var form = this;
    var hasEmpty = $(form)
      .find('[required]')
      .toArray()
      .some(function (field) {
        return !String(field.value).trim();
      });
    var next = document.getElementById($(form).data(hasEmpty ? 'pay-invalid' : 'pay-confirm'));
    if (!hasEmpty) {
      var current = $(form).closest('dialog')[0];
      if (current?.open) current.close();
    }
    if (next && !next.open) next.showModal();
  });
});
