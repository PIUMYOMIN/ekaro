import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  image = "/og-image.png",
  url = "",
  type = "website",
  schema = null,
  alternateUrls = {},
  noindex = false,
}) => {

  const siteUrl =
    import.meta.env.VITE_APP_URL || "http://localhost:5173";

  const fullTitle = title
    ? title.includes("Pyonea")
      ? title
      : `${title} | Pyonea`
    : "Pyonea Marketplace";

  const absoluteImage = image.startsWith("http")
    ? image
    : `${siteUrl}${image}`;

  const absoluteUrl = url.startsWith("http")
    ? url
    : `${siteUrl}${url}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={absoluteUrl} />

      {/* hreflang */}
      {Object.entries(alternateUrls).map(([lang, href]) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={href}
        />
      ))}

      <link
        rel="alternate"
        hrefLang="x-default"
        href={alternateUrls.en || siteUrl}
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:site_name" content="Pyonea" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* noindex */}
      {noindex && (
        <meta name="robots" content="noindex,nofollow" />
      )}

      {/* JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;