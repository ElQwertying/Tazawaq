import { CARDS } from './config.js';
import { state } from './state.js';

const stackContainer = document.getElementById('stack-container');
const doneScreen = document.getElementById('done-screen');
const ctxArea = document.getElementById('ctx-area');
const progress = document.getElementById('progress');

export function initStack() {
	state.idx = 0;
	stackContainer.innerHTML = '';
	CARDS.slice().reverse().forEach((c, i) => {
		const realIdx = CARDS.length - 1 - i;
		const el = document.createElement('div');
		el.className = 'card';
		el.id = `card-${realIdx}`;
		el.innerHTML = `
			<div class="card-split-wrap">
				<div class="side side-left" style="background-image:url(${c.left})"></div>
				<div class="side side-right" style="background-image:url(${c.right})"></div>
			</div>
			<div class="overlay overlay-up"></div>
			<div class="overlay overlay-left"></div>
			<div class="overlay overlay-right"></div>
			<div class="stamp stamp-no">لا</div>
			<div class="stamp stamp-yes">آكلها</div>
			<div class="stamp stamp-rejected">مرفوض</div>
			<div class="card-content"><div class="card-question">${c.q}</div></div>
			<div class="white-wash" style="position:absolute;top:0;left:0;width:100%;height:100%;background:white;opacity:0;pointer-events:none;border-radius:inherit;z-index:5;"></div>
		`;
		stackContainer.appendChild(el);
	});
	updateStack();
}

export function updateStack() {
	if (state.idx >= CARDS.length) {
		stackContainer.style.display = 'none';
		doneScreen.style.display = 'flex';
		setTimeout(() => doneScreen.style.opacity = 1, 50);
		ctxArea.style.opacity = 0;
		return;
	}

	for (let i = state.idx; i < CARDS.length; i++) {
		const el = document.getElementById(`card-${i}`);
		const wash = el.querySelector('.white-wash');
		const diff = i - state.idx;

		if (diff === 0) {
			el.classList.add('active');
			el.style.transform = 'translate(0,0) scale(1)';
			el.style.opacity = 1;
			el.style.zIndex = 100;
			if (wash) wash.style.opacity = 0;
		} else {
			el.classList.remove('active');
			const scale = 1 - Math.pow(diff, 0.9) * 0.09;
			const moveY = diff * 27;
			el.style.transform = `translateY(${moveY}px) scale(${scale})`;
			el.style.zIndex = 100 - diff;
			if (wash) wash.style.opacity = Math.min(diff * 0.35, 0.85);
		}
	}

	const currentData = CARDS[state.idx];
	ctxArea.style.opacity = 0;
	setTimeout(() => {
		document.getElementById('ctx-title').textContent = currentData.title;
		document.getElementById('ctx-desc').textContent = currentData.desc;
		ctxArea.style.opacity = 1;
	}, 150);

	progress.style.width = ((state.idx + 1) / CARDS.length * 100) + '%';
}