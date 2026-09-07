$(function () {
  var $menuItems = $('.primary-nav__item');
  var currentPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

  function getScopedElements(scope, selector) {
    var $scope = $(scope || document);
    return $scope.is(selector) ? $scope.add($scope.find(selector)) : $scope.find(selector);
  }

  // 공통 날짜·연도 선택기 초기화 및 달력 버튼 연결
  function initDatepickers(scope) {
    if (typeof Datepicker === 'undefined') return;

    // ko 기본값의 `2026년09월` 표기를 디자인 표기법인 `2026년 09월`로 통일
    if (Datepicker.locales.ko) Datepicker.locales.ko.titleFormat = 'y년 mm월';

    getScopedElements(scope, '[data-datepicker]').each(function () {
      var input = this;
      var $input = $(input);
      if ($input.data('datepicker-ready')) return;

      var isYearPicker = $input.data('datepicker-view') === 'year';
      var datepickerOptions = {
        language: 'ko',
        format: isYearPicker ? 'yyyy' : 'yyyy-mm-dd',
        prevArrow: '<span class="material-symbols-rounded" aria-hidden="true">chevron_left</span>',
        nextArrow: '<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>',
        autohide: true,
        todayHighlight: true,
        clearButton: true,
        todayButton: !isYearPicker,
        weekStart: 0,
      };

      if (isYearPicker) {
        datepickerOptions.pickLevel = 2;
        datepickerOptions.startView = 2;
        datepickerOptions.maxView = 2;
      }

      var datepicker = new Datepicker(input, datepickerOptions);
      datepicker.picker.element.classList.add(isYearPicker ? 'datepicker--year' : 'datepicker--day');
      var $trigger = $input.closest('.form-datepicker').find('[data-datepicker-trigger]');
      $input.data({ 'datepicker-ready': true, datepicker: datepicker });

      $trigger.off('click.kdhaDatepicker').on('click.kdhaDatepicker', function () {
        datepicker.show();
      });
    });
  }

  // 두 날짜를 하나의 기간 필드로 사용하는 공통 range datepicker
  function initDateRangePickers(scope) {
    if (typeof DateRangePicker === 'undefined') return;

    if (Datepicker.locales.ko) Datepicker.locales.ko.titleFormat = 'y년 mm월';

    getScopedElements(scope, '[data-datepicker-range]').each(function () {
      var rangeElement = this;
      var $range = $(rangeElement);
      if ($range.data('datepicker-range-ready')) return;

      var rangePicker = new DateRangePicker(rangeElement, {
        language: 'ko',
        format: 'yyyy-mm-dd',
        prevArrow: '<span class="material-symbols-rounded" aria-hidden="true">chevron_left</span>',
        nextArrow: '<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>',
        autohide: true,
        todayHighlight: true,
        clearButton: true,
        todayButton: true,
        weekStart: 0,
      });

      rangePicker.datepickers.forEach(function (datepicker) {
        datepicker.picker.element.classList.add('datepicker--day', 'datepicker--range');
      });

      $range.data({ 'datepicker-range-ready': true, 'datepicker-range': rangePicker });
      $range
        .find('[data-datepicker-range-trigger]')
        .off('click.kdhaDateRange')
        .on('click.kdhaDateRange', function () {
          rangePicker.datepickers[0].show();
        });
    });
  }

  window.KDHAComponents = window.KDHAComponents || {};
  window.KDHAComponents.initDatepickers = initDatepickers;
  window.KDHAComponents.initDateRangePickers = initDateRangePickers;
  initDatepickers(document);
  initDateRangePickers(document);

  // 페이지 인덱스 바로가기 메뉴를 현재 스크롤 섹션과 동기화
  var $indexJump = $('.index-jump');
  if ($indexJump.length) {
    var $indexLinks = $indexJump.find('a[href^="#"]');
    var indexSections = $indexLinks
      .map(function () {
        return document.querySelector($(this).attr('href'));
      })
      .get();
    var indexScrollTick = false;

    function updateIndexJump() {
      var sectionScrollMargin = indexSections.reduce(function (largestMargin, section) {
        return Math.max(largestMargin, parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0);
      }, 0);
      var stickyNavBottom = $indexJump[0].getBoundingClientRect().bottom + 8;
      var activationLine = window.scrollY + Math.max(stickyNavBottom, sectionScrollMargin + 1);
      var currentSection = indexSections
        .slice()
        .sort(function (a, b) {
          return a.offsetTop - b.offsetTop;
        })
        .reduce(function (current, section) {
          return section.offsetTop <= activationLine ? section : current;
        }, indexSections[0]);

      $indexLinks.removeClass('is-active').removeAttr('aria-current');
      if (currentSection) {
        $indexLinks
          .filter('[href="#' + currentSection.id + '"]')
          .addClass('is-active')
          .attr('aria-current', 'location');
      }
      indexScrollTick = false;
    }

    $(window).on('scroll resize', function () {
      if (indexScrollTick) return;
      indexScrollTick = true;
      window.requestAnimationFrame(updateIndexJump);
    });
    $indexLinks.on('click', function () {
      $indexLinks.removeClass('is-active').removeAttr('aria-current');
      $(this).addClass('is-active').attr('aria-current', 'location');
    });
    updateIndexJump();
  }

  // 현재 URL에 해당하는 주 메뉴 활성화
  $('.primary-nav__item').each(function () {
    var $item = $(this);
    var $mainLink = $item.children('.primary-nav__link');
    var matchesCurrentPath = $item
      .find('a[href^="/"]')
      .toArray()
      .some(function (link) {
        var href = $(link).attr('href').replace(/\/$/, '');
        return href !== '/' && currentPath.indexOf(href) === 0;
      });
    if (matchesCurrentPath) $mainLink.addClass('primary-nav__link--active').attr('aria-current', 'page');
  });

  // 찾아오시는 길 카카오맵과 협회 위치 마커 초기화
  var kdhaMapContainer = document.getElementById('kdha-kakao-map');
  if (kdhaMapContainer && window.kakao?.maps) {
    var kdhaPosition = new kakao.maps.LatLng(37.589771, 127.0367731);
    var kdhaMap = new kakao.maps.Map(kdhaMapContainer, {
      center: kdhaPosition,
      level: 3,
    });
    var kdhaMarker = new kakao.maps.Marker({ position: kdhaPosition });
    var kdhaInfoWindow = new kakao.maps.InfoWindow({
      position: kdhaPosition,
      content: '<div class="about-location__map-label">대한치과위생사협회</div>',
      removable: true,
    });

    kdhaMarker.setMap(kdhaMap);
    kdhaInfoWindow.open(kdhaMap, kdhaMarker);
    kdhaMap.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
    kdhaMap.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
    kdhaMap.setZoomable(false);
  }

  // 내부 페이지 URL의 끝 슬래시 형식 통일
  $(document).on('click', 'a[href^="/"]', function (event) {
    var target = new URL(this.href, window.location.origin);
    var isFile = /\.[a-z0-9]+$/i.test(target.pathname);

    if (!isFile && target.pathname !== '/' && !target.pathname.endsWith('/')) {
      event.preventDefault();
      window.location.href = target.pathname + '/' + target.search + target.hash;
    }
  });

  // 정관 장 탭, 이전·다음 장 이동, 키보드 탐색
  var $articleTabs = $('.about-articles__tabs [role="tab"]');
  var $articlePanels = $('.about-articles__panel[role="tabpanel"]');

  function activateArticleChapter(chapterNumber, moveFocus) {
    var tabIndex = Number(chapterNumber) - 1;
    var $tab = $articleTabs.eq(tabIndex);
    var $panel = $articlePanels.eq(tabIndex);

    if (!$tab.length || !$panel.length) return;

    $articleTabs.attr({ 'aria-selected': 'false', tabindex: '-1' });
    $articlePanels.prop('hidden', true);
    $tab.attr({ 'aria-selected': 'true', tabindex: '0' });
    $panel.prop('hidden', false);
    $tab[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    if (moveFocus) $tab.trigger('focus');
  }

  $articleTabs.on('click', function () {
    activateArticleChapter($articleTabs.index(this) + 1, false);
  });

  $articleTabs.on('keydown', function (event) {
    var currentIndex = $articleTabs.index(this);
    var nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % $articleTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + $articleTabs.length) % $articleTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = $articleTabs.length - 1;
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    activateArticleChapter(nextIndex + 1, true);
  });

  $(document).on('click', '[data-article-target]', function () {
    var targetChapter = Number($(this).data('article-target'));
    activateArticleChapter(targetChapter, true);
    document.querySelector('.about-articles__tabs-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 협회 조직도에서 선택한 조직의 상세 정보만 표시
  $(document).on('click', '[data-organization-open]', function () {
    var panelId = $(this).data('organization-open');
    var panel = document.getElementById(panelId);

    if (!panel) return;

    $('[data-organization-open]').attr('aria-expanded', 'false');
    $('.about-organization-details__panel').prop('hidden', true);
    $('[data-organization-empty]').prop('hidden', true);
    $(this).attr('aria-expanded', 'true');
    $(panel).prop('hidden', false);
    $(panel).find('h2').get(0)?.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 조직도 정보 영역을 닫고 최초 안내 상태로 복귀
  $(document).on('click', '[data-organization-close]', function () {
    $('[data-organization-open]').attr('aria-expanded', 'false');
    $('.about-organization-details__panel').prop('hidden', true);
    $('[data-organization-empty]').prop('hidden', false).attr('tabindex', '-1').trigger('focus');
  });

  // 기존 사이트처럼 URL 해시에 해당하는 3뎁스 패널 하나만 표시
  function activateAboutHashPanel() {
    $('.about-dental-side-nav, .about-organization-side-nav').each(function () {
      var $nav = $(this);
      var $layout = $nav.parent();
      var $links = $nav.find('a');
      var hash = window.location.hash || new URL($links.first().attr('href'), window.location.origin).hash;
      var $activeLink = $links.filter(function () {
        return new URL($(this).attr('href'), window.location.origin).hash === hash;
      });

      if (!$activeLink.length) {
        $activeLink = $links.first();
        hash = new URL($activeLink.attr('href'), window.location.origin).hash;
      }

      var $panels = $layout.children('[class$="__content"]').children('[id]');
      $panels.prop('hidden', true);
      $panels.filter(hash).prop('hidden', false);
      $links.removeAttr('aria-current');
      $activeLink.attr('aria-current', 'page');
    });
  }

  activateAboutHashPanel();
  $(window).on('hashchange', activateAboutHashPanel);

  // 치과위생사 소개 상세 탭 전환
  function activateDentalTab($tab, moveFocus) {
    var panelId = $tab.data('dental-tab');
    $('[data-dental-tab]').attr({ 'aria-selected': 'false', tabindex: '-1' });
    $('[data-dental-panel]').prop('hidden', true);
    $tab.attr({ 'aria-selected': 'true', tabindex: '0' });
    $('#' + panelId).prop('hidden', false);
    if (moveFocus) $tab.trigger('focus');
  }

  $(document).on('click', '[data-dental-tab]', function () {
    activateDentalTab($(this), false);
  });

  $(document).on('keydown', '[data-dental-tab]', function (event) {
    var $tabs = $('[data-dental-tab]');
    var index = $tabs.index(this);
    var nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % $tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + $tabs.length) % $tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = $tabs.length - 1;
    if (nextIndex === index) return;
    event.preventDefault();
    activateDentalTab($tabs.eq(nextIndex), true);
  });

  // PC 주 메뉴의 서브메뉴 열기 및 닫기
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

  // 공통 dialog·alert 레이어 열기 및 닫기
  $(document).on('click', '[data-dialog-open]', function () {
    var dialog = document.getElementById($(this).data('dialog-open'));
    if (dialog && !dialog.open) dialog.showModal();
  });

  $(document).on('click', '[data-dialog-close]', function () {
    var dialog = $(this).closest('dialog')[0];
    if (dialog) dialog.close();
  });

  $(document).on('click', 'dialog.dialog, dialog.edu-dialog', function (event) {
    if (event.target !== this) return;

    var bounds = this.getBoundingClientRect();
    var clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) this.close();
  });

  // 공통 탭 콘텐츠 전환과 방향키 탐색
  function activateTab($tab, moveFocus) {
    var $tabList = $tab.closest('[data-tabs]');
    var $tabs = $tabList.find('[data-tab]');
    var panelId = $tab.attr('aria-controls');

    $tabs.attr({ 'aria-selected': 'false', tabindex: '-1' });
    $tabs.each(function () {
      $('#' + $(this).attr('aria-controls')).prop('hidden', true);
    });
    $tab.attr({ 'aria-selected': 'true', tabindex: '0' });
    $('#' + panelId).prop('hidden', false);
    if (moveFocus) $tab.trigger('focus');
  }

  $(document).on('click', '[data-tabs] [data-tab]', function () {
    activateTab($(this), false);
  });

  $(document).on('keydown', '[data-tabs] [data-tab]', function (event) {
    var $tabs = $(this).closest('[data-tabs]').find('[data-tab]');
    var currentIndex = $tabs.index(this);
    var nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % $tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + $tabs.length) % $tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = $tabs.length - 1;
    else return;

    event.preventDefault();
    activateTab($tabs.eq(nextIndex), true);
  });

  // 공개 콘텐츠의 탭을 마우스와 방향키로 전환
  function activatePublicTab($tab, moveFocus) {
    var panelId = $tab.attr('aria-controls');
    var $tabList = $tab.closest('[role="tablist"]');
    var $tabs = $tabList.find('[data-public-tab]');

    $tabs.attr({ 'aria-selected': 'false', tabindex: '-1' });
    $tabs.each(function () {
      $('#' + $(this).attr('aria-controls')).prop('hidden', true);
    });
    $tab.attr({ 'aria-selected': 'true', tabindex: '0' });
    $('#' + panelId).prop('hidden', false);
    if (moveFocus) $tab.trigger('focus');
  }

  $(document).on('click', '[data-public-tab]', function () {
    activatePublicTab($(this), false);
  });

  $(document).on('keydown', '[data-public-tab]', function (event) {
    var $tabs = $(this).closest('[role="tablist"]').find('[data-public-tab]');
    var index = $tabs.index(this);
    var nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % $tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + $tabs.length) % $tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = $tabs.length - 1;
    if (nextIndex === index) return;

    event.preventDefault();
    activatePublicTab($tabs.eq(nextIndex), true);
  });

  // 서버 없이 제공하는 자료 목록에서 현재 화면의 항목을 검색
  $(document).on('submit input', '[data-static-search]', function (event) {
    if (event.type === 'submit') event.preventDefault();
    var $form = $(this);
    var keyword = String($form.find('input[type="search"]').val() || '')
      .trim()
      .toLocaleLowerCase('ko-KR');
    var $scope = $form.closest('.user-content, .legacy-public-content');
    var $items = $scope.find('[data-static-search-item]');
    var visibleCount = 0;

    $items.each(function () {
      var matches = !keyword || $(this).text().toLocaleLowerCase('ko-KR').indexOf(keyword) !== -1;
      $(this).prop('hidden', !matches);
      if (matches) visibleCount += 1;
    });
    $form.find('[data-static-search-status]').text('검색 결과 ' + visibleCount + '건');
  });

  // 네이티브 값을 유지하면서 펼침 목록까지 동일하게 표현하는 공통 셀렉트
  var customSelectSequence = $('.ds-select').length;

  function initCustomSelects(scope) {
    getScopedElements(scope, 'select[data-custom-select]').each(function () {
      var $native = $(this);
      if ($native.data('custom-select-ready')) return;

      var listId = ($native.attr('id') || 'ds-select-' + customSelectSequence++) + '-listbox';
      var fieldLabel = $.trim(
        $native.closest('.form-field, .edu-field').children('span, label').first().text() || '선택',
      );
      var isRequired = $native.prop('required');
      var $root = $('<div class="ds-select"></div>');
      var $button = $(
        '<button class="ds-select__button" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false"></button>',
      );
      var $value = $('<span class="ds-select__value"></span>');
      var $icon = $(
        '<span class="ds-select__icon material-symbols-rounded" aria-hidden="true">keyboard_arrow_down</span>',
      );
      var $list = $('<ul class="ds-select__list" role="listbox" hidden></ul>').attr('id', listId);

      if (isRequired) {
        $native.prop('required', false).attr('data-custom-required', 'true');
        $button.attr('aria-required', 'true');
      }

      $button.attr({ 'aria-controls': listId, 'aria-label': fieldLabel });
      $button.append($value, $icon);
      $root.append($button, $list);
      $native.after($root).addClass('ds-select__native').attr({ 'aria-hidden': 'true', tabindex: '-1' });
      $native.data('custom-select-ready', true);

      function syncCustomSelect() {
        // 종속 셀렉트 등에서 원본 option이 바뀐 경우 펼침 목록도 동기화합니다.
        $list.empty();
        $native.find('option').each(function (optionIndex) {
          $list.append(
            $('<li class="ds-select__option" role="option" tabindex="-1"></li>')
              .text($(this).text())
              .attr({
                'data-option-index': optionIndex,
                'aria-selected': this.selected ? 'true' : 'false',
                'aria-disabled': this.disabled ? 'true' : 'false',
              }),
          );
        });
        var selectedIndex = $native.prop('selectedIndex');
        var selectedOption = $native.find('option').eq(selectedIndex);
        var selectedText = selectedOption.text();
        var isPlaceholder =
          selectedOption.attr('data-placeholder') !== 'false' && (!selectedOption.val() || selectedIndex === 0);

        $value.text(selectedText);
        $button
          .toggleClass('is-placeholder', isPlaceholder)
          .attr('aria-label', fieldLabel + ': ' + selectedText)
          .removeAttr('aria-invalid');
        $list
          .children('.ds-select__option')
          .attr('aria-selected', 'false')
          .eq(selectedIndex)
          .attr('aria-selected', 'true');
        $native.closest('.form-field, .edu-field').removeClass('has-error');
      }

      syncCustomSelect();
      $native.on('change', syncCustomSelect);
    });
  }

  window.KDHAComponents.initCustomSelects = initCustomSelects;
  initCustomSelects(document);

  function closeCustomSelect($root, returnFocus) {
    if (!$root.length || !$root.hasClass('is-open')) return;
    $root.removeClass('is-open');
    $root.children('.ds-select__button').attr('aria-expanded', 'false');
    $root.children('.ds-select__list').prop('hidden', true);
    if (returnFocus) $root.children('.ds-select__button').trigger('focus');
  }

  function openCustomSelect($root) {
    $('.ds-select.is-open').each(function () {
      closeCustomSelect($(this), false);
    });
    $root.addClass('is-open');
    $root.children('.ds-select__button').attr('aria-expanded', 'true');
    var $list = $root.children('.ds-select__list').prop('hidden', false);
    var $target = $list.children('[aria-selected="true"]:not([aria-disabled="true"])');
    if (!$target.length) $target = $list.children(':not([aria-disabled="true"])').first();
    $target.trigger('focus');
  }

  $(document).on('click', '.ds-select__button', function () {
    var $root = $(this).closest('.ds-select');
    if ($root.hasClass('is-open')) closeCustomSelect($root, false);
    else openCustomSelect($root);
  });

  $(document).on('click', '.ds-select__option', function () {
    if ($(this).attr('aria-disabled') === 'true') return;
    var $root = $(this).closest('.ds-select');
    var optionIndex = Number($(this).data('option-index'));
    $root.prev('select[data-custom-select]').prop('selectedIndex', optionIndex).trigger('change');
    closeCustomSelect($root, true);
  });

  $(document).on('keydown', '.ds-select__button', function (event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    openCustomSelect($(this).closest('.ds-select'));
  });

  $(document).on('keydown', '.ds-select__option', function (event) {
    var $root = $(this).closest('.ds-select');
    var $options = $root.find('.ds-select__option:not([aria-disabled="true"])');
    var currentIndex = $options.index(this);
    var nextIndex = currentIndex;

    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % $options.length;
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + $options.length) % $options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = $options.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      $(this).trigger('click');
      return;
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      closeCustomSelect($root, event.key === 'Escape');
      return;
    } else return;

    event.preventDefault();
    $options.eq(nextIndex).trigger('focus');
  });

  $(document).on('click', function (event) {
    if ($(event.target).closest('.ds-select').length) return;
    $('.ds-select.is-open').each(function () {
      closeCustomSelect($(this), false);
    });
  });

  $(document).on('submit', 'form', function (event) {
    var $invalid = $(this)
      .find('select[data-custom-required]')
      .filter(function () {
        return !this.value;
      })
      .first();
    if (!$invalid.length) return;

    event.preventDefault();
    var $field = $invalid.closest('.form-field, .edu-field').addClass('has-error');
    $field.find('.ds-select__button').attr('aria-invalid', 'true').trigger('focus');
  });
});
