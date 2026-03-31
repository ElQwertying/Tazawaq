import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

// Use your existing configuration
const firebaseConfig = {
	apiKey: "AIzaSyBI7lbFVejhxIaAOp2fiYKK0vVGVZJntEY",
	authDomain: "tazawaq.firebaseapp.com",
	projectId: "tazawaq",
	storageBucket: "tazawaq.firebasestorage.app",
	messagingSenderId: "120461778429",
	appId: "1:120461778429:web:321c3a039f25bef292cd94",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cardsToSeed = [
	{ q: 'دجاج مشوي + سبانخ؟', left: 'https://images.unsplash.com/photo-1547058606-7eb25508e7e0?auto=format&fit=crop&w=600', right: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600', title: 'تجانس المكونات', desc: 'نقيس مدى قبولك لهذه الإضافات معاً' },
	{ q: 'أرز بسمتي + طماطم؟', left: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600', right: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600', title: 'أساسيات الوجبة', desc: 'هل تعتبر هذا المزيج وجبة متكاملة؟' },
	{ q: 'ستيك لحم + سلطة خضراء؟', left: 'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=600', right: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600', title: 'وجبة غداء', desc: 'هل تفضل البروتين مع الألياف الخضراء؟' },
	{ q: 'بطاطس مقلية + ثوم؟', left: 'https://images.unsplash.com/photo-1587741011081-d85296fa2b2b?auto=format&fit=crop&w=600', right: 'https://images.unsplash.com/photo-1591592744945-21b765814922?auto=format&fit=crop&w=600', title: 'إضافات مفضلة', desc: 'الثومية مع البطاطس مقبلات شهيرة' },
	{ q: 'سمك + أرز أبيض؟', left: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600', right: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600', title: 'أطباق بحرية', desc: 'هل تفضل السمك مع الأرز أم الخبز؟' }
];

async function seedDatabase() {
	const colRef = collection(db, "cards");

	try {
		console.log("Clearing existing cards...");
		const querySnapshot = await getDocs(colRef);
		for (const doc of querySnapshot.docs) {
			await deleteDoc(doc.ref);
		}
		console.log("Collection cleared.");

		console.log("Starting seed...");
		for (const card of cardsToSeed) {
			const docRef = await addDoc(colRef, card);
			console.log(`Added document with ID: ${docRef.id}`);
		}
		console.log("Seeding complete!");
	} catch (e) {
		console.error("Error during seeding: ", e);
	}
}

seedDatabase();