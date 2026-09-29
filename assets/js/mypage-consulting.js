(function () {
  'use strict';

  // 마이페이지 상담관리 전용 동작 — 필수 확인·첨부 파일은 career-contact.js, 커스텀 셀렉트는 common.js 공통 동작 사용
  // 커스텀 셀렉트(data-custom-select)는 네이티브 required가 해제되어 form.checkValidity()에서 빠집니다.
  // 분류를 고르지 않고 등록하면 등록 확인 얼럿 대신 필수 항목 얼럿을 먼저 엽니다. (서버 전송 없음)
  document.addEventListener(
    'submit',
    function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches('.mypage-consult [data-consult-form]')) return;

      var emptySelects = Array.prototype.filter.call(
        form.querySelectorAll('select[data-custom-required]'),
        function (select) {
          return !select.value;
        },
      );
      if (!emptySelects.length) return;

      // 캡처 단계에서 멈춰 career-contact.js의 등록 확인 얼럿이 열리지 않게 합니다.
      event.preventDefault();
      event.stopPropagation();

      emptySelects.forEach(function (select) {
        var field = select.closest('.form-field');
        var button = field && field.querySelector('.ds-select__button');
        if (field) field.classList.add('has-error');
        if (button) button.setAttribute('aria-invalid', 'true');
      });

      var dialog = document.getElementById(form.dataset.consultInvalid);
      if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
    },
    true,
  );
})();
