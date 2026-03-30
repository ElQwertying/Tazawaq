import { CARDS, FLY_THRESHOLD, VELOCITY_THRESHOLD } from './config.js';
import { state } from './state.js';
import { calculatePhysics } from './physics.js';
import { initStack, updateStack } from './ui.js';

function onMove(e) {
	if (!state.dragging || state.idx >= CARDS.length) return;
	const el = document.getElementById(`card-${state.idx}`);
	const rx = e.clientX - state.startX;
	const ry = e.clientY - state.startY;
	const mx = calculatePhysics(rx);
	const my = calculatePhysics(ry);

	el.style.transition = 'none';
	el.style.transform = `translate(${mx}px, ${my}px) rotate(${mx * 0.04}deg)`;

	const opUp = ry < -15 ? Math.min(0.8, Math.abs(ry) / 200) : 0;
	const opLeft = rx < -15 ? Math.min(0.8, Math.abs(rx) / 200) : 0;
	const opRight = rx > 15 ? Math.min(0.8, Math.abs(rx) / 200) : 0;
	const rawDist = Math.max(Math.abs(rx), Math.abs(ry));
	const glow = Math.min(40, rawDist * 0.7);

	el.querySelector('.overlay-up').style.opacity = opUp;
	el.querySelector('.overlay-left').style.opacity = opLeft;
	el.querySelector('.overlay-right').style.opacity = opRight;
	el.querySelector('.stamp-no').style.opacity = rx < -20 ? Math.min(1, Math.abs(rx + 20) / 80) : 0;
	el.querySelector('.stamp-yes').style.opacity = rx > 20 ? Math.min(1, (rx - 20) / 80) : 0;
	el.querySelector('.stamp-rejected').style.opacity = ry < -20 ? Math.min(1, Math.abs(ry + 20) / 80) : 0;

	if (ry < -15) el.style.boxShadow = `0 0 ${glow}px rgba(255, 65, 108, ${opUp}), 0 0 ${glow * 1.5}px rgba(255, 75, 43, ${opUp * 0.4}), inset 0 0 20px rgba(255,255,255,${opUp * 0.2})`;
	else if (rx < -15) el.style.boxShadow = `0 0 ${glow}px rgba(255, 175, 28, ${opLeft}), 0 0 ${glow * 1.5}px rgba(255, 241, 43, ${opLeft * 0.4}), inset 0 0 20px rgba(255,255,255,${opLeft * 0.2})`;
	else if (rx > 15) el.style.boxShadow = `0 0 ${glow}px rgba(9, 213, 19, ${opRight}), 0 0 ${glow * 1.5}px rgba(150, 201, 61, ${opRight * 0.4}), inset 0 0 20px rgba(255,255,255,${opRight * 0.2})`;
	else el.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
}

function fly(dir) {
	const el = document.getElementById(`card-${state.idx}`);
	el.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s';
	const x = dir === 'r' ? 1000 : (dir === 'l' ? -1000 : 0);
	const y = dir === 'u' ? -1200 : 0;
	el.style.transform = `translate(${x}px, ${y}px) rotate(${x / 10}deg)`;
	el.style.opacity = '0';
	state.idx++;
	setTimeout(updateStack, 200);
}

function onEnd(e) {
	if (!state.dragging || state.idx >= CARDS.length) return;
	state.dragging = false;
	const el = document.getElementById(`card-${state.idx}`);
	const rx = e.clientX - state.startX;
	const ry = e.clientY - state.startY;
	const duration = Date.now() - state.startTime;
	const vx = rx / duration;
	const vy = ry / duration;

	if (rx > FLY_THRESHOLD || (vx > VELOCITY_THRESHOLD && rx > 20)) fly('r');
	else if (rx < -FLY_THRESHOLD || (vx < -VELOCITY_THRESHOLD && rx < -20)) fly('l');
	else if (ry < -FLY_THRESHOLD || (vy < -VELOCITY_THRESHOLD && ry < -20)) fly('u');
	else {
		el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
		el.style.transform = 'translate(0,0) scale(1)';
		el.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
		el.querySelectorAll('.overlay, .stamp').forEach(s => s.style.opacity = 0);
	}
}

window.addEventListener('pointerdown', (e) => {
	const cardEl = e.target.closest('.card.active');
	if (cardEl) {
		state.dragging = true;
		state.startX = e.clientX; state.startY = e.clientY;
		state.startTime = Date.now();
	}
});
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onEnd);
document.getElementById('btn-reload').addEventListener('click', () => location.reload());
initStack();
