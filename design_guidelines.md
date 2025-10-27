# Job Search Portal - Design Guidelines

## Design Approach

**Selected Approach**: Design System (Professional/Productivity-Focused)

**Justification**: Job portals are utility-focused applications where efficiency, learnability, and trust are paramount. Users interact with structured data (job listings, applications, recruiter management) and need consistent, predictable interfaces. The design should reference professional platforms like LinkedIn and Indeed while maintaining clarity and professionalism.

**Key Design Principles**:
- Clarity over creativity: Information hierarchy must be immediately apparent
- Role-appropriate interfaces: Each user type gets a tailored experience
- Trust and credibility: Professional aesthetic that inspires confidence
- Efficiency: Minimize clicks to complete core tasks

---

## Core Design Elements

### A. Typography

**Font Families**:
- Primary: Inter or Source Sans Pro (clean, professional sans-serif)
- Use via Google Fonts CDN

**Hierarchy**:
- Page Titles: text-4xl, font-bold (Dashboard headers, section titles)
- Section Headers: text-2xl, font-semibold (Card titles, modal headers)
- Subsection Headers: text-xl, font-semibold (Job titles in listings)
- Body Text: text-base, font-normal (Job descriptions, form labels)
- Metadata/Secondary: text-sm, font-normal (Timestamps, locations, tags)
- Small Print: text-xs, font-normal (Helper text, tooltips)

**Line Heights**:
- Headers: leading-tight
- Body content: leading-relaxed
- Forms: leading-normal

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently throughout
- Component padding: p-4, p-6, p-8
- Section margins: mb-8, mb-12, mb-16
- Grid gaps: gap-4, gap-6, gap-8
- Form field spacing: space-y-4, space-y-6

**Container Strategy**:
- Main content area: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Forms and focused content: max-w-2xl mx-auto
- Full-width dashboards: w-full with internal padding

**Grid System**:
- Job listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Dashboard widgets: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6
- Filter sidebar: Fixed width (w-64 or w-72) on desktop, collapsible on mobile

---

### C. Component Library

#### Navigation

**Top Navigation Bar**:
- Fixed header: h-16, flex items-center justify-between, px-6
- Logo placement: Left side
- Main navigation: Center/Right (Dashboard, Jobs, Applications based on role)
- User profile dropdown: Far right with avatar, name, role badge
- Role indicator: Small badge showing current role (Superadmin/Recruiter/Applicant)

**Side Navigation** (for dashboards):
- Fixed sidebar: w-64, min-h-screen (desktop)
- Collapsible drawer (mobile/tablet)
- Navigation items: py-3 px-4, icon + label pattern using Heroicons
- Active state: Slightly inset with visual indicator

#### Dashboard Layouts

**Superadmin Dashboard**:
- Stats cards row: 4 metrics (Total Recruiters, Pending Approvals, Active Jobs, Total Applicants)
- Pending approvals table: Full-width data table with action buttons
- Recent activity feed: Timeline-style component

**Recruiter Dashboard**:
- Stats cards: Jobs Posted, Active Applications, Views, Pending Approval Status
- Quick actions: "Post New Job" prominent CTA
- Job management table: Sortable columns (Title, Posted Date, Applications, Status)
- Action dropdowns for each job (Edit, View Applications, Delete)

**Job Applicant Dashboard**:
- Profile completion indicator: Progress bar at top
- Saved jobs section: Grid of job cards
- Application status tracker: Timeline view showing application stages
- Recommended jobs: Personalized job card grid

#### Core UI Elements

**Job Cards**:
- Card structure: Rounded corners (rounded-lg), padding p-6
- Layout: Company logo (top-left), job title (large), company name, location, job type badge
- Metadata row: Posted date, salary range (if available), experience level
- Tags: Skill requirements as pill badges (rounded-full, px-3 py-1)
- Action: "Apply Now" or "View Details" button (bottom-right)
- Hover state: Subtle elevation increase (shadow-md to shadow-lg)

**Data Tables**:
- Header row: font-semibold, text-sm, uppercase tracking
- Row height: py-4
- Zebra striping for alternating rows
- Action column: Right-aligned with icon buttons or dropdown menu
- Pagination: Bottom-right, showing "X-Y of Z results"
- Responsive: Stack to card layout on mobile (< md breakpoint)

**Forms**:
- Form groups: space-y-6 between major sections
- Input fields: h-12, px-4, rounded-md, border
- Labels: text-sm, font-medium, mb-2
- Required indicators: Red asterisk
- Validation messages: text-sm below input, pt-1
- File upload: Drag-and-drop zone with dashed border, min-h-32
- Multi-step forms (job posting): Progress indicator at top showing steps

**Filters Panel**:
- Accordion-style sections: Location, Job Type, Experience, Salary Range
- Checkboxes: Custom-styled with clear hit areas (p-2)
- Range sliders: For salary filtering
- Apply/Clear buttons: Sticky footer on mobile, inline on desktop
- Active filters: Pill badges showing current selections with X to remove

**Modal Dialogs**:
- Overlay: Semi-transparent backdrop
- Modal container: max-w-2xl, rounded-lg, p-6
- Header: text-xl font-semibold, mb-4, with close icon (top-right)
- Content: Scrollable if needed (max-h-[80vh])
- Footer: Flex row with Cancel (secondary) and Confirm (primary) buttons

**Buttons**:
- Primary CTA: px-6 py-3, rounded-md, font-medium
- Secondary: px-6 py-3, rounded-md, border
- Small buttons: px-4 py-2, text-sm
- Icon buttons: w-10 h-10, flex items-center justify-center, rounded-md
- Loading states: Spinner icon replacing button text

**Status Badges**:
- Pill shape: rounded-full, px-3 py-1, text-xs, font-medium
- Use semantic indicators: Approved, Pending, Rejected, Active, Closed, Applied, Interviewing
- Consistent positioning in cards and tables

**Search Components**:
- Search bar: Prominent placement, h-12, with search icon (left), rounded-full or rounded-lg
- Auto-complete dropdown: Appears below input, shadow-lg, rounded-md
- Search results: Count displayed ("X jobs found"), sort dropdown (right-aligned)

#### Data Displays

**Job Details Page**:
- Two-column layout: Main content (2/3 width), sidebar (1/3 width)
- Main: Job description, requirements, responsibilities (prose formatting)
- Sidebar: Quick facts (location, type, posted date), company info, apply button (sticky)
- Related jobs: Grid at bottom (3 columns)

**Application Form**:
- Multi-section: Personal Info, Resume Upload, Cover Letter, Additional Questions
- Progress saving: Auto-save draft indicator
- Character counters for text areas
- Resume preview: Inline PDF viewer or download link

**Profile Management**:
- Tab navigation: Overview, Experience, Education, Skills, Uploaded Documents
- Editable sections: Inline editing with save/cancel
- Profile completeness: Visual indicator (circular progress)

#### Overlays

**Confirmation Dialogs**:
- Critical actions (delete job, remove recruiter): Small modal (max-w-md)
- Clear warning text
- Destructive action button (e.g., "Delete") visually distinct

**Toast Notifications**:
- Top-right positioning
- Auto-dismiss after 5 seconds
- Action buttons for undo if applicable
- Success, error, warning, info variants

---

### D. Animations

**Minimal Animation Strategy**:
- Page transitions: None (instant navigation)
- Loading states: Simple spinner (animate-spin from Tailwind)
- Toast appearance: Slide-in from top (transition-transform)
- Dropdown menus: Fade and slight scale (transition-opacity + scale-95 to scale-100)
- Hover effects: Subtle shadow changes only (no complex animations)

---

## Role-Specific Layouts

**Superadmin Interface**:
- Emphasis on management and oversight
- Prominent approval queue with clear approve/deny actions
- Metrics-heavy dashboard
- User management table with search and filters

**Recruiter Interface**:
- Job posting wizard: Multi-step form with preview
- Application inbox: Table view with applicant details
- Communication tools: In-app messaging for applicant contact

**Job Applicant Interface**:
- Search-first design: Large search bar on job listing page
- Filter-rich experience: Persistent left sidebar with filters
- Personalization: "Recommended for you" section
- Application tracking: Visual timeline showing progress

---

## Multi-Language Support

**Implementation Considerations**:
- RTL support: Use logical properties (start/end instead of left/right)
- Text expansion: Allow 30-40% more horizontal space for languages like German
- Consistent spacing: Use padding that accommodates longer translations
- Font stack: Include language-specific fallbacks in typography
- Language selector: Dropdown in top navigation (flag + language name)

---

## Images

**Profile Pictures**:
- User avatars: Circular, w-10 h-10 (navigation), w-16 h-16 (profiles)
- Company logos: Square or rectangular, max-h-12 (job cards), max-h-20 (job details page)
- Fallback: Initials on solid background for missing images

**Placeholder Content**:
- Use placeholder services for company logos and user avatars during development
- No decorative hero images needed - this is a utility application