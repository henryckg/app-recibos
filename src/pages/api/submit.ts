import type { APIRoute } from 'astro';
import { google } from 'googleapis';
import { v2 as cloudinary } from 'cloudinary';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getGoogleAuth() {
  const serviceAccountEmail = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return auth;
}

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: import.meta.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: import.meta.env.CLOUDINARY_API_SECRET?.trim(),
});

async function uploadImageToCloudinary(file: File, fileName: string): Promise<string> {
  // Validación de configuración
  if (!import.meta.env.CLOUDINARY_CLOUD_NAME || !import.meta.env.CLOUDINARY_API_KEY || !import.meta.env.CLOUDINARY_API_SECRET) {
    throw new Error('Faltan credenciales de Cloudinary en el archivo .env');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataURI,
      {
        folder: 'recibos-alfaparf',
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    );
  });
}

async function appendToSheet(auth: any, values: any[][]): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = import.meta.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Google Sheet ID not configured');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

function parseFormData(formData: FormData): any {
  const data: any = {
    numeroRecibo: formData.get('numeroRecibo'),
    nombreVendedor: formData.get('nombreVendedor'),
    nombreCliente: formData.get('nombreCliente'),
    rut: formData.get('rut') || '',
    sap: formData.get('sap') || '',
    montoTotal: formData.get('montoTotal'),
    formasPago: [],
    facturas: [],
  };

  const formasPagoMap = new Map<string, any>();
  const facturasMap = new Map<string, any>();

  for (const [key, value] of formData.entries()) {
    const formasPagoMatch = key.match(/formaPago\[(\d+)\]\[(\w+)\]/);
    if (formasPagoMatch) {
      const [, index, field] = formasPagoMatch;
      if (!formasPagoMap.has(index)) {
        formasPagoMap.set(index, {});
      }
      formasPagoMap.get(index)[field] = value;
    }

    const facturasMatch = key.match(/factura\[(\d+)\]\[(\w+)\]/);
    if (facturasMatch) {
      const [, index, field] = facturasMatch;
      if (!facturasMap.has(index)) {
        facturasMap.set(index, {});
      }
      facturasMap.get(index)[field] = value;
    }
  }

  data.formasPago = Array.from(formasPagoMap.values());
  data.facturas = Array.from(facturasMap.values());

  return data;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const data = parseFormData(formData);

    const auth = getGoogleAuth();

    const fotoRecibo = formData.get('fotoRecibo') as File;
    const fotosAdicionales = formData.getAll('fotosAdicionales') as File[];

    let fotoReciboUrl = '';
    const fotosAdicionalesUrls: string[] = [];

    if (fotoRecibo && fotoRecibo.size > 0) {
      const timestamp = Date.now();
      const fileName = `recibo_${data.numeroRecibo}_${timestamp}.${fotoRecibo.name.split('.').pop()}`;
      fotoReciboUrl = await uploadImageToCloudinary(fotoRecibo, fileName);
    }

    for (let i = 0; i < fotosAdicionales.length; i++) {
      const foto = fotosAdicionales[i];
      if (foto && foto.size > 0) {
        const timestamp = Date.now();
        const fileName = `recibo_${data.numeroRecibo}_adicional_${i + 1}_${timestamp}.${foto.name.split('.').pop()}`;
        const url = await uploadImageToCloudinary(foto, fileName);
        fotosAdicionalesUrls.push(url);
      }
    }

    const formasPagoStr = data.formasPago.map((fp: any) => {
      let str = `${fp.tipo}: $${fp.monto} (${fp.fecha})`;
      if (fp.comprobante) str += ` - Comp: ${fp.comprobante}`;
      if (fp.fechaVencimiento) str += ` - Venc: ${fp.fechaVencimiento}`;
      if (fp.numeroCheque) str += ` - Cheque: ${fp.numeroCheque}`;
      return str;
    }).join(' | ');

    const facturasStr = data.facturas.map((f: any) => {
      let str = `Fact ${f.numero}: $${f.monto}`;
      if (f.cuota) str += ` (Cuota: ${f.cuota})`;
      return str;
    }).join(' | ');

    const row = [
      new Date().toISOString(),
      data.numeroRecibo,
      data.nombreVendedor,
      data.nombreCliente,
      data.rut,
      data.sap,
      data.montoTotal,
      formasPagoStr,
      facturasStr,
      fotoReciboUrl,
      fotosAdicionalesUrls.join(', '),
    ];

    await appendToSheet(auth, [row]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Recibo enviado exitosamente',
        sheetUrl: `https://docs.google.com/spreadsheets/d/${import.meta.env.GOOGLE_SHEET_ID}`,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error al procesar el recibo' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
