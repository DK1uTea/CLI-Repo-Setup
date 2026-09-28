import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { execa } from "execa";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const CLI_ENTRY = path.resolve(__dirname, "../dist/index.js");

describe("E2E CLI execution", () => {
  let tmpRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "create-stack-e2e-"));
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("scaffolds Frontend project non-interactively with --yes", async () => {
    const targetDir = path.join(tmpRoot, "my-frontend-app");

    const result = await execa(
      "node",
      [
        CLI_ENTRY,
        "my-frontend-app",
        "--type",
        "fe",
        "--dir",
        targetDir,
        "--pm",
        "pnpm",
        "--no-install",
        "--no-git",
        "--yes",
      ],
      { cwd: tmpRoot },
    );

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(path.join(targetDir, "package.json"))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(targetDir, ".gitignore"))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, "AGENTS.md"))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, "CLAUDE.md"))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, ".claude", "skills"))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(targetDir, "tests"))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, "e2e"))).toBe(true);

    const pkg = await fs.readJson(path.join(targetDir, "package.json"));
    expect(pkg.name).toBe("my-frontend-app");

    const dockerMd = await fs.readFile(
      path.join(targetDir, "DOCKER.md"),
      "utf8",
    );
    expect(dockerMd).not.toContain("{{projectName}}");
    expect(dockerMd).toContain("my-frontend-app");
  });

  it("scaffolds Backend project non-interactively with --yes", async () => {
    const targetDir = path.join(tmpRoot, "my-backend-service");

    const result = await execa(
      "node",
      [
        CLI_ENTRY,
        "my-backend-service",
        "--type",
        "be",
        "--dir",
        targetDir,
        "--pm",
        "pnpm",
        "--no-install",
        "--no-git",
        "--yes",
      ],
      { cwd: tmpRoot },
    );

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(path.join(targetDir, "package.json"))).toBe(
      true,
    );
    expect(
      await fs.pathExists(path.join(targetDir, "apps", "my-backend-service")),
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(targetDir, "apps", "tcp-server")),
    ).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, "apps", "worker"))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(targetDir, "libs", "core"))).toBe(
      true,
    );
    expect(
      await fs.pathExists(path.join(targetDir, "libs", "layer-data")),
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(targetDir, "libs", "third-party")),
    ).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, "CLAUDE.md"))).toBe(true);

    const pkg = await fs.readJson(path.join(targetDir, "package.json"));
    expect(pkg.name).toBe("my-backend-service");
    expect(pkg.scripts["dev:api"]).toBe(
      "nest start my-backend-service --watch",
    );

    const composeContent = await fs.readFile(
      path.join(targetDir, "docker-compose.yml"),
      "utf8",
    );
    expect(composeContent).not.toContain("{{projectName}}");
    expect(composeContent).toContain("my-backend-service");
  });

  it('scaffolds directly into current directory when target is "."', async () => {
    const emptyCurrentDir = path.join(tmpRoot, "empty-app");
    await fs.ensureDir(emptyCurrentDir);

    const result = await execa(
      "node",
      [
        CLI_ENTRY,
        "in-place-app",
        "--type",
        "fe",
        "--dir",
        ".",
        "--pm",
        "pnpm",
        "--no-install",
        "--no-git",
        "--yes",
      ],
      { cwd: emptyCurrentDir },
    );

    expect(result.exitCode).toBe(0);
    expect(
      await fs.pathExists(path.join(emptyCurrentDir, "package.json")),
    ).toBe(true);
    const pkg = await fs.readJson(path.join(emptyCurrentDir, "package.json"));
    expect(pkg.name).toBe("in-place-app");
  });

  it("errors when directory is non-empty without --overwrite in --yes mode", async () => {
    const targetDir = path.join(tmpRoot, "conflict-app");
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, "existing.txt"), "old data");

    try {
      await execa(
        "node",
        [
          CLI_ENTRY,
          "conflict-app",
          "--type",
          "fe",
          "--dir",
          targetDir,
          "--no-install",
          "--no-git",
          "--yes",
        ],
        { cwd: tmpRoot },
      );
      expect.fail(
        "Should have failed due to non-empty directory without overwrite",
      );
    } catch (err: unknown) {
      const execaError = err as { exitCode?: number };
      expect(execaError.exitCode).not.toBe(0);
      expect(
        await fs.readFile(path.join(targetDir, "existing.txt"), "utf8"),
      ).toBe("old data");
    }
  });

  it("overwrites non-empty directory when --overwrite is passed", async () => {
    const targetDir = path.join(tmpRoot, "overwrite-app");
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, "old-file.txt"), "old content");

    const result = await execa(
      "node",
      [
        CLI_ENTRY,
        "overwrite-app",
        "--type",
        "fe",
        "--dir",
        targetDir,
        "--overwrite",
        "--no-install",
        "--no-git",
        "--yes",
      ],
      { cwd: tmpRoot },
    );

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(path.join(targetDir, "old-file.txt"))).toBe(
      false,
    );
    expect(await fs.pathExists(path.join(targetDir, "package.json"))).toBe(
      true,
    );
  });

  it("initializes git repository when --git is passed", async () => {
    const targetDir = path.join(tmpRoot, "git-test-app");

    const result = await execa(
      "node",
      [
        CLI_ENTRY,
        "git-test-app",
        "--type",
        "fe",
        "--dir",
        targetDir,
        "--git",
        "--no-install",
        "--yes",
      ],
      { cwd: tmpRoot },
    );

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(path.join(targetDir, ".git"))).toBe(true);

    const logRes = await execa("git", ["log", "-1", "--oneline"], {
      cwd: targetDir,
    });
    expect(logRes.exitCode).toBe(0);
    expect(logRes.stdout).toContain(
      "chore: initial scaffold from create-my-stack",
    );
  });
});
