(function () {
  'use strict';

  // 1:1 상담(KD-US-QNA) 화면 동작. 서버 연동 전에는 값을 전송·저장하지 않습니다.
  // 법률·노무 상담 게시판도 같은 data-consult-* 속성으로 재사용할 수 있습니다.

  function openDialog(id) {
    var dialog = document.getElementById(id);
    if (dialog && dialog.tagName === 'DIALOG' && !dialog.open) dialog.showModal();
  }

  // 모바일 상담 탭: 가로 스크롤 안에서 현재 탭이 보이도록 위치를 맞춥니다.
  document.querySelectorAll('.consult-tabs').forEach(function (tabs) {
    var current = tabs.querySelector('[aria-current]');
    if (!current || tabs.scrollWidth <= tabs.clientWidth) return;
    var overflow = current.getBoundingClientRect().right - tabs.getBoundingClientRect().right;
    if (overflow > 0) tabs.scrollLeft += overflow;
  });

  // 답변상태 필터(전체 · 답변대기 · 답변완료)
  document.querySelectorAll('[data-consult-filter]').forEach(function (filter) {
    var scope = filter.closest('.career-contact') || document;
    var list = scope.querySelector('[data-consult-list]');
    var total = scope.querySelector('[data-consult-total]');
    if (!list) return;
    filter.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      var value = button.dataset.consultFilterValue;
      filter.querySelectorAll('button').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      var count = 0;
      list.querySelectorAll('[data-consult-status]').forEach(function (row) {
        var visible = value === 'all' || row.dataset.consultStatus === value;
        row.hidden = !visible;
        if (visible) count += 1;
      });
      if (total) total.textContent = count;
    });
  });

  // 첨부 파일 목록 표시 · 삭제
  document.querySelectorAll('[data-consult-upload]').forEach(function (upload) {
    var input = upload.querySelector('input[type="file"]');
    var list = upload.querySelector('[data-consult-upload-list]');

    function size(bytes) {
      return bytes >= 1048576 ? Math.round(bytes / 1048576) + 'MB' : Math.max(1, Math.round(bytes / 1024)) + 'KB';
    }

    input.addEventListener('change', function () {
      Array.from(input.files).forEach(function (file) {
        var item = document.createElement('li');
        var name = document.createElement('span');
        var fileSize = document.createElement('span');
        var remove = document.createElement('button');
        name.className = 'consult-upload__name';
        name.textContent = file.name;
        fileSize.className = 'consult-upload__size';
        fileSize.textContent = size(file.size);
        remove.type = 'button';
        remove.setAttribute('aria-label', file.name + ' 삭제');
        remove.setAttribute('data-consult-upload-remove', '');
        remove.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">close</span>';
        item.append(name, fileSize, remove);
        list.append(item);
      });
    });

    list.addEventListener('click', function (event) {
      var remove = event.target.closest('[data-consult-upload-remove]');
      if (remove) remove.closest('li').remove();
    });
  });

  // 신청 폼: 필수 항목 확인 후 알림(서버 전송 없음)
  document.querySelectorAll('[data-consult-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      openDialog(form.checkValidity() ? form.dataset.consultConfirm : form.dataset.consultInvalid);
    });
  });
})();
