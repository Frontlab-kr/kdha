/* 대표 메인 페이드업 시안(/main/motion/)
 * 스크롤해서 화면에 들어온 요소가 아래에서 위로 올라오며 나타납니다. 한 번 나타나면 다시 숨기지 않습니다.
 * 같은 순간에 들어온 요소는 순서대로 조금씩 늦게 나타나고, 끝나면 클래스를 지워 원래 hover·전환 효과로 돌아갑니다.
 * 동작 줄이기 설정이거나 IntersectionObserver가 없으면 애니메이션 없이 그대로 보여 줍니다.
 */
$(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  var STAGGER = 80; // 같이 들어온 요소 사이 간격(ms)
  var STAGGER_MAX = 480;
  var rows = new Map(); // 줄 첫 카드 → 그 줄 카드들
  var TARGETS = [
    '.main-b-hero__copy',
    '.main-b-promo',
    '.main-section-heading',
    '.main-b-news__tabs-scroll',
    '.main-b-news__item',
    '.main-b-youtube__card',
  ];

  function show(item, delay) {
    item.style.setProperty('--fade-up-delay', delay + 'ms');
    item.classList.add('is-in');
    // 전환(0.7s)이 끝나면 정리. transitionend는 탭 전환·요소 교체 때 오지 않을 수 있어 타이머로 처리
    setTimeout(function () {
      item.classList.remove('fade-up', 'is-in');
      item.style.removeProperty('--fade-up-delay');
    }, delay + 800);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        // 이미 지나친 요소(새로고침 위치 복원 등)도 숨겨 두지 않음
        if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) return;
        observer.unobserve(entry.target);
        var row = rows.get(entry.target);
        if (row) {
          row.forEach(function (card, index) {
            show(card, Math.min(index * STAGGER, STAGGER_MAX));
          });
          return;
        }
        show(entry.target, Math.min(order * STAGGER, STAGGER_MAX));
        order += 1;
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );

  document.querySelectorAll(TARGETS.join(',')).forEach(function (item) {
    item.classList.add('fade-up');
    observer.observe(item);
  });

  // 퀵메뉴는 줄 단위로 올라옴. 모바일은 가로 스크롤이라 화면 밖 카드가 늦게 나타나지 않도록 줄 첫 카드만 관찰
  document.querySelectorAll('.main-b-quick__card').forEach(function (card) {
    card.classList.add('fade-up');
    var first = Array.from(rows.keys()).find(function (key) {
      return key.offsetTop === card.offsetTop;
    });
    if (first) {
      rows.get(first).push(card);
    } else {
      rows.set(card, [card]);
      observer.observe(card);
    }
  });
});
