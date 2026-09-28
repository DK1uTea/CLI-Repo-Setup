import { redirect } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: 'en' | 'de' }> };

export default async function page({ params }: Props) {
    const { locale } = await params;
    redirect({ href: '/events', locale });
}
