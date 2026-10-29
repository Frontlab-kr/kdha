/* 인트로 서비스 카드 회전(PC 1101px 이상)
 * 카드 4장을 타원 궤도에 놓고 천천히 돌립니다. 앞쪽 카드는 크게, 뒤쪽 카드는 작게·아래로 보입니다.
 * 마우스 오버·키보드 포커스 중에는 멈추고, 포커스한 카드는 앞으로 돌아옵니다.
 * 정지/재생 버튼 제공, 동작 줄이기 설정 시 회전하지 않습니다. 1100px 이하에서는 기존 격자 배치를 씁니다.
 */
(function () {
  var orbit = document.querySelector('[data-intro-orbit]');
  if (!orbit) return;

  var list = orbit.querySelector('.intro__services');
  var items = Array.prototype.slice.call(list.children);
  var toggle = orbit.querySelector('[data-intro-orbit-toggle]');
  var wide = window.matchMedia('(min-width: 1101px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var RADIUS_X = 230; // 좌우 반경
  var DROP = 230; // 뒤쪽 카드가 내려가는 정도
  var MIN_SCALE = 0.45; // 가장 뒤쪽 카드 크기
  var SPEED = 360 / 28000; // 한 바퀴 28초(도/ms)
  var STEP = 360 / items.length;

  var angle = 45; // 대표 사이트(01)를 앞 왼쪽, 교육원 사이트(02)를 앞 오른쪽에서 시작
  var target = null; // 포커스한 카드를 앞으로 돌릴 때의 목표 각도
  var paused = false; // 버튼으로 정지
  var holding = false; // 마우스 오버·포커스 중 정지
  var frame = 0;
  var last = 0;

  function place() {
    items.forEach(function (item, index) {
      var theta = ((index * STEP - angle) * Math.PI) / 180;
      var depth = (Math.cos(theta) + 1) / 2; // 1 = 맨 앞, 0 = 맨 뒤
      var scale = MIN_SCALE + (1 - MIN_SCALE) * depth;
      var x = Math.sin(theta) * RADIUS_X;
      var y = (1 - depth) * DROP;
      item.style.transform =
        'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      item.style.zIndex = String(Math.round(depth * 100));
    });
  }

  function tick(time) {
    var delta = last ? Math.min(time - last, 50) : 0;
    last = time;

    if (target !== null) {
      // 가장 가까운 방향으로 목표 각도까지 부드럽게 회전
      var diff = ((((target - angle) % 360) + 540) % 360) - 180;
      angle += diff * Math.min(1, delta / 160);
      if (Math.abs(diff) < 0.2) {
        angle = target;
        target = null;
      }
    } else if (!paused && !holding && !reduce.matches) {
      angle = (angle + SPEED * delta) % 360;
    }

    place();
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    orbit.classList.add('is-orbit');
    toggle.hidden = reduce.matches;
    place();
    if (!frame) {
      last = 0;
      frame = window.requestAnimationFrame(tick);
    }
  }

  function stop() {
    orbit.classList.remove('is-orbit');
    toggle.hidden = true;
    window.cancelAnimationFrame(frame);
    frame = 0;
    items.forEach(function (item) {
      item.style.transform = '';
      item.style.zIndex = '';
    });
  }

  function update() {
    if (wide.matches) start();
    else stop();
  }

  function setPaused(value) {
    paused = value;
    toggle.setAttribute('aria-pressed', String(value));
    toggle.querySelector('.material-symbols-rounded').textContent = value ? 'play_arrow' : 'pause';
    toggle.querySelector('.sr-only').textContent = value ? '서비스 카드 회전 재생' : '서비스 카드 회전 정지';
  }

  list.addEventListener('mouseenter', function () {
    holding = true;
  });
  list.addEventListener('mouseleave', function () {
    holding = list.contains(document.activeElement);
  });
  list.addEventListener('focusin', function (event) {
    holding = true;
    var index = items.indexOf(event.target.closest('li'));
    if (index > -1 && orbit.classList.contains('is-orbit')) target = index * STEP;
  });
  list.addEventListener('focusout', function (event) {
    if (!list.contains(event.relatedTarget)) holding = list.matches(':hover');
  });
  toggle.addEventListener('click', function () {
    setPaused(!paused);
  });

  setPaused(false);
  wide.addEventListener('change', update);
  reduce.addEventListener('change', update);
  update();
})();
