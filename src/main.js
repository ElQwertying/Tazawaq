import { FLY_THRESHOLD, VELOCITY_THRESHOLD } from './config.js';
import { state } from './state.js';
import { calculatePhysics } from './physics.js';
import { initStack, updateStack, appendNewCard } from './ui.js';
import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

function onMove(e) {
	if (!state.dragging || state.idx >= state.pairs.length) return;
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

	if (ry < -15) el.style.boxShadow = `0 0 ${glow}px rgba(255,65,108,${opUp}), 0 0 ${glow * 1.5}px rgba(255,75,43,${opUp * 0.4}), inset 0 0 20px rgba(255,255,255,${opUp * 0.2})`;
	else if (rx < -15) el.style.boxShadow = `0 0 ${glow}px rgba(255,175,28,${opLeft}), 0 0 ${glow * 1.5}px rgba(255,241,43,${opLeft * 0.4}), inset 0 0 20px rgba(255,255,255,${opLeft * 0.2})`;
	else if (rx > 15) el.style.boxShadow = `0 0 ${glow}px rgba(9,213,19,${opRight}), 0 0 ${glow * 1.5}px rgba(150,201,61,${opRight * 0.4}), inset 0 0 20px rgba(255,255,255,${opRight * 0.2})`;
	else el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
}

function fly(dir) {
	const el = document.getElementById(`card-${state.idx}`);
	if (!el) return;
	el.style.transition = 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1), opacity 0.2s';
	const x = dir === 'r' ? 1000 : (dir === 'l' ? -1000 : 0);
	const y = dir === 'u' ? -1200 : 0;
	el.style.transform = `translate(${x}px,${y}px) rotate(${x / 10}deg)`;
	el.style.opacity = '0';
	state.idx++;
	addNewPairToStack();
	appendNewCard(state.pairs[state.pairs.length - 1]);  // ← creates DOM + updates stack
	// setTimeout(updateStack, 200);
}

function onEnd(e) {
	if (!state.dragging || state.idx >= state.pairs.length) return;
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
		el.style.transition = 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';
		el.style.transform = 'translate(0,0) scale(1)';
		el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
		el.querySelectorAll('.overlay, .stamp').forEach(s => s.style.opacity = 0);
	}
}

window.addEventListener('pointerdown', (e) => {
	const cardEl = e.target.closest('.card.active');
	if (cardEl) {
		state.dragging = true;
		state.startX = e.clientX;
		state.startY = e.clientY;
		state.startTime = Date.now();
	}
});
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onEnd);
document.getElementById('btn-reload').addEventListener('click', () => location.reload());

// async function loadData() {
// 	// 1. fetch all pairs
// 	const pairsSnap = await getDocs(collection(db, 'pairs'));
// 	const rawPairs  = pairsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

// 	// 2. collect unique ingredient IDs
// 	const ingIds = [...new Set(rawPairs.flatMap(p => [p.ingredient_a_id, p.ingredient_b_id]))];

// 	// 3. batch fetch ingredients
// 	const ingDocs  = await Promise.all(ingIds.map(id => getDoc(doc(db, 'ingredients', id))));
// 	const ingMap   = {};
// 	ingDocs.forEach(d => { if (d.exists()) ingMap[d.id] = d.data(); });

// 	// 4. assemble cards
// 	const l = state.lang;
// 	state.pairs = rawPairs
// 		.filter(p => ingMap[p.ingredient_a_id] && ingMap[p.ingredient_b_id])
// 		.map(p => {
// 			const a = ingMap[p.ingredient_a_id];
// 			const b = ingMap[p.ingredient_b_id];
// 			const nameA = l === 'ar' ? a.name_ar : a.name_en;
// 			const nameB = l === 'ar' ? b.name_ar : b.name_en;
// 			return {
// 				id:        p.id,
// 				left:      a.image_url,
// 				right:     b.image_url,
// 				q:         l === 'ar' ? `${nameA} مع ${nameB}؟` : `${nameA} with ${nameB}?`,
// 				title:     `${nameA} + ${nameB}`,
// 				card_type: p.card_type,
// 				cuisine_tag: p.cuisine_tag,
// 			};
// 		});

// 	initStack();
// }


// ─────────────────────────────────────────────
// UPDATED loadData() + HELPERS (TEST MODE)
// 
// Changes:
// 1. Reads ONLY from "ingredients" collection (no more 'pairs')
// 2. Generates 3 random pairs on initial load
// 3. Provides infinite generation: after every user decision,
//    call addNewPairToStack() → creates a new pair and pushes
//    it to the back of the stack (exactly as you asked)
// 
// No changes needed to your UI stack or initStack().
// Just call the new helper after every yes/no decision.
// ─────────────────────────────────────────────

async function loadData() {
	// 1. fetch ALL ingredients (once)
	const ingSnap = await getDocs(collection(db, 'ingredients'));
	const ingredientsList = ingSnap.docs.map(d => ({
		id: d.id,
		...d.data()
	})).filter(ing => ing.is_active === true);

	// 2. cache the list for future dynamic pair generation
	state.ingredients = ingredientsList;

	// 3. generate initial 3 random pairs
	state.pairs = [];
	for (let i = 0; i < 3; i++) {
		const newCard = createRandomPair(ingredientsList, state.lang);
		if (newCard) state.pairs.push(newCard);
	}

	console.log(`✅ Loaded ${state.pairs.length} dynamic pairs (infinite mode active)`);
	initStack();
}

// ─────────────────────────────────────────────
// HELPER: Create one random pair card
// (called on load + after every decision)
// ─────────────────────────────────────────────
function createRandomPair(ingredientsList, lang) {
	if (!ingredientsList || ingredientsList.length < 2) {
		console.warn("Not enough ingredients to create a pair");
		return null;
	}

	// Pick two DIFFERENT random ingredients
	let idx1 = Math.floor(Math.random() * ingredientsList.length);
	let idx2 = Math.floor(Math.random() * ingredientsList.length);
	while (idx2 === idx1) {
		idx2 = Math.floor(Math.random() * ingredientsList.length);
	}

	const a = ingredientsList[idx1];
	const b = ingredientsList[idx2];

	const nameA = lang === 'ar' ? a.name_ar : a.name_en;
	const nameB = lang === 'ar' ? b.name_ar : b.name_en;

	// Optional: avoid generating the exact same pair again soon
	const pairKey = `${[a.id, b.id].sort().join('_')}`;
	if (!state.seenDynamicPairs) state.seenDynamicPairs = new Set();
	if (state.seenDynamicPairs.has(pairKey)) {
		// rare collision → just generate another
		return createRandomPair(ingredientsList, lang);
	}
	state.seenDynamicPairs.add(pairKey);

	return {
		id: `dynamic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		ingredient_a_id: a.id,        // ← important for saving user decision
		ingredient_b_id: b.id,        // ← important for saving user decision
		left: a.image_url,
		right: b.image_url,
		q: lang === 'ar' ? `${nameA} مع ${nameB}؟` : `${nameA} with ${nameB}?`,
		title: `${nameA} + ${nameB}`,
		card_type: 'soft',            // test mode = soft (ranking)
		cuisine_tag: a.cuisine_tag !== 'universal'
			? a.cuisine_tag
			: (b.cuisine_tag || 'universal'),
	};
}

// ─────────────────────────────────────────────
// HELPER: Call this AFTER every user decision
// (yes / no / swipe left / swipe right)
// This creates a new pair and sends it to the back
// ─────────────────────────────────────────────
function addNewPairToStack() {
	if (!state.ingredients || state.ingredients.length < 2) {
		console.warn("Cannot generate new pair - not enough ingredients");
		return;
	}

	const newCard = createRandomPair(state.ingredients, state.lang);
	if (newCard) {
		state.pairs.push(newCard);   // ← sends it to the back
		// If your stack library needs a refresh:
		// initStack();              // uncomment only if your initStack rebuilds safely
		// OR call your stack's "appendCard(newCard)" method if it exists
		console.log(`➕ New dynamic pair added to back → ${newCard.title}`);
	}
}

loadData();