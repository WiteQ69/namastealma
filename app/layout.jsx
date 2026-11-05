import './fonts.css';
import './styles.css';

export const metadata = {
  title: 'Namaste Alma · Chwila dla siebie',
  description: 'Twój codzienny rytuał uważności, refleksji i powrotu do siebie.',
  icons: { icon: '/namaste-alma.png', apple: '/namaste-alma-192.png' },
  appleWebApp: { capable: true, title: 'Namaste Alma', statusBarStyle: 'default' },
};

export const viewport = { themeColor: '#f8f4ed', viewportFit: 'cover' };

export default function Layout({ children }) {
  return <html lang="pl"><body>{children}</body></html>;
}
