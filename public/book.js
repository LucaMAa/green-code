const spreads = [...document.querySelectorAll('.spread')];
const scene = document.querySelector('#book-scene');
const turnPage = document.querySelector('#page-turn');
const turnFront = turnPage.querySelector('.turn-front');
const turnBack = turnPage.querySelector('.turn-back');
const curlHighlight = turnPage.querySelector('.curl-highlight');
const chapterLabel = document.querySelector('#current-chapter');
const pageLabel = document.querySelector('#current-page');
const totalLabel = document.querySelector('#total-pages');
const progress = document.querySelector('#reading-progress');
const progressFill = document.querySelector('#reading-progress-fill');
const previousButton = document.querySelector('#previous-page');
const nextButton = document.querySelector('#next-page');
const indexButtons = [...document.querySelectorAll('.chapter-index [data-go-to]')];
const startButton = document.querySelector('.start-reading');
let currentPage = 0;
let isTurning = false;
let turnTimeout;
let arrivalTimeout;
let pointerStart;

totalLabel.textContent = String(spreads.length).padStart(2, '0');
progress.setAttribute('aria-valuemax', String(spreads.length));

function updateReader() {
  spreads.forEach((spread, index) => {
    const active = index === currentPage;
    spread.classList.toggle('is-current', active);
    spread.setAttribute('aria-hidden', String(!active));
  });

  const pageNumber = currentPage + 1;
  chapterLabel.textContent = spreads[currentPage].dataset.title;
  pageLabel.textContent = String(pageNumber).padStart(2, '0');
  progress.setAttribute('aria-valuenow', String(pageNumber));
  progress.setAttribute('aria-valuetext', `Pagina ${pageNumber} di ${spreads.length}`);
  progressFill.style.width = `${pageNumber / spreads.length * 100}%`;
  previousButton.disabled = currentPage === 0 || isTurning;
  nextButton.disabled = currentPage === spreads.length - 1 || isTurning;
  nextButton.querySelector('span').textContent = currentPage === spreads.length - 1 ? 'Fine del libro' : 'Volta pagina';
  indexButtons.forEach((button) => {
    if (Number(button.dataset.goTo) === currentPage) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function goToPage(nextPage, direction) {
  if (isTurning || nextPage < 0 || nextPage >= spreads.length || nextPage === currentPage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previousSpread = spreads[currentPage];
  let visiblePage = previousSpread.querySelector(direction === 'previous' ? '.left-page' : '.right-page');
  if (!visiblePage.getBoundingClientRect().width) visiblePage = previousSpread.querySelector('.right-page');
  if (!reducedMotion) {
    const sceneBounds = scene.getBoundingClientRect();
    const pageBounds = visiblePage.getBoundingClientRect();
    const nextSpread = spreads[nextPage];
    let reverseSide = nextSpread.querySelector(direction === 'next' ? '.left-page' : '.right-page');
    if (!reverseSide.getBoundingClientRect().width) reverseSide = nextSpread.querySelector('.right-page');
    const frontCopy = visiblePage.cloneNode(true);
    const backCopy = reverseSide.cloneNode(true);
    [frontCopy, backCopy].forEach((copy) => {
      copy.classList.remove('left-page', 'right-page');
      copy.inert = true;
      copy.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      copy.querySelectorAll('[aria-controls], [aria-labelledby]').forEach((element) => {
        element.removeAttribute('aria-controls');
        element.removeAttribute('aria-labelledby');
      });
    });
    frontCopy.removeAttribute('aria-label');
    backCopy.removeAttribute('aria-label');

    isTurning = true;
    turnFront.replaceChildren(frontCopy);
    turnBack.replaceChildren(backCopy);
    turnPage.style.top = `${pageBounds.top - sceneBounds.top}px`;
    turnPage.style.width = `${pageBounds.width}px`;
    turnPage.style.height = `${pageBounds.height}px`;
    turnPage.style.left = `${pageBounds.left - sceneBounds.left}px`;
    turnPage.className = `page-turn turn-${direction}`;
    curlHighlight.hidden = false;
  }
  currentPage = nextPage;
  updateReader();

  const finishTurn = () => {
    if (!isTurning && !spreads[currentPage].classList.contains('arriving')) return;
    window.clearTimeout(turnTimeout);
    window.clearTimeout(arrivalTimeout);
    turnPage.className = 'page-turn';
    turnFront.replaceChildren();
    turnBack.replaceChildren();
    curlHighlight.hidden = true;
    spreads[currentPage].classList.remove('arriving', 'arriving-next', 'arriving-previous');
    isTurning = false;
    updateReader();
  };

  if (reducedMotion) return;
  spreads[currentPage].classList.add('arriving', `arriving-${direction}`);
  turnPage.addEventListener('animationend', finishTurn, { once: true });
  turnTimeout = window.setTimeout(finishTurn, 920);
  arrivalTimeout = window.setTimeout(finishTurn, 920);
}

previousButton.addEventListener('click', () => goToPage(currentPage - 1, 'previous'));
nextButton.addEventListener('click', () => goToPage(currentPage + 1, 'next'));
indexButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const destination = Number(button.dataset.goTo);
    goToPage(destination, destination > currentPage ? 'next' : 'previous');
  });
});
startButton.addEventListener('click', () => {
  document.querySelector('.reader').scrollIntoView({ behavior: 'smooth', block: 'start' });
  goToPage(Number(startButton.dataset.goTo), 'next');
});

scene.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button, input, a, label, select, textarea')) return;
  pointerStart = { x: event.clientX, y: event.clientY };
});
scene.addEventListener('pointerup', (event) => {
  if (!pointerStart) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  pointerStart = undefined;
  if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
  if (window.getSelection() && !window.getSelection().isCollapsed) return;
  goToPage(currentPage + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 'next' : 'previous');
});
scene.addEventListener('pointercancel', () => {
  pointerStart = undefined;
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
  if (event.key === 'ArrowRight') goToPage(currentPage + 1, 'next');
  if (event.key === 'ArrowLeft') goToPage(currentPage - 1, 'previous');
});

const italianNumber = new Intl.NumberFormat('it-IT');

const usersSlider = document.querySelector('#users-slider');
const actionsSlider = document.querySelector('#actions-slider');
const usersValue = document.querySelector('#users-value');
const actionsValue = document.querySelector('#actions-value');
const usageCalls = document.querySelector('#usage-calls');
const usageTokens = document.querySelector('#usage-tokens');

function updateUsageExample() {
  const calls = Number(usersSlider.value) * Number(actionsSlider.value) * 2;
  const tokens = calls * 1450;
  usersValue.value = italianNumber.format(Number(usersSlider.value));
  usersValue.textContent = usersValue.value;
  actionsValue.value = italianNumber.format(Number(actionsSlider.value));
  actionsValue.textContent = actionsValue.value;
  usageCalls.textContent = italianNumber.format(calls);
  usageTokens.textContent = italianNumber.format(tokens);
}

usersSlider.addEventListener('input', updateUsageExample);
actionsSlider.addEventListener('input', updateUsageExample);
updateUsageExample();

const choiceFeedback = document.querySelector('#choice-feedback');
const choiceExplanations = {
  rules: 'Questa è la soluzione più semplice: il programma controlla se l’email è già nell’elenco. Provala con alcuni esempi per assicurarti che funzioni.',
  small: 'Un modello più piccolo può essere utile per compiti che richiedono di capire un testo, ma qui basta cercare l’email nell’elenco.',
  large: 'Un modello grande può aiutare con problemi complicati, ma per controllare un’email è più del necessario.'
};

document.querySelectorAll('.choice-buttons [data-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.choice-buttons [data-choice]').forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle('is-selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
    choiceFeedback.textContent = choiceExplanations[button.dataset.choice];
  });
});

const revealButton = document.querySelector('#reveal-answer');
const recallAnswer = document.querySelector('#recall-answer');
revealButton.addEventListener('click', () => {
  const isExpanded = revealButton.getAttribute('aria-expanded') === 'true';
  revealButton.setAttribute('aria-expanded', String(!isExpanded));
  recallAnswer.hidden = isExpanded;
  revealButton.innerHTML = isExpanded ? 'Gira il cartoncino <span aria-hidden="true">↻</span>' : 'Nascondi la risposta <span aria-hidden="true">↺</span>';
});

updateReader();
