/* 인트로 서비스 카드 3D 캐러셀 시안(/intro/carousel/)
 * Swiper 무한 루프 + 가운데 정렬. 가운데 카드가 가장 크고, 양옆 카드는 단계마다 작아지면서 겹쳐 보입니다.
 * 카드가 4장뿐이라 두 칸씩 건너뛰어도 양옆 2장씩 남도록 두 벌을 복제합니다(복제본은 보조기기·키보드에서 제외).
 * 자동 넘김은 마우스 오버·포커스 중 멈추고, 정지/재생 버튼을 제공합니다. 동작 줄이기 설정 시 자동 넘김을 끕니다.
 */
(function () {
  var root = document.querySelector('[data-intro-carousel]');
  if (!root || typeof Swiper === 'undefined') return;

  var slider = root.querySelector('.intro-carousel__slider');
  var wrapper = slider.querySelector('.swiper-wrapper');
  var originals = Array.prototype.slice.call(wrapper.children);
  var count = originals.length;
  var toggle = root.querySelector('[data-intro-carousel-toggle]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 루프용 복제본 두 벌: 링크는 탭 이동·보조기기에서 숨김
  originals.concat(originals).forEach(function (slide) {
    var clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('data-intro-clone', '');
    clone.querySelectorAll('a, button').forEach(function (el) {
      el.setAttribute('tabindex', '-1');
    });
    clone.querySelectorAll('[id]').forEach(function (el) {
      el.removeAttribute('id');
    });
    wrapper.appendChild(clone);
  });

  // 카드 수(4)만큼의 페이지 표시
  var pagination = root.querySelector('.intro-carousel__pagination');
  var bullets = originals.map(function (slide, index) {
    var title = slide.querySelector('.intro-card__title').textContent.trim();
    var bullet = document.createElement('button');
    bullet.type = 'button';
    bullet.className = 'intro-carousel__bullet';
    bullet.setAttribute('aria-label', title + ' 보기');
    bullet.addEventListener('click', function () {
      moveBy(shortest(index - (swiper.realIndex % count)));
    });
    pagination.appendChild(bullet);
    return bullet;
  });

  // 가운데에서 떨어진 거리(칸)별 화면상 위치(카드 폭 기준). 거리가 늘수록 간격이 좁아지되 항상 같은 방향으로만 움직임
  var STOPS = [0, 0.55, 0.9, 1.1];
  var SCALE_STEP = 0.14; // 한 칸 멀어질 때마다 줄어드는 크기

  function place(distance) {
    var step = Math.min(Math.floor(distance), STOPS.length - 2);
    return STOPS[step] + (STOPS[step + 1] - STOPS[step]) * (distance - step);
  }

  function render(instance) {
    instance.slides.forEach(function (slide) {
      var progress = slide.progress;
      if (!isFinite(progress)) return;
      var width = slide.offsetWidth;
      var distance = Math.min(Math.abs(progress), 3);
      var sign = progress < 0 ? -1 : 1; // 오른쪽 카드는 progress가 음수
      // 줄 전체는 고정(virtualTranslate)하고, 카드마다 제 자리에서 가운데 기준 목표 위치로 각자 이동
      var x = -slide.offsetLeft - sign * place(distance) * width;
      var scale = 1 - distance * SCALE_STEP;
      var opacity = distance > 2 ? Math.max(0, 3 - distance) * 0.6 : distance > 1 ? 1 - (distance - 1) * 0.4 : 1;
      slide.style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      slide.style.zIndex = String(100 - Math.round(distance * 10));
      slide.style.opacity = opacity.toFixed(3);
    });
  }

  function refresh(instance) {
    instance.updateSlidesOffset();
    instance.updateSlidesProgress();
    render(instance);
  }

  var transitionTimer;

  // 4장 기준 가까운 방향으로 몇 칸 이동할지(-2~2)
  function shortest(delta) {
    delta = ((delta % count) + count) % count;
    return delta > count / 2 ? delta - count : delta;
  }

  // 지금 자리에서 delta칸 이동. 이동이 끝나면 loopFix로 양옆 여유를 다시 맞추므로 두 칸 건너뛰어도 카드가 비지 않음
  function moveBy(delta) {
    if (!delta) return;
    if (delta === 1) swiper.slideNext();
    else if (delta === -1) swiper.slidePrev();
    else swiper.slideTo(swiper.activeIndex + delta);
  }

  var swiper = new Swiper(slider, {
    loop: true,
    loopAdditionalSlides: 4, // 두 칸 건너뛰어도 양옆에 2장씩 남도록
    centeredSlides: true,
    slidesPerView: 1,
    virtualTranslate: true, // 줄(wrapper)이 통째로 밀리지 않도록
    spaceBetween: 0,
    speed: 700,
    grabCursor: true,
    watchSlidesProgress: true,
    slideToClickedSlide: false,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: root.querySelector('.intro-carousel__nav--prev'),
      nextEl: root.querySelector('.intro-carousel__nav--next'),
    },
    autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
    a11y: { slideRole: 'group', itemRoleDescriptionMessage: null },
    on: {
      setTranslate: function (instance) {
        instance.updateSlidesProgress(); // virtualTranslate에서는 카드별 progress가 자동 갱신되지 않음
        render(instance);
      },
      // progress 이벤트는 slideTo에서 전환 시간 설정 전에 먼저 와서 카드가 순간이동하므로 쓰지 않음
      afterInit: refresh,
      resize: refresh,
      loopFix: render,
      setTransition: function (instance, duration) {
        instance.slides.forEach(function (slide) {
          slide.style.transitionDuration = duration + 'ms';
        });
        // 줄이 움직이지 않으므로(virtualTranslate) 카드 이동이 끝나면 Swiper에 전환 종료를 알림
        clearTimeout(transitionTimer);
        if (duration > 0) {
          transitionTimer = setTimeout(function () {
            if (!instance.destroyed) instance.wrapperEl.dispatchEvent(new Event('transitionend', { bubbles: true }));
          }, duration);
        }
      },
      transitionEnd: function (instance) {
        instance.loopFix();
        refresh(instance);
      },
      // 뒤쪽 카드를 누르면(드래그 아님) 그 카드가 가운데로
      click: function (instance, event) {
        var slide = event.target.closest('.swiper-slide');
        if (slide && !slide.classList.contains('swiper-slide-active')) moveBy(-Math.round(slide.progress));
      },
      slideChange: function (instance) {
        var active = instance.realIndex % count;
        bullets.forEach(function (bullet, index) {
          bullet.classList.toggle('is-active', index === active);
          bullet.setAttribute('aria-current', index === active ? 'true' : 'false');
        });
      },
    },
  });
  swiper.emit('slideChange', swiper);
  refresh(swiper);

  // 가운데가 아닌 카드는 링크로 이동하지 않음(가운데로 오는 동작은 Swiper click 이벤트에서 처리)
  // Swiper가 click 전에 활성 카드를 바꾸므로, 누르기 시작한 순간 가운데였는지로 판단
  var pressedActive = null;
  slider.addEventListener(
    'pointerdown',
    function (event) {
      var slide = event.target.closest('.swiper-slide');
      pressedActive = slide ? slide.classList.contains('swiper-slide-active') : null;
    },
    true
  );
  slider.addEventListener(
    'click',
    function (event) {
      var slide = event.target.closest('.swiper-slide');
      var wasActive = pressedActive === null ? slide && slide.classList.contains('swiper-slide-active') : pressedActive;
      pressedActive = null;
      if (slide && !wasActive) event.preventDefault();
    },
    true
  );

  // 키보드 포커스한 카드를 가운데로 이동, 포커스 중에는 자동 넘김 멈춤
  slider.addEventListener('focusin', function (event) {
    var slide = event.target.closest('.swiper-slide');
    if (!slide) return;
    if (swiper.autoplay && swiper.autoplay.running) swiper.autoplay.pause();
    var distance = -Math.round(slide.progress);
    // 가까우면 카드가 움직이며 오고, 멀리 있는 원본이면 바로 가운데로
    if (Math.abs(distance) <= 2) moveBy(distance);
    else swiper.slideTo(swiper.slides.indexOf(slide), 0);
  });
  slider.addEventListener('focusout', function (event) {
    if (!slider.contains(event.relatedTarget) && !paused && swiper.autoplay && swiper.autoplay.paused) {
      swiper.autoplay.resume();
    }
  });

  // 정지/재생
  var paused = false;
  if (reduce) toggle.hidden = true;
  toggle.addEventListener('click', function () {
    paused = !paused;
    if (paused) swiper.autoplay.stop();
    else swiper.autoplay.start();
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('.material-symbols-rounded').textContent = paused ? 'play_arrow' : 'pause';
    toggle.querySelector('.sr-only').textContent = paused ? '자동 넘김 재생' : '자동 넘김 정지';
  });
})();
