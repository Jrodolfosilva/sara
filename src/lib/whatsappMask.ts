// Só números BR (DDI 55) por ora.
export function formatWhatsappBR(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 13);
  let out = "";
  if (d.length > 0) out += "+" + d.slice(0, 2);
  if (d.length > 2) out += " (" + d.slice(2, 4) + ")";
  if (d.length > 4) {
    const resto = d.slice(4);
    out += resto.length > 4 ? " " + resto.slice(0, -4) + "-" + resto.slice(-4) : " " + resto;
  }
  return out;
}

// Completo = 55 + DDD (2) + celular com 9º dígito (9) = 13 dígitos.
export function isWhatsappCompleto(value: string): boolean {
  return value.replace(/\D/g, "").length === 13;
}
