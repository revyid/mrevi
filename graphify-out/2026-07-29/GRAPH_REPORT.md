# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 820 nodes · 1325 edges · 77 communities (62 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71a48ca5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dotmatrix-core.tsx
- [locale]/layout.tsx
- dependencies
- BlogTab.tsx
- cn
- Development Dependencies
- dotm-hex-5.tsx
- TypeScript Configuration
- content.ts
- components.json
- getSession
- utils.ts
- actions/auth.ts
- attachment.tsx
- DotMatrixBase
- AdminDashboard.tsx
- getDb
- dropdown-menu.tsx
- select.tsx
- alert-dialog.tsx
- Using Agent Skills
- DotMatrix3Base
- dotmatrix-hooks.ts
- ProfileForm.tsx
- PagesTab.tsx
- lib/auth.ts
- shadcn Skill
- ThemeTab.tsx
- Debugging and Error Recovery
- getSettings
- api/auth/callback/[provider]/route.ts
- ExperiencesTab.tsx
- ProjectsTab.tsx
- rowMajorIndex
- AssetsTab.tsx
- tabs.tsx
- hashPassword
- dream_query.mjs
- assets/route.ts
- oauth/[provider]/route.ts
- journey/page.tsx
- projects/page.tsx
- tools/page.tsx
- matrix-loader.tsx
- dream_query2.mjs
- dream_query3.mjs
- dream_query4.mjs
- next.config.ts
- OpenAI Agent Config
- contact/page.tsx
- badge.tsx
- createDiagonalWave3Resolver
- DotMatrixCommonProps
- database.types.ts
- API and Interface Design
- Git Workflow and Versioning
- idea-refine.sh
- eslint.config.mjs
- postcss.config.mjs
- Browser Testing with DevTools
- Code Simplification
- Context Engineering
- Documentation and ADRs
- Frontend UI Engineering
- shadcn MCP Server

## God Nodes (most connected - your core abstractions)
1. `cn()` - 112 edges
2. `getSession()` - 39 edges
3. `requireAdmin()` - 26 edges
4. `DotmHex5()` - 19 edges
5. `compilerOptions` - 16 edges
6. `DotMatrixBase()` - 16 edges
7. `DotMatrix3Base()` - 14 edges
8. `getDb()` - 12 edges
9. `getSettings()` - 12 edges
10. `Button()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ImageUpload()` --calls--> `cn()`  [EXTRACTED]
  components/admin/ImageUpload.tsx → lib/utils.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent Skill System** — agents_skills_api_and_interface_design_skill_api_design, agents_skills_browser_testing_with_devtools_skill_browser_testing, agents_skills_ci_cd_and_automation_skill_ci_cd, agents_skills_code_review_and_quality_skill_code_review, agents_skills_code_simplification_skill_code_simplification, agents_skills_context_engineering_skill_context_engineering, agents_skills_debugging_and_error_recovery_skill_debugging, agents_skills_deprecation_and_migration_skill_deprecation, agents_skills_documentation_and_adrs_skill_documentation, agents_skills_doubt_driven_development_skill_doubt_driven, agents_skills_frontend_ui_engineering_skill_frontend_ui, agents_skills_git_workflow_and_versioning_skill_git_workflow, agents_skills_idea_refine_skill_idea_refine, agents_skills_incremental_implementation_skill_incremental_implementation, agents_skills_interview_me_skill_interview_me, agents_skills_observability_and_instrumentation_skill_observability, agents_skills_performance_optimization_skill_performance, agents_skills_planning_and_task_breakdown_skill_planning [EXTRACTED 1.00]
- **Agent Skill Lifecycle** — agents_skills_spec_driven_development_skill, agents_skills_test_driven_development_skill, agents_skills_shipping_and_launch_skill, agents_skills_security_and_hardening_skill [EXTRACTED 0.90]
- **shadcn/ui Core Rules** — agents_skills_shadcn_rules_styling, agents_skills_shadcn_rules_forms, agents_skills_shadcn_rules_composition, agents_skills_shadcn_rules_icons, agents_skills_shadcn_rules_chat, agents_skills_shadcn_rules_base_vs_radix [EXTRACTED 1.00]

## Communities (77 total, 15 thin omitted)

### Community 0 - "dotmatrix-core.tsx"
Cohesion: 0.03
Nodes (56): buildOuterRingClockwiseOrder3(), buildSpiralInwardOrderToIndexMap3(), CENTER, CENTER_3, CORNER_COORDS, createPathWaveComponent(), createPathWaveResolver(), CROSS_INDEXES (+48 more)

### Community 1 - "[locale]/layout.tsx"
Cohesion: 0.06
Nodes (35): BlogPage(), getBlogPosts(), metadata, BlogPost, BlogPostPage(), generateMetadata(), getBlogPost(), inter (+27 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (41): @base-ui/react, bcryptjs, class-variance-authority, clsx, jose, lucide-react, next, next-intl (+33 more)

### Community 3 - "BlogTab.tsx"
Cohesion: 0.10
Nodes (23): createBlogPost(), getBlogPosts(), AddUserModalProps, User, BlogPost, BlogTab(), Button(), buttonVariants (+15 more)

### Community 4 - "cn"
Cohesion: 0.10
Nodes (30): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+22 more)

### Community 5 - "Development Dependencies"
Cohesion: 0.07
Nodes (31): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/bcryptjs (+23 more)

### Community 6 - "dotm-hex-5.tsx"
Cohesion: 0.11
Nodes (21): ErrorBoundaryProps, clamp01(), DotmHex5(), DotmHex5Props, hexPatternIndex(), opacityForCell(), pointForCell(), ROW_COUNTS (+13 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "content.ts"
Cohesion: 0.14
Nodes (20): createCustomPage(), createNavigationLink(), createTool(), deleteBlogPost(), deleteCustomPage(), deleteNavigationLink(), deleteTool(), getTools() (+12 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 10 - "getSession"
Cohesion: 0.15
Nodes (16): createUser(), deleteUser(), getAdminStats(), getUsers(), updateUser(), User, GET(), DEFAULT_LINKS (+8 more)

### Community 11 - "utils.ts"
Cohesion: 0.11
Nodes (8): ImageUpload(), ImageUploadProps, UploadedFile, UploadProgress, Separator(), Skeleton(), Spinner(), TooltipContent()

### Community 12 - "actions/auth.ts"
Cohesion: 0.18
Nodes (13): changePassword(), loginAction(), logoutAction(), registerAction(), serverAuthError(), serverAuthLog(), SessionMeta, AuthForm() (+5 more)

### Community 13 - "attachment.tsx"
Cohesion: 0.11
Nodes (17): Attachment(), AttachmentAction(), AttachmentActionProps, AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia() (+9 more)

### Community 14 - "DotMatrixBase"
Cohesion: 0.16
Nodes (17): clampHalo(), colWaveNormFromIndex(), concentricRingNormFromIndex(), distanceFromCenter(), dmxBloomHaloSpreadClass(), dmxBloomRootActive(), dmxDotBloomParts(), DotMatrixBase() (+9 more)

### Community 15 - "AdminDashboard.tsx"
Cohesion: 0.15
Nodes (8): updateSettings(), AdminDashboardProps, Stats, User, SettingsTab(), SidebarTab(), ToolsTab(), UserTable()

### Community 16 - "getDb"
Cohesion: 0.23
Nodes (10): POST(), DELETE(), GET(), POST(), DELETE(), GET(), getCurrentSessionToken(), getDb() (+2 more)

### Community 17 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 18 - "select.tsx"
Cohesion: 0.20
Nodes (10): SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+2 more)

### Community 19 - "alert-dialog.tsx"
Cohesion: 0.15
Nodes (9): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+1 more)

### Community 20 - "Using Agent Skills"
Cohesion: 0.21
Nodes (12): Context Engineering, Incremental Implementation, Security and Hardening, Shipping and Launch, Source-Driven Development, Spec-Driven Development, Test-Driven Development, Using Agent Skills (+4 more)

### Community 21 - "DotMatrix3Base"
Cohesion: 0.20
Nodes (12): blTrPath3NormFromIndex(), brTlPath3NormFromIndex(), clamp01Dmx(), distanceFromCenter3(), DotMatrix3Base(), getMatrix3Layout(), getPattern3Indexes(), indexToCoord3() (+4 more)

### Community 22 - "dotmatrix-hooks.ts"
Cohesion: 0.23
Nodes (11): DotMatrixPhase, DotMatrixPhasesResult, emit(), FrameListener, listeners, subscribeFrame(), tick(), UseCyclePhaseOptions (+3 more)

### Community 23 - "ProfileForm.tsx"
Cohesion: 0.22
Nodes (8): deleteAccount(), updateProfile(), ProfilePage(), parseDevice(), Passkey, ProfileForm(), ProfileFormProps, Session

### Community 24 - "PagesTab.tsx"
Cohesion: 0.20
Nodes (9): deletePageSetting(), getPageSettings(), PageSetting, upsertPageSetting(), EMPTY_FORM, PagesTab(), ROLE_OPTIONS, STATUS_OPTIONS (+1 more)

### Community 25 - "lib/auth.ts"
Cohesion: 0.31
Nodes (9): log(), logError(), POST(), createSession(), createToken(), JWT_SECRET, login(), register() (+1 more)

### Community 26 - "shadcn Skill"
Cohesion: 0.29
Nodes (10): shadcn CLI Reference, Customization & Theming, Registry Authoring, Base vs Radix Rules, Chat & Messaging Rules, Component Composition Rules, Forms & Inputs Rules, Icon Rules (+2 more)

### Community 27 - "ThemeTab.tsx"
Cohesion: 0.24
Nodes (9): getNavigationLinks(), getTheme(), updateTheme(), LocaleLayout(), FIELDS, hexToOklch(), PRESETS, ThemeTab() (+1 more)

### Community 28 - "Debugging and Error Recovery"
Cohesion: 0.22
Nodes (9): CI/CD and Automation, Code Review and Quality, Debugging and Error Recovery, Doubt-Driven Development, Idea Refine, Interview Me, Observability and Instrumentation, Performance Optimization (+1 more)

### Community 29 - "getSettings"
Cohesion: 0.31
Nodes (6): getSettings(), getSkillCards(), getSocialLinks(), generateMetadata(), getData(), Home()

### Community 30 - "api/auth/callback/[provider]/route.ts"
Cohesion: 0.44
Nodes (7): GET(), getGitHubUser(), getGoogleUser(), log(), logError(), GET(), loginWithOAuth()

### Community 31 - "ExperiencesTab.tsx"
Cohesion: 0.25
Nodes (6): createExperience(), deleteExperience(), getExperiences(), updateExperience(), Experience, ExperiencesTab()

### Community 32 - "ProjectsTab.tsx"
Cohesion: 0.25
Nodes (6): createProject(), deleteProject(), getProjects(), updateProject(), Project, ProjectsTab()

### Community 33 - "rowMajorIndex"
Cohesion: 0.29
Nodes (7): buildDiagonalSnakeOrderToIndexMap(), buildMiddleRingAntiClockwiseOrderToIndexMap(), buildOuterRingClockwiseOrderToIndexMap(), buildRowWaveSnakeOrderToIndexMap(), buildSnakeOrderToIndexMap(), buildSpiralInwardOrderToIndexMap(), rowMajorIndex()

### Community 34 - "AssetsTab.tsx"
Cohesion: 0.53
Nodes (5): Asset, AssetsTab(), formatBytes(), formatDate(), getFileName()

### Community 35 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 36 - "hashPassword"
Cohesion: 0.60
Nodes (4): attempts, checkRateLimit(), PUT(), hashPassword()

### Community 37 - "dream_query.mjs"
Cohesion: 0.40
Nodes (4): db, errorRows, keywords, projectSessions

### Community 38 - "assets/route.ts"
Cohesion: 0.83
Nodes (3): DELETE(), GET(), getAuth()

### Community 39 - "oauth/[provider]/route.ts"
Cohesion: 0.83
Nodes (3): GET(), getGitHubAuthUrl(), getGoogleAuthUrl()

### Community 40 - "journey/page.tsx"
Cohesion: 0.67
Nodes (3): getExperiences(), JourneyPage(), metadata

### Community 41 - "projects/page.tsx"
Cohesion: 0.67
Nodes (3): getProjects(), metadata, ProjectsPage()

### Community 42 - "tools/page.tsx"
Cohesion: 0.67
Nodes (3): getTools(), metadata, ToolsPage()

### Community 44 - "dream_query2.mjs"
Cohesion: 0.50
Nodes (3): db, projectSessionIds, sampleMessages

### Community 45 - "dream_query3.mjs"
Cohesion: 0.50
Nodes (3): db, keywords, sampleParts

### Community 46 - "dream_query4.mjs"
Cohesion: 0.50
Nodes (3): db, projectSessions, searchTerms

### Community 47 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, withNextIntl

### Community 48 - "OpenAI Agent Config"
Cohesion: 0.67
Nodes (3): OpenAI Agent Config, shadcn Large Logo, shadcn Small Logo

### Community 51 - "createDiagonalWave3Resolver"
Cohesion: 0.67
Nodes (3): createDiagonalWave3Component(), createDiagonalWave3Resolver(), diagonalWave3PathNormFromIndex()

### Community 52 - "DotMatrixCommonProps"
Cohesion: 0.67
Nodes (3): DotMatrix3BaseProps, DotMatrixBaseProps, DotMatrixCommonProps

## Knowledge Gaps
- **234 isolated node(s):** `db`, `keywords`, `errorRows`, `projectSessions`, `db` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `C` connect `ThemeTab.tsx` to `dotmatrix-core.tsx`, `[locale]/layout.tsx`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `BlogTab.tsx`, `tabs.tsx`, `utils.ts`, `attachment.tsx`, `dropdown-menu.tsx`, `badge.tsx`, `alert-dialog.tsx`, `select.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `db`, `keywords`, `errorRows` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dotmatrix-core.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02649804275820536 - nodes in this community are weakly interconnected._
- **Should `[locale]/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055152394775036286 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `BlogTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09759759759759759 - nodes in this community are weakly interconnected._