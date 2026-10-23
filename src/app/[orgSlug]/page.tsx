import { PageHeader, Panel } from '@/components/page';
import { getCopy } from '@/i18n/locale';

export const instant = false;

export default async function OrgPage() {
  const { dictionary } = await getCopy();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title={dictionary.org.title} description={dictionary.org.open} />
      <Panel>
        <p className="text-sm text-muted-foreground">{dictionary.org.hint}</p>
      </Panel>
    </div>
  );
}
