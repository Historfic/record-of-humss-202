export type PayStatus = "full" | "partial" | "unpaid" | "none";

export function formatPeso(centavos: number): string {
  return "₱" + (centavos / 100).toFixed(2);
}

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

export function paymentStatus(
  dueCentavos: number,
  paidCentavos: number,
): PayStatus {
  if (dueCentavos <= 0) return "none";
  if (paidCentavos <= 0) return "unpaid";
  if (paidCentavos >= dueCentavos) return "full";
  return "partial";
}
