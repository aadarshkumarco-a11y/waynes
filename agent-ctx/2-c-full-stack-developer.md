# Task 2-c — Course Player (LearnView)

Agent: full-stack-developer
Date: 2025

## Files Created

1. **`src/components/lms/video-player.tsx`** — Custom HTML5 video player
2. **`src/components/lms/curriculum-sidebar.tsx`** — Course curriculum sidebar
3. **`src/components/lms/notes-panel.tsx`** — Lesson notes panel
4. **`src/components/lms/learn-view.tsx`** — Main learning orchestrator view

## Architecture Decisions

### Video Player (`VideoPlayer`)
- Native `<video>` element with custom controls overlay
- Idle auto-hide (2.8s timeout) — reappears on mousemove
- Glass-style control bar with progress (buffered + played), volume slider (expand on hover), playback speed dropdown (0.5×–2×)
- Keyboard shortcuts: Space/K (play), ←/→ (seek 5s), ↑/↓ (volume), M (mute), F (fullscreen) — modal overlay listing them all, triggered by `?` button
- Center play button when paused (Framer Motion fade/scale)
- Loading spinner while `waiting`
- Throttled `onProgress` (~ every 4s) for `setLastViewed` autosave
- Locked/poster state when no src
- State-reset on src change via during-render adjustment pattern (lint-friendly: no setState-in-effect, no ref writes during render)

### Curriculum Sidebar (`CurriculumSidebar` + `CurriculumSidebarCollapsible`)
- Header: course title, progress bar, "X of Y lessons completed"
- Accordion (multi-open, all open by default) of sections
- Each section header: section index pill, title, lesson count + duration + "Done" badge when complete
- Lessons: completion check icon, type icon (PlayCircle/FileText/Download/FileType), title, preview badge, duration
- Auto-scroll current lesson into view
- Mobile collapsible variant uses AnimatePresence slide-in drawer

### Notes Panel (`NotesPanel`)
- Composer with capture-timestamp button (shows current time as Badge, removable)
- ⌘+Enter to save
- Notes list sorted by createdAt DESC, each with timestamp Badge (click to recapture), relative time, "edited" tag, edit + delete on hover
- Inline edit mode
- Empty state

### Learn View (`LearnView`)
- Sticky top bar: mobile hamburger (curriculum Sheet), back-to-course, breadcrumb (course → lesson), bookmark toggle, mark complete
- 2-column grid on lg: main (player + tabs + prev/next) + sticky curriculum sidebar
- Lesson type handling: VIDEO (VideoPlayer), PDF (PdfResourceCard), DOWNLOAD (DownloadResourceCard), TEXT (TextLessonCard with prose)
- Locked overlay if !enrolled && !preview with Enroll + Sign in CTAs
- Tabs: Overview / Notes / Resources / Bookmarks (with counts)
  - Overview: about-this-lesson card + instructor card
  - Notes: NotesPanel (requires auth, shows EmptyAuthCard otherwise)
  - Resources: list of all PDF/DOWNLOAD lessons with quick-download
  - Bookmarks: list of course bookmarks with timestamp + click-to-jump
- Prev/Next nav: bottom card grid; next shows "Mark complete & next" if !done
- Lesson-change handling via during-render adjustment (resets tab/video time, calls `setLastViewed`)

## Lint Status

`bun run lint` passes clean (0 errors, 0 warnings) for these four files. (Other agents' files have unrelated errors that are out of scope.)

## Store APIs Used

- `courseSlug`, `lessonId`, `user`, `bookmarks`
- `openCourse`, `openLesson`, `setLastViewed`, `markLessonComplete`, `toggleBookmark`, `setAuthOpen`, `openCheckout`
- `notes`, `addNote`, `updateNote`, `deleteNote`
- `isEnrolled`, `getEnrollment` (via `useLms.getState()` inside memo)
- `useCompletedLessons` hook for completed lesson ids

## Catalog APIs Used

- `courseBySlug` (lookup by slug)
- `instructorMap` (instructor info)
- Lesson type icons from `lucide-react`
