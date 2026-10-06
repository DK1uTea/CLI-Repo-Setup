# create-my-stack

`create-my-stack` is a TypeScript CLI that creates a new frontend or backend project from the templates stored in this repository. The frontend template uses Next.js 16, React 19, and Tailwind CSS 4. The backend template uses a NestJS 11 monorepo with Prisma 7, PostgreSQL/TimescaleDB, and Redis.

This repository has three distinct parts: the CLI in `src/`, the source templates in `templates/`, and tests for the CLI in `tests/`. The repository root is **not** a runnable frontend or backend application. Template applications are copied into a new directory when the CLI runs.

## Documentation map

| Document | Purpose |
| --- | --- |
| [Architecture](docs/architecture.md) | CLI modules, data flow, naming and placeholder rules, directory conflict handling, and post-scaffold operations |
| [Template maintenance](docs/template-maintenance.md) | How templates are prepared, why editor diagnostics are suppressed in source templates, and how generated projects are verified |
| [AI agent entry point](AGENTS.md) | Where agents should start when working in this repository |
| [Repository skill](.agents/skills/create-my-stack-maintenance/SKILL.md) | Task-specific context for agents editing the CLI or templates |
| [Frontend template README](templates/fe/README.md) | Notes shipped with generated frontend projects |
| [Backend template README](templates/be/README.md) | Notes shipped with generated backend projects |

## Requirements

- Node.js 20 or newer.
- pnpm for developing and testing this repository. Generated projects can be installed with pnpm, npm, yarn, or Bun through the CLI's `--pm` option.
- Git only when using the Git initialization option.
- Docker and a compatible database/Redis environment when running the generated backend with its included infrastructure.

The root `pnpm-lock.yaml` belongs to the CLI. Dependencies for `templates/fe` and `templates/be` are deliberately absent from the root installation. The templates contain their own `package.json` files; their dependencies are installed after scaffolding.

## Quick start

Install and build the CLI:

```bash
pnpm install
pnpm build
```

Create a frontend project without prompts, dependency installation, Git operations, or dependency upgrades:

```bash
node dist/index.js demo-web --type fe --dir ./demo-web --pm pnpm --no-install --no-git --no-latest --yes
cd demo-web
pnpm install
pnpm dev
```

For interactive setup, run `node dist/index.js` with no arguments. You can also run `pnpm link --global` after building to expose the `create-my-stack` command on your machine.

Create a backend project with the same predictable, offline scaffold step:

```bash
node dist/index.js core-api --type be --dir ./core-api --pm pnpm --no-install --no-git --no-latest --yes
cd core-api
pnpm install
```

To run the backend, configure `.env` from `.env.example`, start the database and Redis services described by the generated project, run Prisma generation/migrations as needed, and then run `pnpm dev:api`. See the backend template README for the project-specific steps.

## Command line interface

```text
create-my-stack [project-name] [options]
```

| Argument or option | Behavior |
| --- | --- |
| `project-name` | npm-style package name. A scope such as `@team/service` is accepted. If omitted, the CLI prompts or chooses a default under `--yes`. |
| `--type fe\|be` | Selects the frontend or backend template. Interactive mode prompts when omitted; `--yes` defaults to `fe`. |
| `--dir <path>` | Destination directory. Supports `.`, relative paths, and absolute paths. Defaults to `./<sanitized-project-name>`. |
| `--pm pnpm\|npm\|yarn\|bun` | Package manager for install, upgrade, and printed next steps. When omitted, the CLI detects the invoking package manager and falls back to pnpm. |
| `--git` / `--no-git` | Enables or skips `git init` and an initial commit attempt. |
| `--install` / `--no-install` | Enables or skips installation of the generated project's dependencies. |
| `--latest` / `--no-latest` | Enables or skips dependency upgrade after installation. An upgrade failure restores the original `package.json` and retries installation. |
| `--overwrite` | Clears a nonempty destination directory before copying the template. This is destructive. |
| `-y`, `--yes` | Suppresses prompts and fills omitted choices with defaults. With `--yes`, Git, installation, and upgrade default to enabled. |
| `-h`, `--help` | Prints CLI help. |
| `-v`, `--version` | Prints the CLI version. |

In interactive mode, a nonempty destination offers **cancel**, **overwrite**, or **merge**. Merge overwrites matching files while retaining unrelated existing files. In noninteractive mode, a nonempty destination is rejected unless `--overwrite` is passed. A `--latest` request is effective only when installation is enabled.

For repeatable CI or local examples, explicitly pass `--no-install --no-git --no-latest --yes`. Omitting these flags under `--yes` performs additional operations and may require network access.

## What the CLI creates

The CLI copies one complete template, renames `_gitignore` and `_npmrc` to their dotfile names, and skips dependency/build directories. For the backend, it renames `apps/__projectName__` to the sanitized project name. It replaces these placeholders in text files:

| Placeholder | Meaning |
| --- | --- |
| `{{projectName}}` | Original package name, including a scope if supplied. Docker/YAML replacements use the sanitized name where required. |
| `{{sanitizedProjectName}}` | Filesystem-safe application name derived from the final segment of the package name. |
| `{{projectNameTitle}}` | Human-readable title derived from the package name. |
| `{{projectNameDb}}` | Lowercase database name with scope/path punctuation replaced by underscores. |

Binary files are skipped during placeholder processing. The source templates have an editor-only `noCheck` TypeScript option because their dependencies are not installed here. The CLI removes that option in every generated project and restores the backend's `multer` type dependency. Generated projects therefore retain normal TypeScript checking.

After file generation, the CLI optionally initializes Git, installs dependencies, and upgrades them. These actions are independent choices except that upgrading requires installation. The resulting project contains the template's own scripts, tests, documentation, and configuration.

## Repository layout

```text
src/
  index.ts          CLI entry point and operation order
  cli.ts            Flag parsing and help/version handling
  prompts.ts        Interactive prompts and default resolution
  validate.ts       Name validation and destination resolution
  scaffold.ts       Copy, rename, placeholder traversal, cleanup on failure
  placeholders.ts   Placeholder values and binary/text handling
  pm.ts             Package manager command selection
  post.ts           Git, installation, upgrade fallback, next steps
  types.ts          Shared CLI types
templates/
  fe/               Next.js application template
  be/               NestJS monorepo template
  tests/
    src/             Unit tests mirroring paths under src/
    scripts/         Unit tests mirroring safe, importable helpers under scripts/
    e2e.test.ts      Quick CLI end-to-end tests
    e2e-full.test.ts Optional install/build verification
scripts/
  prepare-templates.mjs   Destructive import/cleanup from local source repositories
  template-source-filter.mjs   Importable filter for excluded source files
docs/               Architecture and maintenance documentation
.agents/skills/     Repository-specific AI skill
```

The package publishes `dist/` and `templates/` through the `files` field in the root `package.json`. The root documentation and repository skill are for maintainers of this source repository; they are not copied into generated projects. Template-local AI instructions, such as `templates/fe/AGENTS.md`, belong to the generated application.

Unit tests mirror the source tree under `tests/`: `src/pm.ts` maps to `tests/src/pm.test.ts`, and importable helpers under `scripts/` map to `tests/scripts/`. CLI end-to-end tests stay at `tests/e2e*.test.ts`. The applications inside `templates/` have their own test suites; those tests are copied into generated projects and are not part of the root CLI unit-test layout.

For new CLI behavior and bug fixes, use test-driven development: write a focused test for the expected result, confirm the test fails for the right reason, implement the smallest change, and refactor with the test passing. Existing-behavior coverage can pass on its first run because it documents what the CLI already does. See [AGENTS.md](AGENTS.md) for the maintainer workflow. The FE template has its own TDD instructions for its generated application.

## Development commands

Run these from the repository root:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Rebuilds the CLI with tsup when source changes. |
| `pnpm build` | Produces the ESM CLI in `dist/index.js`. |
| `pnpm typecheck` | Checks `src/` with TypeScript. The root `tsconfig.json` excludes templates and tests. |
| `pnpm lint` | Runs ESLint over `src/`, `tests/`, and `scripts/`. |
| `pnpm verify:commit` | Runs lint, typecheck, build, and the normal test suite in the same order as the pre-commit hook. |
| `pnpm test` | Runs the normal Vitest suite, excluding the full install/build suite. |
| `pnpm test:e2e` | Runs the quick CLI end-to-end test file. |
| `pnpm test:full` | Runs the optional full install/build suite. This script uses POSIX environment-variable syntax; on PowerShell set `$env:E2E_FULL='1'` and run `pnpm exec vitest run tests/e2e-full.test.ts`. |
| `pnpm format` | Formats the root CLI source and tests with Prettier. |

The full suite installs both generated projects, builds the frontend, and generates the Prisma client before building the backend. It needs network access and considerably more time than `pnpm test`. It does not start the backend's database services.

### Commit gate

The root repository uses Husky. `pnpm install` runs the `prepare` script, which configures Git to use `.husky/_`; run `pnpm run prepare` if you need to activate hooks in an existing checkout. On each commit, `.husky/pre-commit` runs `pnpm verify:commit`. A failing lint, typecheck, build, or normal test command stops the commit.

The root lint command covers `src/`, `tests/`, and `scripts/`. The normal test suite includes the quick CLI E2E tests and excludes `tests/e2e-full.test.ts`, which downloads dependencies and builds both generated applications. Run `pnpm test:full` separately when template dependencies or generated builds change. Root Husky checks do not run the application test suites inside `templates/`; those belong to generated projects.

## Editing templates and IDE diagnostics

The files in `templates/` are source artifacts with unresolved placeholders and no local `node_modules`. Opening them in a TypeScript editor used to produce missing-package and follow-on type errors. Broad `declare module '*'` shims also removed useful type information. The current source templates use `noCheck` to keep TS/TSX language recognition while suppressing semantic checking before dependencies exist. The generated projects do **not** inherit `noCheck`.

For a real template type check, scaffold into a separate directory, install its dependencies, and run the generated project's `typecheck` (frontend) or `build` (backend) command. Restart the TypeScript server in VS Code if an already-open tab continues to show stale diagnostics after changing template configuration. See [Template maintenance](docs/template-maintenance.md) before modifying the import script or source templates.

## AI-assisted maintenance

Agents working on this repository should read [AGENTS.md](AGENTS.md), then use the [repository skill](.agents/skills/create-my-stack-maintenance/SKILL.md) for changes to the CLI, scaffold flow, or template preparation. The skill points to the relevant source of truth and calls out invariants that are easy to break, especially the distinction between source templates and generated projects. When working inside `templates/fe`, follow its own `AGENTS.md` as well.

## Current limitations

- `scripts/prepare-templates.mjs` has two hardcoded local Windows source paths. It is a maintainer tool and cannot run on another machine until those paths are adjusted.
- Source template `noCheck` is an editor convenience. It is not evidence that a freshly generated project passes its own type check or build.
- Dependency upgrades can change project behavior. Use `--no-latest` for reproducible scaffolding and validate a project after choosing an upgrade.
- The initial Git commit may fail when the user's Git identity is not configured; Git initialization can still succeed.
