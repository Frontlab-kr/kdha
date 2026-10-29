/* 인트로 서비스 카드 3D 캐러셀 시안(/intro/carousel/)
 * Swiper 무한 루프 + 가운데 정렬. 가운데 카드가 가장 크고, 양옆 카드는 단계마다 작아지면서 겹쳐 보입니다.
 * 카드가 4장뿐이라 양옆 2장씩 보이도록 한 벌을 복제합니다(복제본은 보조기기·키보드에서 제외).
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

  // 루프용 복제본: 링크는 탭 이동·보조기기에서 숨김
  originals.forEach(function (slide) {
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
      swiper.slideToLoop(index);
    });
    pagination.appendChild(bullet);
    return bullet;
  });

  var OFFSET = 0.42; // 옆 카드가 가운데 쪽으로 당겨지는 비율(카드 폭 기준)
  var SCALE_STEP = 0.14; // 한 칸 멀어질 때마다 줄어드는 크기

  function render(instance) {
    instance.slides.forEach(function (slide) {
      var progress = slide.progress;
      var distance = Math.min(Math.abs(progress), 3);
      var x = progress * slide.offsetWidth * OFFSET; // 오른쪽 카드는 progress가 음수
      var scale = 1 - distance * SCALE_STEP;
      var opacity = distance > 2.5 ? 0 : distance > 2 ? (2.5 - distance) * 2 : 1;
      slide.style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      slide.style.zIndex = String(100 - Math.round(distance * 10));
      slide.style.opacity = String(opacity);
    });
  }

  var swiper = new Swiper(slider, {
    loop: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 0,
    speed: 600,
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
      progress: render,
      setTransition: function (instance, duration) {
        instance.slides.forEach(function (slide) {
          slide.style.transitionDuration = duration + 'ms';
        });
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
  render(swiper);

  // 키보드 포커스한 카드를 가운데로 이동, 포커스 중에는 자동 넘김 멈춤
  slider.addEventListener('focusin', function (event) {
    var slide = event.target.closest('.swiper-slide');
    if (!slide) return;
    if (swiper.autoplay && swiper.autoplay.running) swiper.autoplay.pause();
    swiper.slideToLoop(originals.indexOf(slide) > -1 ? originals.indexOf(slide) : swiper.realIndex % count);
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
