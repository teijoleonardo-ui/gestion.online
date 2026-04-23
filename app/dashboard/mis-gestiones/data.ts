export type Transaccion = {
  id: number;
  nro: string;
  bl: string;
  fecha: string;
  estado: "Pagado" | "Pendiente" | "Rechazado" | "En proceso";
  medioPago: string;
  totalUSD: number;
  comprobantes: string[];
  comprobantesRows?: ComprobanteRow[];
};

export type ComprobanteEstado = "Disponible" | "Pendiente" | "No disponible";

export type ComprobanteRow = {
  id: string;
  tipo: string; // Ej: "Recibo", "Diferencia de cambio", "Libre deuda", etc.
  transaccion: string; // Ej: "1633500"
  comprobante: string; // Ej: "0001-00039287"
  facturadoA: string; // Ej: "TOYOTA ARGENTINA S.A."
  moneda: string; // Ej: "ARS" | "USD"
  importe: number;
  cotizacion: number | null;
  item: string; // Ej: "ONEYBUEG02687300"
  contenedor: string; // Ej: "MSCU1234567"
  estado: ComprobanteEstado;
};

export const mockTransacciones: Transaccion[] = [
  {
    id: 1,
    nro: "TRX-2024-00187",
    bl: "MSCU1234567",
    fecha: "10/04/2025",
    estado: "Pagado",
    medioPago: "VEP",
    totalUSD: 545.0,
    comprobantes: ["Boleta de Transacción Web", "Recibo de Pago", "Factura"],
    comprobantesRows: [
      {
        id: "cmp-1",
        tipo: "Recibo",
        transaccion: "1633500",
        comprobante: "0001-00039287",
        facturadoA: "TOYOTA ARGENTINA S.A.",
        moneda: "ARS",
        importe: 406890.0,
        cotizacion: 1370.0,
        item: "ONEYBUEG02687300",
        contenedor: "MSCU1234567",
        estado: "Disponible",
      },
      {
        id: "cmp-2",
        tipo: "Recibo",
        transaccion: "1633500",
        comprobante: "0001-00039290",
        facturadoA: "TOYOTA ARGENTINA S.A.",
        moneda: "ARS",
        importe: 5059410.0,
        cotizacion: 1370.0,
        item: "ONEYBUEG02687300",
        contenedor: "MSCU1234567",
        estado: "Disponible",
      },
      {
        id: "cmp-3",
        tipo: "Diferencia de cambio",
        transaccion: "1633500",
        comprobante: "0001-00012012",
        facturadoA: "TOYOTA ARGENTINA S.A.",
        moneda: "ARS",
        importe: 12000.0,
        cotizacion: 1370.0,
        item: "ONEYBUEG02687300",
        contenedor: "MSCU1234567",
        estado: "Disponible",
      },
      {
        id: "cmp-4",
        tipo: "Libre deuda (lleno)",
        transaccion: "1633500",
        comprobante: "LD-00001821",
        facturadoA: "TOYOTA ARGENTINA S.A.",
        moneda: "ARS",
        importe: 0,
        cotizacion: null,
        item: "-",
        contenedor: "MSCU1234567",
        estado: "Disponible",
      },
      {
        id: "cmp-5",
        tipo: "Nota de crédito",
        transaccion: "1633500",
        comprobante: "NC-00000491",
        facturadoA: "TOYOTA ARGENTINA S.A.",
        moneda: "ARS",
        importe: -670.0,
        cotizacion: 1370.0,
        item: "ONEYBUEG02687300",
        contenedor: "MSCU1234567",
        estado: "Disponible",
      },
    ],
  },
  {
    id: 2,
    nro: "TRX-2024-00192",
    bl: "HLCU9876543",
    fecha: "12/04/2025",
    estado: "Pendiente",
    medioPago: "DEBIN",
    totalUSD: 1280.0,
    comprobantes: ["Boleta de Transacción Web"],
    comprobantesRows: [
      {
        id: "cmp-6",
        tipo: "Recibo",
        transaccion: "1634907",
        comprobante: "0001-00029144",
        facturadoA: "QUICKFOOD S.A.",
        moneda: "USD",
        importe: 670.0,
        cotizacion: 1470.0,
        item: "ONEYBUEG02687300",
        contenedor: "HLCU9876543",
        estado: "Pendiente",
      },
    ],
  },
  {
    id: 3,
    nro: "TRX-2024-00195",
    bl: "CMAU5551234",
    fecha: "14/04/2025",
    estado: "Rechazado",
    medioPago: "Transferencia",
    totalUSD: 320.0,
    comprobantes: [],
  },
  {
    id: 4,
    nro: "TRX-2024-00198",
    bl: "OOLU7778899",
    fecha: "15/04/2025",
    estado: "En proceso",
    medioPago: "VEP",
    totalUSD: 890.0,
    comprobantes: ["Boleta de Transacción Web"],
    comprobantesRows: [
      {
        id: "cmp-7",
        tipo: "Certificado de flete",
        transaccion: "1635111",
        comprobante: "CF-00002111",
        facturadoA: "IMPORTADORA S.A.",
        moneda: "USD",
        importe: 120.0,
        cotizacion: 1470.0,
        item: "MSCU1234567",
        contenedor: "OOLU7778899",
        estado: "Disponible",
      },
    ],
  },
];

export function getTransaccionById(id: number) {
  return mockTransacciones.find((t) => t.id === id) ?? null;
}

