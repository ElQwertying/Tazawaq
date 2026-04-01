# TAZAWAQ | تذوّق
### Product & Architecture Documentation · v0.01

![Platform](https://img.shields.io/badge/Platform-Mobile-blue)
![Database](https://img.shields.io/badge/Database-Firestore-orange)
![Version](https://img.shields.io/badge/Version-0.01-yellow)

**Tazawaq** (Arabic for "to taste/sample") is a gesture-driven meal recommendation engine that solves the daily "What do I eat today?" dilemma through silent, adaptive learning.

---

## 🍽️ The Problem
Every day, millions face decision fatigue. Existing solutions either overwhelm users with recipes or offer generic suggestions that ignore personal context. 

**Tazawaq** replaces forms and menus with a radically simple interface: **Swipe cards.** No questionnaires. Just gesture-driven learning that surfaces one clear, personalized meal suggestion per day.

---

## 🔄 The Core Loop

### 1. Onboarding (First Launch)
The user reacts to 10 visual cards using three primary gestures:
* ➡️ **Right**: Soft Yes (I like this / sounds good)
* ⬅️ **Left**: Soft No (Not for me / not now)
* ⬆️ **Up**: Hard No (Never / I can't eat this)

> **Card Types:**
> * **Single Image:** For safety-critical items (e.g., pork, nuts). Upswiping writes a permanent restriction.
> * **Pair Card:** Two ingredients shown side-by-side. The system asks: *"Does A go well with B?"* to learn flavor affinity and cuisine lean.

### 2. Daily Learning
Each new day, the app presents 3–5 additional cards before the daily suggestion:
* **Adaptive Pairs:** Fills gaps in the user's taste profile.
* **Follow-up:** "How was yesterday's meal?" (Feedback loop).
* **Flavor Probes:** Targets ingredients with low confidence scores.
* **Cuisine Drift:** Probes neighboring cuisines to prevent boredom.

### 3. The Suggestion
The app surfaces a single meal card—the optimized answer to "What do I eat today?"

---

## ⚙️ The Scoring Engine
The engine runs 6 sequential steps to find the perfect fit:

| Step | Action | Logic |
| :--- | :--- | :--- |
| **1** | **Hard Elimination** | Removes `never_meal_ids`, `never_ingredient_ids`, and this week's history. |
| **2** | **Base Score** | Starts with the user’s historical score for a specific Protein/Method/Base combo. |
| **3** | **Flavor Modifier** | Adjusts points based on `loves`, `reduce`, or `neutral` flavor states. |
| **4** | **Rotation Pressure** | Penalizes over-represented cuisines (-15 pts per occurrence) to ensure variety. |
| **5** | **Effort Fit** | Penalizes high-effort meals on weekdays based on learned user speed. |
| **6** | **Outlier Slot** | 1 in 5 suggestions is a "Wildcard" to test openness to new cuisines. |

---

## 🏗️ Data Architecture

### The Decomposition Chain
A meal is never stored as a monolith. It is reassembled at runtime:
1.  **Ingredient**: Raw items (Chicken, Cumin).
2.  **Flavor**: A profile attached to an ingredient with a specific role.
3.  **Combo**: The "blueprint" (Protein + Method + Base + Flavor set).
4.  **Meal**: The concrete output (e.g., Grilled Chicken with Rice).
5.  **Session**: The practical unit (cooking event).

### Schema Overview

#### `ingredients`
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `name_ar / en` | string | Bilingual display names. |
| `category` | enum | Protein, Vegetable, Grain, Spice, etc. |
| `cuisine_tag` | enum | Egyptian, Levantine, Maghrebi, Universal. |

#### `user_flavor_states`
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `state` | enum | Loves \| Neutral \| Reduce \| Never. |
| `strength` | number | 0.0–1.0 confidence score. |
| `last_reinforced`| timestamp | Used for preference decay over time. |

---

## 📡 Signal Flow
*How a swipe becomes a suggestion:*
1.  **Swipe**: User swipes right on **Chicken + Cumin**.
2.  **Signal**: Two `user_signals` are written (Value +10).
3.  **State**: `user_flavor_states` for Cumin moves toward "Loves."
4.  **Propagation**: Every **Combo** containing Cumin receives a score boost.
5.  **Suggestion**: At the next session, Cumin-based meals naturally rise to the top of the scoring engine.

---

## 🛠️ Architecture Notes

* **Zero-Question UI**: Cognitive load is minimized. Preferences are inferred, not requested.
* **Data Isolation**: User data is fully isolated in Firestore; system data is shared and cached.
* **Bilingual First**: Native support for Arabic and English in all schema fields.
* **Hybrid Memory**: 
    * *Long-term*: Signals and Flavor States (persist/decay).
    * *Short-term*: `user_week` (resets for fresh variety).

---
*Built to answer one simple question, every day.*