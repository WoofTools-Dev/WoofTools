import * as React from "react";
import {
  GoPlusRiskLevel,
  GoPlusRiskSummary,
  GoPlusTokenSecurity,
} from "src/app/Interface/goplus.interface";

interface TokenSecurityBannerProps {
  status: "idle" | "loading" | "available" | "unavailable";
  data?: GoPlusTokenSecurity | null;
  summary?: GoPlusRiskSummary | null;
  tokenSymbol?: string;
  unavailableMessage?: string;
  style?: React.CSSProperties;
}

const RISK_LABEL: Record<GoPlusRiskLevel, string> = {
  low: "RIESGO BAJO",
  medium: "RIESGO MEDIO",
  high: "RIESGO ALTO",
  critical: "RIESGO CRÍTICO",
};

const RISK_COLOR: Record<GoPlusRiskLevel, string> = {
  low: "#4ade80",
  medium: "#ffd166",
  high: "#ff8c42",
  critical: "#ff4d4d",
};

function boolOf(v?: string): boolean | null {
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

const cardStyle: React.CSSProperties = {
  background: "#1c1c1c",
  border: "1px solid #333",
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
  fontSize: 13,
  fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif",
};

function Badge({ label, risky, info }: { label: string; risky: boolean | null; info?: string }) {
  const color = risky === null ? "#9b9b9b" : risky ? "#ff6b6b" : "#4ade80";
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "3px 0" }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: color, flexShrink: 0 }} />
      <span style={{ color: "#e5e5e5", fontSize: 12 }}>{label}</span>
      {info ? <span style={{ color: "#9b9b9b", fontSize: 12 }}>{info}</span> : null}
    </div>
  );
}

export default function TokenSecurityBanner({
  status,
  data,
  summary,
  tokenSymbol,
  unavailableMessage,
  style,
}: TokenSecurityBannerProps) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div style={{ ...cardStyle, color: "#9b9b9b", ...style }}>
        Verificando seguridad del token…
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div style={{ ...cardStyle, color: "#ffd166", ...style }}>
        <b>Análisis de seguridad no disponible.</b>{" "}
        {unavailableMessage || "Verifica el token por otros medios o usa la simulación de transacción antes de operar."}
      </div>
    );
  }

  const t = data ?? {};
  const risk = summary ?? { level: "low" as GoPlusRiskLevel, reasons: [] as string[] };
  const riskColor = RISK_COLOR[risk.level];
  const buyTax = parseFloat(t.buy_tax || "0");
  const sellTax = parseFloat(t.sell_tax || "0");

  const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 2 };

  return (
    <div style={{ ...cardStyle, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#fff", fontWeight: 600 }}>
          Seguridad {tokenSymbol ? `· ${tokenSymbol}` : ""}
        </span>
        <span
          style={{
            background: riskColor,
            color: "#111",
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          {RISK_LABEL[risk.level]}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
        <div style={row}>
          <Badge label="Honeypot" risky={boolOf(t.is_honeypot) !== null ? !boolOf(t.is_honeypot) : null} />
          <Badge
            label="Buy tax"
            risky={t.buy_tax !== undefined && buyTax > 10 ? true : t.buy_tax !== undefined ? false : null}
            info={t.buy_tax !== undefined ? `${buyTax}%` : undefined}
          />
          <Badge
            label="Sell tax"
            risky={t.sell_tax !== undefined && sellTax > 10 ? true : t.sell_tax !== undefined ? false : null}
            info={t.sell_tax !== undefined ? `${sellTax}%` : undefined}
          />
          <Badge label="Mintable" risky={boolOf(t.is_mintable) !== null ? !boolOf(t.is_mintable) : null} />
        </div>
        <div style={row}>
          <Badge label="Blacklist" risky={boolOf(t.is_blacklisted) !== null ? !boolOf(t.is_blacklisted) : null} />
          <Badge label="Owner recuperable" risky={boolOf(t.can_take_back_ownership) !== null ? !boolOf(t.can_take_back_ownership) : null} />
          <Badge
            label="Código verificado"
            risky={boolOf(t.is_open_source) !== null ? boolOf(t.is_open_source) : null}
          />
          <Badge
            label="Owner"
            risky={t.owner_percent !== undefined && parseFloat(t.owner_percent) > 50 ? true : null}
            info={t.owner_percent !== undefined ? `${t.owner_percent}%` : undefined}
          />
        </div>
      </div>

      {t.lp_holder_count !== undefined && (
        <div style={{ color: "#9b9b9b", fontSize: 11, marginTop: 6 }}>
          LP holders: {t.lp_holder_count}
          {t.lp_total_supply ? ` · LP total: ${t.lp_total_supply}` : ""}
        </div>
      )}

      {risk.reasons.length > 0 && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(255, 109, 109, 0.12)",
            border: "1px solid rgba(255, 109, 109, 0.4)",
            color: "#ff8f8f",
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
          }}
        >
          <b>Motivos de riesgo:</b>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
            {risk.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
