const API_URL =
  'https://one.alensis.cz/api2/rest/inbounds/processItemsFromScanningStation';

export const processBarcodesAlensa = async (barcodes: string[]) => {
  try {
    // ✅ Kontrola vstupu
    if (!Array.isArray(barcodes) || barcodes.length === 0) {
      return { success: false, error: 'No barcodes provided' };
    }

    // ✅ Odeslání požadavku
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barcodes }),
    });

    const data = await res.json();

    // ✅ Zpracování odpovědi
    if (!res.ok) {
      // HTTP chyba (např. 400)
      return {
        success: false,
        error: data?.error || `HTTP error ${res.status}`,
      };
    }

    if (data.status !== true) {
      // Business chyba (status=false)
      return {
        success: false,
        error: data?.error || 'Unknown error',
      };
    }

    // ✅ Úspěch
    return { success: true, error: null };
  } catch (err: any) {
    // ✅ Síťová nebo jiná chyba
    return {
      success: false,
      error: err.message || 'Network error',
    };
  }
};
