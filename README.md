# create-my-stack

CLI scaffolding viết bằng **TypeScript** để khởi tạo nhanh các dự án **Frontend** (Next.js 16 + React 19 + Tailwind v4) hoặc **Backend** (NestJS 11 Monorepo + Prisma 7 + TimescaleDB/PostgreSQL + Redis) từ 2 bộ template chuẩn hóa, tích hợp sẵn hệ thống **AI Rules** (AGENTS.md, CLAUDE.md, skills) và hạ tầng kiểm thử (Vitest, Jest, Playwright).

---

## 🚀 Cách chạy Local

### Cách 1: Chạy trực tiếp qua Node

Sau khi build dự án:
```bash
# 1. Cài đặt dependencies và build CLI
pnpm install
pnpm build

# 2. Chạy trực tiếp
node dist/index.js
# hoặc truyền flags
node dist/index.js my-app --type fe --dir ./my-app --pm pnpm
```

### Cách 2: Link toàn cục bằng `pnpm link`

```bash
# Đăng ký link global
pnpm link --global

# Chạy ở bất kỳ thư mục nào trên máy
create-my-stack
# hoặc
create-my-stack my-app --type fe
```

*(Để hủy link sau này: `pnpm unlink --global create-my-stack`)*

---

## 📋 Danh sách Tham số & Flags

CLI hỗ trợ cả hai chế độ: **Interactive (hỏi đáp trực quan bằng `@clack/prompts`)** và **Non-interactive (flags qua `cac`)**.

```bash
create-my-stack [project-name] [options]
```

| Flag | Mô tả | Mặc định |
|---|---|---|
| `[project-name]` | Tên project (hỗ trợ scope `@org/name`, validate theo npm standard) | Prompt nếu thiếu |
| `--type <fe\|be>` | Loại dự án: `fe` (Frontend Next.js) hoặc `be` (Backend NestJS) | Prompt nếu thiếu |
| `--dir <path>` | Đường dẫn thư mục đích (hỗ trợ `.`, relative, absolute) | `./<project-name>` |
| `--pm <pm>` | Package manager: `pnpm`, `npm`, `yarn`, `bun` | Auto-detect từ user agent |
| `--git` / `--no-git` | Có khởi tạo Git repository và commit ban đầu hay không | `true` (Prompt nếu thiếu) |
| `--install` / `--no-install` | Có tự động chạy `install dependencies` sau khi scaffold hay không | `true` (Prompt nếu thiếu) |
| `--latest` / `--no-latest` | Có nâng cấp toàn bộ dependencies lên bản mới nhất hay không | `true` (Prompt nếu thiếu) |
| `--overwrite` | Tự động xóa sạch nội dung cũ nếu thư mục đích tồn tại và không rỗng | Prompt `Cancel/Overwrite/Merge` |
| `-y`, `--yes` | Sử dụng toàn bộ giá trị mặc định, không hiện prompt | `false` |
| `-h`, `--help` | Hiển thị bảng trợ giúp | |
| `-v`, `--version` | Hiển thị phiên bản CLI hiện tại | |

### Ví dụ lệnh không tương tác (CI / Automation):

```bash
# Tạo dự án Frontend nhanh, không prompt, không cài deps, không git
create-my-stack dashboard --type fe --pm pnpm --no-install --no-git --yes

# Tạo dự án Backend vào thư mục hiện tại và ghi đè nếu có file cũ
create-my-stack core-api --type be --dir . --pm pnpm --overwrite --yes
```

---

## 🛡️ Cơ chế Fallback khi chọn `--latest`

- Khi bật tùy chọn nâng cấp dependencies lên bản mới nhất (`--latest`), CLI sẽ chạy lệnh cập nhật tương ứng với Package Manager đã chọn (`pnpm up --latest`, `npm-check-updates -u && npm install`, `yarn up`, `bun update`).
- **An toàn**: CLI tự động tạo bản sao lưu của `package.json` trước khi nâng cấp. Nếu có xung đột phiên bản (breaking changes / peer dependency conflict) khiến lệnh nâng cấp thất bại:
  1. CLI tự động khôi phục lại `package.json` gốc từ template.
  2. Tự động chạy lại lệnh `install` tiêu chuẩn.
  3. In cảnh báo rõ ràng và tiếp tục hoàn tất quá trình khởi tạo dự án mà không làm gián đoạn hay hỏng project.

---

## 🔄 Cách cập nhật Template khi 2 Repo gốc thay đổi

Khi repo gốc Frontend (`D:\Bavaan\mep-dashboard-fe`) hoặc Backend (`D:\Bavaan\protrack-backend-api`) có cập nhật kiến trúc hoặc tính năng mới, bạn có thể đồng bộ lại các template trong thư mục `templates/` thông qua script tự động:

```bash
node scripts/prepare-templates.mjs
```

Script này tự động:
1. Đọc và lọc sạch toàn bộ: `node_modules`, `.git`, `.next`, `dist`, `.env` thật (chỉ giữ `.env.example`), logs, cache cá nhân (`.omc`, `.playwright-mcp`), build info (`*.tsbuildinfo`).
2. Tự động đổi tên `.gitignore` thành `_gitignore` (tránh lỗi đóng gói npm).
3. Đặt lại các biến placeholder `{{projectName}}`, `{{sanitizedProjectName}}`, `{{projectNameTitle}}`, `{{projectNameDb}}` vào `package.json`, `nest-cli.json`, `docker-compose.yml`, Swagger, README.
4. Đổi tên thư mục app chính trong Monorepo BE thành `apps/__projectName__`.

Sau khi cập nhật template, chạy lại build và test:
```bash
pnpm build
pnpm test
```

---

## 🧪 Các script phát triển & Kiểm thử

- `pnpm dev`: Chạy tsup watcher để live-rebuild mã nguồn CLI khi code.
- `pnpm build`: Build bundle ESM bằng tsup ra `dist/index.js`.
- `pnpm typecheck`: Kiểm tra TypeScript strict type.
- `pnpm lint`: Chạy ESLint kiểm tra quy chuẩn mã nguồn.
- `pnpm format`: Chạy Prettier định dạng code.
- `pnpm test`: Chạy toàn bộ Unit test và E2E test nhanh (Vitest).
- `pnpm test:e2e`: Chạy riêng bộ E2E test.
- `pnpm test:full`: Chạy bộ E2E test chuyên sâu (scaffold thật, `pnpm install` và `pnpm build` cả 2 repo mẫu).
