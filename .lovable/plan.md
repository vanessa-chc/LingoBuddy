

# Fix Auto-Navigation and Analyze Page Layout

## Issue 1: Auto-Navigate After Upload

### Changes to `src/pages/Index.tsx`
- Modify `handleFileChange` to navigate to `/analyze` immediately after converting the file to base64, instead of setting local state
- Modify `handlePaste` to navigate to `/analyze` immediately after reading the clipboard image
- Remove the image preview state and UI (the preview will now live only on `/analyze`)
- Remove the "Analyze" button entirely
- Remove the X-button removal logic (no longer needed on home page)
- Keep the upload zone, action sheet, clipboard link, and file input as-is

### Changes to `src/components/UploadActionSheet.tsx`
- No changes needed

## Issue 2: Analyze Page Layout Fixes

### Changes to `src/pages/Analyze.tsx`

**Screenshot preview:**
- Max-height 400px, centered, border-radius 12px
- Add shadow: `0px 4px 20px rgba(0,0,0,0.3)`
- Add X button (top-right): 32x32px circle with white 15% background
- When X is tapped, navigate back to `/` (since we no longer store state on home page)

**"Chatting with..." label:**
- Change "Who sent this?" to "Chatting with..."
- margin-top 24px from screenshot
- Font size 17px, white at 70% opacity, left-aligned

**Context pills:**
- Wrap in a horizontal overflow-x-auto scroll container
- Gap 12px between pills
- Each pill: padding 12px 24px, border-radius 24px, font 17px semibold
- Unselected: transparent background, 1px solid border at `rgba(255,255,255,0.15)`
- Selected: 2px solid `#E4FB4E` border, `#E4FB4E` background, `#1A2E05` text
- Remove `flex-1` so pills size to content

**Analyze button:**
- Fixed position at bottom, 24px from bottom edge
- Full width with 20px padding on each side (total 40px)
- Height 56px, border-radius 20px
- Background `#E4FB4E`, text `#1A2E05` at 17px semibold
- Add bottom padding to main content so it doesn't hide behind the fixed button
