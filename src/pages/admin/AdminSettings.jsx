import { useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";

const LABELS = {
  show_layanan: "Tampilkan Section Produk Pilihan di Home",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("setting_key, setting_value");
      const map = {};
      for (const row of data || []) map[row.setting_key] = row.setting_value === "1";
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  async function toggle(key) {
    const next = !settings[key];
    setSettings((s) => ({ ...s, [key]: next }));
    setSaved(false);
    await adminWrite({ entity: "settings", action: "update", id: key, payload: { setting_value: next ? "1" : "0" } });
    setSaved(true);
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Pengaturan Tampilan</h1>

      {loading ? (
        <p className="text-slate-400">Memuat…</p>
      ) : (
        <div className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-card">
          {Object.keys(LABELS).map((key) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3.5">
              <span className="text-sm font-medium text-slate-700">{LABELS[key]}</span>
              <input
                type="checkbox"
                checked={!!settings[key]}
                onChange={() => toggle(key)}
                className="h-5 w-5 rounded border-slate-300 text-brand-600"
              />
            </label>
          ))}
          {saved && <p className="text-sm font-medium text-mint-600">Tersimpan.</p>}
        </div>
      )}
    </AdminShell>
  );
}
