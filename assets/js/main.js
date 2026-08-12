$(function () {
  var news = {
    association: {
      more: '/community/notices/association',
      items: [
        [
          '2026-08-03',
          '“보건의료인력기준 법제화” 범국민 서명운동 안내',
          '안전하고 질 높은 의료서비스를 위한 적정 수준의 보건의료인력 확보 안내입니다.',
        ],
        [
          '2026-07-24',
          '치과위생사 고용환경에 관한 회원 실태조사 참여 안내',
          '치과위생사의 근로환경과 재취업 실태를 파악하기 위한 회원 조사입니다.',
        ],
        [
          '2026-07-15',
          '2027년도 대한치과위생사협회 다이어리 제작 용역 입찰 공고',
          '협회 다이어리 제작 용역 수행 업체를 선정합니다.',
        ],
      ],
    },
    education: {
      more: '/community/notices/education',
      items: [
        [
          '2026-08-05',
          '2026년 하반기 보수교육 일정 및 신청 안내',
          '하반기 현장교육 일정과 교육 신청 방법을 안내합니다.',
        ],
        [
          '2026-07-29',
          '사이버 보수교육 신규 과정 개설 안내',
          '감염관리와 노인 구강관리 신규 온라인 과정이 개설되었습니다.',
        ],
        ['2026-07-18', '보수교육 이수시간 및 면제 신청 안내', '대상별 이수시간과 면제·유예 신청 절차를 확인해 주세요.'],
      ],
    },
    legal: {
      more: '/career/consulting/legal',
      items: [
        ['2026-08-04', '근로계약서에 포함되어야 하는 필수 항목', '계약기간, 임금, 근로시간과 휴일 항목을 안내합니다.'],
        ['2026-07-26', '진료기록과 개인정보 보호 관련 상담 사례', '환자 개인정보와 진료기록 관리 기준입니다.'],
        ['2026-07-11', '의료사고 발생 시 초기 대응 절차', '사고 직후 기록 보존과 보고, 상담 신청 절차입니다.'],
      ],
    },
    labor: {
      more: '/career/consulting',
      items: [
        ['2026-08-02', '연차휴가 발생 기준과 사용 방법', '근속기간에 따른 연차휴가 계산 방법입니다.'],
        ['2026-07-22', '퇴직금 산정 시 평균임금 계산 안내', '퇴직 전 3개월 임금을 기준으로 한 산정 사례입니다.'],
        ['2026-07-08', '임신·육아기 근로시간 단축 제도', '임신과 육아 기간에 사용할 수 있는 제도를 안내합니다.'],
      ],
    },
    schedule: {
      more: '/news/schedule',
      items: [
        ['2026-08-08', '제48회 종합학술대회 및 KDHEX', '코엑스 마곡에서 학술대회와 KDHEX가 개최됩니다.'],
        ['2026-08-19', '8월 정기이사회', '협회 주요 사업과 하반기 운영계획을 논의합니다.'],
        ['2026-09-05', '전국 시도회장 간담회', '전국 시도회 현안 공유와 공동사업 협의 일정입니다.'],
      ],
    },
  };

  $('.home-news__tab').on('click', function () {
    var category = this.id.replace('news-tab-', '');
    var selected = news[category];
    if (!selected) return;

    $('.home-news__tab').removeClass('ds-chip--active').attr('aria-selected', 'false');
    $(this).addClass('ds-chip--active').attr('aria-selected', 'true');
    $('.home-news__more').attr('href', selected.more);
    $('#home-news-panel')
      .attr('aria-labelledby', this.id)
      .html(
        selected.items
          .map(function (item) {
            return (
              '<article class="home-news__item"><a class="home-news__content" href="' +
              selected.more +
              '"><h3 class="home-news__title">' +
              item[1] +
              '</h3><p class="home-news__description">' +
              item[2] +
              '</p></a><time class="home-news__date">' +
              item[0] +
              '</time></article>'
            );
          })
          .join(''),
      );
  });

  function resetSwiperMarkup(selector) {
    var $swiper = $(selector);
    $swiper
      .removeClass('swiper-initialized swiper-horizontal swiper-watch-progress swiper-backface-hidden')
      .removeAttr('style')
      .find('.swiper-wrapper, .swiper-slide')
      .removeAttr('style');
    $swiper
      .find('.swiper-slide')
      .removeClass(
        'swiper-slide-active swiper-slide-next swiper-slide-prev swiper-slide-visible swiper-slide-fully-visible',
      );
  }

  if (typeof Swiper !== 'undefined') {
    resetSwiperMarkup('.hero__slider');
    resetSwiperMarkup('.home-newsletter__slider');

    new Swiper('.hero__slider', {
      effect: 'fade',
      loop: true,
      speed: 650,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.hero__pagination', clickable: true },
    });

    new Swiper('.home-newsletter__slider', {
      slidesPerView: 'auto',
      spaceBetween: 40,
      speed: 600,
      grabCursor: true,
      rewind: true,
      slideToClickedSlide: true,
      watchSlidesProgress: true,
      pagination: { el: '.home-newsletter__pagination', clickable: true },
      navigation: {
        prevEl: '.home-newsletter__button--prev',
        nextEl: '.home-newsletter__button--next',
      },
      a11y: {
        prevSlideMessage: '이전 치위협보',
        nextSlideMessage: '다음 치위협보',
        paginationBulletMessage: '{{index}}번째 치위협보로 이동',
      },
      breakpoints: {
        0: { spaceBetween: 16 },
        701: { spaceBetween: 28 },
        1101: { spaceBetween: 40 },
      },
    });
  }
});
