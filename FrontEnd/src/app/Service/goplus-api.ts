import { environment } from '../../environments/environment';
import {
  GoPlusApiResponse,
  GoPlusApprovalSecurity,
  GoPlusSimulationRequest,
  GoPlusSimulationResult,
  GoPlusTokenSecurity,
} from '../Interface/goplus.interface';

const BASE = environment.apiUrl;

export async function getTokenSecurity(
  chainId: number,
  address: string
): Promise<GoPlusTokenSecurity | null> {
  try {
    const res = await fetch(
      `${BASE}/api/goplus/token-security/${chainId}?address=${encodeURIComponent(address)}`
    );
    if (!res.ok) return null;
    const body: GoPlusApiResponse<GoPlusTokenSecurity> = await res.json();
    return body?.available ? body.data ?? null : null;
  } catch {
    return null;
  }
}

export async function getApprovalSecurity(
  chainId: number,
  address: string
): Promise<GoPlusApprovalSecurity | null> {
  try {
    const res = await fetch(
      `${BASE}/api/goplus/approval-security/${chainId}?address=${encodeURIComponent(address)}`
    );
    if (!res.ok) return null;
    const body: GoPlusApiResponse<GoPlusApprovalSecurity> = await res.json();
    return body?.available ? body.data ?? null : null;
  } catch {
    return null;
  }
}

export async function simulateTransaction(
  payload: GoPlusSimulationRequest
): Promise<GoPlusSimulationResult | null> {
  try {
    const res = await fetch(`${BASE}/api/goplus/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const body: GoPlusApiResponse<GoPlusSimulationResult> = await res.json();
    return body?.available ? body.data ?? null : null;
  } catch {
    return null;
  }
}
