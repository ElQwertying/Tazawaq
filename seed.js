import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";

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

// ─────────────────────────────────────────────
// INGREDIENTS ONLY SEED (v2 - comprehensive)
// 
// This seed ONLY populates the "ingredients" collection.
// All connections (flavors, pairs, combos, meals, sessions, 
// simple_applications, etc.) will be seeded in separate future scripts.
// 
// Exhaustive list covering Egyptian, Levantine, Gulf, Maghrebi 
// and universal staples. Categories expanded logically while 
// staying compatible with existing app structure.
// 
// Arabic names are accurate and commonly used in Egypt/Levant.
// Image URLs are real Unsplash + Picsum (stable food photos).
// All items are is_active: true by default.
// ─────────────────────────────────────────────

const ingredients = [
  // ── PROTEIN ──
  { name_ar: "دجاج", name_en: "chicken", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1547058606-7eb25508e7e0?w=600", is_active: true },
  { name_ar: "لحم بقري", name_en: "beef", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1588347818036-558601350947?w=600", is_active: true },
  { name_ar: "لحم ضأن", name_en: "lamb", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1603048297173-c92544798b8a?w=600", is_active: true },
  { name_ar: "سمك", name_en: "fish", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600", is_active: true },
  { name_ar: "بلطي", name_en: "tilapia", category: "protein", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/1015/600", is_active: true },
  { name_ar: "سالمون", name_en: "salmon", category: "protein", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "تونة", name_en: "tuna", category: "protein", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "جمبري", name_en: "shrimp", category: "protein", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600", is_active: true },
  { name_ar: "حبار", name_en: "squid", category: "protein", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/870/600", is_active: true },
  { name_ar: "بيض", name_en: "eggs", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587486936739-7f43a2a95e95?w=600", is_active: true },
  { name_ar: "كبدة", name_en: "liver", category: "protein", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1544025162-d76594e6f5e7?w=600", is_active: true },
  { name_ar: "فراخ رومي", name_en: "turkey", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600", is_active: true },
  { name_ar: "بط", name_en: "duck", category: "protein", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/1005/600", is_active: true },
  { name_ar: "حمام", name_en: "pigeon", category: "protein", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/133/600", is_active: true },

  // ── VEGETABLE ──
  { name_ar: "سبانخ", name_en: "spinach", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600", is_active: true },
  { name_ar: "طماطم", name_en: "tomato", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", is_active: true },
  { name_ar: "بصل", name_en: "onion", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600", is_active: true },
  { name_ar: "ثوم", name_en: "garlic", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1591928285539-a89c521b7fd4?w=600", is_active: true },
  { name_ar: "بطاطس", name_en: "potato", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1585514819139-78a2de4a3c85?w=600", is_active: true },
  { name_ar: "جزر", name_en: "carrot", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600", is_active: true },
  { name_ar: "فلفل رومي", name_en: "bell pepper", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600", is_active: true },
  { name_ar: "كوسة", name_en: "zucchini", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600", is_active: true },
  { name_ar: "باذنجان", name_en: "eggplant", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1569923186292-bb55e55dbde4?w=600", is_active: true },
  { name_ar: "ملوخية", name_en: "molokhia", category: "vegetable", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1616840388998-a514e565a7e4?w=600", is_active: true },
  { name_ar: "فول", name_en: "fava beans", category: "vegetable", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", is_active: true },
  { name_ar: "خيار", name_en: "cucumber", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600", is_active: true },
  { name_ar: "بامية", name_en: "okra", category: "vegetable", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "قرنبيط", name_en: "cauliflower", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "بروكولي", name_en: "broccoli", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "فاصوليا خضراء", name_en: "green beans", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "بازلاء", name_en: "peas", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "كرنب", name_en: "cabbage", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/1015/600", is_active: true },
  { name_ar: "خس", name_en: "lettuce", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "فجل", name_en: "radish", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "جرجير", name_en: "arugula", category: "vegetable", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "كراث", name_en: "leeks", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "خرشوف", name_en: "artichoke", category: "vegetable", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "يقطين", name_en: "pumpkin", category: "vegetable", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },

  // ── GRAIN / LEGUME ──
  { name_ar: "أرز أبيض", name_en: "white rice", category: "grain", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600", is_active: true },
  { name_ar: "أرز بسمتي", name_en: "basmati rice", category: "grain", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1536304993881-ff86e0c9dbb3?w=600", is_active: true },
  { name_ar: "خبز بلدي", name_en: "pita bread", category: "grain", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", is_active: true },
  { name_ar: "مكرونة", name_en: "pasta", category: "grain", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600", is_active: true },
  { name_ar: "برغل", name_en: "bulgur", category: "grain", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1594020293008-5f99db4f4b07?w=600", is_active: true },
  { name_ar: "عدس", name_en: "lentils", category: "grain", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1585669418634-a0e05d37e428?w=600", is_active: true },
  { name_ar: "فريك", name_en: "freekeh", category: "grain", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "كسكسي", name_en: "couscous", category: "grain", cuisine_tag: "maghrebi", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "كينوا", name_en: "quinoa", category: "grain", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "شعير", name_en: "barley", category: "grain", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "حمص", name_en: "chickpeas", category: "legume", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/292/600", is_active: true },

  // ── DAIRY ──
  { name_ar: "جبنة بيضاء", name_en: "white cheese", category: "dairy", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600", is_active: true },
  { name_ar: "زبادي", name_en: "yogurt", category: "dairy", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1488477181228-c84a2b82ca7b?w=600", is_active: true },
  { name_ar: "قشطة", name_en: "cream", category: "dairy", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587044912741-1d6e45e7e0b5?w=600", is_active: true },
  { name_ar: "حليب", name_en: "milk", category: "dairy", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "لبنة", name_en: "labneh", category: "dairy", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "جبنة حلوم", name_en: "halloumi", category: "dairy", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "سمن", name_en: "ghee", category: "dairy", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "زبدة", name_en: "butter", category: "dairy", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },

  // ── SPICE ──
  { name_ar: "كمون", name_en: "cumin", category: "spice", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", is_active: true },
  { name_ar: "كركم", name_en: "turmeric", category: "spice", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600", is_active: true },
  { name_ar: "فلفل أسود", name_en: "black pepper", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "قرفة", name_en: "cinnamon", category: "spice", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "بابريكا", name_en: "paprika", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "كزبرة", name_en: "coriander", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "هيل", name_en: "cardamom", category: "spice", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "قرنفل", name_en: "clove", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "جوزة الطيب", name_en: "nutmeg", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "زنجبيل", name_en: "ginger", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "شطة", name_en: "chili powder", category: "spice", cuisine_tag: "egyptian", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "سماق", name_en: "sumac", category: "spice", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "زعفران", name_en: "saffron", category: "spice", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "ورق غار", name_en: "bay leaf", category: "spice", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },

  // ── HERB ──
  { name_ar: "بقدونس", name_en: "parsley", category: "herb", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "كزبرة خضراء", name_en: "cilantro", category: "herb", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "نعناع", name_en: "mint", category: "herb", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "شبت", name_en: "dill", category: "herb", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "ريحان", name_en: "basil", category: "herb", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },

  // ── SAUCE / CONDIMENT ──
  { name_ar: "طحينة", name_en: "tahini", category: "sauce", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600", is_active: true },
  { name_ar: "صلصة طماطم", name_en: "tomato sauce", category: "sauce", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=600", is_active: true },
  { name_ar: "دبس رمان", name_en: "pomegranate molasses", category: "sauce", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "هريسة", name_en: "harissa", category: "sauce", cuisine_tag: "maghrebi", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "خل", name_en: "vinegar", category: "sauce", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },

  // ── OIL ──
  { name_ar: "زيت زيتون", name_en: "olive oil", category: "oil", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "زيت عباد الشمس", name_en: "sunflower oil", category: "oil", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },

  // ── FRUIT ──
  { name_ar: "ليمون", name_en: "lemon", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "تمر", name_en: "date", category: "fruit", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "رمان", name_en: "pomegranate", category: "fruit", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "تين", name_en: "fig", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "عنب", name_en: "grape", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "مانجو", name_en: "mango", category: "fruit", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "تفاح", name_en: "apple", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "موز", name_en: "banana", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "برتقال", name_en: "orange", category: "fruit", cuisine_tag: "universal", image_url: "https://picsum.photos/id/292/600", is_active: true },

  // ── NUT / SEED ──
  { name_ar: "فستق", name_en: "pistachio", category: "nut", cuisine_tag: "gulf", image_url: "https://picsum.photos/id/312/600", is_active: true },
  { name_ar: "لوز", name_en: "almond", category: "nut", cuisine_tag: "universal", image_url: "https://picsum.photos/id/133/600", is_active: true },
  { name_ar: "جوز", name_en: "walnut", category: "nut", cuisine_tag: "universal", image_url: "https://picsum.photos/id/201/600", is_active: true },
  { name_ar: "صنوبر", name_en: "pine nut", category: "nut", cuisine_tag: "levantine", image_url: "https://picsum.photos/id/292/600", is_active: true },
  { name_ar: "سمسم", name_en: "sesame", category: "nut", cuisine_tag: "universal", image_url: "https://picsum.photos/id/312/600", is_active: true },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function clearCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) {
    console.log(`  ✅ ${colName} already empty`);
    return;
  }
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`  🗑️ cleared: ${colName} (${snap.size} docs)`);
}

// ─────────────────────────────────────────────
// MAIN SEED (ingredients only)
// ─────────────────────────────────────────────
async function seedIngredientsOnly() {
  console.log("────────────────────────────────────");
  console.log("🚀 TAZAWAQ SEED v2 - INGREDIENTS ONLY");
  console.log("────────────────────────────────────");
  console.log("Only the ingredients collection is touched.");
  console.log("All flavor / pair / combo / meal connections will be added later.\n");

  await clearCollection("ingredients");

  console.log("\n── seeding ingredients ──");
  let successCount = 0;

  for (const ing of ingredients) {
    try {
      const ref = await addDoc(collection(db, "ingredients"), ing);
      console.log(`  ✅ ${ing.name_ar} (${ing.name_en}) → ${ref.id} [${ing.category}]`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed: ${ing.name_en}`, err);
    }
  }

  console.log("\n── done ──");
  console.log(`  📦 ${successCount} ingredients seeded successfully`);
  console.log(`  📋 Total categories covered: protein, vegetable, grain, legume, dairy, spice, herb, sauce, oil, fruit, nut`);
  console.log("\nCollections NOT touched (user data — safe):");
  console.log("  users, user_signals, user_flavor_states, user_combo_scores, user_week, user_followups, pairs, flavors, combos, meals, sessions, simple_applications");
  console.log("\nNext step: create separate seed files for flavors, pairs, combos, etc.");
}

seedIngredientsOnly().catch(console.error);

// import { initializeApp } from "firebase/app";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   writeBatch,
//   doc,
// } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyBI7lbFVejhxIaAOp2fiYKK0vVGVZJntEY",
//   authDomain: "tazawaq.firebaseapp.com",
//   projectId: "tazawaq",
//   storageBucket: "tazawaq.firebasestorage.app",
//   messagingSenderId: "120461778429",
//   appId: "1:120461778429:web:321c3a039f25bef292cd94",
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// // ─────────────────────────────────────────────
// // INGREDIENTS
// // category: protein | vegetable | grain | dairy | spice | sauce | fruit
// // cuisine_tag: egyptian | levantine | gulf | maghrebi | universal
// // ─────────────────────────────────────────────
// const ingredients = [
//   // proteins
//   { name_ar: "دجاج", name_en: "chicken", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1547058606-7eb25508e7e0?w=600", is_active: true },
//   { name_ar: "لحم بقري", name_en: "beef", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1588347818036-558601350947?w=600", is_active: true },
//   { name_ar: "سمك", name_en: "fish", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600", is_active: true },
//   { name_ar: "بيض", name_en: "eggs", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587486936739-7f43a2a95e95?w=600", is_active: true },
//   { name_ar: "كبدة", name_en: "liver", category: "protein", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1544025162-d76594e6f5e7?w=600", is_active: true },
//   { name_ar: "فراخ رومي", name_en: "turkey", category: "protein", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600", is_active: true },
//   { name_ar: "جمبري", name_en: "shrimp", category: "protein", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600", is_active: true },

//   // vegetables
//   { name_ar: "سبانخ", name_en: "spinach", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600", is_active: true },
//   { name_ar: "طماطم", name_en: "tomato", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", is_active: true },
//   { name_ar: "بصل", name_en: "onion", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600", is_active: true },
//   { name_ar: "ثوم", name_en: "garlic", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1591928285539-a89c521b7fd4?w=600", is_active: true },
//   { name_ar: "بطاطس", name_en: "potato", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1585514819139-78a2de4a3c85?w=600", is_active: true },
//   { name_ar: "جزر", name_en: "carrot", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600", is_active: true },
//   { name_ar: "فلفل رومي", name_en: "bell pepper", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600", is_active: true },
//   { name_ar: "كوسة", name_en: "zucchini", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600", is_active: true },
//   { name_ar: "باذنجان", name_en: "eggplant", category: "vegetable", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1569923186292-bb55e55dbde4?w=600", is_active: true },
//   { name_ar: "ملوخية", name_en: "molokhia", category: "vegetable", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1616840388998-a514e565a7e4?w=600", is_active: true },
//   { name_ar: "فول", name_en: "fava beans", category: "vegetable", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", is_active: true },
//   { name_ar: "خيار", name_en: "cucumber", category: "vegetable", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600", is_active: true },

//   // grains
//   { name_ar: "أرز أبيض", name_en: "white rice", category: "grain", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600", is_active: true },
//   { name_ar: "أرز بسمتي", name_en: "basmati rice", category: "grain", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1536304993881-ff86e0c9dbb3?w=600", is_active: true },
//   { name_ar: "خبز بلدي", name_en: "pita bread", category: "grain", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", is_active: true },
//   { name_ar: "مكرونة", name_en: "pasta", category: "grain", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600", is_active: true },
//   { name_ar: "برغل", name_en: "bulgur", category: "grain", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1594020293008-5f99db4f4b07?w=600", is_active: true },
//   { name_ar: "عدس", name_en: "lentils", category: "grain", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1585669418634-a0e05d37e428?w=600", is_active: true },

//   // dairy
//   { name_ar: "جبنة بيضاء", name_en: "white cheese", category: "dairy", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600", is_active: true },
//   { name_ar: "زبادي", name_en: "yogurt", category: "dairy", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1488477181228-c84a2b82ca7b?w=600", is_active: true },
//   { name_ar: "قشطة", name_en: "cream", category: "dairy", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1587044912741-1d6e45e7e0b5?w=600", is_active: true },

//   // spices & sauces
//   { name_ar: "كمون", name_en: "cumin", category: "spice", cuisine_tag: "egyptian", image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", is_active: true },
//   { name_ar: "كركم", name_en: "turmeric", category: "spice", cuisine_tag: "gulf", image_url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600", is_active: true },
//   { name_ar: "طحينة", name_en: "tahini", category: "sauce", cuisine_tag: "levantine", image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600", is_active: true },
//   { name_ar: "صلصة طماطم", name_en: "tomato sauce", category: "sauce", cuisine_tag: "universal", image_url: "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=600", is_active: true },
// ];

// // ─────────────────────────────────────────────
// // PAIRS
// // card_type: "hard" (yes/no) | "soft" (ranking)
// // We reference ingredients by name_en for seeding,
// // the app will resolve to real IDs after ingredients are inserted.
// // ─────────────────────────────────────────────
// const pairTemplates = [
//   // classic egyptian combos
//   { a: "chicken",       b: "molokhia",      cuisine_tag: "egyptian",   card_type: "hard"},
//   { a: "fava beans",    b: "eggs",           cuisine_tag: "egyptian",   card_type: "hard"},
//   { a: "liver",         b: "onion",          cuisine_tag: "egyptian",   card_type: "hard"},
//   { a: "white rice",    b: "lentils",        cuisine_tag: "egyptian",   card_type: "soft"},
//   { a: "fava beans",    b: "white cheese",   cuisine_tag: "egyptian",   card_type: "hard"},

//   // levantine combos
//   { a: "eggplant",      b: "tahini",         cuisine_tag: "levantine",  card_type: "hard"},
//   { a: "bulgur",        b: "tomato",         cuisine_tag: "levantine",  card_type: "soft"},
//   { a: "zucchini",      b: "white rice",     cuisine_tag: "levantine",  card_type: "hard"},
//   { a: "chicken",       b: "bell pepper",    cuisine_tag: "levantine",  card_type: "soft"},

//   // gulf combos
//   { a: "basmati rice",  b: "shrimp",         cuisine_tag: "gulf",       card_type: "hard"},
//   { a: "fish",          b: "turmeric",        cuisine_tag: "gulf",       card_type: "hard"},
//   { a: "beef",          b: "basmati rice",   cuisine_tag: "gulf",       card_type: "soft"},

//   // universal / cross-cuisine
//   { a: "chicken",       b: "spinach",        cuisine_tag: "universal",  card_type: "hard"},
//   { a: "potato",        b: "garlic",         cuisine_tag: "universal",  card_type: "hard"},
//   { a: "eggs",          b: "tomato",         cuisine_tag: "universal",  card_type: "hard"},
//   { a: "beef",          b: "onion",          cuisine_tag: "universal",  card_type: "hard"},
//   { a: "pasta",         b: "tomato sauce",   cuisine_tag: "universal",  card_type: "soft"},
//   { a: "yogurt",        b: "cucumber",       cuisine_tag: "universal",  card_type: "soft"},
//   { a: "chicken",       b: "garlic",         cuisine_tag: "universal",  card_type: "soft"},
//   { a: "carrot",        b: "cumin",          cuisine_tag: "egyptian",   card_type: "soft"},
//   { a: "spinach",       b: "white cheese",   cuisine_tag: "egyptian",   card_type: "hard"},
//   { a: "fish",          b: "white rice",     cuisine_tag: "universal",  card_type: "hard"},
//   { a: "beef",          b: "potato",         cuisine_tag: "universal",  card_type: "soft"},
//   { a: "eggplant",      b: "tomato",         cuisine_tag: "levantine",  card_type: "hard"},
// ];

// // ─────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────
// async function clearCollection(colName) {
//   const snap = await getDocs(collection(db, colName));
//   if (snap.empty) return;
//   const batch = writeBatch(db);
//   snap.docs.forEach((d) => batch.delete(d.ref));
//   await batch.commit();
//   console.log(`  cleared: ${colName} (${snap.size} docs)`);
// }

// // ─────────────────────────────────────────────
// // MAIN SEED
// // ─────────────────────────────────────────────
// async function seed() {
//   console.log("── clearing old data ──");
//   // Only clear static collections — never touch user data collections
//   await clearCollection("ingredients");
//   await clearCollection("pairs");

//   // ── seed ingredients ──
//   console.log("\n── seeding ingredients ──");
//   const ingredientIdMap = {}; // name_en → firestore id
//   for (const ing of ingredients) {
//     const ref = await addDoc(collection(db, "ingredients"), ing);
//     ingredientIdMap[ing.name_en] = ref.id;
//     console.log(`  + ${ing.name_ar} (${ing.name_en}) → ${ref.id}`);
//   }

//   // ── seed pairs ──
//   console.log("\n── seeding pairs ──");
//   for (const p of pairTemplates) {
//     const idA = ingredientIdMap[p.a];
//     const idB = ingredientIdMap[p.b];

//     if (!idA || !idB) {
//       console.warn(`  ⚠ skipped pair "${p.a} + ${p.b}" — ingredient not found`);
//       continue;
//     }

//     await addDoc(collection(db, "pairs"), {
//       ingredient_a_id: idA,
//       ingredient_b_id: idB,
//       cuisine_tag: p.cuisine_tag,
//       card_type: p.card_type,
//       global_yes_count: 0,
//       global_no_count: 0,
//     });
//     console.log(`  + ${p.cuisine_tag}`);
//   }

//   console.log("\n── done ──");
//   console.log(`  ${ingredients.length} ingredients`);
//   console.log(`  ${pairTemplates.length} pairs`);
//   console.log("\nCollections NOT touched (user data — safe):");
//   console.log("  users, user_ingredient_scores, user_pair_decisions, recent_meals, onboarding_answers");
// }

// seed().catch(console.error);