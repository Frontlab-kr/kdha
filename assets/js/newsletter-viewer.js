import '../vendor/pdflipbook/pdflipbook.js';

(function () {
  'use strict';
  const root = document.querySelector('#newsletter-book');
  if (!root) return;
  const scriptUrl = import.meta.url;
  const assetBase = new URL('../vendor/', scriptUrl);
  const documentBase = new URL('../', scriptUrl);
  const status = document.querySelector('[data-book-status]');
  const page = document.querySelector('#book-page');
  const total = document.querySelector('[data-book-total]');
  const toolbar = document.querySelector('.newsletter-viewer__toolbar');
  const original = document.querySelector('[data-book-original]');
  const download = document.querySelector('[data-book-download]');
  let book = null;
  let pages = 0;
  const labels = {
    'Previous page': '이전 페이지',
    'Next page': '다음 페이지',
    Fullscreen: '전체화면',
    'Exit fullscreen': '전체화면 종료',
    'Zoom in': '확대',
    'Zoom out': '축소',
    'Single page view': '한 페이지 보기',
    'Two-page view': '두 페이지 보기',
  };
  function translate() {
    root.setAttribute('aria-label', '치위협보 PDF 뷰어. 방향키로 페이지를 이동합니다.');
    root.querySelectorAll('button[aria-label]').forEach(function (button) {
      const label = labels[button.getAttribute('aria-label')];
      if (label) {
        button.setAttribute('aria-label', label);
        button.title = label;
      }
    });
    const loading = root.querySelector('.fb-status-text');
    if (loading && /^Loading/.test(loading.textContent))
      loading.textContent = loading.textContent.replace(/^Loading…/, 'PDF 불러오는 중…');
  }
  new MutationObserver(translate).observe(root, { childList: true, subtree: true, characterData: true });
  function setReady(ready) {
    toolbar.querySelectorAll('button, input').forEach(function (el) {
      el.disabled = !ready;
    });
  }
  function updatePage() {
    const current = book.currentPage();
    page.value = current;
    status.textContent = '전체 ' + pages + '페이지 중 ' + current + '페이지';
    document.querySelector('[data-book-first]').disabled = current <= 1;
    document.querySelector('[data-book-last]').disabled = current >= pages;
  }
  root.addEventListener('flipbook:ready', function (event) {
    pages = event.detail.pages;
    page.max = pages;
    total.textContent = '/ ' + pages;
    setReady(true);
    updatePage();
    translate();
  });
  root.addEventListener('flipbook:pagechange', updatePage);
  ['flipbook:modechange', 'fullscreenchange'].forEach(function (name) {
    root.addEventListener(name, translate);
  });
  root.addEventListener('flipbook:error', function () {
    status.textContent = 'PDF를 열 수 없습니다. 잠시 후 새로고침해 주세요.';
    const text = root.querySelector('.fb-status-text');
    if (text) text.textContent = 'PDF를 불러오지 못했습니다.';
    setReady(false);
  });
  function reset() {
    if (book) book.destroy();
    book = null;
    setReady(false);
    original.hidden = download.hidden = true;
    pages = 0;
    page.value = 1;
    total.textContent = '/ 0';
  }
  function open(options, url, filename) {
    original.href = download.href = url;
    download.download = filename;
    original.hidden = download.hidden = false;
    status.textContent = 'PDF를 불러오는 중입니다.';
    book = window.PDFlipbook.create(
      root,
      Object.assign(
        {
          pdfjsSrc: new URL('pdfjs/pdf.min.mjs', assetBase).href,
          pdfWorkerSrc: new URL('pdfjs/pdf.worker.min.mjs', assetBase).href,
          displayMode: 'auto',
          maxScale: 2,
          padding: 32,
          duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520,
        },
        options,
      ),
    );
    translate();
  }
  document.querySelector('[data-book-first]').addEventListener('click', function () {
    if (book) book.goTo(1);
  });
  document.querySelector('[data-book-last]').addEventListener('click', function () {
    if (book) book.goTo(pages);
  });
  document.querySelector('[data-book-jump]').addEventListener('submit', function (event) {
    event.preventDefault();
    if (book && pages) book.goTo(Math.max(1, Math.min(pages, Number(page.value) || 1)));
  });
  const issue = new URLSearchParams(location.search).get('issue') || '356';
  const docs = window.KDHANewsletterDocuments || {};
  if (Object.prototype.hasOwnProperty.call(docs, issue)) {
    document.querySelector('#viewer-title').textContent = '제' + issue + '호 치위협보';
    if (docs[issue]) {
      const url = new URL(docs[issue], documentBase);
      if (['http:', 'https:'].includes(url.protocol)) open({ url: url.href }, url.href, '치위협보-' + issue + '.pdf');
      else status.textContent = '지원하지 않는 PDF 주소입니다.';
    } else status.textContent = 'PDF 주소가 등록되지 않았습니다.';
  } else status.textContent = '등록되지 않은 치위협보입니다. 목록에서 다시 선택해 주세요.';
  window.addEventListener('pagehide', function (event) {
    if (!event.persisted) reset();
  });
})();
