import fs from 'fs-extra';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const FE_SRC = 'D:\\Bavaan\\mep-dashboard-fe';
const BE_SRC = 'D:\\Bavaan\\protrack-backend-api';
const FE_DEST = path.join(ROOT_DIR, 'templates', 'fe');
const BE_DEST = path.join(ROOT_DIR, 'templates', 'be');

const COMMON_EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.env',
  '.env.local',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  'coverage',
  '.DS_Store',
  'Thumbs.db',
];

function shouldExclude(srcPath, relPath, isFE) {
  const parts = relPath.split(/[\\/]/);
  const base = path.basename(srcPath);

  for (const part of parts) {
    if (COMMON_EXCLUDES.includes(part)) return true;
    if (part === '.husky' && parts.includes('_')) return true;
    if (part === '.omc' && (parts.includes('sessions') || parts.includes('state'))) return true;
  }

  if (base.endsWith('.tsbuildinfo')) return true;
  if (base.startsWith('.env.') && base.endsWith('.local')) return true;
  if (base === '.env') return true;

  if (isFE) {
    if (parts.includes('.playwright-mcp')) return true;
    if (parts.includes('.playwright-cli')) return true;
    if (parts.includes('playwright-report')) return true;
    if (parts.includes('test-results')) return true;
    if (parts.includes('src') && parts.includes('.omc')) return true;
    if (parts.includes('.omc')) return true;
    if (parts.includes('.vscode') && base !== 'mcp.json') return true;
  }

  return false;
}

async function copyRepo(srcDir, destDir, isFE) {
  console.log(`Copying base files from ${srcDir} to ${destDir}...`);
  await fs.remove(destDir);
  await fs.ensureDir(destDir);

  await fs.copy(srcDir, destDir, {
    filter: (src) => {
      const rel = path.relative(srcDir, src);
      if (!rel) return true;
      return !shouldExclude(src, rel, isFE);
    },
  });

  const gitignorePath = path.join(destDir, '.gitignore');
  if (await fs.pathExists(gitignorePath)) {
    await fs.move(gitignorePath, path.join(destDir, '_gitignore'), { overwrite: true });
    console.log(`Renamed .gitignore -> _gitignore in ${destDir}`);
  }

  const npmrcPath = path.join(destDir, '.npmrc');
  if (await fs.pathExists(npmrcPath)) {
    await fs.move(npmrcPath, path.join(destDir, '_npmrc'), { overwrite: true });
    console.log(`Renamed .npmrc -> _npmrc in ${destDir}`);
  }
}

async function cleanFE() {
  console.log('Sanitizing and creating clean base for FE...');

  const pkgPath = path.join(FE_DEST, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = '{{projectName}}';
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    console.log('Updated FE package.json with {{projectName}}');
  }

  const dockerMd = path.join(FE_DEST, 'DOCKER.md');
  if (await fs.pathExists(dockerMd)) {
    let content = await fs.readFile(dockerMd, 'utf8');
    content = content.replace(/mep-dashboard-fe/g, '{{projectName}}');
    await fs.writeFile(dockerMd, content, 'utf8');
  }

  // Remove MEP domain features
  const featuresToRemove = [
    'calendar',
    'cam',
    'events',
    'policy',
    'rent',
    'reporting-tool',
    'user-settings',
  ];
  for (const feat of featuresToRemove) {
    const featDir = path.join(FE_DEST, 'src', 'features', feat);
    if (await fs.pathExists(featDir)) {
      await fs.remove(featDir);
      console.log(`Removed FE domain feature: ${feat}`);
    }
  }

  // Create clean starter dashboard feature
  const dashboardDir = path.join(FE_DEST, 'src', 'features', 'dashboard');
  await fs.emptyDir(dashboardDir);

  const dashboardContext = `# Dashboard Feature Context

Starter dashboard module demonstrating standard architecture conventions:
- \`(components)/\`: UI components for dashboard
- \`(hooks)/\`: Custom React hooks for data fetching & state
- \`CONTEXT.md\`: Business rules & module boundaries
`;
  await fs.writeFile(path.join(dashboardDir, 'CONTEXT.md'), dashboardContext, 'utf8');

  const componentsDir = path.join(dashboardDir, '(components)');
  await fs.ensureDir(componentsDir);

  const dashboardMainTsx = `'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Sparkles, Code2, ShieldCheck, Terminal } from 'lucide-react';

export default function DashboardMain() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Starter Base
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Welcome to your new Next.js 16 + React 19 + Tailwind CSS v4 application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Framework</CardTitle>
            <Sparkles className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Next.js 16</div>
            <p className="text-xs text-muted-foreground mt-1">App Router + React 19</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Styling</CardTitle>
            <Code2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tailwind v4</div>
            <p className="text-xs text-muted-foreground mt-1">Radix Nova + Shadcn UI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Rules</CardTitle>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AGENTS.md</div>
            <p className="text-xs text-muted-foreground mt-1">CLAUDE.md + Agent Skills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Testing</CardTitle>
            <Terminal className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Vitest + E2E</div>
            <p className="text-xs text-muted-foreground mt-1">Playwright configured</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            You can start developing new modules under <code className="font-mono text-primary">src/features/&lt;module&gt;</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Follow the architectural playbook in <code className="font-mono">CLAUDE.md</code> and <code className="font-mono">AGENTS.md</code> to build scalable, accessible, and type-safe features.
          </p>
          <div className="flex gap-3">
            <Button size="sm">Create New Feature</Button>
            <Button size="sm" variant="outline">View Architecture Docs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;
  await fs.writeFile(path.join(componentsDir, 'dashboard-main.tsx'), dashboardMainTsx, 'utf8');

  // Clean up private routes
  const privateDir = path.join(FE_DEST, 'src', 'app', '[locale]', '(private)');
  const privateRoutesToRemove = [
    'calendar-dashboard',
    'calendar-event-detail',
    'customer-activation',
    'event-detail',
    'events',
    'rent',
    'reporting-tool',
    'user-settings',
  ];
  for (const route of privateRoutesToRemove) {
    const routeDir = path.join(privateDir, route);
    if (await fs.pathExists(routeDir)) {
      await fs.remove(routeDir);
      console.log(`Removed FE private route: ${route}`);
    }
  }

  // Ensure clean dashboards page
  const dashboardsDir = path.join(privateDir, 'dashboards');
  await fs.ensureDir(dashboardsDir);
  const dashboardsPageTsx = `import DashboardMain from '@/features/dashboard/(components)/dashboard-main';

export default function DashboardPage() {
  return <DashboardMain />;
}
`;
  await fs.writeFile(path.join(dashboardsDir, 'page.tsx'), dashboardsPageTsx, 'utf8');

  // Add clean [locale]/page.tsx redirecting to /dashboards
  const localeRootPage = path.join(FE_DEST, 'src', 'app', '[locale]', 'page.tsx');
  const localeRootTsx = `import { redirect } from 'next/navigation';

export default function LocaleIndexPage() {
  redirect('/dashboards');
}
`;
  await fs.writeFile(localeRootPage, localeRootTsx, 'utf8');

  // Clean (private)/layout.tsx
  const privateLayoutPath = path.join(privateDir, 'layout.tsx');
  if (await fs.pathExists(privateLayoutPath)) {
    const cleanPrivateLayout = `import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppFooter } from '@/shared/components/common/layout/app-footer';
import { AppSidebar } from '@/shared/components/common/layout/app-sidebar';
import { AppHeader } from '@/shared/components/common/layout/app-header';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-w-0 min-h-screen">
        <AppHeader />
        <div className="p-6 flex-1">{children}</div>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
`;
    await fs.writeFile(privateLayoutPath, cleanPrivateLayout, 'utf8');
  }

  // Clean app-sidebar.tsx
  const sidebarPath = path.join(
    FE_DEST,
    'src',
    'shared',
    'components',
    'common',
    'layout',
    'app-sidebar.tsx',
  );
  if (await fs.pathExists(sidebarPath)) {
    const cleanSidebar = `'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/shared/components/ui/sidebar';
import { LayoutDashboard, Settings } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/dashboards',
    label: 'Dashboard',
    Icon: LayoutDashboard,
  },
  {
    href: '/settings',
    label: 'Settings',
    Icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <span className="truncate">{{projectNameTitle}}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
        <div className="truncate">v0.1.0</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
`;
    await fs.writeFile(sidebarPath, cleanSidebar, 'utf8');
  }

  // Remove api proxies
  const apiProxiesToRemove = ['proxy-download', 'proxy-image'];
  for (const proxy of apiProxiesToRemove) {
    const proxyDir = path.join(FE_DEST, 'src', 'app', 'api', proxy);
    if (await fs.pathExists(proxyDir)) {
      await fs.remove(proxyDir);
      console.log(`Removed FE api route: ${proxy}`);
    }
  }

  // Clean up legacy feature tests
  const testFeaturesDir = path.join(FE_DEST, 'tests', 'features');
  if (await fs.pathExists(testFeaturesDir)) {
    const testDirsToRemove = ['calendar', 'cam', 'events', 'rent', 'reporting-tool', 'user-settings'];
    for (const t of testDirsToRemove) {
      await fs.remove(path.join(testFeaturesDir, t));
    }
    console.log('Cleaned up legacy feature tests from FE tests/');
  }

  // Clean up specs in docs/
  const specsDir = path.join(FE_DEST, 'docs', 'specs');
  if (await fs.pathExists(specsDir)) {
    await fs.remove(specsDir);
    await fs.ensureDir(specsDir);
    await fs.writeFile(
      path.join(specsDir, 'README.md'),
      '# Module Specs\n\nStore feature specifications here following spec-driven-development.\n',
      'utf8',
    );
  }
}

async function cleanBE() {
  console.log('Sanitizing and creating clean base for BE...');

  // Update package.json
  const bePkgPath = path.join(BE_DEST, 'package.json');
  if (await fs.pathExists(bePkgPath)) {
    const pkg = await fs.readJson(bePkgPath);
    pkg.name = '{{projectName}}';
    pkg.scripts['start:prod'] = 'node dist/apps/{{sanitizedProjectName}}/main';
    pkg.scripts['dev:api'] = 'nest start {{sanitizedProjectName}} --watch';
    pkg.scripts['test:e2e'] = 'jest --config ./apps/{{sanitizedProjectName}}/test/jest-e2e.json';
    delete pkg.scripts['dev:tcp-server'];
    delete pkg.scripts['dev:worker'];
    await fs.writeJson(bePkgPath, pkg, { spaces: 2 });
    console.log('Cleaned BE package.json');
  }

  // Remove GPS apps: tcp-server and worker
  const tcpServerDir = path.join(BE_DEST, 'apps', 'tcp-server');
  if (await fs.pathExists(tcpServerDir)) {
    await fs.remove(tcpServerDir);
    console.log('Removed BE apps/tcp-server');
  }

  const workerDir = path.join(BE_DEST, 'apps', 'worker');
  if (await fs.pathExists(workerDir)) {
    await fs.remove(workerDir);
    console.log('Removed BE apps/worker');
  }

  // Rename apps/protrack-backend-api -> apps/__projectName__
  const oldAppDir = path.join(BE_DEST, 'apps', 'protrack-backend-api');
  const newAppDir = path.join(BE_DEST, 'apps', '__projectName__');
  if (await fs.pathExists(oldAppDir)) {
    await fs.move(oldAppDir, newAppDir, { overwrite: true });
    console.log('Renamed apps/protrack-backend-api -> apps/__projectName__');
  }

  // Remove GPS modules from apps/__projectName__/src/modules
  const beModulesDir = path.join(BE_DEST, 'apps', '__projectName__', 'src', 'modules');
  const beModulesToRemove = ['analytics', 'devices', 'events', 'positions', 'settings', 'upload'];
  for (const mod of beModulesToRemove) {
    const modDir = path.join(beModulesDir, mod);
    if (await fs.pathExists(modDir)) {
      await fs.remove(modDir);
      console.log(`Removed BE module: ${mod}`);
    }
  }

  // Update modules/index.ts
  const modulesIndex = `export * from './auth/auth.module';
export * from './users/users.module';
export * from './tenants/tenants.module';
`;
  await fs.writeFile(path.join(beModulesDir, 'index.ts'), modulesIndex, 'utf8');

  // Update app.module.ts in apps/__projectName__/src
  const appModulePath = path.join(BE_DEST, 'apps', '__projectName__', 'src', 'app.module.ts');
  const cleanAppModule = `import {
  appConfiguration,
  appSchema,
  HttpExceptionFilter,
  ResponseInterceptor,
  RolesGuard,
  redisConfiguration,
  redisSchema,
  SerializerInterceptor,
} from '@app/core';
import { CacheModule, PrismaModule } from '@app/third-party';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import { AuthModule, TenantsModule, UsersModule } from './modules';
import { JwtAuthGuard } from './modules/auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...appSchema,
        ...redisSchema,
      }),
      load: [appConfiguration, redisConfiguration],
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    TenantsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
`;
  await fs.writeFile(appModulePath, cleanAppModule, 'utf8');

  // Clean libs/layer-data
  const layerDataSrc = path.join(BE_DEST, 'libs', 'layer-data', 'src');
  const layerDataToRemove = ['analytics', 'devices', 'events', 'positions', 'settings'];
  for (const ld of layerDataToRemove) {
    const ldDir = path.join(layerDataSrc, ld);
    if (await fs.pathExists(ldDir)) {
      await fs.remove(ldDir);
      console.log(`Removed layer-data: ${ld}`);
    }
  }

  const layerDataIndex = `export * from './tenants';
export * from './users';
`;
  await fs.writeFile(path.join(layerDataSrc, 'index.ts'), layerDataIndex, 'utf8');

  // Clean prisma models: remove GPS device models
  const prismaModelsDir = path.join(BE_DEST, 'prisma', 'models');
  const prismaModelsToRemove = [
    'command.prisma',
    'device.prisma',
    'event.prisma',
    'geofence.prisma',
    'position.prisma',
    'setting.prisma',
  ];
  for (const model of prismaModelsToRemove) {
    const modelPath = path.join(prismaModelsDir, model);
    if (await fs.pathExists(modelPath)) {
      await fs.remove(modelPath);
      console.log(`Removed prisma model: ${model}`);
    }
  }

  // Update user.prisma to remove DeviceCommand relation
  const userPrismaPath = path.join(prismaModelsDir, 'user.prisma');
  if (await fs.pathExists(userPrismaPath)) {
    let userPrisma = await fs.readFile(userPrismaPath, 'utf8');
    userPrisma = userPrisma.replace(/\s+requestedCommands\s+DeviceCommand\[\][^\n]*/g, '');
    await fs.writeFile(userPrismaPath, userPrisma, 'utf8');
  }

  // Update tenant.prisma to remove GPS device relations
  const tenantPrismaPath = path.join(prismaModelsDir, 'tenant.prisma');
  if (await fs.pathExists(tenantPrismaPath)) {
    const cleanTenantPrisma = `model Tenant {
  id        String   @id @default(cuid()) @db.VarChar(30)
  name      String   @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users     User[]

  @@map("pt_tenants")
}
`;
    await fs.writeFile(tenantPrismaPath, cleanTenantPrisma, 'utf8');
  }

  // Update nest-cli.json
  const nestCliPath = path.join(BE_DEST, 'nest-cli.json');
  if (await fs.pathExists(nestCliPath)) {
    let content = await fs.readFile(nestCliPath, 'utf8');
    content = content.replace(/apps\/protrack-backend-api/g, 'apps/{{sanitizedProjectName}}');
    content = content.replace(/"protrack-backend-api":/g, '"{{sanitizedProjectName}}":');
    content = content.replace(/apps\/\{\{projectName\}\}/g, 'apps/{{sanitizedProjectName}}');
    content = content.replace(/"\{\{projectName\}\}":/g, '"{{sanitizedProjectName}}":');
    await fs.writeFile(nestCliPath, content, 'utf8');

    const nestCli = await fs.readJson(nestCliPath);
    delete nestCli.projects['tcp-server'];
    delete nestCli.projects['worker'];
    await fs.writeJson(nestCliPath, nestCli, { spaces: 2 });
    console.log('Cleaned nest-cli.json');
  }

  // Update docker-compose.yml
  const composePath = path.join(BE_DEST, 'docker-compose.yml');
  if (await fs.pathExists(composePath)) {
    const cleanCompose = `x-database-url: &database-url
  postgresql://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB:-{{projectNameDb}}}

services:
  db:
    image: timescale/timescaledb-ha:pg16
    container_name: {{sanitizedProjectName}}-timescaledb
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-{{projectNameDb}}}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres123456}
    ports:
      - '\${DB_PORT:-5432}:5432'
    volumes:
      - timescale_data:/home/postgres/pgdata/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U \${POSTGRES_USER:-postgres} -d \${POSTGRES_DB:-{{projectNameDb}}}']
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  redis:
    image: redis:7-alpine
    container_name: {{sanitizedProjectName}}-redis
    restart: unless-stopped
    ports:
      - '\${REDIS_PORT:-6379}:6379'
    volumes:
      - redis_data:/data
    command: redis-server --save 60 1 --loglevel warning
    healthcheck:
      test: ['CMD-SHELL', 'redis-cli ping']
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 5s

  migrate:
    image: {{sanitizedProjectName}}/migrate:latest
    build:
      context: .
      dockerfile: apps/{{sanitizedProjectName}}/Dockerfile
      target: migrator
    container_name: {{sanitizedProjectName}}-migrate
    environment:
      DATABASE_URL: *database-url
    depends_on:
      db:
        condition: service_healthy
    restart: 'no'

  api:
    image: {{sanitizedProjectName}}/api:latest
    build:
      context: .
      dockerfile: apps/{{sanitizedProjectName}}/Dockerfile
      target: runner
    container_name: {{sanitizedProjectName}}-api
    restart: unless-stopped
    ports:
      - '\${API_PORT:-3000}:3000'
    env_file: .env
    environment:
      NODE_ENV: production
      DATABASE_URL: *database-url
      REDIS_HOST: redis
    depends_on:
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_healthy

volumes:
  timescale_data:
  redis_data:
`;
    await fs.writeFile(composePath, cleanCompose, 'utf8');
    console.log('Cleaned BE docker-compose.yml');
  }

  // Update swagger.util.ts
  const swaggerUtilPath = path.join(BE_DEST, 'libs', 'core', 'src', 'utils', 'swagger.util.ts');
  if (await fs.pathExists(swaggerUtilPath)) {
    let content = await fs.readFile(swaggerUtilPath, 'utf8');
    content = content.replace(/Protrack Backend API/g, '{{projectNameTitle}} API');
    content = content.replace(/API documentation for Protrack backend/g, 'API documentation for {{projectNameTitle}}');
    await fs.writeFile(swaggerUtilPath, content, 'utf8');
  }

  // Update .env.example
  const envExamplePath = path.join(BE_DEST, '.env.example');
  if (await fs.pathExists(envExamplePath)) {
    let content = await fs.readFile(envExamplePath, 'utf8');
    content = content.replace(/REDIS_KEY_PREFIX=protrack/g, 'REDIS_KEY_PREFIX={{sanitizedProjectName}}');
    content = content.replace(/POSTGRES_DB=protrack/g, 'POSTGRES_DB={{projectNameDb}}');
    content = content.replace(/localhost:5432\/protrack/g, 'localhost:5432/{{projectNameDb}}');
    await fs.writeFile(envExamplePath, content, 'utf8');
  }

  // Rename skill folder
  const oldSkillDir = path.join(BE_DEST, '.claude', 'skills', 'protrack-engineering-playbook');
  const newSkillDir = path.join(BE_DEST, '.claude', 'skills', 'engineering-playbook');
  if (await fs.pathExists(oldSkillDir)) {
    await fs.move(oldSkillDir, newSkillDir, { overwrite: true });
    const skillMd = path.join(newSkillDir, 'SKILL.md');
    if (await fs.pathExists(skillMd)) {
      let content = await fs.readFile(skillMd, 'utf8');
      content = content.replace(/name: protrack-engineering-playbook/g, 'name: engineering-playbook');
      content = content.replace(/Protrack Engineering Playbook/g, 'Engineering Playbook');
      await fs.writeFile(skillMd, content, 'utf8');
    }
  }

  // Update BE CLAUDE.md
  const claudeMdPath = path.join(BE_DEST, 'CLAUDE.md');
  if (await fs.pathExists(claudeMdPath)) {
    let claudeMd = await fs.readFile(claudeMdPath, 'utf8');
    claudeMd = claudeMd.replace(
      /# CLAUDE\.md — Protrack Backend API[\s\S]*?## Tech Stack/,
      `# CLAUDE.md — Backend API Starter (NestJS Monorepo)

Đọc toàn bộ file này trước khi thực hiện bất kỳ thay đổi nào.

---

## Tổng quan dự án

Template Backend REST API chuẩn doanh nghiệp, xây dựng theo kiến trúc **NestJS Monorepo** với **Service/Repository Pattern**, hỗ trợ **Multi-tenancy**, **Prisma ORM**, **PostgreSQL/TimescaleDB**, và **Redis Cache**.

- Toàn bộ truy cập database phải thông qua repository interface trong \`@app/layer-data\`.
- Controllers chỉ làm nhiệm vụ dispatch và serialize, không chứa business logic.
- Services xử lý nghiệp vụ, gọi qua Repositories.
- Tuân thủ quy ước DTO validation, HTTP response format chuẩn và mã lỗi Api*HttpError.

---

## Tech Stack`,
    );
    claudeMd = claudeMd.replace(/│\s+└── tcp-server\/[\s\S]*?apps\/worker\/tsconfig\.app\.json/g, '');
    await fs.writeFile(claudeMdPath, claudeMd, 'utf8');
  }
}

async function main() {
  await copyRepo(FE_SRC, FE_DEST, true);
  await cleanFE();

  await copyRepo(BE_SRC, BE_DEST, false);
  await cleanBE();

  console.log('Templates preparation and base refinement completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
