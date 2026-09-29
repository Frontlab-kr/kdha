$(function () {
  'use strict';

  $('[data-edu-main-slider]').each(function () {
    var $section = $(this);
    var slider = new Swiper($section.find('.edu-main-slider')[0], {
      slidesPerView: 'auto',
      spaceBetween: 24,
      breakpoints: { 0: { spaceBetween: 12 }, 701: { spaceBetween: 24 } },
    });

    $section.on('click', '[data-edu-main-filter]', function () {
      var filter = $(this).data('edu-main-filter');
      var $slides = $section.find('.swiper-slide');
      $section.find('[data-edu-main-filter]').removeClass('is-active').attr('aria-pressed', 'false');
      $(this).addClass('is-active').attr('aria-pressed', 'true');
      $slides.each(function () {
        this.hidden = filter !== 'all' && $(this).data('category') !== filter;
      });
      $section.find('.edu-main-empty').prop('hidden', $slides.filter(':not([hidden])').length > 0);
      slider.update();
      slider.slideTo(0, 0);
    });
  });
});
