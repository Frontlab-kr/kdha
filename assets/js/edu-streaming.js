/* 현장보수교육 실시간 스트리밍(수강자·운영자) 정적 시연 동작 */
(function () {
  var root = document.querySelector('[data-streaming]');
  if (!root) return;

  var chat = root.querySelector('[data-streaming-chat]');
  var chatOpenButton = root.querySelector('[data-streaming-chat-open]');
  var landscapeQuery = window.matchMedia('(max-width: 932px) and (max-height: 500px) and (orientation: landscape)');

  // 모바일 채팅·첨부자료 탭 전환과 방향키 탐색
  var tabList = root.querySelector('[data-streaming-tabs]');
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));

    var activateTab = function (tab, moveFocus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).classList.toggle('is-active', selected);
      });
      if (moveFocus) tab.focus();
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab, false);
      });
      tab.addEventListener('keydown', function (event) {
        var next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[next], true);
      });
    });
  }

  // 채팅 메시지 전송(예시: 화면에만 추가)
  var form = root.querySelector('[data-streaming-chat-form]');
  var log = root.querySelector('[data-streaming-messages]');

  var formatTime = function (date) {
    var hours = date.getHours();
    var pad = function (value) {
      return String(value).padStart(2, '0');
    };
    return (
      (hours < 12 ? '오전 ' : '오후 ') +
      pad(hours % 12 || 12) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  };

  if (form && log) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.elements.message;
      var text = input.value.trim();
      if (!text) {
        input.focus();
        return;
      }

      var item = document.createElement('li');
      var time = document.createElement('time');
      var icon = document.createElement('span');
      var body = document.createElement('div');
      var author = document.createElement('strong');
      var message = document.createElement('p');

      var isOperator = root.classList.contains('edu-streaming--operator');
      item.className = 'edu-streaming__message edu-streaming__message--' + (isOperator ? 'operator' : 'self');
      time.textContent = formatTime(new Date());
      icon.className = 'material-symbols-rounded edu-streaming__icon edu-streaming__icon--20';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'person';
      author.textContent = isOperator ? '운영자' : '나';
      message.textContent = text;
      body.append(author, message);
      item.append(time, icon, body);
      log.querySelector('ol').append(item);
      log.scrollTop = log.scrollHeight;
      input.value = '';
      input.focus();
    });
  }

  // 전체화면 중 영상 뒤에 가려진 영역은 키보드·보조기기 탐색에서 제외
  var coveredAreas = root.querySelectorAll(
    '.edu-streaming__header, .edu-streaming__abstract, .edu-streaming__tabs, .edu-streaming__attachment',
  );
  var syncInert = function () {
    var fullscreen = root.classList.contains('is-fullscreen');
    coveredAreas.forEach(function (area) {
      area.inert = fullscreen;
    });
    if (chat) chat.inert = fullscreen && !root.classList.contains('is-chat-open');
  };

  // 전체화면: 레터박스 영상 + 하단 컨트롤
  var setFullscreen = function (on) {
    root.classList.toggle('is-fullscreen', on);
    if (!on) setChatOpen(false, false);
    syncInert();
  };

  // 전체화면 중 채팅 패널 열기·닫기
  var setChatOpen = function (open, moveFocus) {
    if (!chat) return;
    root.classList.toggle('is-chat-open', open);
    if (chatOpenButton) chatOpenButton.setAttribute('aria-expanded', String(open));
    syncInert();
    if (!moveFocus) return;
    if (open) chat.querySelector('[data-streaming-chat-close]').focus();
    else if (chatOpenButton) chatOpenButton.focus();
  };

  root.querySelectorAll('[data-streaming-fullscreen-open]').forEach(function (button) {
    button.addEventListener('click', function () {
      setFullscreen(true);
      if (root.requestFullscreen && !document.fullscreenElement) {
        root.requestFullscreen().catch(function () {});
      }
      root.querySelector('[data-streaming-fullscreen-close]').focus();
    });
  });

  root.querySelectorAll('[data-streaming-fullscreen-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      setFullscreen(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      root.querySelector('[data-streaming-fullscreen-open]').focus();
    });
  });

  // 브라우저 전체화면을 Esc 등으로 종료한 경우 화면 상태도 되돌림
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && !landscapeQuery.matches) setFullscreen(false);
  });

  if (chatOpenButton) {
    chatOpenButton.addEventListener('click', function () {
      setChatOpen(true, true);
    });
  }

  root.querySelectorAll('[data-streaming-chat-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      setChatOpen(false, true);
    });
  });

  root.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && root.classList.contains('is-chat-open')) {
      setChatOpen(false, true);
    }
  });

  // 가로 모드 휴대폰은 전체화면으로 시청, 세로로 돌아오면 일반 화면
  var syncOrientation = function () {
    setFullscreen(landscapeQuery.matches);
  };
  syncOrientation();
  landscapeQuery.addEventListener('change', syncOrientation);

  // 운영자: 공지 등록 후 채팅 상단 공지 교체
  var noticeForm = document.querySelector('[data-streaming-notice-form]');
  var noticeText = root.querySelector('[data-streaming-notice-text]');
  if (noticeForm && noticeText) {
    noticeForm.addEventListener('submit', function (event) {
      var value = noticeForm.elements.notice.value.trim();
      if (!value) {
        event.preventDefault();
        noticeForm.elements.notice.focus();
        return;
      }
      noticeText.textContent = '';
      value.split(/\r?\n/).forEach(function (line, index) {
        if (index) noticeText.append(document.createElement('br'));
        noticeText.append(line);
      });
    });
  }
  // 첨부 PDF: 패널 미리보기를 PDF.js로 그리고, 확대보기는 치위협보 PDF 뷰어로 새 창 열기
  var pdfPanel = root.querySelector('[data-streaming-pdf]');
  if (pdfPanel) {
    var pdfSrc = pdfPanel.getAttribute('data-streaming-pdf');
    var pdfTitle = pdfPanel.getAttribute('data-streaming-pdf-title') || '첨부자료';
    var pdfUrl = new URL(pdfSrc, location.href).href;

    root.querySelectorAll('[data-streaming-pdf-open]').forEach(function (link) {
      var viewer = new URL(link.getAttribute('href'), location.href);
      viewer.searchParams.set('src', new URL(pdfUrl).pathname);
      viewer.searchParams.set('title', pdfTitle);
      link.href = viewer.href;
    });

    var canvas = pdfPanel.querySelector('[data-streaming-pdf-canvas]');
    var fallback = canvas && canvas.nextElementSibling;
    var prev = pdfPanel.querySelector('[data-streaming-pdf-prev]');
    var next = pdfPanel.querySelector('[data-streaming-pdf-next]');
    var pageText = pdfPanel.querySelector('[data-streaming-pdf-page]');
    var totalText = pdfPanel.querySelector('[data-streaming-pdf-total]');
    var pdfDoc = null;
    var pageNum = 1;
    var rendering = null;

    var setDisabled = function (button, disabled) {
      if (button) button.setAttribute('aria-disabled', String(disabled));
    };
    var renderPage = function () {
      if (!pdfDoc || !canvas) return;
      pageText.textContent = pageNum;
      setDisabled(prev, pageNum <= 1);
      setDisabled(next, pageNum >= pdfDoc.numPages);
      var box = canvas.parentElement;
      rendering = pdfDoc.getPage(pageNum).then(function (page) {
        var base = page.getViewport({ scale: 1 });
        // 미리보기 영역 안쪽 높이에 맞춰 축소, 선명도를 위해 devicePixelRatio 배율 적용
        var maxH = box.clientHeight - 32 || 168;
        var maxW = box.clientWidth - 32 || 126;
        var scale = Math.min(maxH / base.height, maxW / base.width);
        var ratio = window.devicePixelRatio || 1;
        var viewport = page.getViewport({ scale: scale * ratio });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = Math.round(viewport.width / ratio) + 'px';
        canvas.style.height = Math.round(viewport.height / ratio) + 'px';
        canvas.setAttribute('aria-label', '첨부자료.pdf ' + pageNum + '쪽 미리보기');
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      });
    };
    var move = function (step) {
      if (!pdfDoc) return;
      var target = pageNum + step;
      if (target < 1 || target > pdfDoc.numPages) return;
      pageNum = target;
      Promise.resolve(rendering).then(renderPage);
    };
    if (prev)
      prev.addEventListener('click', function () {
        move(-1);
      });
    if (next)
      next.addEventListener('click', function () {
        move(1);
      });

    if (canvas) {
      import('/kdha/assets/vendor/pdfjs/pdf.min.mjs')
        .then(function (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/kdha/assets/vendor/pdfjs/pdf.worker.min.mjs';
          return pdfjs.getDocument(pdfUrl).promise;
        })
        .then(function (doc) {
          pdfDoc = doc;
          totalText.textContent = doc.numPages;
          canvas.hidden = false;
          if (fallback) fallback.remove();
          renderPage();
        })
        .catch(function () {
          // 불러오지 못하면 기본 미리보기 이미지를 그대로 둡니다.
        });
    }
  }
})();
