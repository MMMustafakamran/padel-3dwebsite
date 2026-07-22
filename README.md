# Padel Scroll Film Website

Build a premium, cinematic padel website inspired by the EMBER coffee scroll site in the sibling project. The padel site should feel like the same design family, but it must have its own sport-specific visual language and copy.

## Source asset

The supplied source video is:

`Racket_floats_strikes_ball_202607220414.mp4`

Keep all paths relative to this folder so the project can be moved to another location without changes.

## Core experience

Create a single-page site where vertical scrolling scrubs through an image sequence extracted from the source video.

Use this structure:

1. A full-screen sticky cinematic stage.
2. A fixed transparent header over the stage.
3. Scroll-driven video frames rendered into a canvas.
4. Editorial captions that fade and drift in sync with the frame progress.
5. A final visual transition into the site content instead of an abrupt end to the film.
6. Supporting sections below the film for the brand, court, racket, coaching, events, and CTA.

The page should remain scrollable. The film is the opening chapter, not a video player with visible controls.

## Scroll-film implementation

Extract optimized WebP frames from the video into:

`frames/frame_0001.webp`, `frames/frame_0002.webp`, etc.

Create a manifest at `frames/frames.json` with this shape:

```json
{
  "count": 144,
  "pattern": "frames/frame_%04d.webp"
}
```

Use a canvas image-sequence scrubber similar to the coffee project:

- Load the first 10–15% of frames eagerly so the first viewport appears quickly.
- Fetch the remaining frames in the background with limited concurrency.
- Decode only a sliding window around the current playhead.
- Evict decoded frames that are far behind the current frame.
- Draw frames with `cover` fitting so there are no empty edges.
- Smooth the playhead with a time-based lerp so fast scrolls feel cinematic.
- Use non-linear scroll stops to spend more time on the most important moment: the racket striking or returning the ball.
- Support `prefers-reduced-motion` with a static hero image and visible content.

Suggested scroll mapping:

```js
const SCROLL_STOPS = [
  [0.00, 0.00],
  [0.12, 0.16],
  [0.30, 0.34],
  [0.52, 0.62],
  [0.72, 0.80],
  [0.88, 0.94],
  [1.00, 1.00]
];
```

Adjust these after inspecting the extracted frames. The strike, ball impact, or strongest racket movement should receive the longest scroll interval.

## Final transition

Do not let the site feel like the frames simply stop and the visitor keeps scrolling through empty space.

Use a padel-related transition for the final 10–15% of the film. Recommended direction:

- The ball grows toward the camera or the racket strings fill the viewport.
- A circular or elliptical aperture expands from the ball impact point.
- Subtle court-line rings or string-bed lines ripple outward.
- The aperture becomes the dark background of the first content section.
- Reveal a short bridge message such as “The point continues.” or “Play the next point.”
- Make the first section below the film share the same background color so the handoff feels continuous.

The transition must be driven by scroll progress, not by a timer.

## Visual direction

Carry over the coffee site’s design principles:

- Transparent fixed header over the film.
- Wide letter spacing for navigation and eyebrow labels.
- Large restrained typography with one editorial serif accent.
- Strong contrast and generous but controlled spacing.
- Minimal borders and small uppercase labels.
- Subtle grain, vignette, and image treatment.
- No gradients that feel like generic sports-app UI.
- No carousels, autoplay controls, or dense dashboard layouts.

Use a padel palette rather than coffee browns. Recommended starting tokens:

```css
:root {
  --ink: #101a18;
  --court: #16483f;
  --court-deep: #0d2e2a;
  --lime: #d7f04b;
  --sand: #e9e2d3;
  --cream: #f4f0e6;
  --muted: rgba(244, 240, 230, .62);
  --line: rgba(244, 240, 230, .2);
}
```

The lime should be an accent only: CTA details, page numbers, ball-impact markers, and small highlights. Keep the interface mostly dark green, cream, and sand.

## Header

Keep the header transparent at all scroll positions. Do not add a white or colored panel after the film ends.

Suggested content:

- Wordmark: `RALLY / PADEL CLUB` or a replaceable brand name.
- Links: `Court`, `Play`, `Coaching`, `Journal`.
- CTA: `Book a court`.

The mobile header should keep the wordmark and CTA visible while hiding the full link row.

## Suggested film captions

Use short captions tied to moments in the sequence:

- `01 · Ready` — “Find your position.”
- `02 · Read` — “Watch the angle.”
- `03 · Strike` — “Meet the ball clean.”
- `04 · Move` — “One step earlier.”
- `05 · Rally` — “Keep the point alive.”

Captions should fade in/out based on normalized scroll progress and use a small vertical drift. Keep captions out of the ball’s focal area.

## Content sections below the film

Build these sections with the same editorial rhythm as the coffee site:

1. **Manifesto** — “The best points are built before the ball crosses the net.”
2. **The court** — court geometry, glass, light, and positioning.
3. **The racket** — material detail and control.
4. **The session** — coaching, open play, and community.
5. **Gallery** — large image-led grid using extracted stills or supporting crops.
6. **CTA** — book a court, join a session, or discover the club.

Avoid making every section full viewport height. Use compact editorial sections with intentional image crops and responsive spacing.

## Responsive requirements

- Desktop: two-column feature sections with square or slightly landscape crops.
- Mobile: single-column sections with 4:3 image crops.
- Keep the film readable at 390px wide.
- Prevent horizontal overflow.
- Keep CTA buttons large enough to tap.
- Disable or simplify the canvas film for reduced-motion users.

## Local run

Serve this folder over HTTP; do not open `index.html` directly:

```powershell
python -m http.server 4189
```

Then open `http://127.0.0.1:4189/`.

## Acceptance checklist

- The source video is converted into a usable frame manifest.
- Scrolling changes the frame sequence smoothly.
- The strike/impact moment receives intentional pacing.
- The header remains transparent from hero through content.
- The final frames transition into the first content section creatively.
- No dead scroll space appears after the film.
- The layout works at desktop and 390px mobile widths.
- No horizontal overflow or console errors.
