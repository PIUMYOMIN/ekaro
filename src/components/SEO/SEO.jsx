import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  image = "/og-image.jpg",
  url,
  type = "website",
  schema = null,
  alternateUrls = {},
  noindex = false,
}) => {
  // Append brand name if not already present
  const fullTitle = title.includes("Pyonea") ? title : `${title} | Pyonea`;
  const siteUrl = "https://pyonea.com";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* hreflang */}
      {Object.entries(alternateUrls).map(([lang, href]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={alternateUrls.en || siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* noindex if requested (e.g., error pages) */}
      {noindex && <meta name="robots" content="noindex" />}

      {/* JSON‑LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;