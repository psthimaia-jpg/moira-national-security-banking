import { Shield } from "lucide-react";

const ROWS = [
  {
    moiraCode: "262626-AML",
    standard: "Anti-Money Laundering",
    senateCode: "31 U.S.C. § 5318",
    regulation: "Bank Secrecy Act",
  },
  {
    moiraCode: "262626-KYC",
    standard: "Customer Verification",
    senateCode: "12 C.F.R. § 21.21",
    regulation: "OCC KYC Standard",
  },
  {
    moiraCode: "262626-RISK",
    standard: "Risk Monitoring",
    senateCode: "Dodd-Frank § 165",
    regulation: "Enhanced Prudential Standards",
  },
  {
    moiraCode: "262626-CYBER",
    standard: "Cyber Resilience",
    senateCode: "FISMA § 3544",
    regulation: "Federal Info Security",
  },
  {
    moiraCode: "262626-ASSET",
    standard: "Asset Integrity",
    senateCode: "Basel III Pillar 2",
    regulation: "ICAAP Framework",
  },
  {
    moiraCode: "262626-SETTLE",
    standard: "Settlement Finality",
    senateCode: "UCC Article 4A",
    regulation: "Funds Transfer",
  },
];

export default function RegulatoryComplianceTranslator() {
  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.12 0.02 255)",
        border: "1px solid oklch(0.72 0.16 55 / 0.3)",
        boxShadow: "0 0 16px oklch(0.72 0.16 55 / 0.08)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.72 0.16 55 / 0.12), oklch(0.14 0.025 255))",
          borderBottom: "1px solid oklch(0.22 0.025 255)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-mono font-bold tracking-widest"
              style={{ color: "oklch(0.82 0.14 55)" }}
            >
              REGULATORY COMPLIANCE TRANSLATOR
            </p>
            <p
              className="text-[9px] font-mono mt-0.5"
              style={{ color: "oklch(0.55 0.08 55)" }}
            >
              Auto-maps Moira 262626 audit codes to Congressional financial
              codes
            </p>
          </div>
          <Shield
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(0.72 0.16 55)" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] font-mono">
          <thead>
            <tr style={{ background: "oklch(0.14 0.02 255)" }}>
              {[
                "Moira Audit Code",
                "Standard",
                "US Senate Code",
                "Regulation",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left font-bold"
                  style={{ color: "oklch(0.5 0.06 255)", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.moiraCode}
                data-ocid={`admin.compliance.row.${i + 1}`}
                style={{
                  borderTop: "1px solid oklch(0.18 0.02 255)",
                  background:
                    i % 2 === 0 ? "transparent" : "oklch(0.115 0.018 255)",
                }}
              >
                <td
                  className="px-2 py-2 font-bold"
                  style={{ color: "oklch(0.82 0.14 55)", whiteSpace: "nowrap" }}
                >
                  {row.moiraCode}
                </td>
                <td
                  className="px-2 py-2"
                  style={{
                    color: "oklch(0.72 0.04 255)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.standard}
                </td>
                <td
                  className="px-2 py-2 font-bold"
                  style={{ color: "oklch(0.7 0.14 200)", whiteSpace: "nowrap" }}
                >
                  {row.senateCode}
                </td>
                <td
                  className="px-2 py-2"
                  style={{ color: "oklch(0.65 0.04 255)" }}
                >
                  {row.regulation}
                </td>
                <td className="px-2 py-2">
                  <span
                    className="px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: "oklch(0.65 0.16 150 / 0.12)",
                      border: "1px solid oklch(0.65 0.16 150 / 0.3)",
                      color: "oklch(0.65 0.16 150)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    COMPLIANT ✓
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export button */}
      <div
        className="px-3 py-2"
        style={{ borderTop: "1px solid oklch(0.18 0.02 255)" }}
      >
        <button
          type="button"
          data-ocid="admin.compliance_export.primary_button"
          onClick={() => window.print()}
          className="w-full h-8 text-[10px] font-mono font-bold rounded-lg flex items-center justify-center gap-2"
          style={{
            background: "oklch(0.72 0.16 55 / 0.12)",
            border: "1px solid oklch(0.72 0.16 55 / 0.35)",
            color: "oklch(0.82 0.14 55)",
          }}
        >
          <Shield className="w-3 h-3" /> Export for Congress
        </button>
      </div>
    </div>
  );
}
