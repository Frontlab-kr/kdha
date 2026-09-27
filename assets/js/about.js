/* 협회소개 화면 스크립트 */
(() => {
  // 협회조직 KD-US-ORG-01-01: 조직도 항목을 선택하면 아래 상세(집행부·분과위원회·시도회·산하단체·학회)를 표시합니다.
  // 주소 해시(#organization-branches 등)로도 바로 열 수 있습니다.
  const org = document.querySelector('[data-about-organization]');
  if (org) {
    const buttons = [...org.querySelectorAll('[data-org-target]')];
    const select = (key, scroll) => {
      buttons.forEach((button) => {
        const active = button.dataset.orgTarget === key;
        button.setAttribute('aria-expanded', String(active));
        document.getElementById(`organization-${button.dataset.orgTarget}`).hidden = !active;
      });
      const panel = document.getElementById(`organization-${key}`);
      if (panel && scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.orgTarget, true)));
    const fromHash = () => {
      const key = location.hash.replace('#organization-', '');
      if (buttons.some((button) => button.dataset.orgTarget === key)) select(key, false);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }
})();

// 치과위생사 소개: 주소 해시 #oath 로 '치과위생사 선서' 탭을 엽니다.
(() => {
  const oathTab = document.getElementById('dental-tab-oath');
  // 공통 탭 스크립트(common.js)가 준비된 뒤 선택합니다.
  if (oathTab && location.hash === '#oath') window.addEventListener('load', () => oathTab.click());
})();
