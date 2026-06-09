// Cliente de upload com progresso real via XHR (Server Actions não expõem
// progresso). Envia para /api/upload e reporta a % por onProgress.
export function enviarImagemComProgresso(
  file: File,
  escopo: string,
  onProgress: (pct: number) => void
): Promise<{ chave: string; url: string }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("arquivo", file);
    fd.append("escopo", escopo);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && j.ok) {
          onProgress(100);
          resolve({ chave: j.chave, url: j.url });
        } else {
          reject(new Error(j.erro || "Falha no upload"));
        }
      } catch {
        reject(new Error("Resposta inválida do servidor"));
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    xhr.onabort = () => reject(new Error("Upload cancelado"));
    xhr.send(fd);
  });
}
