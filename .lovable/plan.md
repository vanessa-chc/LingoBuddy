# Consistent Image Preview Across Pages

## Problem

The screenshot preview appears at different sizes and positions on `/analyze`, the scanning overlay, and `/results`, causing visual "jumping" during page transitions.

## Current State


| Page             | Image Top Offset                 | Image Width         | Max Height    |
| ---------------- | -------------------------------- | ------------------- | ------------- |
| `/analyze`       | ~108px (header + 60px margin)    | 100% - 40px padding | 400px         |
| Scanning overlay | ~156px (80px + title + 40px)     | calc(100% - 80px)   | 400px         |
| `/results`       | Vertically centered (background) | 100% - 48px padding | Unconstrained |


## Solution

Create a shared `ScreenshotPreview` component with fixed, consistent styling used by all three views. Anchor the image to the same position and size everywhere.

### Shared Constants (matching the `/analyze` page style)

- **Top offset**: Fixed at a consistent value from the top of the 430px container
- **Width**: calc(100% - 40px), centered
- **Max height**: 450px
- **Border radius**: 12px
- **Box shadow**: 0px 4px 20px rgba(0,0,0,0.3)
- **Object-fit**: contain

### Changes by File

**1. New: `src/components/ScreenshotPreview.tsx**`

- Shared component accepting `src`, `alt`, optional `overlay` (for scan line), optional `children` (for X button)
- Applies consistent width, max-height, border-radius, shadow, and object-fit
- Wraps image in a relatively-positioned container for overlays

**2. `src/pages/Analyze.tsx` (normal view)**

- Replace the inline image + wrapper with `ScreenshotPreview`
- Keep the X (remove) button as a child overlay
- Adjust the top margin so the image lands at the shared position (accounting for header height)
- Screenshot should appear at ~108px from viewport top (after header)

**3. `src/pages/Analyze.tsx` (scanning overlay)**

- **Title "Scanning the vibe..." positioning:**
  - Margin-top: 80px from viewport top 
  - Font-size: 28px 
  - Font-weight: bold (700) 
  - Color: #FFFFFF 
  - Text-align: center 
- Then 40px gap before the ScreenshotPreview
- Replace inline image with `ScreenshotPreview`
- Pass the scan line animation as an overlay prop
- Chatting with [Context]" text below the image: 
  - Margin-top: 24px 
  - Font-size: 17px 
  - Color: rgba(255,255,255,0.7) 
  - Highlight context name in #ECFF51 
- Cancel button at bottom (margin-bottom: 40px)

**4. `src/pages/Results.tsx**`

- `ScreenshotPreview`as background layer (fixed position, top of page) 
- Apply opacity: 0.5 to the entire ScreenshotPreview wrapper 
- Bottom sheet overlays on top (z-index: 10) 
- User can still see dimmed screenshot when sheet is expanded
- Replace the background centered image with `<ScreenshotPreview>` at the same fixed position (top of page, same width/height) 
- **Background layer setup:** 
  - Position: fixed or absolute at top of page 
  - Apply `opacity: 0.5` to the entire ScreenshotPreview wrapper (dimmed background)
  - Screenshot uses same positioning as `/analyze` page 
- **Bottom sheet overlays on top:** 
  - z-index: 10 (above the dimmed screenshot) 
  - User can see background screenshot at all times when sheet is open 
- The bottom sheet will overlay on top as before

&nbsp;

### Technical Details

The `ScreenshotPreview` component:

```typescript
// Consistent image styling across all pages
interface ScreenshotPreviewProps {
  src: string;
  alt?: string;
  className?: string;       // extra wrapper classes
  overlay?: React.ReactNode; // scan line, etc.
  children?: React.ReactNode; // X button, etc.
  style?: React.CSSProperties; // for opacity on results page
}
```

Key style constants extracted:

- `maxHeight: 450px`
- `width: 100%` within a container that has 20px horizontal padding
- `objectFit: "contain"`
- `borderRadius: 12px`
- `boxShadow: "0px 4px 20px rgba(0,0,0,0.3)"`

The top margin on each page will be calculated so the image's top edge lands at the same absolute screen position: 

- `/analyze` page: ~108px from viewport top (after header) 
- Scanning overlay: Title at 80px, then 40px gap, then image 
- `/results` page: Same position as `/analyze`, but dimmed (50% opacity)

No functionality changes -- only visual consistency.