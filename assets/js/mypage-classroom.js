$(function () {
  // 마이페이지 내 강의실 전용 동작 (다이얼로그 열기·닫기·해시 열기는 common.js, 탭·화면 확인 메뉴는 mypage.js)

  function closeOpenDialogs() {
    Array.prototype.slice
      .call(document.querySelectorAll('dialog[open]'))
      .reverse()
      .forEach(function (dialog) {
        dialog.close();
      });
  }

  function openDialog(id) {
    var dialog = id ? document.getElementById(id) : null;
    if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
  }

  // 흐름 이동: 열린 팝업·알림을 모두 닫고 다음 팝업을 엽니다. 값이 없으면 닫기만 합니다.
  // data-classroom-reset="폼 id"가 있으면 폼을 처음 상태로 되돌립니다(재시험·설문 취소).
  $(document).on('click', '[data-classroom-next]', function () {
    var resetId = $(this).data('classroom-reset');
    var nextId = $(this).attr('data-classroom-next');
    var form = resetId ? document.getElementById(resetId) : null;

    closeOpenDialogs();
    if (form && typeof form.reset === 'function') form.reset();
    openDialog(nextId);
  });

  // 제출 전 필수 응답 확인: 미응답이면 data-invalid 알림, 모두 응답했으면
  // data-valid(현재 팝업 위에 열기) 또는 data-valid-next(모두 닫고 열기)를 엽니다.
  $(document).on('click', '[data-classroom-check]', function () {
    var $button = $(this);
    var form = this.form || $button.closest('form')[0];
    var isValid = !form || form.checkValidity();

    if (!isValid) {
      openDialog($button.data('invalid'));
      return;
    }

    if ($button.data('valid-next')) {
      closeOpenDialogs();
      if (form) form.reset();
      openDialog($button.data('valid-next'));
      return;
    }

    openDialog($button.data('valid'));
  });

  // 사이버강의 플레이어: 재생 버튼 상태(재생 ↔ 일시정지)만 전환합니다. 실제 영상은 서버 연동 시 연결합니다.
  $(document).on('click', '[data-player-toggle]', function () {
    var $player = $(this).closest('[data-player]');
    var isPlaying = $player.attr('data-playing') !== 'true';

    $player.attr('data-playing', String(isPlaying));
    $player.find('[data-player-toggle]').each(function () {
      $(this).attr('aria-label', isPlaying ? '일시정지' : '재생');
      $(this)
        .find('.material-symbols-rounded')
        .text(isPlaying ? 'pause' : 'play_arrow');
    });
  });
});
