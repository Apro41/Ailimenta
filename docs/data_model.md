# AIlimenta Initial Data Model (MVP)

## 1. User
- `id`: UUID
- `email`: string
- `password_hash`: string
- `name`: string
- `profile_picture_url`: string (optional)
- `dietary_preferences`: array (e.g., vegetarian, vegan, keto)
- `allergies`: array (e.g., nuts, gluten)
- `budget`: decimal or enum (e.g., low/medium/high)
- `cuisine_preferences`: array (e.g., Italian, Asian)
- `sustainability_preferences`: array (e.g., local, organic)
- `shopping_history`: array of shopping sessions
- `liked_clips`: array of video clip IDs

## 2. Recipe
- `id`: UUID
- `title`: string
- `description`: string
- `ingredients`: array of ingredient objects
- `instructions`: array of steps
- `nutrition_facts`: object (calories, macros, etc.)
- `sustainability_score`: float
- `source`: string (internal, influencer, external API)
- `video_clip_id`: string (if from influencer clip)

## 3. Ingredient
- `id`: UUID
- `name`: string
- `quantity`: string (e.g., '2 cups')
- `unit`: string
- `possible_substitutes`: array of ingredient IDs
- `sustainability_score`: float

## 4. Grocery Inventory Item
- `id`: UUID
- `store_id`: string
- `ingredient_id`: string
- `price`: decimal
- `availability`: boolean
- `sustainability_score`: float
- `last_updated`: datetime

## 5. Shopping Cart
- `id`: UUID
- `user_id`: string
- `items`: array of inventory item IDs
- `total_price`: decimal
- `created_at`: datetime

## 6. Video Clip
- `id`: string
- `title`: string
- `url`: string
- `thumbnail_url`: string
- `influencer`: string
- `recipe_id`: string (if mapped)
- `likes`: integer
- `metadata`: object (tags, cuisine, etc.)

---

# Next: API Integration Requirements
