# Graph Report - .  (2026-07-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 515 nodes · 1121 edges · 30 communities (22 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 937 input · 296 output

## Graph Freshness
- Built from commit: `8b428979`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Components and Modals
- User Management and Auth
- App Layout and Navigation
- Auth Pages and Dashboard
- Core Dependencies
- Development Dependencies
- Content Management Actions
- TypeScript Configuration
- Blog System
- Shadcn UI Configuration
- Attachment Components
- Shadcn Documentation and Rules
- Database Query Scripts
- OAuth Provider Routes
- Message Sampling Scripts
- Keyword Extraction Scripts
- Search Session Scripts
- AI Agent Assets
- Experience Page
- Projects Page
- Tools Page
- Database Type Definitions
- ESLint Configuration
- Next.js Configuration
- PostCSS Configuration
- Shadcn MCP Server

## God Nodes (most connected - your core abstractions)
1. `cn()` - 114 edges
2. `getDb()` - 62 edges
3. `getSession()` - 38 edges
4. `Button()` - 22 edges
5. `compilerOptions` - 16 edges
6. `requireAdmin()` - 15 edges
7. `Spinner()` - 13 edges
8. `Input()` - 12 edges
9. `Badge()` - 10 edges
10. `hashPassword()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `getSession()`  [EXTRACTED]
  app/layout.tsx → lib/auth.ts
- `AlertTitle()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `Attachment()` --calls--> `cn()`  [EXTRACTED]
  components/ui/attachment.tsx → lib/utils.ts
- `AttachmentMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/attachment.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **shadcn/ui Core Rules** — agents_skills_shadcn_rules_styling, agents_skills_shadcn_rules_forms, agents_skills_shadcn_rules_composition, agents_skills_shadcn_rules_icons, agents_skills_shadcn_rules_chat, agents_skills_shadcn_rules_base_vs_radix [EXTRACTED 1.00]

## Communities (30 total, 8 thin omitted)

### Community 0 - "UI Components and Modals"
Cohesion: 0.06
Nodes (67): AddUserModal(), AddUserModalProps, User, ImageUpload(), ImageUploadProps, UploadedFile, UploadProgress, Asset (+59 more)

### Community 1 - "User Management and Auth"
Cohesion: 0.09
Nodes (48): createUser(), deleteUser(), getAdminStats(), getUsers(), updateUser(), User, changePassword(), deleteAccount() (+40 more)

### Community 2 - "App Layout and Navigation"
Cohesion: 0.06
Nodes (32): inter, metadata, poppins, RootLayout(), AppShell(), NO_SIDEBAR_PATHS, getInitials(), Navigation() (+24 more)

### Community 3 - "Auth Pages and Dashboard"
Cohesion: 0.07
Nodes (34): loginAction(), registerAction(), AdminDashboard(), AdminDashboardProps, Stats, User, AssetsTab(), formatBytes() (+26 more)

### Community 4 - "Core Dependencies"
Cohesion: 0.05
Nodes (39): @base-ui/react, bcryptjs, class-variance-authority, clsx, jose, lucide-react, next, dependencies (+31 more)

### Community 5 - "Development Dependencies"
Cohesion: 0.07
Nodes (31): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/bcryptjs (+23 more)

### Community 6 - "Content Management Actions"
Cohesion: 0.12
Nodes (22): createBlogPost(), createExperience(), createProject(), createTool(), deleteBlogPost(), deleteExperience(), deleteProject(), deleteTool() (+14 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "Blog System"
Cohesion: 0.12
Nodes (16): getBlogPosts(), BlogPage(), getBlogPosts(), BlogPost, BlogPostPage(), getBlogPost(), BlogPost, Badge() (+8 more)

### Community 9 - "Shadcn UI Configuration"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Attachment Components"
Cohesion: 0.11
Nodes (17): Attachment(), AttachmentAction(), AttachmentActionProps, AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia() (+9 more)

### Community 11 - "Shadcn Documentation and Rules"
Cohesion: 0.29
Nodes (10): shadcn CLI Reference, Customization & Theming, Registry Authoring, Base vs Radix Rules, Chat & Messaging Rules, Component Composition Rules, Forms & Inputs Rules, Icon Rules (+2 more)

### Community 12 - "Database Query Scripts"
Cohesion: 0.40
Nodes (4): db, errorRows, keywords, projectSessions

### Community 13 - "OAuth Provider Routes"
Cohesion: 0.83
Nodes (3): GET(), getGitHubAuthUrl(), getGoogleAuthUrl()

### Community 14 - "Message Sampling Scripts"
Cohesion: 0.50
Nodes (3): db, projectSessionIds, sampleMessages

### Community 15 - "Keyword Extraction Scripts"
Cohesion: 0.50
Nodes (3): db, keywords, sampleParts

### Community 16 - "Search Session Scripts"
Cohesion: 0.50
Nodes (3): db, projectSessions, searchTerms

### Community 17 - "AI Agent Assets"
Cohesion: 0.67
Nodes (3): OpenAI Agent Config, shadcn Large Logo, shadcn Small Logo

## Knowledge Gaps
- **142 isolated node(s):** `db`, `keywords`, `errorRows`, `projectSessions`, `db` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Components and Modals` to `Attachment Components`, `Blog System`, `App Layout and Navigation`, `Auth Pages and Dashboard`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `getDb()` connect `User Management and Auth` to `Blog System`, `Content Management Actions`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `getSession()` connect `User Management and Auth` to `App Layout and Navigation`, `Content Management Actions`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `db`, `keywords`, `errorRows` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components and Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `User Management and Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.08717948717948718 - nodes in this community are weakly interconnected._
- **Should `App Layout and Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.05939716312056738 - nodes in this community are weakly interconnected._