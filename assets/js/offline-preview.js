/* 화면 확인 전용: 보기 전환, 신청 영역 sticky 위치와 모바일 레이어를 제어합니다.
 * 검색, 페이지네이션, 데이터 생성, 신청 검증, 결제 및 저장 기능은 구현하지 않습니다. */
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  if ($('#ofe-list-view')) {
    const setView = (view) => {
      $('#ofe-list-view').hidden = view !== 'list';
      $('#ofe-calendar-view').hidden = view !== 'calendar';
      $$('[data-ofe-view]').forEach((button) => {
        const active = button.dataset.ofeView === view;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };
    $$('[data-ofe-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.ofeView)));
    setView(new URLSearchParams(location.search).get('view') === 'calendar' ? 'calendar' : 'list');
  }
  if ($('#ofe-apply-shell')) {
    const shell = $('#ofe-apply-shell');
    // 긴 신청 영역은 하단까지 읽은 뒤 화면 아래 24px 위치에 머뭅니다.
    // 높이만 측정하고 스크롤 고정은 CSS sticky로 처리합니다.
    const updateApplyHeight = () => {
      shell.style.setProperty('--ofe-apply-height', `${shell.getBoundingClientRect().height}px`);
    };
    new ResizeObserver(updateApplyHeight).observe(shell);
    updateApplyHeight();
    let returnFocus;
    const mobile = matchMedia('(max-width: 767px)');
    function openApply() {
      returnFocus = document.activeElement;
      shell.classList.add('is-open');
      shell.setAttribute('role', 'dialog');
      shell.setAttribute('aria-modal', 'true');
      document.body.style.overflow = 'hidden';
      $$('a[href], button, input, select, [tabindex="0"]', shell)
        .find((element) => !element.disabled && element.getClientRects().length)
        ?.focus();
    }
    function closeApply() {
      shell.classList.remove('is-open');
      shell.removeAttribute('role');
      shell.removeAttribute('aria-modal');
      document.body.style.overflow = '';
      returnFocus?.focus();
    }
    $('[data-apply-open]').addEventListener('click', openApply);
    shell.addEventListener('click', (event) => {
      if (event.target === shell) closeApply();
    });
    shell.addEventListener('keydown', (event) => {
      if (!shell.classList.contains('is-open') || $('dialog[open]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeApply();
      }
      if (event.key === 'Tab') {
        const elements = $$('a[href], button, input, select, [tabindex="0"]', shell).filter(
          (el) => !el.disabled && el.getClientRects().length,
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    mobile.addEventListener('change', () => {
      if (!mobile.matches) closeApply();
    });
  }
})();
