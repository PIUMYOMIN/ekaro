import React from "react";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("about.title")}
        </h1>

        {/* Mission */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {t("about.mission.title")}
          </h2>

          <p className="text-gray-700 mb-6">
            {t("about.mission.paragraph1")}
          </p>

          <p className="text-gray-700 mb-6">
            {t("about.mission.paragraph2")}
          </p>

          <p className="text-gray-700">
            {t("about.mission.paragraph3")}
          </p>
        </div>

        {/* Buyers & Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Buyers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("about.buyers.title")}
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>{t("about.buyers.point1")}</li>
              <li>{t("about.buyers.point2")}</li>
              <li>{t("about.buyers.point3")}</li>
              <li>{t("about.buyers.point4")}</li>
              <li>{t("about.buyers.point5")}</li>
            </ul>
          </div>

          {/* Sellers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("about.sellers.title")}
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>{t("about.sellers.point1")}</li>
              <li>{t("about.sellers.point2")}</li>
              <li>{t("about.sellers.point3")}</li>
              <li>{t("about.sellers.point4")}</li>
              <li>{t("about.sellers.point5")}</li>
            </ul>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">
            {t("about.vision.title")}
          </h2>

          <p className="text-gray-700 mb-6">
            {t("about.vision.paragraph1")}
          </p>

          <p className="text-gray-700 mb-6">
            {t("about.vision.paragraph2")}
          </p>

          <p className="text-gray-700">
            {t("about.vision.paragraph3")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;