

# Add Relationship Context Selector to Analyze Page

## What Changes
Update the `/analyze` page to include a relationship context selector between the image preview and the Analyze button. The home page (`Index.tsx`) stays untouched.

## Analyze Page Layout (top to bottom)

1. **Header** -- back arrow + title "Add Context" (rename from "Analyzing...")
2. **Image preview** -- centered, max-height 400px, rounded (already exists)
3. **Context selector** -- label "Who sent this?" + 4 pill-style toggle buttons in a horizontal row:
   - Friend, Work, Dating, Formal
   - Selected state: filled with `bg-cta` (yellow-green) + dark text
   - Unselected state: `bg-secondary` border with white text
4. **Analyze button** -- full-width CTA button, disabled until a context pill is selected

## Technical Details

**File: `src/pages/Analyze.tsx`**
- Add `useState` for `selectedContext` (type: `"friend" | "work" | "dating" | "formal" | null`)
- Render 4 pill buttons using `map` over a contexts array
- Style selected pill with `bg-cta text-cta-foreground`, unselected with `bg-secondary text-foreground`
- Analyze button disabled when `!selectedContext`
- No navigation on Analyze tap yet (placeholder/toast) since results page doesn't exist

No other files are modified. The upload flow on the home page remains completely unchanged.
