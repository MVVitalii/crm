import type { Metadata } from 'next';
import { Onest } from 'next/font/google';

import { I18nProvider } from '@/components/i18n-provider';
import { PressFeedback } from '@/components/press-feedback';
import { themeBootScript } from '@/components/theme';
import { getDictionary } from '@/i18n/dictionary';
import { getLocale } from '@/i18n/locale';

import './globals.css';

const sans = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
});

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getLocale());
  return {
    metadataBase: new URL('https://crm-mvvitaliis-projects.vercel.app'),
    title: 'CRM',
    description: dictionary.metaDescription,
    openGraph: {
      type: 'website',
      title: 'Mini CRM: Next.js + PostgreSQL',
      description:
        'Multi-tenant CRM with organizations, roles, a drag-and-drop deal board and an audit log.',
      images: [{ url: '/og.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={`${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <PressFeedback />
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
