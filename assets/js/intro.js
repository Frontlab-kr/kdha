/* 인트로 배경 인터랙션(/intro/, Figma Intro_PC 11/09 코멘트 "백이미지 인터랙션")
 * 배경 이미지·광원의 느린 흐름은 CSS 애니메이션이 맡고, 여기서는 마우스 위치에 따라
 * --intro-px·--intro-py(-1~1)를 부드럽게 따라가도록 갱신해 시차(parallax)를 줍니다.
 * 마우스가 있는 기기에서만 동작하며, 동작 줄이기 설정 시에는 값을 0으로 두고 멈춥니다.
 */
(function () {
  var root = document.querySelector('[data-intro-motion]');
  if (!root) return;

  // 카드 강조·배경: 처음에는 대표 사이트, 이후에는 마지막으로 마우스를 올리거나 포커스한 카드로 옮겨 유지
  var cards = root.querySelectorAll('[data-intro-bg]');
  // 새 시안(/intro/motion/, data-intro-hover): 프로토타입과 같이 배경은 바꾸지 않고, 벗어나면 강조·회전을 해제
  var hoverOnly = root.hasAttribute('data-intro-hover');
  function select(card) {
    cards.forEach(function (item) {
      item.classList.toggle('is-featured', item === card);
    });
    if (!hoverOnly) root.setAttribute('data-intro-active', card.getAttribute('data-intro-bg'));
  }
  // 새 시안(/intro/motion/): 올리거나 포커스할 때마다 카드 오브젝트를 한 바퀴 회전(끝나면 정지)
  function spin(card) {
    var object = card.querySelector('.intro-card__object');
    if (!object) return;
    object.classList.remove('is-spinning');
    void object.offsetWidth; // 다시 시작
    object.classList.add('is-spinning');
  }
  root.addEventListener('animationend', function (event) {
    if (event.animationName === 'intro-object-spin') event.target.classList.remove('is-spinning');
  });
  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function () {
      select(card);
      spin(card);
    });
    if (hoverOnly) {
      ['pointerleave', 'blur'].forEach(function (type) {
        card.addEventListener(type, function () {
          card.classList.remove('is-featured');
          var object = card.querySelector('.intro-card__object');
          if (object) object.classList.remove('is-spinning');
        });
      });
    }
    card.addEventListener('focus', function () {
      select(card);
      spin(card);
    });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var EASE = 0.06; // 프레임마다 목표값을 따라가는 비율
  var targetX = 0;
  var targetY = 0;
  var x = 0;
  var y = 0;
  var frame = 0;

  function apply() {
    root.style.setProperty('--intro-px', x.toFixed(4));
    root.style.setProperty('--intro-py', y.toFixed(4));
  }

  function tick() {
    x += (targetX - x) * EASE;
    y += (targetY - y) * EASE;
    if (Math.abs(targetX - x) < 0.001 && Math.abs(targetY - y) < 0.001) {
      x = targetX;
      y = targetY;
      frame = 0;
    } else {
      frame = window.requestAnimationFrame(tick);
    }
    apply();
  }

  function moveTo(nextX, nextY) {
    targetX = nextX;
    targetY = nextY;
    if (!frame) frame = window.requestAnimationFrame(tick);
  }

  function enabled() {
    return finePointer.matches && !reduce.matches;
  }

  document.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse' || !enabled()) return;
    moveTo((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  });

  // 창 밖으로 나가면 가운데로 복귀
  document.documentElement.addEventListener('mouseleave', function () {
    moveTo(0, 0);
  });

  function reset() {
    if (enabled()) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
    x = y = targetX = targetY = 0;
    apply();
  }
  reduce.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
})();
