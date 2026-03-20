import React from "react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO/seo";
import useSEO from "../hooks/useSEO";

const Legal = () => {
  const { t } = useTranslation();
  const SeoComponent = useSEO({
    title: t("legal.pageTitle"),
    description: "Legal terms, privacy policy, and other important information for Pyonea marketplace users.",
    url: "/legal",
  });

  const legalSections = [
    {
      title: t("legal.terms.title"),
      content: t("legal.terms.content")
    },
    {
      title: t("legal.privacy.title"),
      content: t("legal.privacy.content")
    },
    {
      title: t("legal.refund.title"),
      content: t("legal.refund.content")
    },
    {
      title: t("legal.seller.title"),
      content: t("legal.seller.content")
    },
    {
      title: t("legal.dispute.title"),
      content: t("legal.dispute.content")
    }
  ];



  return (
    <>
      {SeoComponent}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("legal.pageTitle")}
        </h1>
        <p className="text-center text-gray-600 mb-8">{t("legal.subtitle")}</p>

        <div className="bg-white rounded-lg shadow-md p-8">
          {legalSections.map((section, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h2 className="text-2xl font-bold mb-4">
                {section.title}
              </h2>
              <p className="text-gray-700 mb-6">
                {section.content}
              </p>
              {index < legalSections.length - 1 && (
                <hr className="my-6" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            {t("legal.contact.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("legal.contact.description")}
          </p>
          <p className="text-gray-700">
            <strong>{t("legal.contact.emailLabel")}</strong> contact.pyonea@gmail.com
            <br />
            <strong>{t("legal.contact.addressLabel")}</strong>{" "}
            {t("legal.contact.address")}
          </p>
        </div>
      </div>
    </>
  );
};

export default Legal;