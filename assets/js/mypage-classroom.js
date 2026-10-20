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

  // 과정공지 첨부파일: 치위협보 PDF 뷰어 주소를 만듭니다(edu-streaming.js와 같은 방식, 배포 경로 변환 대응).
  // a[data-classroom-pdf-open][href=뷰어] + data-classroom-pdf(PDF 경로) + data-classroom-pdf-title(표시 이름)
  $('[data-classroom-pdf-open]').each(function () {
    var pdfSrc = this.getAttribute('data-classroom-pdf');
    if (!pdfSrc) return;
    var viewer = new URL(this.getAttribute('href'), window.location.href);
    viewer.searchParams.set('src', new URL(pdfSrc, window.location.href).pathname);
    viewer.searchParams.set('title', this.getAttribute('data-classroom-pdf-title') || '첨부파일');
    this.href = viewer.href;
  });

  // 채점자교육 상세: 순위별 신청 지역을 고르면 같은 줄의 교육일정을 활성화합니다.
  // 지역별 교육일정은 퍼블리싱 샘플 데이터이며 개발 시 서버 데이터로 교체합니다.
  var examinerSchedules = {
    seoul: ['2026-10-08(목) 서울 치과위생사회관', '2026-10-12(월) 서울 치과위생사회관'],
    daegu: ['2026-10-10(토) 대구 교육장', '2026-10-17(토) 대구 교육장'],
    daejeon: ['2026-10-10(토) 대전 교육장', '2026-10-24(토) 대전 교육장'],
    gwangju: ['2026-10-17(토) 광주 교육장', '2026-10-31(토) 광주 교육장'],
    busan: ['2026-10-24(토) 부산 교육장', '2026-11-07(토) 부산 교육장'],
  };

  function setExaminerScheduleState($select, enabled) {
    $select.prop('disabled', !enabled);
    $select.next('.ds-select').find('.ds-select__button').prop('disabled', !enabled);
  }

  $('[data-examiner-region-row] [data-examiner-schedule]').each(function () {
    setExaminerScheduleState($(this), !this.disabled);
  });

  $(document).on('change', '[data-examiner-region-row] [data-examiner-region]', function () {
    var list = examinerSchedules[this.value] || [];
    var $schedule = $(this).closest('[data-examiner-region-row]').find('[data-examiner-schedule]');

    $schedule
      .empty()
      .append($('<option value=""></option>').text(list.length ? '교육일정 선택' : '신청지역을 먼저 선택해 주세요.'));
    list.forEach(function (item) {
      $schedule.append($('<option></option>').val(item).text(item));
    });
    setExaminerScheduleState($schedule, list.length > 0);
    $schedule.trigger('change');
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
  // 학습 퀴즈: 이전·다음으로 문제(step)를 전환하고 제목의 유형(객관식·서술형)과 번호를 바꿉니다.
  function showQuizStep($form, index) {
    var $steps = $form.find('[data-quiz-step]');
    var total = $steps.length;
    var current = Math.max(0, Math.min(index, total - 1));
    var $dialog = $form.closest('dialog');

    $steps.each(function (i) {
      this.hidden = i !== current;
    });
    $form.data('quiz-index', current);
    $form.find('[data-quiz-current]').text(current + 1);
    $form.find('[data-quiz-total]').text(total);
    $form.find('[data-quiz-prev]').prop('disabled', current === 0);
    $form.find('[data-quiz-next]').prop('disabled', current === total - 1);
    $dialog.find('[data-quiz-type]').text($steps.eq(current).attr('data-quiz-step'));
  }

  $(document).on('click', '[data-quiz-prev], [data-quiz-next]', function () {
    var $form = $(this).closest('[data-quiz]');
    var step = this.hasAttribute('data-quiz-next') ? 1 : -1;
    showQuizStep($form, ($form.data('quiz-index') || 0) + step);
  });

  $('[data-quiz]').each(function () {
    showQuizStep($(this), 0);
  });
});
