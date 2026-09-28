import PolicyMain from "@/features/policy/(components)/policy-main";
import NotFoundPage from "../../[...not-found]/not-found";

interface PageProps {
  params: Promise<{
    policy: string;
  }>
}

const PolicyPage = async ({ params }: PageProps) => {
  const { policy } = await params;

  const isPolicyPage =
    policy === 'privacy-policy' ||
    policy === 'support' ||
    policy === 'impressum' ||
    policy === 'datenschutz' ||
    policy === 'agb';

  if (!isPolicyPage) {
    return <NotFoundPage />
  }

  return <PolicyMain policy={policy} />;
}

export default PolicyPage;