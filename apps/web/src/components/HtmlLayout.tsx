import React from 'react';
import Script from 'next/script';

interface HtmlLayoutProps {
  children: React.ReactNode;
  lang?: string;
  className?: string;
  bodyClassName?: string;
}

export function HtmlLayout({ 
  children, 
  lang = "en", 
  className = "",
  bodyClassName = "font-mono antialiased" 
}: HtmlLayoutProps) {
  return (
    <html lang={lang} className={className} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lukas" />
        <meta name="application-name" content="Lukas" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              const theme = localStorage.getItem('theme') || 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className={bodyClassName} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
