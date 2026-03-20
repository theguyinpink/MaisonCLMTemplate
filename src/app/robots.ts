export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://app.maisonclm.fr/sitemap.xml",
  };
}