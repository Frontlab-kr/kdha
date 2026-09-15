$(function () {
  // 협회 소식 탭별 콘텐츠
  var news = {
    association: {
      label: '공지',
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
        [
          '2026-07-10',
          '아동 칫솔질 문화 확산을 위한 업무 협약 안내',
          '올바른 구강관리 습관 확산을 위한 협력 사업을 시작합니다.',
        ],
        ['2026-07-02', '제48회 종합학술대회 참가 신청 안내', '학술대회 프로그램과 사전 등록 일정을 안내합니다.'],
        [
          '2026-06-29',
          '회원 권익 향상을 위한 법률·노무 상담 운영',
          '회원 대상 전문 상담 서비스 이용 방법을 확인하세요.',
        ],
      ],
    },
    education: {
      label: '협회',
      more: '/community/notices/association',
      items: [
        ['2026-08-06', '대한치과위생사협회 주요 사업 일정 안내', '협회의 하반기 주요 사업과 일정을 확인해 주세요.'],
        ['2026-07-28', '회원 서비스 개선을 위한 시스템 점검 안내', '더 나은 서비스 제공을 위해 시스템을 점검합니다.'],
        ['2026-07-18', '전국 시도회 공동 캠페인 안내', '국민 구강건강 증진을 위한 공동 캠페인을 진행합니다.'],
      ],
    },
    legal: {
      label: '교육',
      more: '/community/notices/education',
      items: [
        ['2026-08-05', '2026년 하반기 보수교육 일정 및 신청 안내', '하반기 현장교육 일정과 신청 방법을 안내합니다.'],
        ['2026-07-29', '사이버 보수교육 신규 과정 개설 안내', '감염관리와 노인 구강관리 신규 과정이 개설되었습니다.'],
        ['2026-07-18', '보수교육 이수시간 및 면제 신청 안내', '대상별 이수시간과 면제·유예 신청 절차를 확인해 주세요.'],
      ],
    },
    labor: {
      label: '법률',
      more: '/career/consulting/legal',
      items: [
        ['2026-08-04', '근로계약서에 포함되어야 하는 필수 항목', '계약기간, 임금, 근로시간과 휴일 항목을 안내합니다.'],
        ['2026-07-26', '진료기록과 개인정보 보호 관련 상담 사례', '환자 개인정보와 진료기록 관리 기준입니다.'],
        ['2026-07-11', '의료사고 발생 시 초기 대응 절차', '사고 직후 기록 보존과 보고, 상담 신청 절차입니다.'],
      ],
    },
    schedule: {
      label: '노무',
      more: '/career/consulting',
      items: [
        ['2026-08-02', '연차휴가 발생 기준과 사용 방법', '근속기간에 따른 연차휴가 계산 방법입니다.'],
        ['2026-07-22', '퇴직금 산정 시 평균임금 계산 안내', '퇴직 전 3개월 임금을 기준으로 한 산정 사례입니다.'],
        ['2026-07-08', '임신·육아기 근로시간 단축 제도', '임신과 육아 기간에 사용할 수 있는 제도를 안내합니다.'],
      ],
    },
  };

  function renderNews(category) {
    var selected = news[category];
    if (!selected) return;
    $('.main-b-news__more').attr('href', selected.more);
    $('#home-news-panel').html(
      selected.items
        .map(function (item) {
          return (
            '<article class="main-b-news__item"><span class="ds-badge main-b-news__category">' +
            selected.label +
            '</span><a href="' +
            selected.more +
            '"><h3 class="main-b-news__title">' +
            item[1] +
            '</h3><p class="main-b-news__description">' +
            item[2] +
            '</p></a><time datetime="' +
            item[0] +
            '">' +
            item[0] +
            '</time></article>'
          );
        })
        .join(''),
    );
  }

  // 탭 클릭과 방향키 이동 처리
  $('.main-b-news__tab')
    .on('click', function () {
      $('.main-b-news__tab').removeClass('is-active').attr({ 'aria-selected': 'false', tabindex: '-1' });
      $(this).addClass('is-active').attr({ 'aria-selected': 'true', tabindex: '0' });
      $('#home-news-panel').attr('aria-labelledby', this.id);
      renderNews(this.id.replace('news-tab-', ''));
    })
    .on('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var tabs = $('.main-b-news__tab').toArray();
      var next = (tabs.indexOf(this) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });

  renderNews('association');

  // 회원 지원 안내 슬라이드
  if (typeof Swiper !== 'undefined') {
    new Swiper('.main-b-promo', {
      loop: true,
      speed: 600,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.main-b-promo__pagination', clickable: true },
      a11y: { paginationBulletMessage: '{{index}}번째 안내로 이동' },
    });
  }
});
