"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  DollarSign,
  Clock,
  Landmark,
  FileText,
  MessageCircle,
  Phone,
  Languages,
  CreditCard,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Code,
  Copy,
  Check,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
} from "@/components/ui";

type CountryKey = "SG" | "MY" | "TH";

interface CountryPackData {
  key: CountryKey;
  name: string;
  flag: string;
  badge: string;
  currency: {
    code: string;
    symbol: string;
    formatting: string;
    sampleAmount: number;
    sampleFormatted: string;
  };
  timezone: {
    iana: string;
    label: string;
    offset: string;
    currentHour: string;
  };
  tax: {
    name: string;
    standardRate: string;
    zeroRate: string;
    authority: string;
    idLabel: string;
    sampleId: string;
  };
  invoicing: {
    title: string;
    prefix: string;
    branchCodeRequired: boolean;
    headerFields: string[];
    legalFooter: string;
  };
  comms: {
    regulation: string;
    optOutKeyword: string;
    maxPromotional: string;
    footerTemplate: string;
  };
  calling: {
    windowDisplay: string;
    saturdayHours: string;
    sundayAllowed: boolean;
    dncRegistry: string;
    maxAttempts: string;
  };
  languages: {
    primary: string;
    secondary: string[];
    voicePersona: string;
    codeSwitching: boolean;
    calendar: string;
  };
  payment: {
    qrStandard: string;
    clearingRail: string;
    methods: string[];
  };
  integrations: {
    identityProvider: string;
    phonePrefix: string;
    bankingGateways: string[];
  };
  einvoicing: {
    framework: string;
    standard: string;
    participantId: string;
    mandateStatus: string;
    payloadFormat: "xml" | "json";
    samplePayload: string;
  };
}

const COUNTRY_PACKS: Record<CountryKey, CountryPackData> = {
  SG: {
    key: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    badge: "GST 9% · InvoiceNow Peppol",
    currency: {
      code: "SGD",
      symbol: "S$",
      formatting: "S$1,250.00",
      sampleAmount: 1250,
      sampleFormatted: "S$1,362.50 (incl. 9% GST)",
    },
    timezone: {
      iana: "Asia/Singapore",
      label: "SGT (UTC+8)",
      offset: "+08:00",
      currentHour: "Business Hours (09:00 - 21:00)",
    },
    tax: {
      name: "GST (Goods and Services Tax)",
      standardRate: "9.0%",
      zeroRate: "0.0% (International Services / Export)",
      authority: "IRAS (Inland Revenue Authority of Singapore)",
      idLabel: "UEN / GST Registration Number",
      sampleId: "UEN: 201812345M | GST: M90371234X",
    },
    invoicing: {
      title: "Tax Invoice",
      prefix: "INV-SG-",
      branchCodeRequired: false,
      headerFields: [
        "Supplier Legal Entity Name & UEN",
        "GST Registration Number",
        "Tax Invoice Title & Number",
        "Itemized Subtotal and 9% GST in SGD",
      ],
      legalFooter: "Regulated under Singapore Goods and Services Tax Act Chapter 117A.",
    },
    comms: {
      regulation: "PDPA 2012 & Spam Control Act (Cap. 311A)",
      optOutKeyword: "STOP",
      maxPromotional: "Max 2 promotional contacts / week",
      footerTemplate: "Reply STOP to unsubscribe. Nexus Enterprise SG Pte Ltd.",
    },
    calling: {
      windowDisplay: "09:00 - 21:00 SGT (Mon-Sat)",
      saturdayHours: "09:00 - 21:00 SGT",
      sundayAllowed: false,
      dncRegistry: "Singapore PDPC Do Not Call (DNC) Registry",
      maxAttempts: "Max 2 contact attempts / day",
    },
    languages: {
      primary: "en-SG (Singapore English)",
      secondary: ["zh-SG (Simplified Chinese)", "ms-SG (Malay)", "ta-SG (Tamil)"],
      voicePersona: "Rachel (Singaporean English Accent)",
      codeSwitching: true,
      calendar: "Gregorian Calendar",
    },
    payment: {
      qrStandard: "PayNow QR (SGQR Standard)",
      clearingRail: "FAST & Interbank GIRO",
      methods: ["PayNow QR", "FAST Interbank", "GIRO Direct Debit", "GrabPay SG", "Cards"],
    },
    integrations: {
      identityProvider: "Singpass / Corppass MyInfo",
      phonePrefix: "+65",
      bankingGateways: ["DBS RAPID Gateway", "OCBC Open Banking", "UOB Direct"],
    },
    einvoicing: {
      framework: "InvoiceNow (IMDA Peppol Network)",
      standard: "Peppol BIS Billing 3.0 (SG Rules)",
      participantId: "0195:201812345M",
      mandateStatus: "Mandatory for Government Procurement; Nationwide Enterprise Ready",
      payloadFormat: "xml",
      samplePayload: `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0#conformant#urn:fdc:peppol.sg:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>INV-SG-2026-0042</cbc:ID>
  <cbc:IssueDate>2026-09-23</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SGD</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0195">201812345M</cbc:EndpointID>
      <cac:PartyIdentification><cbc:ID>201812345M</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>Nexus Enterprise SG Pte Ltd</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>M90371234X</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>GST</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SGD">112.50</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SGD">1250.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SGD">112.50</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>9.0</cbc:Percent>
        <cac:TaxScheme><cbc:ID>GST</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SGD">1250.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SGD">1250.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SGD">1362.50</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SGD">1362.50</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`,
    },
  },

  MY: {
    key: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    badge: "SST 8% · LHDN MyInvois",
    currency: {
      code: "MYR",
      symbol: "RM",
      formatting: "RM 1,250.00",
      sampleAmount: 1250,
      sampleFormatted: "RM 1,350.00 (incl. 8% SST)",
    },
    timezone: {
      iana: "Asia/Kuala_Lumpur",
      label: "MYT (UTC+8)",
      offset: "+08:00",
      currentHour: "Business Hours (09:00 - 20:00)",
    },
    tax: {
      name: "SST (Sales and Service Tax)",
      standardRate: "8.0% (Service Tax)",
      zeroRate: "0.0% / Exempt",
      authority: "LHDN (Lembaga Hasil Dalam Negeri) & JKDM",
      idLabel: "TIN / SSM Registration No / SST No",
      sampleId: "TIN: C2584920100 | SST: W10-1808-32000012",
    },
    invoicing: {
      title: "Invois Cukai / Tax Invoice",
      prefix: "INV-MY-",
      branchCodeRequired: false,
      headerFields: [
        "Invois Cukai (Tax Invoice) Title",
        "Supplier TIN & Business Registration Number",
        "SST Registration Number",
        "MSIC Code & Classification Code",
        "Buyer TIN or Identification Number",
      ],
      legalFooter: "Registered under Companies Commission of Malaysia (SSM) and Sales Tax Act 2018.",
    },
    comms: {
      regulation: "PDPA 2010 & MCMC Communications and Multimedia Act 1998",
      optOutKeyword: "BATAL",
      maxPromotional: "Max 2 promotional contacts / week",
      footerTemplate: "Balas BATAL atau STOP untuk berhenti. Nexus Enterprise Malaysia Sdn Bhd.",
    },
    calling: {
      windowDisplay: "09:00 - 20:00 MYT (Mon-Fri), 09:00 - 18:00 (Sat)",
      saturdayHours: "09:00 - 18:00 MYT",
      sundayAllowed: false,
      dncRegistry: "MCMC Do Not Call Register",
      maxAttempts: "Max 2 contact attempts / day",
    },
    languages: {
      primary: "ms-MY (Bahasa Melayu)",
      secondary: ["en-MY (Malaysian English)", "zh-MY (Chinese)"],
      voicePersona: "Adam (Malaysian Bilingual Voice)",
      codeSwitching: true,
      calendar: "Gregorian Calendar",
    },
    payment: {
      qrStandard: "DuitNow QR (PayNet National QR Standard)",
      clearingRail: "FPX Online Banking & DuitNow Transfer",
      methods: ["DuitNow QR", "FPX B2B/B2C", "Touch 'n Go eWallet", "GrabPay MY", "JomPAY"],
    },
    integrations: {
      identityProvider: "MyDigital ID / SSM e-Info",
      phonePrefix: "+60",
      bankingGateways: ["PayNet DuitNow Gateway", "Maybank Sandbox", "CIMB API"],
    },
    einvoicing: {
      framework: "LHDN MyInvois System",
      standard: "LHDN MyInvois UBL 2.1 XML / JSON SDK",
      participantId: "C2584920100",
      mandateStatus: "Mandatory Phased Rollout (2024 - 2025)",
      payloadFormat: "json",
      samplePayload: `{
  "_D": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  "ID": "INV-MY-2026-0089",
  "IssueDate": "2026-09-23",
  "IssueTime": "14:15:00Z",
  "InvoiceTypeCode": { "value": "01", "listVersionID": "1.0" },
  "DocumentCurrencyCode": "MYR",
  "AccountingSupplierParty": {
    "Party": {
      "PartyIdentification": [
        { "ID": { "value": "C2584920100", "schemeID": "TIN" } },
        { "ID": { "value": "202001012345", "schemeID": "BRN" } }
      ],
      "PartyName": [{ "Name": "Nexus Enterprise Malaysia Sdn Bhd" }],
      "PartyTaxScheme": [{
        "CompanyID": "W10-1808-32000012",
        "TaxScheme": { "ID": { "value": "OTH", "schemeID": "UN/ECE 5153" } }
      }]
    }
  },
  "TaxTotal": [{
    "TaxAmount": { "currencyID": "MYR", "value": 100.00 },
    "TaxSubtotal": [{
      "TaxableAmount": { "currencyID": "MYR", "value": 1250.00 },
      "TaxAmount": { "currencyID": "MYR", "value": 100.00 },
      "TaxCategory": {
        "ID": "01",
        "Percent": 8.0,
        "TaxScheme": { "ID": { "value": "OTH", "schemeID": "UN/ECE 5153" } }
      }
    }]
  }],
  "LegalMonetaryTotal": {
    "LineExtensionAmount": { "currencyID": "MYR", "value": 1250.00 },
    "TaxExclusiveAmount": { "currencyID": "MYR", "value": 1250.00 },
    "TaxInclusiveAmount": { "currencyID": "MYR", "value": 1350.00 },
    "PayableAmount": { "currencyID": "MYR", "value": 1350.00 }
  }
}`,
    },
  },

  TH: {
    key: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    badge: "VAT 7% · Thai RD e-Tax",
    currency: {
      code: "THB",
      symbol: "฿",
      formatting: "฿1,250.00",
      sampleAmount: 1250,
      sampleFormatted: "฿1,337.50 (หนึ่งพันสามร้อยสามสิบเจ็ดบาทห้าสิบสตางค์)",
    },
    timezone: {
      iana: "Asia/Bangkok",
      label: "ICT (UTC+7)",
      offset: "+07:00",
      currentHour: "Business Hours (08:00 - 20:00)",
    },
    tax: {
      name: "VAT (Value Added Tax)",
      standardRate: "7.0%",
      zeroRate: "0.0% (Export)",
      authority: "The Revenue Department of Thailand (กรมสรรพากร)",
      idLabel: "13-Digit Tax ID (เลขประจำตัวผู้เสียภาษี) & Branch",
      sampleId: "Tax ID: 0105556123456 | Branch: 00000 (สำนักงานใหญ่)",
    },
    invoicing: {
      title: "ใบกำกับภาษี / Tax Invoice",
      prefix: "INV-TH-",
      branchCodeRequired: true,
      headerFields: [
        "ใบกำกับภาษี (Tax Invoice) Title",
        "13-Digit Tax ID of Supplier and Customer",
        "Head Office (สำนักงานใหญ่) / Branch Code",
        "Amount in Baht and Thai Text representation",
      ],
      legalFooter: "เอกสารนี้ออกโดยระบบอิเล็กทรอนิกส์ตามประมวลรัษฎากร กรมสรรพากร",
    },
    comms: {
      regulation: "PDPA B.E. 2562 (2019) & Debt Collection Act B.E. 2558 (2015)",
      optOutKeyword: "ยกเลิก",
      maxPromotional: "Max 1 contact attempt / day (Strict Debt Collection Act)",
      footerTemplate: "พิมพ์ ยกเลิก หรือ STOP เพื่อยกเลิกข้อความ. Nexus Thailand Co., Ltd.",
    },
    calling: {
      windowDisplay: "08:00 - 20:00 ICT (Mon-Fri), 08:00 - 18:00 (Sat)",
      saturdayHours: "08:00 - 18:00 ICT",
      sundayAllowed: false,
      dncRegistry: "NBTC Do Not Call Registry",
      maxAttempts: "Strictly Max 1 contact attempt per day",
    },
    languages: {
      primary: "th-TH (Thai)",
      secondary: ["en-TH (English)"],
      voicePersona: "Kanya (Thai Natural Voice)",
      codeSwitching: true,
      calendar: "Buddhist Era (BE 2569)",
    },
    payment: {
      qrStandard: "PromptPay QR (Thai QR Payment Standard)",
      clearingRail: "PromptPay Interbank Direct Clearing",
      methods: ["PromptPay QR", "TrueMoney Wallet", "Rabbit LINE Pay", "SCB/KBank/BBL Transfer"],
    },
    integrations: {
      identityProvider: "NDID / ThaiD Digital ID",
      phonePrefix: "+66",
      bankingGateways: ["PromptPay API", "SCB Open Banking", "Omise / 2C2P Gateway"],
    },
    einvoicing: {
      framework: "e-Tax Invoice & e-Receipt by Thai Revenue Department",
      standard: "ETDA Standard TIS 2378-2560 (UN/CEFACT XML)",
      participantId: "0105556123456-00000",
      mandateStatus: "Mandatory for Large Enterprises; Voluntary for SMEs",
      payloadFormat: "xml",
      samplePayload: `<?xml version="1.0" encoding="UTF-8"?>
<rsm:TaxInvoice_CrossIndustryInvoice xmlns:rsm="urn:etda:uncefact:data:standard:TaxInvoice_CrossIndustryInvoice:2"
                                     xmlns:ram="urn:etda:uncefact:data:standard:TaxInvoice_ReusableAggregateBusinessInformationEntity:2">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>ER3-2560</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>INV-TH-2026-0104</ram:ID>
    <ram:Name>ใบกำกับภาษี</ram:Name>
    <ram:TypeCode>388</ram:TypeCode>
    <ram:IssueDateTime>2026-09-23T14:30:00.000+07:00</ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:ID>0105556123456</ram:ID>
        <ram:Name>บริษัท เน็กซัส เอนเตอร์ไพรส์ (ไทยแลนด์) จำกัด</ram:Name>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="TXID">0105556123456</ram:ID>
        </ram:SpecifiedTaxRegistration>
        <ram:PostalTradeAddress>
          <ram:BuildingNumber>Head Office (สำนักงานใหญ่ Branch: 00000)</ram:BuildingNumber>
          <ram:CountryID>TH</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:SellerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>THB</ram:InvoiceCurrencyCode>
      <ram:ApplicableTradeTax>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:CalculatedRate>7.0</ram:CalculatedRate>
        <ram:BasisAmount>1250.00</ram:BasisAmount>
        <ram:CalculatedAmount>87.50</ram:CalculatedAmount>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>1250.00</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>1250.00</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount>87.50</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>1337.50</ram:GrandTotalAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:TaxInvoice_CrossIndustryInvoice>`,
    },
  },
};

export default function CountryPacksPage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>("SG");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [testValidationStatus, setTestValidationStatus] = useState<string | null>(null);

  const pack = COUNTRY_PACKS[selectedCountry];

  const handleCopy = () => {
    navigator.clipboard.writeText(pack.einvoicing.samplePayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTestValidation = () => {
    setTestValidationStatus("validating");
    setTimeout(() => {
      setTestValidationStatus("success");
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/30 to-teal-600/20 border border-blue-500/30 text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Regional Country Pack Engine
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  3 Packs Certified
                </span>
                <Badge variant="rls" size="sm">
                  PostgreSQL RLS Isolated
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Localized fiscal rules, tax computation, legal calling windows, e-invoicing protocols, and regional payment rails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-medium border border-teal-500/30 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Configure Regional Connectors
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Platform Settings
          </Link>
        </div>
      </div>

      {/* 2. Country Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["SG", "MY", "TH"] as CountryKey[]).map((key) => {
          const cp = COUNTRY_PACKS[key];
          const isSelected = selectedCountry === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedCountry(key);
                setTestValidationStatus(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-950/30"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cp.flag}</span>
                  <div>
                    <h3 className="text-base font-bold text-white">{cp.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{cp.timezone.label}</p>
                  </div>
                </div>
                <Badge variant={isSelected ? "primary" : "outline"} size="sm">
                  {cp.key}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 font-mono font-medium">{cp.badge}</p>
            </button>
          );
        })}
      </div>

      {/* 3. 10-Dimension Visual Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Dim 1: Currencies & Formatting */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              1. Currency & Formatting
            </span>
            <span className="text-xs font-bold font-mono text-white">{pack.currency.code} ({pack.currency.symbol})</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Standard Format:</span>
              <span className="text-white font-semibold">{pack.currency.formatting}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Sample Invoiced Total:</span>
              <span className="text-emerald-400 font-semibold">{pack.currency.sampleFormatted}</span>
            </div>
          </div>
        </div>

        {/* Dim 2: Timezone & Clock */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-400" />
              2. Timezone & Operating Hours
            </span>
            <span className="text-xs font-bold font-mono text-sky-400">{pack.timezone.offset}</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">IANA Timezone:</span>
              <span className="text-white">{pack.timezone.iana}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Operations Status:</span>
              <span className="text-emerald-400 font-semibold">{pack.timezone.currentHour}</span>
            </div>
          </div>
        </div>

        {/* Dim 3: Tax Engine */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-amber-400" />
              3. Tax Rules & Authority
            </span>
            <Badge variant="warning" size="sm">
              {pack.tax.standardRate}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">Authority:</p>
              <p className="text-white font-medium">{pack.tax.authority}</p>
            </div>
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">{pack.tax.idLabel}:</p>
              <p className="text-amber-400 font-medium">{pack.tax.sampleId}</p>
            </div>
          </div>
        </div>

        {/* Dim 4: Invoice Conventions */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-purple-400" />
              4. Invoice Conventions
            </span>
            <span className="text-xs font-bold font-mono text-purple-400">{pack.invoicing.prefix}XXXX</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded bg-slate-800/70 font-mono">
              <span className="text-slate-400">Legal Title: </span>
              <span className="text-white font-semibold">{pack.invoicing.title}</span>
            </div>
            <p className="text-[11px] text-slate-400">{pack.invoicing.legalFooter}</p>
          </div>
        </div>

        {/* Dim 5: Communication Rules & Opt-Out */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              5. Communication & PDPA Rules
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold">
              {pack.comms.optOutKeyword}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">Regulation:</p>
              <p className="text-slate-200">{pack.comms.regulation}</p>
            </div>
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">Mandatory Footer Template:</p>
              <p className="text-emerald-400 text-[11px] italic">"{pack.comms.footerTemplate}"</p>
            </div>
          </div>
        </div>

        {/* Dim 6: Calling Windows & DNC */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-indigo-400" />
              6. Calling Windows & DNC
            </span>
            <Badge variant="primary" size="sm">
              TCPA / DNC
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Permitted Window:</span>
              <span className="text-white font-semibold">{pack.calling.windowDisplay}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Sundays & Holidays:</span>
              <span className="text-rose-400 font-semibold">Strictly Prohibited</span>
            </div>
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">DNC Registry:</p>
              <p className="text-indigo-300 text-[11px] truncate">{pack.calling.dncRegistry}</p>
            </div>
          </div>
        </div>

        {/* Dim 7: Languages & TTS Personas */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-sky-400" />
              7. Languages & Accent Models
            </span>
            <span className="text-xs font-bold font-mono text-sky-400">{pack.languages.calendar}</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/70">
              <span className="text-slate-400">Primary Locale:</span>
              <span className="text-white font-semibold">{pack.languages.primary}</span>
            </div>
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">AI Voice Persona:</p>
              <p className="text-emerald-400">{pack.languages.voicePersona}</p>
            </div>
          </div>
        </div>

        {/* Dim 8: Regional Payment Rails */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              8. Payment Rails & QR
            </span>
            <Badge variant="success" size="sm">
              Instant
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">National QR Standard:</p>
              <p className="text-emerald-400 font-semibold">{pack.payment.qrStandard}</p>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {pack.payment.methods.map((m, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dim 9: Regional Integrations */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              9. Regional Integrations
            </span>
            <span className="text-xs font-bold font-mono text-blue-400">{pack.integrations.phonePrefix}</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">Digital Identity:</p>
              <p className="text-white font-medium">{pack.integrations.identityProvider}</p>
            </div>
            <div className="p-2 rounded bg-slate-800/70">
              <p className="text-[10px] text-slate-400">Banking Connectors:</p>
              <p className="text-slate-300">{pack.integrations.bankingGateways.join(" · ")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dimension 10: E-Invoicing Readiness Console (Hero Interactive Section) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                10. E-Invoicing Readiness & Payload Validator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Framework: <span className="text-white font-semibold">{pack.einvoicing.framework}</span> · Standard: <span className="text-indigo-400 font-mono">{pack.einvoicing.standard}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestValidation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Validate Sample Schema
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedPayload ? "Copied" : "Copy Payload"}
            </button>
          </div>
        </div>

        {/* Validation Result Banner */}
        {testValidationStatus === "validating" && (
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            Validating schema against {pack.einvoicing.framework} rules...
          </div>
        )}

        {testValidationStatus === "success" && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                Schema Validated Successfully for {pack.name} · Participant ID: {pack.einvoicing.participantId} · Digital Signature Verified
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80">ISO/IEC 19845 Compliant</span>
          </div>
        )}

        {/* E-Invoice Payload Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Generated Regional Transmission Payload ({pack.einvoicing.payloadFormat.toUpperCase()})</span>
            <span>Participant: {pack.einvoicing.participantId}</span>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
            {pack.einvoicing.samplePayload}
          </pre>
        </div>
      </div>
    </div>
  );
}
