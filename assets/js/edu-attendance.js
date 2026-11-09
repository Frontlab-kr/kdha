// 현장교육 출결정보 입력(ED-AD-OFE-01-09P): 페이지를 열면 출석 팝업을 바로 엽니다.
// URL hash로 다른 팝업(#attendance-out-dialog)을 지정했으면 common.js가 그 팝업을 엽니다.
$(function () {
  var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
  if ((target && target.tagName === 'DIALOG') || document.querySelector('dialog[open]')) return;
  var dialog = document.getElementById('attendance-in-dialog');
  if (dialog && !dialog.open) dialog.showModal();
});
