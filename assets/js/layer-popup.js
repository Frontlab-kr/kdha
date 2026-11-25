/* 메인 레이어 팝업(대표 메인·교육원 메인)
 * [data-layer-popup="키"]마다 "오늘 하루 열지 않기"를 누르면 그날(자정까지)은 다시 열지 않습니다(localStorage).
 * 확인용: 주소에 ?popup 을 붙이면 저장값과 관계없이 엽니다. Esc·닫기로 닫힙니다.
 */
(function () {
  var popups = document.querySelectorAll('[data-layer-popup]');
  if (!popups.length) return;

  var force = /[?&]popup\b/.test(location.search);
  var today = new Date();
  var todayKey = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-');

  function storageKey(popup) {
    return 'kdha-layer-popup:' + popup.getAttribute('data-layer-popup');
  }
  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // 저장이 막힌 환경(사생활 보호 모드 등)에서는 이번 방문에만 닫힘
    }
  }
  // <dialog>(대표 메인)는 배경을 어둡게 덮는 모달로, 그 외(교육원 메인)는 화면 위쪽 레이어로 엽니다.
  function open(popup) {
    if (popup.showModal) {
      popup.showModal();
      popup.focus(); // 열리자마자 닫기 버튼에 초점 테두리가 보이지 않도록 팝업 자체에 초점
    } else {
      popup.hidden = false;
    }
  }
  function close(popup) {
    if (popup.showModal) popup.close();
    else popup.hidden = true;
  }

  popups.forEach(function (popup) {
    if (force || read(storageKey(popup)) !== todayKey) open(popup);

    popup.addEventListener('click', function (event) {
      if (event.target.closest('[data-layer-popup-today]')) {
        write(storageKey(popup), todayKey);
        close(popup);
      } else if (event.target.closest('[data-layer-popup-close]')) {
        close(popup);
      }
    });
    popup.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close(popup);
    });
  });
})();
