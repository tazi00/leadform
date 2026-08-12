import "./globals.css";

export const metadata = {
  title: "Lead Form",
  description: "Contact form with admin panel and Google Sheets export",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
