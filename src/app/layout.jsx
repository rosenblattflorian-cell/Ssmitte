export const metadata = {
  title: "Solar Lead App",
  description: "MVP for lead scoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
