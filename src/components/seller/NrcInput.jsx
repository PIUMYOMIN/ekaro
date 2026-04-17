// src/components/seller/NrcInput.jsx
// Myanmar NRC (National Registration Card) structured input.
//
// NRC format: {division}/{township_code}({type}){number}
// Example EN: 8/KaPaTa(N)123456
// Example MM: ၈/ကပတ(နိုင်)၁၂၃၄၅၆
//
// Four dropdown selects + one number input, each independently
// validated. The combined NRC string is shown as a preview.

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// ── Division list (14 States/Regions) ─────────────────────────────────────────
export const NRC_DIVISIONS = [
  { value: "1",  en: "Kachin State",        mm: "ကချင်ပြည်နယ်"   },
  { value: "2",  en: "Kayah State",         mm: "ကယားပြည်နယ်"   },
  { value: "3",  en: "Kayin State",         mm: "ကရင်ပြည်နယ်"   },
  { value: "4",  en: "Chin State",          mm: "ချင်းပြည်နယ်"   },
  { value: "5",  en: "Sagaing Region",       mm: "စစ်ကိုင်းတိုင်း" },
  { value: "6",  en: "Tanintharyi Region",   mm: "တနင်္သာရီတိုင်း" },
  { value: "7",  en: "Bago Region",          mm: "ပဲခူးတိုင်း"    },
  { value: "8",  en: "Magway Region",        mm: "မကွေးတိုင်း"    },
  { value: "9",  en: "Mandalay Region",      mm: "မန္တလေးတိုင်း"  },
  { value: "10", en: "Mon State",            mm: "မွန်ပြည်နယ်"    },
  { value: "11", en: "Rakhine State",        mm: "ရခိုင်ပြည်နယ်"  },
  { value: "12", en: "Yangon Region",        mm: "ရန်ကုန်တိုင်း"  },
  { value: "13", en: "Shan State",           mm: "ရှမ်းပြည်နယ်"   },
  { value: "14", en: "Ayeyarwady Region",    mm: "အင်းဝတိုင်း"    },
];

// ── Township codes per division ────────────────────────────────────────────────
// Each entry: { code: "KaPaTa", mm: "ကပတ", township: "Township name" }
export const NRC_TOWNSHIPS = {
  "1": [ // Kachin
    { code: "MaHtaLa", mm: "မထလ",  township: "Myitkyina" },
    { code: "SaPhaNa",  mm: "စဖန",  township: "Shwegu" },
    { code: "PaKaNa",   mm: "ပကန",  township: "Putao" },
    { code: "MaYaNa",   mm: "မရန",  township: "Mogaung" },
    { code: "KaHtaNa",  mm: "ကထန",  township: "Katha" },
    { code: "HsinHtaLa",mm: "ဆဟလ", township: "Hsinbo" },
    { code: "MaBaNa",   mm: "မဘန",  township: "Bhamo" },
  ],
  "2": [ // Kayah
    { code: "KaYaPha",  mm: "ကရဖ",  township: "Loikaw" },
    { code: "LaKaNa",   mm: "လကန",  township: "Pruso" },
    { code: "ShaNa",    mm: "ရှန",   township: "Shadaw" },
  ],
  "3": [ // Kayin
    { code: "PaAn",     mm: "ဖဆ",   township: "Pa-an" },
    { code: "KaThaNa",  mm: "ကသန",  township: "Kawkareik" },
    { code: "MaWaNa",   mm: "မဝန",  township: "Myawady" },
    { code: "ThaThaNa", mm: "သသန",  township: "Thaton" },
  ],
  "4": [ // Chin
    { code: "KaLaNa",   mm: "ကလန",  township: "Hakha" },
    { code: "MaTaNa",   mm: "မတန",  township: "Matupi" },
    { code: "MiNa",     mm: "မိန",   township: "Mindat" },
    { code: "FaLaMa",   mm: "ဖလမ",  township: "Falam" },
    { code: "PaLeTa",   mm: "ပလတ",  township: "Paletwa" },
    { code: "TiDiMa",   mm: "တိဒိမ", township: "Tidim" },
    { code: "ThanLaNa", mm: "သန်လန", township: "Thantlang" },
  ],
  "5": [ // Sagaing
    { code: "SaGaKa",   mm: "စစ်ကိုင်",  township: "Sagaing" },
    { code: "ShwePha",  mm: "ရွှေဖ",     township: "Shwebo" },
    { code: "MoNya",    mm: "မုံညာ",     township: "Monywa" },
    { code: "KaTha",    mm: "ကသ",       township: "Katha" },
    { code: "KaLay",    mm: "ကလေး",     township: "Kalay" },
    { code: "TaMu",     mm: "တမူ",      township: "Tamu" },
    { code: "HkaMTi",   mm: "ဆမ်တိ",   township: "Hkamti" },
    { code: "YaYaNa",   mm: "ရရန",      township: "Yinmarbin" },
    { code: "KaBaNa",   mm: "ကဘန",     township: "Kanbalu" },
    { code: "WuNtHo",   mm: "ဝုန္ထော",   township: "Wuntho" },
  ],
  "6": [ // Tanintharyi
    { code: "DaWay",    mm: "ဒဝေ",  township: "Dawei" },
    { code: "MyeIk",    mm: "မြိတ်", township: "Myeik" },
    { code: "KaWThoung",mm: "ကောထောင်", township: "Kawthoung" },
    { code: "PyiNa",    mm: "ပိုင်နာ", township: "Palaw" },
    { code: "ThaNByu",  mm: "သံဖြူ", township: "Thanbyu" },
  ],
  "7": [ // Bago
    { code: "BaGo",     mm: "ပဲခူး", township: "Bago" },
    { code: "TaUnGoo",  mm: "တောင်ငူ", township: "Taungoo" },
    { code: "Pya",      mm: "ဖြ",   township: "Pyay" },
    { code: "ThayeT",   mm: "သရက်", township: "Thayetmyo" },
    { code: "OkKan",    mm: "အုက္ကန်", township: "Okkan" },
    { code: "MaRang",   mm: "မရမ်",  township: "Minhla" },
  ],
  "8": [ // Magway
    { code: "MaGway",   mm: "မကွေး", township: "Magway" },
    { code: "YaNan",    mm: "ရနန်",  township: "Yenangyaung" },
    { code: "PaKoKu",   mm: "ပကိုကု", township: "Pakokku" },
    { code: "ThaYet",   mm: "သရက်", township: "Thayetmyo" },
    { code: "KaPaTa",   mm: "ကပတ",  township: "Kamma" },
    { code: "MinBu",    mm: "မင်းဘူး", township: "Minbu" },
    { code: "YeNan",    mm: "ရနန",   township: "Yenanchaung" },
    { code: "SeLin",    mm: "ဆလင်",  township: "Seikphyu" },
    { code: "GanGaw",   mm: "ဂန့်ဂေါ", township: "Gangaw" },
  ],
  "9": [ // Mandalay
    { code: "MaNTaLe",  mm: "မန်တလေး", township: "Mandalay" },
    { code: "AMaraPu",  mm: "အမာပူ",  township: "Amarapura" },
    { code: "PaThein",  mm: "ပသိမ်",  township: "Patheingyi" },
    { code: "MaHtila",  mm: "မထိလ",  township: "Meikhtila" },
    { code: "Nyaung",   mm: "ညောင်",  township: "Nyaung-U" },
    { code: "KyauksE",  mm: "ကျောက်ဆဲ", township: "Kyaukse" },
    { code: "Pyin",     mm: "ပြင်",   township: "Pyin Oo Lwin" },
    { code: "MYingSan", mm: "မြင်စန်", township: "Myingyan" },
    { code: "YameT",    mm: "ရမ်မဲ",  township: "Yamethin" },
    { code: "ThaZi",    mm: "သာဇီ",  township: "Thazi" },
    { code: "KyaukPa",  mm: "ကျောက်ပ", township: "Kyaukpadaung" },
    { code: "NatMauk",  mm: "နတ်မောက်", township: "Natmauk" },
    { code: "TaTon",    mm: "တပ်တိုန်", township: "Sintgaing" },
  ],
  "10": [ // Mon
    { code: "MaWLa",    mm: "မော်လ",  township: "Mawlamyine" },
    { code: "ThaHton",  mm: "သထုံ",   township: "Thaton" },
    { code: "YeNa",     mm: "ရေနာ",   township: "Ye" },
    { code: "BiLin",    mm: "ဘိလင်",  township: "Bilin" },
    { code: "KaLon",    mm: "ကလုံ",   township: "Chaungzon" },
    { code: "MuDon",    mm: "မုတ္တမ",  township: "Mudon" },
  ],
  "11": [ // Rakhine
    { code: "SiTTWe",   mm: "စစ်တွေ", township: "Sittwe" },
    { code: "MyauK",    mm: "မြောက်",  township: "Myebon" },
    { code: "MrauK",    mm: "မြောက်ဦ", township: "Mrauk-U" },
    { code: "KyaukTar", mm: "ကျောက်တ", township: "Kyauktaw" },
    { code: "MaTuPi",   mm: "မတူပိ",   township: "Matupi" },
    { code: "TaWNi",    mm: "တောနီ",   township: "Taungup" },
    { code: "AnNa",     mm: "အမ်နာ",   township: "Ann" },
    { code: "GwaNa",    mm: "ဂွနာ",    township: "Gwa" },
    { code: "ThanTwe",  mm: "သံတွဲ",   township: "Thandwe" },
    { code: "PyinPha",  mm: "ပြင်ဖ",   township: "Ponnagyun" },
  ],
  "12": [ // Yangon
    { code: "ThaYaKa",  mm: "သကက",   township: "Thaketa" },
    { code: "AhMaKa",   mm: "အမက",   township: "Ahlone" },
    { code: "LaYaKa",   mm: "လရက",   township: "Latpadan" },
    { code: "HlaKa",    mm: "လကာ",   township: "Hlaing" },
    { code: "YanKin",   mm: "ရန်ကင်",  township: "Yankin" },
    { code: "TaMwe",    mm: "တမ်ဝေ",   township: "Tamwe" },
    { code: "BaHan",    mm: "ဗဟန်",   township: "Bahan" },
    { code: "DaGon",    mm: "ဒဂုံ",    township: "Dagon" },
    { code: "SanChaung",mm: "ဆန်ချောင်",township: "Sanchaung" },
    { code: "KaMaYut",  mm: "ကမာရွတ်", township: "Kamayut" },
    { code: "ThinGan",  mm: "သင်္ကြန်", township: "Thingangyun" },
    { code: "MinGaLa",  mm: "မင်္ဂလာ",  township: "Mingalar Taungnyunt" },
    { code: "BotaHtaung",mm:"ဗိုလ်ထ", township: "Botahtaung" },
    { code: "PaZuNdaung",mm:"ပဇုန်",   township: "Pazundaung" },
    { code: "HlaingThar",mm:"လိုင်သ",  township: "Hlaingtharyar" },
    { code: "ShwePyiThar",mm:"ရွှေပြ", township: "Shwe Pyi Thar" },
    { code: "NorthOkka",mm: "မြောက်ဦ", township: "North Okkalapa" },
    { code: "SouthOkka",mm: "တောင်ဦ",  township: "South Okkalapa" },
    { code: "Insein",   mm: "အင်းစိန်", township: "Insein" },
    { code: "Mingaladon",mm:"မင်္ဂလာ",  township: "Mingaladon" },
    { code: "Hmawbi",   mm: "မော်ဘီ",  township: "Hmawbi" },
    { code: "Twantay",  mm: "တွံတေး",  township: "Twantay" },
    { code: "Kawhmu",   mm: "ကော့မှူး", township: "Kawhmu" },
  ],
  "13": [ // Shan
    { code: "TaungGyi", mm: "တောင်ကြီ", township: "Taunggyi" },
    { code: "LashiO",   mm: "လားရှိုး",  township: "Lashio" },
    { code: "KeLong",   mm: "ကျိုင်းတုံ", township: "Kengtung" },
    { code: "MonYwa",   mm: "မုံညာ",    township: "Muse" },
    { code: "LaiKha",   mm: "လဲချား",   township: "Loilem" },
    { code: "MyNSat",   mm: "မြင်းဆပ်",  township: "Minesat" },
    { code: "TachilEk", mm: "တာချီလိတ်", township: "Tachileik" },
    { code: "MonHsat",  mm: "မုန်းဆပ်",  township: "Mong Hsat" },
    { code: "KaLaW",    mm: "ကလော",    township: "Kalaw" },
    { code: "HsiPaw",   mm: "သိပေါ",   township: "Hsipaw" },
  ],
  "14": [ // Ayeyarwady
    { code: "HinTha",   mm: "ဟင်သာ",  township: "Hinthada" },
    { code: "BaThein",  mm: "ဘသိမ်",  township: "Pathein" },
    { code: "MaUBin",   mm: "မအူပင်", township: "Maubin" },
    { code: "PyaTa",    mm: "ဖြတ",    township: "Pyapon" },
    { code: "NyaungDon",mm: "ညောင်ဒုံ",township: "Nyaungdon" },
    { code: "Wakema",   mm: "ဝါးကယ်မာ",township: "Wakema" },
    { code: "Danubyu",  mm: "ဒနုဗြူ", township: "Danubyu" },
    { code: "Labutta",  mm: "လပွတ္တာ", township: "Labutta" },
    { code: "Mawlamyine",mm:"မော်လ",  township: "Mawlamyinegyun" },
    { code: "Bogale",   mm: "ဘိုဂလေ", township: "Bogale" },
    { code: "Einme",    mm: "အိမ်မဲ", township: "Einme" },
  ],
};

// ── NRC ID types ───────────────────────────────────────────────────────────────
export const NRC_TYPES = [
  { value: "N",     en: "N (Naing)",    mm: "နိုင်",        label: "Citizen" },
  { value: "E",     en: "E (Ein)",      mm: "ဧည့်",        label: "Foreign Guest" },
  { value: "P",     en: "P (Pyu)",      mm: "ဧည့်ပြု",     label: "Temporary" },
  { value: "T",     en: "T (Tha)",      mm: "သာသနာ",      label: "Religious" },
  { value: "TH",    en: "TH",           mm: "သ",           label: "Associate" },
  { value: "Naing", en: "Naing",        mm: "နိုင်",        label: "Citizen (Alt)" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const SELECT_CLS = [
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600",
  "rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100",
  "focus:ring-2 focus:ring-green-500 focus:outline-none",
].join(" ");

const LABEL_CLS = "block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1";

// ── NrcInput component ─────────────────────────────────────────────────────────
export default function NrcInput({ value = {}, onChange, error = {} }) {
  const { i18n } = useTranslation();
  const isMM = i18n.language === 'my';

  // value = { nrc_division, nrc_township_code, nrc_township_mm, nrc_type, nrc_number }
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  // Filtered township list for current division
  const townships = useMemo(
    () => NRC_TOWNSHIPS[value.nrc_division] || [],
    [value.nrc_division]
  );

  // Preview string
  const preview = useMemo(() => {
    const { nrc_division: d, nrc_township_code: tc, nrc_township_mm: tmm,
            nrc_type: tp, nrc_number: num } = value;
    if (!d || !tc || !tp || !num) return null;
    const en = `${d}/${tc}(${tp})${num}`;
    if (!tmm) return en;
    const divMM = d.replace(/\d/g, c => '၀၁၂၃၄၅၆၇၈၉'[c]);
    const numMM = num.replace(/\d/g, c => '၀၁၂၃၄၅၆၇၈၉'[c]);
    const typeMM = NRC_TYPES.find(t => t.value === tp)?.mm || tp;
    const mm = `${divMM}/${tmm}(${typeMM})${numMM}`;
    return { en, mm };
  }, [value]);

  const handleDivisionChange = (e) => {
    // Reset township when division changes
    onChange({ ...value, nrc_division: e.target.value, nrc_township_code: '', nrc_township_mm: '' });
  };

  const handleTownshipChange = (e) => {
    const selected = townships.find(t => t.code === e.target.value);
    onChange({
      ...value,
      nrc_township_code: selected?.code || '',
      nrc_township_mm:   selected?.mm   || '',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3">
          Myanmar NRC Number
          <span className="ml-1 text-xs font-normal text-gray-400 dark:text-slate-500">
            (National Registration Card)
          </span>
        </span>

        {/* 4 dropdowns + 1 number input in a responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">

          {/* 1. Division */}
          <div>
            <label className={LABEL_CLS}>
              {isMM ? "တိုင်းဒေသကြီး / ပြည်နယ်" : "Division"}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={value.nrc_division || ''}
              onChange={handleDivisionChange}
              className={SELECT_CLS}
            >
              <option value="">{isMM ? "ရွေးချယ်ပါ" : "Select"}</option>
              {NRC_DIVISIONS.map(d => (
                <option key={d.value} value={d.value}>
                  {d.value}/ — {isMM ? d.mm : d.en}
                </option>
              ))}
            </select>
            {error.nrc_division && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.nrc_division}</p>
            )}
          </div>

          {/* 2. Township code */}
          <div className="sm:col-span-2">
            <label className={LABEL_CLS}>
              {isMM ? "မြို့နယ်ကုဒ်" : "Township Code"}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={value.nrc_township_code || ''}
              onChange={handleTownshipChange}
              disabled={!value.nrc_division}
              className={SELECT_CLS + (!value.nrc_division ? ' opacity-50 cursor-not-allowed' : '')}
            >
              <option value="">
                {!value.nrc_division
                  ? (isMM ? "တိုင်းဒေသကြီးအရင်ရွေးပါ" : "Select division first")
                  : (isMM ? "မြို့နယ်ကုဒ်ရွေးချယ်ပါ" : "Select township")}
              </option>
              {townships.map(t => (
                <option key={t.code} value={t.code}>
                  {t.code} / {t.mm} — {t.township}
                </option>
              ))}
            </select>
            {error.nrc_township_code && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.nrc_township_code}</p>
            )}
          </div>

          {/* 3. NRC Type */}
          <div>
            <label className={LABEL_CLS}>
              {isMM ? "အမျိုးအစား" : "ID Type"}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={value.nrc_type || ''}
              onChange={set('nrc_type')}
              className={SELECT_CLS}
            >
              <option value="">{isMM ? "ရွေးချယ်ပါ" : "Select"}</option>
              {NRC_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.en} ({t.mm}) — {t.label}
                </option>
              ))}
            </select>
            {error.nrc_type && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.nrc_type}</p>
            )}
          </div>
        </div>

        {/* 4. Serial number — full width below */}
        <div>
          <label className={LABEL_CLS}>
            {isMM ? "မှတ်ပုံတင်နံပါတ်" : "Registration Number"}
            <span className="text-red-500 ml-0.5">*</span>
            <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
              {isMM ? "(ဂဏန်း ၆ လုံး)" : "(6 digits)"}
            </span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="123456"
            value={value.nrc_number || ''}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, '');
              onChange({ ...value, nrc_number: v });
            }}
            className={[
              "w-full sm:w-48 px-3 py-2 text-sm border rounded-lg",
              "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100",
              "placeholder-gray-400 dark:placeholder-slate-500",
              "focus:ring-2 focus:ring-green-500 focus:outline-none",
              error.nrc_number
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-slate-600",
            ].join(" ")}
          />
          {error.nrc_number && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.nrc_number}</p>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1 uppercase tracking-wide">
            {isMM ? "NRC နံပါတ်" : "NRC Preview"}
          </p>
          <p className="text-base font-mono font-bold text-green-900 dark:text-green-200 tracking-wider">
            {typeof preview === 'string' ? preview : preview.en}
          </p>
          {typeof preview !== 'string' && preview.mm && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">{preview.mm}</p>
          )}
        </div>
      )}
    </div>
  );
}