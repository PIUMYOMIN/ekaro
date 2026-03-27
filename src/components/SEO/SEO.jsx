import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  image,
  url = "",
  type = "website",
  schema = null,
  alternateUrls = {},
  noindex = false,
  locale = "en_US",
}) => {

  const siteUrl =
    import.meta.env.VITE_APP_URL || "https://pyonea.com";

  const safeImage = (image != null && image !== "") ? image : "/og-image.png";
  const safeUrl   = url ?? "";

  const fullTitle = title
    ? title.includes("Pyonea")
      ? title
      : `${title} | Pyonea`
    : "Pyonea Marketplace";

  const absoluteImage = safeImage.startsWith("http")
    ? safeImage
    : `${siteUrl}${safeImage}`;

  const absoluteUrl = safeUrl.startsWith("http")
    ? safeUrl
    : `${siteUrl}${safeUrl}`;

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
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@PyoneaMarket" />
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