import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO/SEO";

const routeConfig = {
  "/": { type: "website", key: "home" },
  "/products": { type: "website", key: "products" },
  "/sellers": { type: "website", key: "sellers" },
  "/categories": { type: "website", key: "categories" },
  "/login": { type: "website", key: "auth" },
  "/register": { type: "website", key: "auth" },
  "/forgot-password": { type: "website", key: "auth" },
};

const useSEO = ({ title, description, image, schema, url: customUrl, data = {}, noindex = false } = {}) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Determine page type based on path
  let pageKey = "default";
  if (location.pathname === "/") pageKey = "home";
  else if (location.pathname.startsWith("/products/")) pageKey = "product";
  else if (location.pathname.startsWith("/categories")) pageKey = "category";
  else if (location.pathname.startsWith("/sellers/")) pageKey = "seller";
  else if (location.pathname.match(/^\/(login|register|forgot-password)/)) pageKey = "auth";
  else if (location.pathname === "/products") pageKey = "products";
  else if (location.pathname === "/sellers") pageKey = "sellers";
  else if (location.pathname === "/categories") pageKey = "categories";

  // Build title from i18n + data
  const defaultTitle = t(`seo.${pageKey}.title`, data);
  const finalTitle = title || defaultTitle;

  const defaultDescription = t(`seo.${pageKey}.description`, data);
  const finalDescription = description || defaultDescription;

  // Construct alternate URLs (assuming no language prefix in URL – adjust if needed)
  const baseUrl = "https://pyonea.com";

  // Canonical URL — use caller-supplied override when available, else derive from location
  const currentPath = location.pathname + location.search;
  const resolvedUrl = customUrl
    ? (customUrl.startsWith('http') ? customUrl : `${baseUrl}${customUrl}`)
    : `${baseUrl}${currentPath}`;

  // Alternate hreflang URLs
  const alternateUrls = {};
  ['en', 'my'].forEach(lang => {
    alternateUrls[lang] = resolvedUrl;
  });

  // OG type: product pages get "product" (extended), everything else "website"
  const ogType = pageKey === 'product' ? 'website' : (routeConfig[location.pathname]?.type || 'website');

  let schemaData = schema;

  if (!schemaData && pageKey === "product" && data.name) {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: data.name,
      description: description,
      image: image,
    };
  }

  const locale = i18n.language === 'my' ? 'my_MM' : 'en_US';

  return (
    <SEO
      title={finalTitle}
      description={finalDescription}
      image={image}
      url={resolvedUrl}
      type={ogType}
      schema={schemaData}
      alternateUrls={alternateUrls}
      noindex={noindex}
      locale={locale}
    />
  );
};

export default useSEO;