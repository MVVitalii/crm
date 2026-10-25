import { WorkspaceChrome } from '@/components/workspace-chrome';
import { getCopy } from '@/i18n/locale';
import { requireMember } from '@/server/tenant';

import { OrgNav } from './org-nav';

export const instant = false;

export default async function OrgLayout({ children, params }: LayoutProps<'/[orgSlug]'>) {
  const { orgSlug } = await params;
  const { organization } = await requireMember(orgSlug);
  const { dictionary } = await getCopy();

  return (
    <WorkspaceChrome
      title={organization.name}
      back={{ href: '/', label: dictionary.home.back }}
      navBar={<OrgNav orgSlug={orgSlug} placement="bar" />}
      navSidebar={<OrgNav orgSlug={orgSlug} placement="sidebar" />}
    >
      {children}
    </WorkspaceChrome>
  );
}
