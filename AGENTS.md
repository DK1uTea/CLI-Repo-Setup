# AI agent guide

This repository builds `create-my-stack`, a CLI that copies one of two application templates. Read [README.md](README.md) for user-facing behavior and [docs/architecture.md](docs/architecture.md) for the code path before changing scaffold behavior.

Use the [create-my-stack-maintenance skill](.agents/skills/create-my-stack-maintenance/SKILL.md) when modifying the root CLI, source templates, placeholder handling, or template preparation. Read [docs/template-maintenance.md](docs/template-maintenance.md) before refreshing or changing a template.

Keep these boundaries clear:

- Root `src/` and `tests/` describe the scaffolding CLI. `templates/fe` and `templates/be` are separate applications copied to users.
- Put root unit tests under `tests/` with paths mirroring `src/` or importable `scripts/` helpers; do not colocate them with logic. Leave template-local tests in their templates, where they are copied into generated projects.
- The source templates intentionally set TypeScript `noCheck` because their dependencies are not installed in this repository. Generated projects must have normal type checking; `src/scaffold.ts` removes `noCheck` during copy and restores backend `multer` types.
- `scripts/prepare-templates.mjs` deletes and recreates both checked-in template trees from hardcoded local source paths. Inspect its inputs and the resulting diff before running or accepting a refresh.
- Do not infer generated-project correctness from the root `pnpm typecheck`; verify the generated files or build the generated application when the change affects it.
- Preserve user changes already present in the working tree.

When editing files inside `templates/fe`, also follow `templates/fe/AGENTS.md`. Template-specific instructions and documentation apply to the generated applications; this root guide applies to the CLI repository.

## Test-driven changes to the CLI

For a new CLI feature or behavior fix, define the expected behavior from the request or a focused spec, add a test in the mirrored `tests/src/` or `tests/scripts/` path (or a root CLI E2E test when the behavior crosses process boundaries), and run it first to confirm it fails for the intended reason. Implement the smallest change that makes it pass, then refactor while keeping it green. Run the relevant unit tests followed by `pnpm test`, `pnpm typecheck`, and `pnpm lint`. Assert observable behavior and use real filesystem fixtures where practical; mock external commands and prompts only at their boundaries.

Adding coverage for behavior that already exists is a characterization task: these tests may pass immediately. Do not change production behavior merely to manufacture a red test. The FE template has its own detailed TDD role split in `templates/fe/AGENTS.md` and its TDD skill; follow those instructions when working on that generated application's code or tests.
