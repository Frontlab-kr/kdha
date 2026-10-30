/* 인트로 서비스 카드 회전 시안(/intro/rotate/, Figma Intro_PC 4404:227693)
 * 앞쪽 큰 카드 2장 + 양끝 뒤쪽 작은 카드 2장 배치에서 3초마다 한 칸씩 돌아갑니다.
 * 모든 카드가 왼쪽으로 한 칸씩 흐르고(뒤 오른쪽 → 앞 오른쪽 → 앞 왼쪽 → 뒤 왼쪽), 맨 왼쪽 카드는
 * 왼쪽으로 빠지며 사라졌다가 오른쪽 끝에서 나타나 뒤 오른쪽으로 들어옵니다. 앞 왼쪽 카드가 보라 강조 카드입니다.
 * 마우스 오버·키보드 포커스 중에는 멈추고, 오버한 카드가 강조됩니다. 뒤쪽 카드는 누르면 링크 대신 한 칸 앞으로 옵니다.
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
  var DURATION = 800;
  var EASING = 'cubic-bezier(0.45, 0, 0.2, 1)';
  // 자리별 위치·크기(Figma Intro_PC 4404:227693, 카드 330×274 기준, 앞쪽 400/330배)
  var FRONT = 400 / 330;
  var GEOMETRY = {
    'front-left': [120, 1, FRONT, 3],
    'front-right': [560, 1, FRONT, 3],
    'back-right': [770, 40, 1, 1],
    'back-left': [0, 40, 1, 1],
    'exit-left': [-180, 60, 0.85, 0], // 맨 왼쪽에서 빠져나가는 자리(투명)
    'exit-right': [950, 60, 0.85, 0], // 맨 오른쪽에서 빠져나가는 자리(투명)
  };

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

  function transformOf(slot) {
    var g = GEOMETRY[slot];
    return 'translate(' + g[0] + 'px, ' + g[1] + 'px) scale(' + g[2].toFixed(4) + ')';
  }

  // 뒤 왼쪽 ↔ 뒤 오른쪽으로 넘어가는 카드는 줄 뒤를 가로지르지 않고, 한쪽으로 빠졌다가 반대쪽에서 들어옴
  function wrap(item, from, to) {
    var out = from === 'back-left' ? 'exit-left' : 'exit-right';
    var back = from === 'back-left' ? 'exit-right' : 'exit-left';
    var duration = reduce.matches ? 0 : DURATION;
    item.style.transition = 'none';
    item.style.zIndex = '0';
    item.style.transform = transformOf(to);
    item.animate(
      [
        { transform: transformOf(from), opacity: 1, easing: EASING },
        { transform: transformOf(out), opacity: 0, offset: 0.45 },
        { transform: transformOf(back), opacity: 0, offset: 0.55, easing: EASING },
        { transform: transformOf(to), opacity: 1 },
      ],
      { duration: duration }
    ).onfinish = function () {
      item.style.transition = '';
      item.style.zIndex = String(GEOMETRY[to][3]);
    };
  }

  function place() {
    items.forEach(function (item, index) {
      var slot = slotOf(index);
      var from = item.getAttribute('data-slot');
      item.setAttribute('data-slot', slot);
      if ((from === 'back-left' && slot === 'back-right') || (from === 'back-right' && slot === 'back-left')) {
        wrap(item, from, slot);
      } else {
        item.style.transform = transformOf(slot);
        item.style.zIndex = String(GEOMETRY[slot][3]);
      }
      // 뒤쪽 카드는 대부분 가려지므로 탭 순서를 앞쪽 카드 뒤로
      item.querySelector('a').tabIndex = slot.indexOf('back') === 0 ? -1 : 0;
    });
    if (!holding) setActive(items[step]);
  }

  function rotateTo(index) {
    step = (index + count) % count;
    place();
  }

  // 뒤쪽 카드를 한 칸만 앞으로: 뒤 오른쪽은 앞 오른쪽으로(정방향), 뒤 왼쪽은 앞 왼쪽으로(역방향)
  function bringForward(item) {
    var slot = item.getAttribute('data-slot');
    if (slot === 'back-right') rotateTo(step + 1);
    else if (slot === 'back-left') rotateTo(step - 1);
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
    // 처음 배치는 애니메이션 없이
    items.forEach(function (item) {
      item.style.transition = 'none';
    });
    place();
    list.offsetWidth; // 배치를 먼저 반영
    items.forEach(function (item) {
      item.style.transition = '';
    });
    schedule();
  }

  function disable() {
    clearTimeout(timer);
    list.classList.remove('is-rotate');
    items.forEach(function (item) {
      item.removeAttribute('data-slot');
      item.style.transform = '';
      item.style.zIndex = '';
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
      bringForward(item);
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
    bringForward(item);
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
