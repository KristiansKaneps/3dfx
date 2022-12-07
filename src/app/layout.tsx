import {type ReactNode} from 'react';

import '@styles/globals.scss';

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html>
      <head />
      <body>{children}</body>
    </html>
  );
}
