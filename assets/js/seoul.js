$(function () {
  $('.seoul-menu-button').on('click', function () {
    $('.seoul-nav').toggleClass('is-open');
    $(this).toggleClass('is-open');
  });
  $('.seoul-filter button').on('click', function () {
    $(this).addClass('is-active').siblings().removeClass('is-active');
  });
  $('.seoul-faq button').on('click', function () {
    var $item = $(this).closest('article');
    $item.toggleClass('is-open').siblings().removeClass('is-open');
  });
});
