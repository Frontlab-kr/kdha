(() => {
  const toggle = document.querySelector('[data-site-menu-toggle]');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  const header = toggle.closest('.site-header');
  const close = menu.querySelector('.site-menu__close');
  const mobile = matchMedia('(max-width: 1100px)');
  const groups = [...menu.querySelectorAll('.site-menu__group')];
  let previousOverflow = '';
  let pinned = false;
  function sync() {
    groups.forEach((group) => {
      const button = group.querySelector('.site-menu__heading');
      button.disabled = !mobile.matches;
      button.setAttribute('aria-expanded', String(!mobile.matches || group.classList.contains('is-expanded')));
    });
    if (!menu.hidden) document.body.style.overflow = mobile.matches ? 'hidden' : previousOverflow;
  }
  function setOpen(open, moveFocus = true) {
    if (!open) {
      pinned = false;
      header.classList.remove('is-menu-pinned');
    }
    if (open === !menu.hidden) return;
    if (open) previousOverflow = document.body.style.overflow;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-menu-open', open);
    if (open) {
      sync();
      if (moveFocus) close.focus();
    } else {
      document.body.style.overflow = previousOverflow;
      if (moveFocus) toggle.focus();
    }
  }
  toggle.addEventListener('click', () => {
    if (mobile.matches) {
      setOpen(menu.hidden);
      return;
    }
    if (pinned) {
      setOpen(false);
    } else {
      pinned = true;
      header.classList.add('is-menu-pinned');
      setOpen(true, false);
    }
  });
  header.querySelectorAll('.primary-nav__links > .primary-nav__item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (!mobile.matches) setOpen(true, false);
    });
  });
  header.addEventListener('mouseleave', () => {
    if (!mobile.matches && !pinned) setOpen(false, false);
  });
  // 키보드: GNB 메뉴에 포커스가 오면 마우스 오버와 같이 전체 메뉴 레이어를 열고,
  // 포커스가 GNB·전체 메뉴·메뉴 버튼 밖으로 나가면 닫습니다.
  const navLinks = header.querySelector('.primary-nav__links');
  const inMenuArea = (el) => !!el && [navLinks, menu, toggle].some((area) => area && area.contains(el));
  header.querySelectorAll('.primary-nav__links > .primary-nav__item').forEach((item) => {
    item.addEventListener('focusin', () => {
      if (!mobile.matches) setOpen(true, false);
    });
  });
  // 1뎁스 → 레이어: 1뎁스에서 Tab을 누르면 같은 이름의 메뉴 묶음 첫 링크로 이동하고,
  // 묶음 마지막 링크에서 Tab은 다음 1뎁스로, 첫 링크에서 Shift+Tab은 원래 1뎁스로 돌아갑니다.
  const label = (el) => el.textContent.replace('keyboard_arrow_down', '').replace(/\s+/g, ' ').trim();
  const visible = (el) => el.getClientRects().length > 0;
  const topLinks = () => [...header.querySelectorAll('.primary-nav__links .primary-nav__link')].filter(visible);
  const groupLinks = (link) => {
    const group = groups.find((item) => label(item.querySelector('.site-menu__heading')) === label(link));
    return group ? [...group.querySelectorAll('ul a[href]')].filter(visible) : [];
  };
  const afterNav = () => {
    const all = [...header.querySelectorAll('a[href], button:not(:disabled)')].filter(visible);
    return all.find((el) => !inMenuArea(el) && navLinks.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  };
  header.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || mobile.matches || menu.hidden) return;
    const tops = topLinks();
    const active = document.activeElement;
    const topIndex = tops.indexOf(active);
    if (topIndex > -1 && !event.shiftKey) {
      const links = groupLinks(active);
      if (links.length) {
        event.preventDefault();
        links[0].focus();
      }
      return;
    }
    const owner = tops.find((top) => groupLinks(top).includes(active));
    if (!owner) return;
    const links = groupLinks(owner);
    if (event.shiftKey && active === links[0]) {
      event.preventDefault();
      owner.focus();
    } else if (!event.shiftKey && active === links[links.length - 1]) {
      event.preventDefault();
      const next = tops[tops.indexOf(owner) + 1] || afterNav();
      if (next) next.focus();
    }
  });
  header.addEventListener('focusout', (event) => {
    if (mobile.matches || pinned || menu.hidden) return;
    if (!inMenuArea(event.relatedTarget)) setOpen(false, false);
  });
  close.addEventListener('click', () => setOpen(false));
  groups.forEach((group) =>
    group.querySelector('.site-menu__heading').addEventListener('click', () => {
      const expand = !group.classList.contains('is-expanded');
      groups.forEach((item) => item.classList.toggle('is-expanded', item === group && expand));
      sync();
    }),
  );
  document.addEventListener('keydown', (event) => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === 'Tab' && mobile.matches) {
      const targets = [...menu.querySelectorAll('a[href], button:not(:disabled)')].filter(
        (el) => el.getClientRects().length,
      );
      const first = targets[0],
        last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    setOpen(false, false);
    sync();
  });
  sync();
})();
