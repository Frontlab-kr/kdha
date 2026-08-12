$(function () {
  var $menuItems = $('.primary-nav__item');
  var currentPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

  $('.primary-nav__link').each(function () {
    var href = $(this).attr('href');
    if (href && href !== '/' && currentPath.indexOf(href) === 0) {
      $(this).addClass('primary-nav__link--active').attr('aria-current', 'page');
    }
  });

  $(document).on('click', 'a[href^="/"]', function (event) {
    var target = new URL(this.href, window.location.origin);
    var isFile = /\.[a-z0-9]+$/i.test(target.pathname);

    if (!isFile && target.pathname !== '/' && !target.pathname.endsWith('/')) {
      event.preventDefault();
      window.location.href = target.pathname + '/' + target.search + target.hash;
    }
  });

  $menuItems.on('mouseenter focusin', function () {
    $(this).addClass('primary-nav__item--open').siblings().removeClass('primary-nav__item--open');
  });

  $('.site-header').on('mouseleave', function () {
    $menuItems.removeClass('primary-nav__item--open');
  });

  $menuItems.on('focusout', function (event) {
    if (!this.contains(event.relatedTarget)) {
      $(this).removeClass('primary-nav__item--open');
    }
  });
});
