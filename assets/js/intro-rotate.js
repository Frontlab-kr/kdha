/* 인트로 서비스 카드 회전 시안(/intro/rotate/, Figma Intro_PC 4404:227693)
 * 앞쪽 큰 카드 2장 + 양끝 뒤쪽 작은 카드 2장 배치에서 3초마다 한 칸씩 돌아갑니다.
 * 앞 오른쪽 → 앞 왼쪽 → 뒤 왼쪽 → 뒤 오른쪽 → 앞 오른쪽 순서. 앞 왼쪽 카드가 보라 강조 카드입니다.
 * 마우스 오버·키보드 포커스 중에는 멈추고, 오버한 카드가 강조됩니다. 뒤쪽 카드는 누르면 링크 대신 앞으로 옵니다.
 * 동작 줄이기 설정 시 자동 회전하지 않고, 1199px 이하에서는 기존 격자 배치를 씁니다.
 */
(function () {
  var list = document.querySelector('[data-intro-rotate]');
  if (!list) return;

  var items = Array.prototype.slice.call(list.children);
  var count = items.length;
  var wide = window.matchMedia('(min-width: 1200px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 자리 순서: 앞 왼쪽(강조), 앞 오른쪽, 뒤 오른쪽, 뒤 왼쪽
  var SLOTS = ['front-left', 'front-right', 'back-right', 'back-left'];
  var DELAY = 3000;

  var step = 0; // 앞 왼쪽에 놓인 카드 번호
  var timer = 0;
  var holding = false;
  var pressedSlot = null;

  function slotOf(index) {
    return SLOTS[(index - step + count) % count];
  }

  function setActive(item) {
    items.forEach(function (other) {
      other.classList.toggle('is-active', other === item);
    });
  }

  function place() {
    items.forEach(function (item, index) {
      var slot = slotOf(index);
      item.setAttribute('data-slot', slot);
      // 뒤쪽 카드는 대부분 가려지므로 탭 순서를 앞쪽 카드 뒤로
      item.querySelector('a').tabIndex = slot.indexOf('back') === 0 ? -1 : 0;
    });
    if (!holding) setActive(items[step]);
  }

  function rotateTo(index) {
    step = (index + count) % count;
    place();
  }

  function schedule() {
    clearTimeout(timer);
    if (!wide.matches || reduce.matches || holding) return;
    timer = setTimeout(function () {
      rotateTo(step + 1);
      schedule();
    }, DELAY);
  }

  function hold(state) {
    holding = state;
    if (!state) setActive(items[step]);
    schedule();
  }

  function enable() {
    list.classList.add('is-rotate');
    place();
    schedule();
  }

  function disable() {
    clearTimeout(timer);
    list.classList.remove('is-rotate');
    items.forEach(function (item) {
      item.removeAttribute('data-slot');
      item.classList.remove('is-active');
      item.querySelector('a').tabIndex = 0;
    });
  }

  // 오버한 카드를 강조하고 회전은 멈춤
  items.forEach(function (item, index) {
    item.addEventListener('mouseenter', function () {
      if (!list.classList.contains('is-rotate')) return;
      holding = true;
      clearTimeout(timer);
      if (item.getAttribute('data-slot').indexOf('front') === 0) setActive(item);
    });
    item.addEventListener('focusin', function () {
      if (!list.classList.contains('is-rotate')) return;
      holding = true;
      clearTimeout(timer);
      if (item.getAttribute('data-slot').indexOf('back') === 0) rotateTo(index);
      setActive(item);
    });
  });
  list.addEventListener('mouseleave', function () {
    if (list.classList.contains('is-rotate') && !list.contains(document.activeElement)) hold(false);
  });
  list.addEventListener('focusout', function (event) {
    if (list.classList.contains('is-rotate') && !list.contains(event.relatedTarget) && !list.matches(':hover')) {
      hold(false);
    }
  });

  // 뒤쪽 카드는 링크로 이동하지 않고 앞 왼쪽으로 옴(누르기 시작한 순간의 자리로 판단)
  list.addEventListener('pointerdown', function (event) {
    var item = event.target.closest('[data-slot]');
    pressedSlot = item ? item.getAttribute('data-slot') : null;
  });
  list.addEventListener('click', function (event) {
    var item = event.target.closest('[data-slot]');
    var slot = pressedSlot || (item && item.getAttribute('data-slot'));
    pressedSlot = null;
    if (!item || !slot || slot.indexOf('back') !== 0) return;
    event.preventDefault();
    rotateTo(items.indexOf(item));
    setActive(item);
  });

  function sync() {
    if (wide.matches) enable();
    else disable();
  }
  sync();
  wide.addEventListener('change', sync);
  reduce.addEventListener('change', schedule);
})();
