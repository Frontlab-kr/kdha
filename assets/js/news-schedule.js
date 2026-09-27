/* 협회일정(KD-US-CAL-01-01) 화면 확인용 스크립트
 * 달력/상세 화면을 아래 샘플 일정으로 그립니다. 실제 일정 데이터와 오늘 날짜는 서버에서 제공합니다.
 * - 목록: /news/schedule/?month=YYYY-MM  (이전 달 · 다음 달 · 오늘)
 * - 상세: /news/schedule/detail/?date=YYYY-MM-DD  (이전 일정 · 다음 일정 · 달력으로 · 오늘) */
(() => {
  const root = document.querySelector('[data-news-schedule]');
  if (!root) return;

  // 샘플 일정 (Figma·화면기획서 예시)
  const EVENTS = [
    { date: '2026-10-01', time: '09:30', place: '국회 의원회관', title: "회장 외, '건강수명과 튼튼한 돌봄은 입에서 시작된다' 국회 토론회", people: '박정란 회장, 김민영 정책이사 등' },
    { date: '2026-10-01', time: '14:00', place: '코엑스 마곡', title: '2026년도 상반기 치위생학교육 평가·인증 대상 대학 워크숍', people: '박정란 회장, 강부월 원장, 한경순 부원장, 이선영 간사 외 위원 2인 등' },
    { date: '2026-10-04', time: '10:00', place: '치과위생사회관', title: '제3차 정기이사회', people: '박정란 회장 외 이사 15인' },
    { date: '2026-10-10', time: '13:00', place: '서울 aT센터', title: '구강보건의 날 기념 대국민 구강건강 캠페인', people: '박정란 회장, 홍보위원회 등' },
    { date: '2026-10-11', time: '11:00', place: '보건복지부', title: '보건복지부 구강정책과 간담회', people: '박정란 회장, 김민영 정책이사' },
    { date: '2026-10-17', time: '09:00', place: '대전컨벤션센터', title: '2026 제48회 종합학술대회 및 KDHEX 개막식', people: '박정란 회장 외 임원 전원' },
    { date: '2026-10-17', time: '13:30', place: '대전컨벤션센터', title: '치위생 교육기관 협의회 정기총회', people: '강부월 원장, 한경순 부원장' },
    { date: '2026-10-17', time: '15:00', place: '대전컨벤션센터', title: '시·도회장 연석회의', people: '박정란 회장, 시·도회장 17인' },
    { date: '2026-10-17', time: '16:30', place: '대전컨벤션센터', title: '국제교류위원회 해외 연자 간담회', people: '국제교류위원회' },
    { date: '2026-10-17', time: '18:00', place: '대전컨벤션센터', title: '학술대회 우수 포스터 시상식', people: '학술위원회' },
    { date: '2026-10-18', time: '10:00', place: '대전컨벤션센터', title: '2026 제48회 종합학술대회 2일차', people: '박정란 회장 외 임원 전원' },
    { date: '2026-10-21', time: '14:00', place: '한국보건의료인국가시험원', title: '치과위생사 국가시험 실기 평가위원 회의', people: '김민영 정책이사' },
    { date: '2026-10-24', time: '10:00', place: '인천 송도컨벤시아', title: '인천광역시회 창립 기념식', people: '박정란 회장' },
    { date: '2026-10-25', time: '11:00', place: '광주 김대중컨벤션센터', title: '광주·전남회 회원 한마음 대회', people: '박정란 회장, 한경순 부원장' },
    { date: '2026-10-28', time: '15:00', place: '치과위생사회관', title: '면허신고 제도 개선 TF 회의', people: '정책위원회' },
    { date: '2026-10-31', time: '10:00', place: '천안 상록리조트', title: '충청남도회 임원 워크숍', people: '박정란 회장' },
    { date: '2026-11-05', time: '14:00', place: '치과위생사회관', title: '제4차 정기이사회', people: '박정란 회장 외 이사 15인' },
    { date: '2026-09-18', time: '10:00', place: '국회 의원회관', title: '의료기사법 개정 관련 국회 정책간담회', people: '박정란 회장' },
  ];
  const MAX_VISIBLE = 2;
  const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  };
  const escape = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const byDate = (date) => EVENTS.filter((e) => e.date === date).sort((a, b) => a.time.localeCompare(b.time));
  // 화면 확인용 기준일 (Figma 예시와 동일). 실제 서비스에서는 서버 날짜를 사용합니다.
  const today = parse(root.dataset.today || iso(new Date()));
  const params = new URLSearchParams(location.search);
  const detailUrl = (date) => `/kdha/news/schedule/detail/?date=${date}`;
  const monthUrl = (d) => `/kdha/news/schedule/?month=${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

  if (root.dataset.newsSchedule === 'month') {
    const title = root.querySelector('[data-schedule-title]');
    const grid = root.querySelector('[data-schedule-grid]');
    let current = params.get('month') ? parse(params.get('month')) : new Date(today.getFullYear(), today.getMonth(), 1);

    const render = () => {
      const y = current.getFullYear();
      const m = current.getMonth();
      title.textContent = `${y}년 ${m + 1}월`;
      const start = new Date(y, m, 1 - new Date(y, m, 1).getDay());
      const weeks = Math.ceil((new Date(y, m, 1).getDay() + new Date(y, m + 1, 0).getDate()) / 7);
      let html = WEEK.map(
        (w, i) => `<div class="ofe-weekday${i === 0 ? ' ofe-sunday' : i === 6 ? ' ofe-saturday' : ''}">${w}</div>`,
      ).join('');
      for (let i = 0; i < weeks * 7; i += 1) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const key = iso(d);
        const list = byDate(key);
        const cls = ['ofe-day'];
        if (d.getMonth() !== m) cls.push('ofe-day--outside');
        if (d.getDay() === 0) cls.push('ofe-sunday');
        if (d.getDay() === 6) cls.push('ofe-saturday');
        if (key === iso(today)) cls.push('news-schedule__today');
        const label = `${d.getMonth() + 1}월 ${d.getDate()}일`;
        html += `<div class="${cls.join(' ')}">`;
        html += `<span class="ofe-day__number"${key === iso(today) ? ' aria-current="date"' : ''}>${d.getDate()}<span class="sr-only">일${key === iso(today) ? ' 오늘' : ''}</span></span>`;
        list.slice(0, MAX_VISIBLE).forEach((e) => {
          html += `<a class="ofe-day__event" href="${detailUrl(key)}">${e.time} · ${escape(e.place)}<b>${escape(e.title)}</b></a>`;
        });
        if (list.length > MAX_VISIBLE) {
          html += `<a class="ds-button ds-button--outline ds-button--small ofe-day__more" href="${detailUrl(key)}">+${list.length - MAX_VISIBLE}개 더보기</a>`;
        }
        if (list.length) {
          html += `<a class="ofe-day__count" href="${detailUrl(key)}" aria-label="${label} 일정 ${list.length}건 보기">${list.length}건</a>`;
        }
        html += '</div>';
      }
      grid.innerHTML = html;
      history.replaceState(null, '', monthUrl(current));
    };
    root.querySelector('[data-schedule-prev]').addEventListener('click', () => {
      current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
      render();
    });
    root.querySelector('[data-schedule-next]').addEventListener('click', () => {
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      render();
    });
    root.querySelector('[data-schedule-today]').addEventListener('click', () => {
      current = new Date(today.getFullYear(), today.getMonth(), 1);
      render();
    });
    render();
  }

  if (root.dataset.newsSchedule === 'day') {
    const title = root.querySelector('[data-schedule-title]');
    const list = root.querySelector('[data-schedule-list]');
    const back = root.querySelector('[data-schedule-calendar]');
    let current = params.get('date') ? parse(params.get('date')) : today;

    const render = () => {
      const key = iso(current);
      title.textContent = `${current.getFullYear()}년 ${pad(current.getMonth() + 1)}월 ${pad(current.getDate())}일 ${WEEK[current.getDay()]}요일`;
      back.href = monthUrl(current);
      const items = byDate(key);
      const date = `${current.getFullYear()}.${pad(current.getMonth() + 1)}.${pad(current.getDate())}(${WEEK[current.getDay()]})`;
      list.innerHTML = items.length
        ? items
            .map(
              (e) => `<li class="news-schedule__item">
  <h2>${escape(e.title)}</h2>
  <dl>
    <div><dt>일시 및 장소</dt><dd><span>${date} ${e.time}</span><span>${escape(e.place)}</span></dd></div>
    <div><dt>참석자</dt><dd>${escape(e.people)}</dd></div>
  </dl>
</li>`,
            )
            .join('')
        : '<li class="news-schedule__empty">등록된 일정이 없습니다.</li>';
      history.replaceState(null, '', detailUrl(key));
    };
    // 이전 일정 · 다음 일정: 하루씩 이동합니다.
    const move = (step) => {
      current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + step);
      render();
    };
    root.querySelector('[data-schedule-prev]').addEventListener('click', () => move(-1));
    root.querySelector('[data-schedule-next]').addEventListener('click', () => move(1));
    root.querySelector('[data-schedule-today]').addEventListener('click', () => {
      current = today;
      render();
    });
    render();
  }
})();
