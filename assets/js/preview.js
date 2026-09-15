document.addEventListener('DOMContentLoaded', function () {
  var viewer = document.querySelector('[data-preview-fade]');

  if (!viewer) return;

  var images = Array.from(viewer.querySelectorAll('[data-preview-image]'));
  var nextButton = viewer.querySelector('[data-preview-next]');
  var status = viewer.querySelector('[data-preview-status]');
  var currentConcept = window.location.hash === '#b' ? 'b' : 'a';
  var currentSlide = 1;

  // 현재 콘셉트의 시안을 번호에 맞춰 페이드 전환한다.
  function updatePreview() {
    images.forEach(function (image) {
      var isActive = image.dataset.previewImage === currentConcept + '-' + currentSlide;
      image.classList.toggle('is-active', isActive);
      image.setAttribute('aria-hidden', String(!isActive));
    });

    nextButton.setAttribute('aria-label', '다음 시안 보기, 현재 ' + currentSlide + '/4');
    status.textContent = currentSlide + '번 시안이 표시되었습니다.';
  }

  function showNextSlide() {
    currentSlide = (currentSlide % 4) + 1;
    updatePreview();
  }

  // 전체 시안을 클릭하면 1 → 2 → 3 → 4 → 1 순서로 반복한다.
  nextButton.addEventListener('click', showNextSlide);

  // 키보드 사용자는 Enter 또는 Space로 동일하게 다음 시안을 확인한다.
  nextButton.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;

    event.preventDefault();
    showNextSlide();
  });

  // 주소의 A/B 해시가 바뀌면 해당 콘셉트의 첫 시안부터 표시한다.
  window.addEventListener('hashchange', function () {
    currentConcept = window.location.hash === '#b' ? 'b' : 'a';
    currentSlide = 1;
    updatePreview();
  });

  updatePreview();
});
