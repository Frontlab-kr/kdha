$(function () {
  // 모바일 전체 메뉴 열기 및 닫기
  $('.regional-menu-button').on('click', function () {
    $('.regional-nav').toggleClass('is-open');
    $(this).toggleClass('is-open');
  });

  // 게시물 카테고리 필터 활성화
  $('.regional-filter button').on('click', function () {
    $(this).addClass('is-active').siblings().removeClass('is-active');
  });

  // FAQ 아코디언 열기 및 닫기
  $('.regional-faq button').on('click', function () {
    var $item = $(this).closest('article');
    $item.toggleClass('is-open').siblings().removeClass('is-open');
  });
});
