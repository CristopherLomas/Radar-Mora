export default function ApiOfflineBanner() {
  return (
    <div className="api-offline-banner">
      <h3>No se pudo conectar con el servidor</h3>
      <p>El dashboard necesita el backend en marcha. En otra máquina, la primera vez puede tardar varios minutos (genera datos y entrena el modelo).</p>
      <ol>
        <li>Desde la raíz del proyecto: <code>.\scripts\setup.ps1</code> (solo la primera vez)</li>
        <li>Abre una terminal en <code>backend</code></li>
        <li>
          <code>.\venv\Scripts\python.exe start.py</code> (Windows) — no uses <code>python start.py</code> desde la raíz
        </li>
        <li>Espera <strong>3–8 minutos</strong> la primera vez hasta ver &quot;Uvicorn running on http://0.0.0.0:8000&quot;</li>
        <li>En otra terminal: <code>cd frontend</code> → <code>npm run dev</code></li>
        <li>Abre <a href="http://localhost:5173">http://localhost:5173</a> y recarga (Ctrl+F5)</li>
      </ol>
      <p className="api-offline-hint">
        Diagnóstico: <code>.\scripts\verify.ps1</code> · Guía completa: <code>INSTALACION.md</code>
      </p>
    </div>
  );
}
