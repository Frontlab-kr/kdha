/* 회관기금(KD-US-CON-01-01) 화면 확인용 스크립트
 * 기부 신청: 필수 입력 확인 → 신청 확인 알림 → 완료 알림. 실제 저장은 서버 연동 시 처리합니다. */
(() => {
  const form = document.querySelector('[data-fund-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.closest('dialog').close();
    document.getElementById('fund-confirm-dialog').showModal();
  });
})();
