# Template maintenance

The checked-in `templates/fe` and `templates/be` directories are the exact source artifacts the CLI copies. They are deliberately not installed as root workspace packages. Changes to those directories affect every future generated project.

## Two ways to change a template

1. **Focused edit:** Change a checked-in template file directly when the intended change is small and there is no need to refresh from the upstream repository. Verify the generated output, because placeholder replacement and folder renaming can change the result.
2. **Upstream refresh:** Run `scripts/prepare-templates.mjs` only after reviewing its input repositories and cleanup behavior. It copies from hardcoded `FE_SRC` and `BE_SRC` paths near the top of the script, removes the existing template directories, then recreates and sanitizes them. This is a broad, destructive operation; review the full diff before accepting it.

The script filters Git data, installed dependencies, build output, real `.env` files, lockfiles, and several local tool caches. It renames `.gitignore` and `.npmrc` to `_gitignore` and `_npmrc` so that the CLI can restore dotfiles in a generated project. It also removes domain-specific modules from the source applications and writes a starter dashboard/backend layout. Its output is a maintained starter, not an unmodified copy of either upstream repository.

The file-selection rules live in `scripts/template-source-filter.mjs` and have isolated tests in `tests/scripts/template-source-filter.test.ts`. Testing that helper does not execute the destructive import script or validate every transformation performed later in the refresh.

The source paths are machine-specific Windows paths. Do not run the refresh script as a routine validation command: it replaces both checked-in template trees. When using a different machine, inspect and adjust the paths deliberately before running it.

## Placeholder contract

The CLI knows four text placeholders: `{{projectName}}`, `{{sanitizedProjectName}}`, `{{projectNameTitle}}`, and `{{projectNameDb}}`. The backend's `apps/__projectName__` folder is renamed separately. Placeholder values are prepared by `buildTemplateVariables` in `src/placeholders.ts`; the CLI traverses generated files in `src/scaffold.ts`.

When introducing a new placeholder, update its value creation, replacement expectations, examples, and tests together. Do not add a placeholder to a binary file or assume the CLI renames paths other than the backend application directory. In Docker/YAML files, the replacement function treats `{{projectName}}` specially to avoid invalid scoped image/service names.

## Why source templates use `noCheck`

The root `pnpm install` installs only CLI dependencies. A source template has its own `package.json` but no local `node_modules`, and it still contains project-name placeholders. Running ordinary semantic type checking over that incomplete source produces missing-module and follow-on type errors. The previous `declare module '*'` shims hid many missing imports while making those imports effectively untyped.

The checked-in FE and BE root `tsconfig.json` files set `compilerOptions.noCheck: true` for editor inspection. The checked-in BE config also has `types: []` because `@types/multer` is not installed in the source template. Its alias targets use relative paths, so the config does not need the deprecated `baseUrl` setting under the root TypeScript version.

`copyTemplateFiles` removes `noCheck` from the generated project's root config and restores `types: ["multer"]` for BE. `scripts/prepare-templates.mjs` reapplies these source-only settings whenever templates are refreshed. The generated project therefore gets normal type checking after its dependencies are installed. If VS Code still shows old diagnostics after a config change, restart its TypeScript server.

The root `pnpm typecheck` does not check templates. `tsc -p templates/fe` or `tsc -p templates/be/apps/__projectName__` can confirm that the source configs parse quietly, but because `noCheck` is enabled, a successful result does **not** prove the generated application is type-safe.

## Verification levels

| Level | Command or action | Evidence |
| --- | --- | --- |
| CLI compile | `pnpm typecheck` and `pnpm build` | Root CLI source compiles and bundles. |
| CLI quality | `pnpm lint` | Root source and CLI tests satisfy ESLint. |
| Normal tests | `pnpm test` | Unit/scaffold tests and quick CLI end-to-end tests pass. |
| Generated file inspection | Scaffold FE and BE with `--no-install --no-git --no-latest --yes` into a disposable directory | Placeholders, renamed paths, dotfiles, and generated `tsconfig.json` have the expected values. |
| Generated application build | Install dependencies in each generated project, then run FE `pnpm build`; run BE `pnpm prisma:generate` and `pnpm build` | Application dependencies, generated types, and framework builds work together. |

The optional `tests/e2e-full.test.ts` automates the last level when `E2E_FULL=1`. The root `pnpm test:full` script uses POSIX assignment syntax. In PowerShell, use:

```powershell
$env:E2E_FULL = '1'
pnpm exec vitest run tests/e2e-full.test.ts
Remove-Item Env:E2E_FULL
```

The full suite installs dependencies and may require network access. It does not start Docker services or verify a live backend database connection. Use the template's own run instructions when that integration matters.

## Template-specific instructions

The FE template has its own `AGENTS.md`, `CLAUDE.md`, feature context files, and architecture documents. The BE template has a `CLAUDE.md` and NestJS/Prisma conventions. These files are part of the generated projects and apply when editing their application code. The repository-root [AGENTS.md](../AGENTS.md) describes the scaffolding tool itself; it does not replace those template-local rules.
