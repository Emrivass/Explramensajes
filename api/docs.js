// Función serverless de Vercel:  GET /api/docs
//   Rastrea (recursivamente) la carpeta maestra de Drive y devuelve la lista de
//   archivos { id, name, mime, path:[carpetas ancestro] }. La herramienta los
//   mapea al repertorio (dossiers, presupuestos, recursos) aplicando Explora > Ucademy.
// Env vars en Vercel:
//   GOOGLE_API_KEY   (clave de API de Google con la "Google Drive API" habilitada)
//   DRIVE_FOLDER_ID  (opcional; por defecto la carpeta maestra de recursos)
// Requisito: la carpeta de Drive debe estar compartida como "cualquiera con el enlace".
const ROOT = process.env.DRIVE_FOLDER_ID || "17c_VSh2R85h4YJ_Mh4t7GqAubgA1eMGb";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const key = process.env.GOOGLE_API_KEY;
  if (!key) { res.status(400).json({ error: "sin GOOGLE_API_KEY" }); return; }

  const files = [];
  let calls = 0;
  async function listFolder(id, path) {
    let pageToken = "";
    do {
      if (++calls > 200) return; // tope de seguridad
      const q = "'" + id + "' in parents and trashed = false";
      const url =
        "https://www.googleapis.com/drive/v3/files?key=" + encodeURIComponent(key) +
        "&q=" + encodeURIComponent(q) +
        "&fields=" + encodeURIComponent("nextPageToken,files(id,name,mimeType)") +
        "&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true&orderBy=name" +
        (pageToken ? "&pageToken=" + pageToken : "");
      const r = await fetch(url);
      const j = await r.json();
      if (j.error) throw new Error((j.error && j.error.message) || "Drive API error");
      for (const f of (j.files || [])) {
        if (f.mimeType === "application/vnd.google-apps.folder") {
          await listFolder(f.id, path.concat(f.name));
        } else {
          files.push({ id: f.id, name: f.name, mime: f.mimeType, path: path });
        }
      }
      pageToken = j.nextPageToken || "";
    } while (pageToken);
  }

  try {
    await listFolder(ROOT, []);
    res.status(200).json({ files: files });
  } catch (e) {
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
