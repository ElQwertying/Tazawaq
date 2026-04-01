TAZAWAQ
تزوّق
Product & Architecture README  ·  v1.0

What Problem Does Tazawaq Solve?
Every day, millions of people face the same question: "What do I eat today?" The answer is harder than it sounds. It depends on what ingredients are at hand, what cooking effort is realistic on that day, personal taste preferences, dietary restrictions, cuisine familiarity, and the desire for variety without monotony.
Existing solutions either overwhelm users with too many choices, or offer generic recommendations that ignore individual context. Tazawaq solves this with a radically simple interface: swipe cards. No forms. No questionnaires. No menus. Just gesture-driven learning that builds a taste profile silently in the background and surfaces one clear, personalized meal suggestion per day.

How It Works — The Core Loop
1. Onboarding (First Launch)
The user is presented with 10 carefully authored swipe cards. There are no questions — only visual cards that the user reacts to by swiping:
•	➡️  Right  =  Soft Yes  (I like this / this sounds good)
•	⬅️  Left   =  Soft No   (not for me / not now)
•	⬆️  Up     =  Hard No   (never / I can't eat this)

Cards come in two types:
•	Single image card — used for safety-critical items only (e.g. a pork dish, shellfish, nuts). An upswipe writes a permanent hard restriction to the user's profile.
•	Pair card — two ingredients shown side by side. The implied question is always: "does A go well with B?" The answer tells the system about flavor affinity, cuisine lean, and comfort with certain combinations.

The 10 onboarding cards are pre-authored in Firestore under the onboarding collection, ordered and designed to act as a hidden decision tree — each card tags a behavioral axis (spice tolerance, richness preference, cuisine familiarity, effort comfort) without ever presenting that framing to the user. After the 10 cards, the user is shown their first session: a full meal suggestion built from what was just learned.
2. Daily Learning (Every New Day)
Each time the app detects a new day (compared against the user's last session date), it presents 3–5 additional swipe cards before showing the meal suggestion. These cards include:
•	Adaptive ingredient pair cards — selected based on what the system still doesn't know about the user, prioritizing novel ingredients and combinations that provide the most signal.
•	Followup card — a single image of the meal suggested the previous day: "How was it?" Swipe right = good, left = not great, up = never again.
•	Flavor probe card — a single ingredient image for flavors where the user's confidence score is still low.
•	Cuisine drift card — if the system detects overexposure to one cuisine, it probes a neighboring cuisine to test openness.
3. The Meal Suggestion
At the end of each card session (onboarding or daily), the app surfaces a single meal card — the answer to "what do I eat today?" This is computed by a scoring engine that runs against all available meals and picks the best fit given the user's current state.

The Scoring Engine
The scoring engine runs in 6 sequential steps, each modifying a score that starts at 0:
Step 1 — Hard Elimination
Any meal is immediately removed from consideration if: it appears in the user's never_meal_ids, any of its required ingredients appear in never_ingredient_ids, or it has already been shown to the user this week (shown_meal_ids in user_week).
Step 2 — Base Score from Combo
Every meal links to a combo (a cooking method + protein + base combination). The user's accumulated score for that combo (stored in user_combo_scores) forms the base score. This means meals built on combos the user has historically responded well to start with a head start.
Step 3 — Flavor Modifier
Each meal carries a list of flavor IDs. The engine looks up each flavor in user_flavor_states and applies a modifier: a loved flavor adds points proportional to its strength score, a reduce flavor subtracts, and a never flavor eliminates the meal entirely.
Step 4 — Rotation Pressure
To prevent cuisine monotony, the engine penalises meals whose cuisine tag has been over-represented this week. For each time that cuisine appears in cuisine_counts, the score drops by 15 points. This naturally rotates variety without ever asking the user "do you want something different today?"
Step 5 — Effort Fit
On weekdays, meals with effort_minutes above a threshold are penalised. The threshold is learned from user behavior during onboarding (slow vs quick swipe reactions to effort-heavy meal images) and refined daily.
Step 6 — Outlier Slot
One in every five suggestions is intentionally outside the user's established cuisine_cluster. This prevents the system from becoming an echo chamber and occasionally surfaces new cuisines the user may enjoy. If the user swipes right, the system expands their cluster.

How the Data Is Decomposed
The central design principle is that a meal is never stored as a monolithic object. Instead it is broken into atomic pieces — each piece answering one narrow question — and then the scoring engine reassembles those pieces at runtime for each specific user. This decomposition is what makes personalization possible without storing a separate meal list per user.
The Decomposition Chain
A meal is the intersection of five independent layers:
•	Ingredient — the raw item (chicken, cumin, lemon). Carries no opinion about cooking.
•	Flavor — a flavor profile attached to an ingredient, including its role (traditional, optional, removable) and how many meals it covers.
•	Combo — a specific combination of protein + cooking method + base(s) + flavor set. This is the cooking blueprint.
•	Meal — one concrete output of a combo: one protein, one base, optional sides and sauce. The scoreable unit.
•	Session — a cooking event that produces multiple meals from one combo in one effort. The practical unit for weekly planning.
This chain means that a user's positive signal on chicken + cumin (from a pair card) can propagate upward: it boosts the score of every combo that uses cumin as a flavor, which boosts every meal derived from those combos — without any additional input from the user.
Simple Applications
Simple applications are a separate layer below combos. They represent minimal-effort uses of a flavor or ingredient (e.g. cumin sprinkled on a boiled egg). They are triggered when a flavor's strength score crosses a threshold, and are surfaced as quick-win suggestions alongside main meals.

Data Structures
ingredients
Field	Type	Purpose
id	string	Auto-generated Firestore ID
name_ar / name_en	string	Bilingual display name
category	enum	protein | vegetable | grain | legume | dairy | spice | herb | sauce | oil | fruit | nut
cuisine_tag	enum	universal | egyptian | levantine | gulf | maghrebi
image_url	string	Stable image for card rendering
is_active	boolean	Controls visibility in card selection

flavors
Field	Type	Purpose
ingredient_id	ref	Links to the ingredient this flavor belongs to
role_default	enum	traditional | optional | accent
removable	boolean	Can the user remove this flavor and still have the dish?
meal_coverage_pct	number	What fraction of meals use this flavor — used for prioritizing probes
simple_application_ids	array	Quick-win uses triggered at high flavor strength

combos
Field	Type	Purpose
protein_id	ref	The primary protein ingredient
method	string	Cooking method (boil_then_fry, grill, slow_cook, etc.)
base_ids	array	Possible carb/base pairings (rice, pasta, bread)
flavor_ids	array	Flavor profile for this combo
cuisine_tag	enum	Cuisine classification
valid	boolean	Whether this combo is currently surfaceable

meals
Field	Type	Purpose
combo_id	ref	The combo this meal is derived from
base_id	ref	The specific base chosen from the combo's base_ids
required_ingredient_ids	array	Hard blockers — if user has never'd any of these, meal is eliminated
optional_ingredient_ids	array	Nice-to-haves that don't block the meal
effort_minutes	number	Used in Step 5 of scoring (effort fit)
meal_type	enum	breakfast | lunch | dinner | snack

user_signals
Field	Type	Purpose
target_type	enum	ingredient | flavor | combo | meal | session | simple_application
target_id	ref	ID of the item the signal is about
gesture	enum	yes | later | never
value	number	+10 (yes) | +5 (later) | -9999 (never)
expires_at	timestamp | null	Signals can decay over time for perishable preferences

user_flavor_states
Field	Type	Purpose
flavor_id	ref	The flavor being tracked
state	enum	loves | neutral | reduce | never
strength	number	0.0–1.0, confidence in this state
last_reinforced_at	timestamp	Each reinforcing signal updates this — used for decay
expires_at	timestamp | null	Allows temporary flavor avoidance (e.g. during illness)

user_combo_scores
Field	Type	Purpose
combo_id	ref	The combo being scored
score	number	Cumulative score from all signals touching this combo
signal_count	number	Number of signals — used to weight confidence
expires_at	timestamp	Combo scores reset periodically to allow drift in taste

user_week
Field	Type	Purpose
week_start	string	ISO date of the week's start (Saturday for Egyptian calendar)
shown_meal_ids	array	Prevents showing the same meal twice in one week
picked_meal_ids	array	What the user actually chose — stronger signal than just shown
cuisine_counts	map	cuisine_tag → count, drives Step 4 rotation pressure
resets_at	timestamp	Auto-reset at week boundary

user_followups
Field	Type	Purpose
meal_id	ref	The meal that was suggested
suggested_on	string	Date of suggestion
followup_shown	boolean	Whether the followup card has been presented yet
followup_response	enum | null	liked | ignored | null (pending)
expires_at	timestamp	Followup cards expire if the user doesn't open the app

onboarding
Field	Type	Purpose
order	number	1–10, determines card sequence
card_type	enum	single | pair
ingredient_id	ref	Single cards only — the ingredient shown
ingredient_a_id / _b_id	ref	Pair cards only — the two ingredients
image_url / image_url_a / _b	string	Image(s) for card rendering
label_ar / label_en	string	Display label for the card
is_active	boolean	Allows disabling a card without deletion

Signal Flow — From Swipe to Suggestion
The following describes the complete lifecycle of a single user gesture:
•	User swipes right on a pair card showing chicken + cumin.
•	A user_signal is written: target_type=ingredient, target_id=ing_chicken, gesture=yes, value=+10.
•	A second user_signal: target_id=flv_cumin, target_type=flavor, gesture=yes, value=+10.
•	user_flavor_states for flv_cumin is upserted: state→loves, strength increases toward 1.0.
•	All combos containing flv_cumin in their flavor_ids have their user_combo_scores incremented.
•	At next suggestion time, meals derived from those combos carry higher base scores (Step 2).
•	The cumin flavor modifier (Step 3) adds further points to those meals.
•	The top-scoring non-eliminated meal is presented as the day's suggestion.

Adaptive Pair Selection
This is not a versus comparison (A or B?). Every pair card asks: does A go well with B? The user is building a mental map of flavor compatibility, and the system is reading that map to infer preferences.
Pair selection is adaptive, not random. The system prioritizes:
•	Novelty — pairs containing ingredients or flavors with low signal_count get priority.
•	Divergence — pairs where the two items have very different combo_score values produce more signal than pairs of similar-scoring items.
•	Cuisine coverage — early sessions ensure at least one pair per major cuisine_tag to avoid gaps in the taste map.
•	Non-repetition — a seen_pairs set prevents the same pair appearing twice, with a size cap and periodic reset to handle long sessions gracefully.

Architecture Notes
Firestore Collection Strategy
User data is fully isolated per user_id — no cross-user reads are ever needed. System data (ingredients, flavors, combos, meals, sessions, onboarding) is read-only from the client and shared across all users. This split means system collections can be heavily cached client-side, and all writes go to user-scoped collections only.
No Questions, Ever
The app never surfaces a text question, dropdown, or form. Every piece of information about the user is derived from swipe gestures on visual cards. This is a deliberate product constraint: the cognitive load of swiping an image is near-zero, while answering a question about dietary preferences is high. The system compensates for the lower precision of gesture signals by collecting more of them over time and using the scoring engine to cross-validate.
Bilingual First
All ingredient and card data is stored with both Arabic (name_ar) and English (name_en) fields. The app reads the user's language preference from their profile and renders accordingly. No translation layer is needed at runtime.
Week-Based Memory
The user_week document resets every week. This means the system has both a long-term memory (user_signals, user_flavor_states, user_combo_scores — which persist and decay slowly) and a short-term memory (user_week — which resets for fresh variety). The combination prevents both monotony (short-term) and forgetting hard-won preferences (long-term).

Tazawaq — Built to answer one simple question, every day.
