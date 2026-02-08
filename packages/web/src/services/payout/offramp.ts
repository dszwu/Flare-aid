/**
 * Off-ramp Adapter Interface & Mock Implementation
 *
 * In production this would integrate with Transak, Kotani Pay, or
 * a bridge → DEX → fiat flow. For the MVP we use a mock adapter
 * that simulates the conversion.
 */

export interface OfframpQuote {
  flrAmount: string; // wei
  fiatCurrency: string;
  fiatAmount: string;
  exchangeRate: string; // FLR/fiat
  fee: string;
}

export interface OfframpResult {
  success: boolean;
  referenceHash: string;
  fiatAmount: string;
  fiatCurrency: string;
  timestamp: number;
}

export interface IOfframpAdapter {
  name: string;
  getQuote(amountWei: string, targetCurrency: string): Promise<OfframpQuote>;
  execute(amountWei: string, targetCurrency: string, recipientRef: string): Promise<OfframpResult>;
}

/**
 * Mock off-ramp adapter for development / testnet.
 * Simulates conversion at a fixed FLR/USD rate of $0.025.
 */
export class MockOfframpAdapter implements IOfframpAdapter {
  name = "MockOfframp";

  private readonly MOCK_FLR_USD = 0.025;

  async getQuote(amountWei: string, targetCurrency: string): Promise<OfframpQuote> {
    const flrAmount = Number(amountWei) / 1e18;
    const usdAmount = flrAmount * this.MOCK_FLR_USD;
    const fee = usdAmount * 0.015; // 1.5% fee
    const netAmount = usdAmount - fee;

    return {
      flrAmount: amountWei,
      fiatCurrency: targetCurrency,
      fiatAmount: netAmount.toFixed(2),
      exchangeRate: this.MOCK_FLR_USD.toString(),
      fee: fee.toFixed(2),
    };
  }

  async execute(
    amountWei: string,
    targetCurrency: string,
    recipientRef: string
  ): Promise<OfframpResult> {
    const quote = await this.getQuote(amountWei, targetCurrency);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 500));

    return {
      success: true,
      referenceHash: `mock_${Date.now()}_${recipientRef.slice(0, 8)}`,
      fiatAmount: quote.fiatAmount,
      fiatCurrency: targetCurrency,
      timestamp: Date.now(),
    };
  }
}
