# Implementation instructions

You are building a cinematic padel brand website in this folder.

Follow `README.md` as the product brief. Treat the supplied MP4 as the source for the opening scroll film. Keep all generated assets and code inside this folder and use relative paths only.

## Non-negotiable behavior

- The hero is a sticky canvas controlled by page scroll.
- The header is fixed and transparent at every scroll position.
- Use editorial typography, not sports-dashboard styling.
- Make the ball strike or racket impact the visual focal point.
- End the film with a scroll-driven padel transition into the first content section.
- Do not leave a blank or visually disconnected scroll region after the final frame.
- Add a reduced-motion fallback.
- Test desktop and 390px mobile widths before considering the work complete.

## Engineering guidance

- Prefer vanilla HTML, CSS, and JavaScript unless the folder already contains a framework.
- Keep frame loading memory-safe with a decode window and background fetching.
- Add `aria-label`s, alt text, a skip link, and keyboard-visible focus states.
- Use `loading="lazy"` for supporting images below the fold.
- Avoid external dependencies and remote assets unless explicitly required.
- Do not alter or delete the source video.

## Visual QA

Check these moments manually:

1. Opening hero before any scroll.
2. The strike/impact moment.
3. The beginning of the final transition.
4. The completed transition screen.
5. The first content section after the film.
6. Mobile at approximately 390 × 844.

The final handoff should feel like one continuous movement from court action into the padel story.
