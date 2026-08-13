export interface GoPlusTokenSecurity {
  token_name?: string;
  token_symbol?: string;
  is_honeypot?: string;
  buy_tax?: string;
  sell_tax?: string;
  is_mintable?: string;
  hidden_owner?: string;
  can_take_back_ownership?: string;
  selfdestruct?: string;
  is_proxy?: string;
  is_open_source?: string;
  is_blacklisted?: string;
  cannot_sell_all?: string;
  is_whitelisted?: string;
  is_airdrop_scam?: string;
  is_phishing?: string;
  is_insider_trading?: string;
  is_anti_whale?: string;
  anti_whale_modifiable?: string;
  owner_change_balance?: string;
  holder_count?: string;
  lp_holder_count?: string;
  lp_total_supply?: string;
  is_lp_locked?: string;
  owner_percent?: string;
  creator_percent?: string;
  owner_address?: string;
  creator_address?: string;
  trust_list?: string;
  holders?: { address: string; is_locked?: number; percentage?: number }[];
}

export interface GoPlusApprovalSecurity {
  contract_name?: string;
  creator_address?: string;
  deployed_time?: number;
  doubt_list?: string;
  is_contract?: string;
  is_open_source?: string;
  is_proxy?: string;
  malicious_behavior?: string;
}

export interface GoPlusSimulationFlag {
  type: string;
  message: string;
}

export interface GoPlusSimulationResult {
  is_revert?: boolean;
  is_simulated?: boolean;
  flagged?: GoPlusSimulationFlag[];
  erc20_balance_changes?: {
    address: string;
    erc20_change: { token_address: string; change: string }[];
  }[];
  erc20_allowance_changes?: {
    owner: string;
    spender: string;
    contract_address: string;
    amount: string;
  }[];
  native_balance_changes?: {
    address: string;
    native_change: { before: string; after: string; change: string };
  }[];
  logs?: unknown[];
}

export interface GoPlusSimulationRequest {
  chain_id: string;
  url?: string;
  from?: string;
  to?: string;
  data?: string;
  value?: string;
  gas_limit?: string;
  gas_price?: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  nonce?: string;
}

export interface GoPlusApiResponse<T> {
  available: boolean;
  data?: T;
  message?: string;
}

export type GoPlusRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GoPlusRiskSummary {
  level: GoPlusRiskLevel;
  reasons: string[];
}

const flag = (value?: string): boolean => value === '1';

export function evaluateTokenRisk(token: GoPlusTokenSecurity | null): GoPlusRiskSummary {
  const reasons: string[] = [];
  if (!token) {
    return { level: 'low', reasons: [] };
  }

  if (flag(token.is_honeypot)) reasons.push('Honeypot detectado');
  if (flag(token.selfdestruct)) reasons.push('El contrato puede autodestruirse');
  if (flag(token.is_airdrop_scam)) reasons.push('Posible airdrop scam');
  if (flag(token.cannot_sell_all)) reasons.push('No se puede vender el 100%');

  if (flag(token.is_mintable)) reasons.push('El owner puede hacer mint ilimitado');
  if (flag(token.can_take_back_ownership)) reasons.push('El owner puede recuperar ownership');
  if (flag(token.is_blacklisted)) reasons.push('Token en listas negras (blacklist)');
  if (flag(token.is_proxy) && !flag(token.is_open_source)) reasons.push('Proxy sin código verificado');
  if (flag(token.owner_change_balance)) reasons.push('El owner puede modificar balances');

  const buyTax = parseFloat(token.buy_tax || '0');
  const sellTax = parseFloat(token.sell_tax || '0');
  if (buyTax > 10) reasons.push(`Buy tax alto (${buyTax}%)`);
  if (sellTax > 10) reasons.push(`Sell tax alto (${sellTax}%)`);
  if (buyTax > 5 && buyTax <= 10) reasons.push(`Buy tax medio (${buyTax}%)`);
  if (sellTax > 5 && sellTax <= 10) reasons.push(`Sell tax medio (${sellTax}%)`);

  const ownerPercent = parseFloat(token.owner_percent || '0');
  if (ownerPercent > 50) reasons.push(`Owner concentra ${ownerPercent}% del supply`);

  let level: GoPlusRiskLevel = 'low';
  if (
    flag(token.is_honeypot) ||
    flag(token.selfdestruct) ||
    flag(token.is_airdrop_scam) ||
    flag(token.cannot_sell_all)
  ) {
    level = 'critical';
  } else if (
    flag(token.is_mintable) ||
    flag(token.can_take_back_ownership) ||
    flag(token.is_blacklisted) ||
    flag(token.owner_change_balance) ||
    buyTax > 10 ||
    sellTax > 10 ||
    ownerPercent > 50 ||
    (flag(token.is_proxy) && !flag(token.is_open_source))
  ) {
    level = 'high';
  } else if (buyTax > 5 || sellTax > 5 || flag(token.hidden_owner)) {
    level = 'medium';
  }

  return { level, reasons };
}

export function getSimulationReceived(
  result: GoPlusSimulationResult | null,
  userAddress: string,
  tokenAddress: string
): string | null {
  if (!result?.erc20_balance_changes) return null;
  const user = result.erc20_balance_changes.find(
    (b) => b.address.toLowerCase() === userAddress.toLowerCase()
  );
  if (!user) return null;
  const change = user.erc20_change.find(
    (c) => c.token_address.toLowerCase() === tokenAddress.toLowerCase()
  );
  if (!change) return null;
  const delta = BigInt(change.change || '0');
  return delta.toString();
}
