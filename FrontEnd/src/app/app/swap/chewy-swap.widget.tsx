import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits, getAddress } from "ethers";
import {
  CHEWYSWAP,
  ROUTER_ABI,
  ERC20_ABI,
  SHIBARIUM_TOKENS,
  ChewyToken,
  BONE_NATIVE_ADDRESS,
} from "src/app/Service/chewyswap";

interface ChewySwapWidgetProps {
  provider: BrowserProvider | null;
}

const WBONE = SHIBARIUM_TOKENS.find((t) => t.symbol === "WBONE")!;

function getTokenByAddress(address: string): ChewyToken {
  const key = address.toLowerCase();
  const hit = SHIBARIUM_TOKENS.find((t) => t.address.toLowerCase() === key);
  return hit || WBONE;
}

export default function ChewySwapWidget({ provider }: ChewySwapWidgetProps) {
  const [tokenIn, setTokenIn] = useState<ChewyToken>(SHIBARIUM_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<ChewyToken>(SHIBARIUM_TOKENS[4]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [balance, setBalance] = useState<string>("");
  const [slippage, setSlippage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useMemo(
    () => (provider ? (new Contract(CHEWYSWAP.router, ROUTER_ABI, provider) as any) : null),
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

  const getQuote = useCallback(async () => {
    if (!router || !amountIn || !path.length) {
      setAmountOut("");
      return;
    }
    try {
      setLoading(true);
      setError(null);
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
      let tx;

      if (tokenIn.isNative) {
        tx = await connectedRouter.swapExactETHForTokens(minOut, path, signerAddress, deadline, {
          value: parsedIn,
        });
      } else if (tokenOut.isNative) {
        const token = new Contract(tokenIn.address, ERC20_ABI, signer) as any;
        const allowance = await token.allowance(signerAddress, CHEWYSWAP.router);
        if (allowance < parsedIn) {
          const approveTx = await token.approve(CHEWYSWAP.router, "115792089237316195423570985008687907853269984665640564039457584007913129639935");
          await approveTx.wait();
        }
        tx = await connectedRouter.swapExactTokensForETH(parsedIn, minOut, path, signerAddress, deadline);
      } else {
        const token = new Contract(tokenIn.address, ERC20_ABI, signer) as any;
        const allowance = await token.allowance(signerAddress, CHEWYSWAP.router);
        if (allowance < parsedIn) {
          const approveTx = await token.approve(CHEWYSWAP.router, "115792089237316195423570985008687907853269984665640564039457584007913129639935");
          await approveTx.wait();
        }
        tx = await connectedRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          parsedIn, minOut, path, signerAddress, deadline
        );
      }

      const receipt = await tx.wait();
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
        <span>ChewySwap · gas {tokenIn.isNative || tokenOut.isNative ? "BONE" : tokenIn.symbol}</span>
      </div>

      <button style={styles.swapBtn} disabled={loading} onClick={doSwap}>
        {loading ? "Processing…" : `Swap on ChewySwap`}
      </button>

      {error && <div style={{ ...styles.msg, color: "#ff6b6b" }}>{error}</div>}
      {success && <div style={{ ...styles.msg, color: "#4ade80" }}>{success}</div>}
    </div>
  );
}
