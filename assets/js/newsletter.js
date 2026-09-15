(function ($) {
  'use strict';
  $(function () {
    const $root = $('[data-newsletter]');
    if (!$root.length) return;
    let year = 'all';
    const filter = function () {
      const query = String($('#newsletter-search').val() || '')
        .trim()
        .toLowerCase();
      let count = 0;
      $root.find('[data-newsletter-item]').each(function () {
        const matchesYear =
          year === 'all' || (year === '2023' ? Number(this.dataset.year) <= 2023 : this.dataset.year === year);
        this.hidden = !(matchesYear && this.textContent.toLowerCase().includes(query));
        if (!this.hidden) count++;
      });
      $root.find('.newsletter-empty').prop('hidden', count > 0);
      $root.find('.ds-pagination').prop('hidden', count === 0);
      $root.find('[data-newsletter-status]').text('치위협보 ' + count + '건이 검색되었습니다.');
    };
    $root.on('click', '[data-newsletter-year]', function () {
      year = this.dataset.newsletterYear;
      $root.find('[data-newsletter-year]').attr('aria-pressed', 'false');
      $(this).attr('aria-pressed', 'true');
      filter();
    });
    $root.find('[data-newsletter-search]').on('submit', function (event) {
      event.preventDefault();
      filter();
    });
    $('#newsletter-search').on('input', filter);
  });
})(window.jQuery);
