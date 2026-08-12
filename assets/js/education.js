$(function () {
  $('.edu-filter button').on('click', function () {
    var category = $(this).data('filter');
    $(this).addClass('is-active').siblings().removeClass('is-active');
    $('[data-category]').each(function () {
      $(this).toggle(category === 'all' || $(this).data('category') === category);
    });
  });

  $('.edu-search').on('submit', function (event) {
    event.preventDefault();
  });
});
