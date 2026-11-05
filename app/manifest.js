export default function manifest() {
  return {
    id: '/',
    name: 'Namaste Alma · Chwila dla siebie',
    short_name: 'Namaste Alma',
    lang: 'pl',
    description: 'Codzienny rytuał uważności i refleksji.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f4ed',
    theme_color: '#f8f4ed',
    icons: [
      { src: '/namaste-alma-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/namaste-alma-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
