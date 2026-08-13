import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import {
  SHIBASWAP,
  ROUTER_ABI,
  ERC20_ABI,
  SHIBARIUM_TOKENS,
  ShibaToken,
  BONE_NATIVE_ADDRESS,
} from "src/app/Service/shibaswap";
import { CHAINS } from "src/app/Service/chain.constants";
import {
  getApprovalSecurity,
  getTokenSecurity,
  simulateTransaction,
} from "src/app/Service/goplus-api";
import {
  evaluateTokenRisk,
  getSimulationReceived,
  GoPlusRiskSummary,
  GoPlusSimulationResult,
  GoPlusTokenSecurity,
} from "src/app/Interface/goplus.interface";
import TokenSecurityBanner from "./token-security-banner";

interface ShibaSwapWidgetProps {
  provider: BrowserProvider | null;
}

const SHIBARIUM_CHAIN_ID = CHAINS.shibarium.chainId;
const SHIBARIUM_RPC_URL = CHAINS.shibarium.rpcUrl;

const WBONE = SHIBARIUM_TOKENS.find((t) => t.symbol === "WBONE")!;

function getTokenByAddress(address: string): ShibaToken {
  const key = address.toLowerCase();
  const hit = SHIBARIUM_TOKENS.find((t) => t.address.toLowerCase() === key);
  return hit || WBONE;
}

export default function ShibaSwapWidget({ provider }: ShibaSwapWidgetProps) {
  const [tokenIn, setTokenIn] = useState<ShibaToken>(SHIBARIUM_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<ShibaToken>(SHIBARIUM_TOKENS[4]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [balance, setBalance] = useState<string>("");
  const [slippage, setSlippage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [securityStatus, setSecurityStatus] = useState<"idle" | "loading" | "available" | "unavailable">("idle");
  const [tokenSecurity, setTokenSecurity] = useState<GoPlusTokenSecurity | null>(null);
  const [riskSummary, setRiskSummary] = useState<GoPlusRiskSummary | null>(null);

  const [simResult, setSimResult] = useState<GoPlusSimulationResult | null>(null);
  const [simWarning, setSimWarning] = useState<string | null>(null);
  const [simReceived, setSimReceived] = useState<string | null>(null);
  const [confirmOverride, setConfirmOverride] = useState(false);

  const router = useMemo(
    () => (provider ? (new Contract(SHIBASWAP.router, ROUTER_ABI, provider) as any) : null),
    [provider]
  );

  const signerRouter = useMemo(
    () => router && provider?.getSigner().then((s) => router.connect(s)),
    [router, provider]
  );

  const path = useMemo(() => {
    const a = tokenIn.isNative ? WBONE : tokenIn;
    const b = tokenOut.isNative ? WBONE : tokenOut;
    if (a.address.toLowerCase() === b.address.toLowerCase()) return [];
    return [a.address, b.address];
  }, [tokenIn, tokenOut]);

  const loadBalance = useCallback(async () => {
    if (!provider || !tokenIn) return;
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      if (tokenIn.isNative) {
        const bal = await provider.getBalance(address);
        setBalance(formatUnits(bal, tokenIn.decimals));
      } else {
        const token = new Contract(tokenIn.address, ERC20_ABI, provider) as any;
        const bal = await token.balanceOf(address);
        setBalance(formatUnits(bal, tokenIn.decimals));
      }
    } catch {
      setBalance("");
    }
  }, [provider, tokenIn]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const checkTokenSecurity = useCallback(async () => {
    const address = tokenIn.isNative ? "" : tokenIn.address;
    if (!address) {
      setSecurityStatus("idle");
      setTokenSecurity(null);
      setRiskSummary(null);
      return;
    }
    setSecurityStatus("loading");
    const result = await getTokenSecurity(SHIBARIUM_CHAIN_ID, address);
    if (result) {
      setTokenSecurity(result);
      setRiskSummary(evaluateTokenRisk(result));
      setSecurityStatus("available");
    } else {
      setTokenSecurity(null);
      setRiskSummary(null);
      setSecurityStatus("unavailable");
    }
  }, [tokenIn]);

  useEffect(() => {
    const t = setTimeout(checkTokenSecurity, 500);
    return () => clearTimeout(t);
  }, [checkTokenSecurity]);

  const getQuote = useCallback(async () => {
    if (!router || !amountIn || !path.length) {
      setAmountOut("");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSimResult(null);
      setSimWarning(null);
      setSimReceived(null);
      setConfirmOverride(false);
      const parsed = parseUnits(amountIn, tokenIn.decimals);
      const amounts = await router.getAmountsOut(parsed, path);
      const out = amounts[amounts.length - 1];
      const minOut = (out * BigInt(Math.round((100 - slippage) * 100))) / BigInt(10000);
      setAmountOut(formatUnits(minOut, tokenOut.decimals));
    } catch (e: any) {
      setError(`Quote failed: ${e?.shortMessage || e?.message || "no liquidity"}`);
      setAmountOut("");
    } finally {
      setLoading(false);
    }
  }, [router, amountIn, path, tokenIn, tokenOut, slippage]);

  useEffect(() => {
    const t = setTimeout(getQuote, 400);
    return () => clearTimeout(t);
  }, [getQuote]);

  const doSwap = async () => {
    setError(null);
    setSuccess(null);
    if (!provider) {
      setError("Wallet not connected");
      return;
    }
    if (!amountIn || !path.length) {
      setError("Select two different tokens");
      return;
    }
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const parsedIn = parseUnits(amountIn, tokenIn.decimals);
      const amounts = await router!.getAmountsOut(parsedIn, path);
      const minOut = (amounts[amounts.length - 1] * BigInt(Math.round((100 - slippage) * 100))) / BigInt(10000);

      const connectedRouter = (await signerRouter)!;
      const iface = (new Contract(SHIBASWAP.router, ROUTER_ABI, provider) as any).interface;

      let data: string;
      let value = "0";
      let swapCall: () => Promise<any>;

      if (tokenIn.isNative) {
        data = iface.encodeFunctionData("swapExactETHForTokens", [
          minOut.toString(),
          path,
          signerAddress,
          deadline,
        ]);
        value = parsedIn.toString();
        swapCall = () =>
          connectedRouter.swapExactETHForTokens(minOut, path, signerAddress, deadline, {
            value: parsedIn,
          });
      } else if (tokenOut.isNative) {
        data = iface.encodeFunctionData("swapExactTokensForETH", [
          parsedIn.toString(),
          minOut.toString(),
          path,
          signerAddress,
          deadline,
        ]);
        swapCall = () =>
          connectedRouter.swapExactTokensForETH(parsedIn, minOut, path, signerAddress, deadline);
      } else {
        data = iface.encodeFunctionData("swapExactTokensForTokensSupportingFeeOnTransferTokens", [
          parsedIn.toString(),
          minOut.toString(),
          path,
          signerAddress,
          deadline,
        ]);
        swapCall = () =>
          connectedRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            parsedIn,
            minOut,
            path,
            signerAddress,
            deadline
          );
      }

      // Transaction Simulation (GoPlus capa 2)
      const sim = await simulateTransaction({
        chain_id: String(SHIBARIUM_CHAIN_ID),
        url: SHIBARIUM_RPC_URL,
        from: signerAddress,
        to: SHIBASWAP.router,
        data,
        value,
      });
      setSimResult(sim);
      if (sim) {
        const flags = sim.flagged || [];
        if (sim.is_revert) {
          setError("La simulación indica que la transacción fallaría (revert). Operación cancelada.");
          setLoading(false);
          return;
        }
        if (flags.length > 0 && !confirmOverride) {
          setSimWarning(
            `La simulación detectó riesgos: ${flags.map((f) => f.message || f.type).join(" · ")}`
          );
          setConfirmOverride(true);
          setError("Revisa las advertencias y pulsa Swap de nuevo para continuar de todos modos.");
          setLoading(false);
          return;
        }
        if (flags.length === 0) setSimWarning(null);
        if (!tokenOut.isNative) {
          const recv = getSimulationReceived(sim, signerAddress, tokenOut.address);
          if (recv !== null) setSimReceived(formatUnits(recv, tokenOut.decimals));
        }
      }

      // Approval Security (GoPlus capa 3) + approve por monto exacto
      if (!tokenIn.isNative) {
        const token = new Contract(tokenIn.address, ERC20_ABI, signer) as any;
        const allowance = await token.allowance(signerAddress, SHIBASWAP.router);
        if (allowance < parsedIn) {
          const approval = await getApprovalSecurity(SHIBARIUM_CHAIN_ID, SHIBASWAP.router);
          if (
            approval &&
            (approval.doubt_list === "1" ||
              (approval.malicious_behavior && approval.malicious_behavior !== "0"))
          ) {
            setError(
              "Approval Security: el contrato spender tiene riesgos detectados. Operación bloqueada."
            );
            setLoading(false);
            return;
          }
          const approveTx = await token.approve(SHIBASWAP.router, parsedIn.toString());
          await approveTx.wait();
        }
      }

      const tx = await swapCall();
      const receipt = await tx.wait();
      setConfirmOverride(false);
      setSuccess(`Swap confirmed! Tx: ${receipt.hash.slice(0, 10)}...${receipt.hash.slice(-8)}`);
      loadBalance();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Swap failed");
    } finally {
      setLoading(false);
    }
  };

  const setMax = () => {
    if (balance) setAmountIn(balance);
  };

  const switchTokens = () => {
    const tmp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tmp);
    setAmountIn("");
    setAmountOut("");
  };

  const selectTokenIn = (symbol: string) => {
    const tok = SHIBARIUM_TOKENS.find((t) => t.symbol === symbol);
    if (!tok) return;
    if (tok.address.toLowerCase() === tokenOut.address.toLowerCase()) {
      setTokenOut(tokenIn);
    }
    setTokenIn(tok);
    setAmountIn("");
    setAmountOut("");
  };

  const selectTokenOut = (symbol: string) => {
    const tok = SHIBARIUM_TOKENS.find((t) => t.symbol === symbol);
    if (!tok) return;
    if (tok.address.toLowerCase() === tokenIn.address.toLowerCase()) {
      setTokenIn(tokenOut);
    }
    setTokenOut(tok);
    setAmountIn("");
    setAmountOut("");
  };

  const swapDisabled = loading || (securityStatus === "available" && riskSummary?.level === "critical");

  const styles: {
    card: React.CSSProperties;
    field: React.CSSProperties;
    label: React.CSSProperties;
    input: React.CSSProperties;
    row: React.CSSProperties;
    tokenBtn: React.CSSProperties;
    select: React.CSSProperties;
    swapBtn: React.CSSProperties;
    meta: React.CSSProperties;
    msg: React.CSSProperties;
  } = {
    card: {
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      background: "var(--card-bg, #161616)",
      border: "1px solid #333",
      borderRadius: 12,
      padding: 16,
      fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif",
      color: "var(--text-primary, #fff)",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      background: "#202020",
      border: "1px solid #333",
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },
    label: { fontSize: 12, color: "#9b9b9b", display: "flex", justifyContent: "space-between" },
    input: {
      background: "transparent",
      border: "none",
      color: "#fff",
      fontSize: 18,
      outline: "none",
      width: "100%",
    },
    row: { display: "flex", alignItems: "center", gap: 8 },
    tokenBtn: {
      background: "var(--primary, #ea801e)",
      border: "none",
      borderRadius: 8,
      color: "#fff",
      padding: "6px 12px",
      fontWeight: 600,
      cursor: "pointer",
    },
    select: {
      background: "#2a2a2a",
      color: "#fff",
      border: "1px solid #444",
      borderRadius: 6,
      padding: "4px 6px",
      fontSize: 13,
    },
    swapBtn: {
      width: "100%",
      background: "var(--primary, #ea801e)",
      border: "none",
      borderRadius: 10,
      color: "#fff",
      padding: "14px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 8,
    },
    meta: { fontSize: 12, color: "#9b9b9b", display: "flex", justifyContent: "space-between", marginTop: 6 },
    msg: { fontSize: 13, marginTop: 8, wordBreak: "break-word" as const },
  };

  return (
    <div style={styles.card}>
      <TokenSecurityBanner
        status={securityStatus}
        data={tokenSecurity}
        summary={riskSummary}
        tokenSymbol={tokenIn.symbol}
      />

      <div style={styles.field}>
        <div style={styles.label}>
          <span>From</span>
          <span>Balance: {balance ? parseFloat(balance).toFixed(6) : "—"} {tokenIn.symbol}</span>
        </div>
        <div style={styles.row}>
          <input
            style={styles.input}
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
          <button style={styles.tokenBtn} onClick={setMax}>MAX</button>
          <select style={styles.select} value={tokenIn.symbol} onChange={(e) => selectTokenIn(e.target.value)}>
            {SHIBARIUM_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
        <button onClick={switchTokens} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--primary, #ea801e)", fontSize: 20 }}>⇅</button>
      </div>

      <div style={styles.field}>
        <div style={styles.label}>
          <span>To (estimated)</span>
          <span>{tokenOut.symbol}</span>
        </div>
        <div style={styles.row}>
          <input style={styles.input} type="text" readOnly placeholder="0.0" value={loading ? "…" : amountOut} />
          <select style={styles.select} value={tokenOut.symbol} onChange={(e) => selectTokenOut(e.target.value)}>
            {SHIBARIUM_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.meta}>
        <span>Slippage</span>
        <input
          type="number"
          min={0.1}
          max={50}
          step={0.1}
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
          style={{ width: 60, background: "#2a2a2a", color: "#fff", border: "1px solid #444", borderRadius: 6, padding: "2px 6px", fontSize: 12 }}
        />%
      </div>

      <div style={styles.meta}>
        <span>Min received</span>
        <span>{amountOut ? `${amountOut} ${tokenOut.symbol}` : "—"}</span>
      </div>

      <div style={styles.meta}>
        <span>Route</span>
        <span>ShibaSwap · gas {tokenIn.isNative || tokenOut.isNative ? "BONE" : tokenIn.symbol}</span>
      </div>

      {simReceived && (
        <div style={{ ...styles.meta, color: "#4ade80" }}>
          <span>Simulación recibirás ≈</span>
          <span>{simReceived} {tokenOut.symbol}</span>
        </div>
      )}

      {simWarning && (
        <div style={{ ...styles.msg, color: "#ffd166" }}>⚠ {simWarning}</div>
      )}

      <button style={styles.swapBtn} disabled={swapDisabled} onClick={doSwap}>
        {loading ? "Processing…" : "Swap on ShibaSwap"}
      </button>

      {error && <div style={{ ...styles.msg, color: "#ff6b6b" }}>{error}</div>}
      {success && <div style={{ ...styles.msg, color: "#4ade80" }}>{success}</div>}
    </div>
  );
}
