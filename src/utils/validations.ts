export function validarRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return false;
  
  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  if (!/^\d+$/.test(cuerpo)) return false;
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto);
  
  return dv === dvCalculado;
}

export function formatearRUT(rut: string): string {
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  if (cleanRut.length < 2) return rut;
  
  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${cuerpoFormateado}-${dv}`;
}

export function validarSAP(sap: string): boolean {
  if (!sap || typeof sap !== 'string') return false;
  
  const cleanSap = sap.replace(/\D/g, '');
  
  return cleanSap.length === 9 && /^\d{9}$/.test(cleanSap);
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

export function parsearMoneda(valor: string): number {
  const cleanValue = valor.replace(/[^\d]/g, '');
  return parseInt(cleanValue) || 0;
}
