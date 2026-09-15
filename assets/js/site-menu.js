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
