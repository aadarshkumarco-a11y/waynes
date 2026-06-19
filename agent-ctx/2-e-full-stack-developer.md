# Task 2-e: Checkout + My Learning + Blog + Certificate Views

Agent: full-stack-developer
Task: Build Checkout + My Learning + Blog (list+post) + Certificate verification views under `src/components/lms/`.

## Files created (all `"use client"`)
- `src/components/lms/checkout-view.tsx` — `CheckoutView` (named + default)
- `src/components/lms/my-learning-view.tsx` — `MyLearningView` (named + default)
- `src/components/lms/blog-view.tsx` — `BlogView` (named + default)
- `src/components/lms/blog-post-view.tsx` — `BlogPostView` (named + default)
- `src/components/lms/certificate-view.tsx` — `CertificateView` (named + default)

## Architecture notes

### Store integration
- Read `checkoutCourseId`, `user`, `appliedCouponCode`, `blogSlug`, `certificateId`, `enrollments`, `orders`, `certificates` from `useLms`.
- Called: `navigate`, `openCourse`, `openLesson`, `openBlog`, `openCertificate`, `setAuthOpen`, `applyCoupon`, `removeCoupon`, `validateCoupon`, `checkout`, `isEnrolled`, `getEnrollment`.
- Catalog lookup via `courseMap[checkoutCourseId]` and `blogBySlug[blogSlug]`.

### CheckoutView
- Thin wrapper component looks up the course from `courseMap[checkoutCourseId]`. If none, renders `<EmptyCheckoutState />` (Browse-courses CTA).
- Renders `<CheckoutForm key={course.id} course={course} />` — keyed remount guarantees local form state (txnRef, couponInput, success state, etc.) resets cleanly when switching courses. This avoids the React 19 `react-hooks/set-state-in-effect` lint error.
- Already-enrolled branch: full-width gradient hero ("You're already enrolled!"), "Continue learning"/"Review course" via `openLesson`, "View course details", "Browse other courses" links.
- Two-column layout: left = coupon + payment form, right = sticky order-summary card (course thumbnail/title/instructor + price breakdown + 3 trust badges).
- Coupon section: input + Apply; success → green pill with "You saved ₹X" + Remove; error → red text. Hint button: "Try WELCOME50 for 50% off" auto-fills and applies.
- Payment form: radio group for UPI/Bank/Card (info-only), UPI ID `learniverse@upi` with copy button, required UTR/Transaction Reference input with inline validation, "Place Order · ₹X" button. Sign-in prompt alert shown if `!user`.
- Success screen: Framer Motion spring-in card on `gradient-brand` background, badge "Status: Pending verification", order details (amount/method/txnRef/submitted-at), 3-step "What happens next" timeline, "View My Learning" + "Back to Course" buttons.

### MyLearningView
- Not-logged-in: centered hero card with sign-in CTA + browse-catalog fallback.
- Empty state: dashed-border card with "Explore the catalog" CTA, then orders list (if any) below.
- Header: 4 stat cards (Enrolled / In progress / Completed / Certificates) computed from `enrollments` filtered by `user.id` + `certificates` filtered by `userId`.
- Filters: Tabs (All / In Progress / Completed with counts) + search input.
- Grid of custom `LearningCard` components (thumbnail, completed/in-progress badge, title, instructor avatar, progress bar with %, "Continue"/"Review" button, "Certificate" button if completed+cert). Framer Motion staggered entrance + hover lift.
- Orders mini-section: full list of `orders` filtered by `userEmail === user.email`, sorted by createdAt desc, each row shows thumbnail + title + order number + date + amount saved + color-coded status badge (PENDING=amber, APPROVED=primary, REJECTED=destructive, REFUNDED=muted).

### BlogView
- Header with badge + "Insights for builders & learners" gradient headline.
- Featured post (first blog post) as a large 2-column card with cover image, "★ Featured" badge, category, title, excerpt, author avatar+name, date, reading time, view count, "Read article" CTA. Only shown when no filter/search active.
- Category filter pills (All + unique categories) + search input.
- Grid of `BlogCard` (cover, category badge, title, excerpt, author avatar+name, reading time). Click → `openBlog(slug)`.
- Newsletter CTA at bottom: gradient-brand card with email input posting to `/api/subscribers`. Graceful fallback toast if API unreachable.

### BlogPostView
- Not-found state if `blogSlug` invalid.
- Hero: full-width cover image with dark overlay, back-to-blog link, category badge, large white headline, excerpt, author avatar+name, date, reading time, view count.
- Body: two-column layout (content + sticky sidebar).
  - Content card: `ReactMarkdown` with custom-styled elements (h1/h2/h3/h4, p text-muted-foreground leading-relaxed, ul list-disc pl-6 with primary markers, blockquote border-l-4 border-primary bg-muted/40 italic, inline code bg-muted text-primary, pre block with scrollbar-thin, hr via Separator, table with borders). Tags row + Share/Copy-link buttons. "Next article" CTA card (rotating). Footer CTA "Ready to learn?" gradient card → navigate("catalog").
  - Sidebar: author card (avatar, name, role, stats), related posts (same category first, then others, max 3, click → openBlog), share buttons.

### CertificateView
Two modes based on `certificateId` in store:
1. **Verification mode** (`certificateId` set):
   - Found: green "Certificate Verified ✓" banner with motion entrance + full certificate display card with footer (issued date, verified badge, mono verify ID, Share + Download PDF buttons).
   - Not found: red FileX2 icon, "Certificate not found" with the bad ID, embedded search form to retry.
2. **Gallery mode** (`certificateId` null):
   - Not logged in: centered "Verify a certificate" hero with verify form, sign-in CTA, and demo ID hint (`LMS-TK8X4A-2Q9B`).
   - Logged in with no certs: empty state with "Continue learning" CTA + inline verify form.
   - Logged in with certs: grid of `CertificateCard` (compact cert preview + footer with View + Download PDF buttons), then inline verify form below.

- `CertificateDisplay` component (reused in gallery & verification): gradient-brand 2px border → white inner with bg-grid overlay, decorative corner shapes. Header row (GraduationCap logo + "Learniverse / Premium Learning" + "Verified" badge). Centered title block: "Certificate of Completion" kicker, candidate name in `text-gradient-brand` (large), course title. Circular seal (gradient circle + Award icon). 4-column field grid (Instructor / Score / Issued On / Verify ID mono). Signature row (Candidate line + cursive "Learniverse" signature line).
- `downloadCertificate(cert)`: opens a new window with a self-contained HTML certificate (print-optimized landscape layout) and auto-triggers `window.print()`. User can "Save as PDF" from the print dialog.
- `shareCertificate(cert)`: uses `navigator.share` if available, else copies share link to clipboard.

## Lint status
All five view files pass `bun run lint` cleanly (no errors, no warnings). Remaining lint errors in the repo belong to other agents' files (`admin-blog.tsx`, `admin-courses.tsx`, `video-player.tsx`, `notes-panel.tsx`).

## Conventions followed
- Every file: `"use client";` at top.
- Mobile-first responsive (sm:, md:, lg: breakpoints).
- Brand emerald palette, no indigo/blue.
- Framer Motion for page/section/card transitions (entrance, hover, success spring).
- Reused shared components: `StarRating` not needed here but `Avatar`/`Progress`/`Tabs`/`RadioGroup`/`Alert`/`Badge`/`Separator` used.
- Lucide icons only.
- Toasts via `sonner`.
- Did NOT edit page.tsx, layout.tsx, store.ts, catalog.ts, or other agents' files.
