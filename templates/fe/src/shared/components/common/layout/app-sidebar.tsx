'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
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
  useSidebar,
} from '@/shared/components/ui/sidebar'
import {
  IconCalendarNavigator,
  IconCatalogue,
  IconCustomerActivation,
  IconDashboards,
  IconEventNavigator,
  IconEventReporting,
  IconLogout,
  IconUserSettings,
} from '@/shared/components/common/icons'
import { clientLogout } from '@/lib/api'
import { useUserStore } from '@/shared/stores/use-user-store'

/** Strip separators and lowercase so BE key variations all match the same string.
 *  e.g. "reporting-tool", "reportingTool", "reporting_tool" → "reportingtool"
 */
const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]/g, '')

type NavItem = {
  href: string
  labelKey: string
  Icon: React.ComponentType<{ className?: string }>
  activeWhen?: string[]
  /** Always visible regardless of navbar — used for dashboards and settings */
  alwaysShow?: boolean
  /** Pre-normalized keys that match BE navbar values for this item */
  navbarKeys?: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboards',
    labelKey: 'dashboards',
    Icon: IconDashboards,
    navbarKeys: ['dashboard'],
  },
  {
    href: '/calendar-dashboard',
    labelKey: 'calendarDashboard',
    Icon: IconCalendarNavigator,
    activeWhen: ['/calendar-event-detail'],
    navbarKeys: ['calendar', 'event-calendar', 'calendar-dashboard'],
  },
  {
    href: '/events',
    labelKey: 'events',
    Icon: IconEventNavigator,
    activeWhen: ['/event-detail'],
    navbarKeys: ['event'],
  },
  {
    href: '/rent',
    labelKey: 'rent',
    Icon: IconCatalogue,
    navbarKeys: ['rent', 'event'],
  },
  {
    href: '/customer-activation',
    labelKey: 'customerActivation',
    Icon: IconCustomerActivation,
    activeWhen: ['/customer-activation'],
    navbarKeys: ['customer-activation', 'cam', 'customerActivation'],
  },
  {
    href: '/reporting-tool',
    labelKey: 'reportingTool',
    Icon: IconEventReporting,
    navbarKeys: ['reporting-tool', 'reporting', 'trade-fair'],
  },
  { href: '/user-settings', labelKey: 'userSettings', Icon: IconUserSettings, alwaysShow: true },
]

function isNavVisible(item: NavItem, navbar: string[] | null): boolean {
  if (item.alwaysShow) return true
  if (navbar === null) return true
  if (navbar.includes('*')) return true
  if (!item.navbarKeys) return true
  const normalizedNavbar = navbar.map(normalize)
  return item.navbarKeys.some((key) => normalizedNavbar.includes(normalize(key)))
}

type NavLabelKey = Parameters<ReturnType<typeof useTranslations<'navigation'>>>[0]

const MENU_BTN_CLS =
  'gap-2.5 rounded-sidebar-item! px-4 h-10 [&_svg]:size-5 text-sidebar-foreground/60 hover:text-sidebar-foreground data-active:bg-sidebar-primary data-active:font-bold data-active:text-sidebar-foreground'

export function AppSidebar() {
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const navbar = useUserStore((s) => s.navbar)

  const visibleItems = NAV_ITEMS.filter((item) => isNavVisible(item, navbar))

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-6 py-5">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={200}
            height={36}
            priority
            className="object-contain mx-auto w-50 h-auto"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {visibleItems.map(({ href, labelKey, Icon, activeWhen = [] }) => {
                const isActive =
                  pathname.startsWith(href) || activeWhen.some((p) => pathname.startsWith(p))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={isActive}
                      className={MENU_BTN_CLS}
                    >
                      <Link href={href} onClick={() => setOpenMobile(false)}>
                        <Icon className="size-5!" />
                        {tNav(labelKey as NavLabelKey)}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className={MENU_BTN_CLS} onClick={clientLogout}>
              <IconLogout />
              {tCommon('logout')}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
