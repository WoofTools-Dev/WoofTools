import * as React from "react";
import { useState } from "react";
import { CHAINS } from "src/app/Service/chain.constants";
import { getTokenSecurity, simulateTransaction } from "src/app/Service/goplus-api";
import {
  evaluateTokenRisk,
  GoPlusRiskSummary,
  GoPlusSimulationResult,
  GoPlusTokenSecurity,
} from "src/app/Interface/goplus.interface";
import TokenSecurityBanner from "./token-security-banner";

interface SecurityPanelProps {
  chainId: number;
  style?: React.CSSProperties;
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export default function SecurityPanel({ chainId, style }: SecurityPanelProps) {
  const chainKey: "ethereum" | "shibarium" =
    chainId === CHAINS.ethereum.chainId ? "ethereum" : "shibarium";
  const rpcUrl = CHAINS[chainKey].rpcUrl;

  const [address, setAddress] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "loading" | "available" | "unavailable">("idle");
  const [tokenSecurity, setTokenSecurity] = useState<GoPlusTokenSecurity | null>(null);
  const [riskSummary, setRiskSummary] = useState<GoPlusRiskSummary | null>(null);

  const [simFrom, setSimFrom] = useState("");
  const [simTo, setSimTo] = useState("");
  const [simData, setSimData] = useState("");
  const [simValue, setSimValue] = useState("");
  const [simStatus, setSimStatus] = useState<"idle" | "loading" | "done" | "unavailable">("idle");
  const [simResult, setSimResult] = useState<GoPlusSimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const verify = async () => {
    if (!ADDRESS_RE.test(address)) return;
    setTokenStatus("loading");
    const result = await getTokenSecurity(chainId, address);
    if (result) {
      setTokenSecurity(result);
      setRiskSummary(evaluateTokenRisk(result));
      setTokenStatus("available");
    } else {
      setTokenSecurity(null);
      setRiskSummary(null);
      setTokenStatus("unavailable");
    }
  };

  const runSimulation = async () => {
    if (!simFrom || !simTo || !simData) {
      setSimError("from, to y data son obligatorios");
      return;
    }
    setSimError(null);
    setSimStatus("loading");
    const result = await simulateTransaction({
      chain_id: String(chainId),
      url: rpcUrl,
      from: simFrom,
      to: simTo,
      data: simData,
      value: simValue || "0",
    });
    if (result) {
      setSimResult(result);
      setSimStatus("done");
    } else {
      setSimResult(null);
      setSimStatus("unavailable");
    }
  };

  const panelStyle: React.CSSProperties = {
    background: "#161616",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    maxWidth: 420,
    marginLeft: "auto",
    marginRight: "auto",
    fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif",
    color: "#fff",
    textAlign: "left",
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    background: "#202020",
    border: "1px solid #444",
    borderRadius: 6,
    color: "#fff",
    padding: "6px 8px",
    fontSize: 13,
    width: "100%",
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    background: "var(--primary, #ea801e)",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    padding: "6px 12px",
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Seguridad (GoPlus)</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={inputStyle}
          placeholder="Dirección del token (0x…)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button style={btnStyle} onClick={verify} disabled={tokenStatus === "loading"}>
          Verificar
        </button>
      </div>
      <TokenSecurityBanner
        status={tokenStatus}
        data={tokenSecurity}
        summary={riskSummary}
        tokenSymbol={tokenSecurity?.token_symbol}
      />

      <div style={{ fontWeight: 600, fontSize: 12, margin: "12px 0 6px", color: "#9b9b9b" }}>
        Simulación de transacción (avanzado)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <input style={inputStyle} placeholder="from (0x…)" value={simFrom} onChange={(e) => setSimFrom(e.target.value)} />
        <input style={inputStyle} placeholder="to (0x…)" value={simTo} onChange={(e) => setSimTo(e.target.value)} />
        <input style={inputStyle} placeholder="data (hex calldata)" value={simData} onChange={(e) => setSimData(e.target.value)} />
        <input style={inputStyle} placeholder="value (wei, opcional)" value={simValue} onChange={(e) => setSimValue(e.target.value)} />
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <button style={btnStyle} onClick={runSimulation} disabled={simStatus === "loading"}>
          Simular
        </button>
        <span style={{ fontSize: 12, color: "#9b9b9b" }}>
          {simStatus === "loading"
            ? "Simulando…"
            : simStatus === "unavailable"
            ? "Simulación no disponible"
            : ""}
        </span>
      </div>

      {simError && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 6 }}>{simError}</div>}

      {simStatus === "done" && simResult && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            background: simResult.is_revert
              ? "rgba(255,109,109,0.12)"
              : simResult.flagged?.length
              ? "rgba(255,209,102,0.12)"
              : "rgba(74,222,128,0.12)",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 8,
            color: simResult.is_revert ? "#ff8f8f" : simResult.flagged?.length ? "#ffd166" : "#4ade80",
          }}
        >
          {simResult.is_revert
            ? "La transacción revertiría."
            : simResult.flagged?.length
            ? `Advertencias: ${simResult.flagged.map((f) => f.message || f.type).join(" · ")}`
            : "Transacción simulada sin errores."}
          {simResult.erc20_balance_changes?.length ? (
            <div style={{ marginTop: 4, color: "#9b9b9b" }}>
              Cambios de balance ERC-20: {simResult.erc20_balance_changes.length} cuenta(s)
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
