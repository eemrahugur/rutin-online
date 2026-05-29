import { useState, useEffect } from "react";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TODAY = 3;
const CONTACT_WHATSAPP = "905XXXXXXXXX";
const CONTACT_EMAIL = "destek@rutin.online";
const SATIN_AL_URL = "https://rutin.online/satin-al";

const EXAMPLE_ROUTINES = [
  { emoji: "📚", title: "Günde 30 dk kitap oku", time: "21:00", category: "gelişim" },
  { emoji: "🏃", title: "Günde 45 dk egzersiz yap", time: "07:00", category: "spor" },
  { emoji: "💧", title: "Günde 2 litre su iç", time: "Gün boyu", category: "sağlık" },
  { emoji: "🧘", title: "Günde 10 dk meditasyon yap", time: "07:30", category: "zihin" },
  { emoji: "✍️", title: "Her gece günlük tut", time: "22:00", category: "gelişim" },
  { emoji: "🌿", title: "Şeker tüketimini azalt", time: "Gün boyu", category: "sağlık" },
  { emoji: "😴", title: "23:00'da uyu", time: "23:00", category: "sağlık" },
  { emoji: "🎵", title: "Günde 20 dk dil öğren", time: "19:00", category: "gelişim" },
  { emoji: "💪", title: "Günde 50 şınav çek", time: "08:00", category: "spor" },
  { emoji: "🥗", title: "Her öğün sebze ye", time: "Gün boyu", category: "sağlık" },
];

const CATS = { spor: "#16A34A", sağlık: "#0EA5E9", gelişim: "#7C3AED", zihin: "#F59E0B" };

const VALID_LICENSES = {
  "RUTIN-2025-DEMO": { name: "Demo Kullanıcı", expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  "RUTIN-TEST-9999": { name: "Test Kullanıcı", expiresAt: new Date(Date.now() - 1000) },
};

const SCREENS = { LANDING:"landing", ACTIVATE:"activate", EXPIRED:"expired", DASHBOARD:"dashboard", ADD:"add", EDIT:"edit", STATS:"stats" };

const Logo = ({ size=28, textSize=22, dotSize=13, color="#16A34A", light="#86EFAC" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3.5" strokeDasharray="110 20" strokeLinecap="round"/>
      <polyline points="15,24 21,30 33,18" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{ fontSize:textSize, fontWeight:700, color, letterSpacing:-0.5, lineHeight:1 }}>
      rutin<span style={{ fontSize:dotSize, color:light, fontWeight:600 }}>.online</span>
    </span>
  </div>
);

function daysLeft(date) { return Math.max(0, Math.ceil((new Date(date) - Date.now()) / 86400000)); }
function formatDate(date) { return new Date(date).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" }); }

export default function RutinOnline() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [routines, setRoutines] = useState([]);
  const [splash, setSplash] = useState(true);
  const [newR, setNewR] = useState({ title:"", emoji:"⭐", time:"", category:"spor" });
  const [editR, setEditR] = useState(null);
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [notifPermission, setNotifPermission] = useState("default");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { setTimeout(() => setSplash(false), 1000); }, []);

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  const showToast = (msg, color = "#16A34A") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const requestNotification = async () => {
    if (!("Notification" in window)) { showToast("Tarayıcın bildirim desteklemiyor.", "#EF4444"); return; }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      showToast("Bildirimler açıldı! ✅");
      scheduleReminders();
    } else {
      showToast("Bildirim izni verilmedi.", "#F59E0B");
    }
  };

  const scheduleReminders = () => {
    routines.forEach(r => {
      if (!r.time || r.time === "Gün boyu") return;
      const [h, m] = r.time.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target - now;
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("rutin.online 🔔", {
            body: `${r.emoji} ${r.title} — zamanı geldi!`,
            icon: "/favicon.ico",
          });
        }
      }, delay);
    });
  };

  const S = {
    app: { minHeight:"100vh", background:"#F8FAF8", fontFamily:"'Segoe UI', system-ui, sans-serif", color:"#1A2E1A" },
    nav: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 28px", background:"white", borderBottom:"1px solid #E8F5E9" },
    btn: (bg="#16A34A", color="white") => ({ background:bg, color, border:"none", borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:600, cursor:"pointer" }),
    card: { background:"white", borderRadius:16, padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid #E8F5E9" },
    input: { width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"13px 16px", fontSize:15, outline:"none", boxSizing:"border-box", color:"#111", fontFamily:"inherit" },
  };

  const todayCompleted = routines.filter(r => r.completedDays.includes(selectedDay)).length;
  const progress = routines.length ? Math.round((todayCompleted / routines.length) * 100) : 0;

  const activateLicense = () => {
    setLicenseError(""); setLicenseLoading(true);
    setTimeout(() => {
      const key = licenseInput.trim().toUpperCase();
      const license = VALID_LICENSES[key];
      if (!license) { setLicenseError("Geçersiz lisans kodu. Lütfen rutin.online'dan aldığın e-postayı kontrol et."); setLicenseLoading(false); return; }
      const expired = new Date(license.expiresAt) < new Date();
      setSession({ name:license.name, expiresAt:license.expiresAt, licenseKey:key });
      setLicenseLoading(false);
      setScreen(expired ? SCREENS.EXPIRED : SCREENS.DASHBOARD);
    }, 1200);
  };

  const toggle = (id) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== id) return r;
      const done = r.completedDays.includes(selectedDay);
      return { ...r, completedDays: done ? r.completedDays.filter(d => d !== selectedDay) : [...r.completedDays, selectedDay], streak: done ? Math.max(0, r.streak-1) : r.streak+1 };
    }));
  };

  const addRoutine = (preset = null) => {
    const r = preset || newR;
    if (!r.title.trim()) return;
    const added = { ...r, id:Date.now(), streak:0, completedDays:[] };
    setRoutines(p => [...p, added]);
    if (!preset) { setNewR({ title:"", emoji:"⭐", time:"", category:"spor" }); setScreen(SCREENS.DASHBOARD); }
    showToast(`"${r.title}" eklendi ✅`);
  };

  const deleteRoutine = (id) => {
    const r = routines.find(r => r.id === id);
    setRoutines(p => p.filter(r => r.id !== id));
    setDeleteConfirm(null);
    showToast(`"${r?.title}" silindi.`, "#6B7280");
  };

  const saveEdit = () => {
    if (!editR?.title.trim()) return;
    setRoutines(p => p.map(r => r.id === editR.id ? editR : r));
    showToast("Rutin güncellendi ✅");
    setEditR(null); setScreen(SCREENS.DASHBOARD);
  };

  // SPLASH
  if (splash) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", background:"white" }}>
      <div style={{ textAlign:"center", animation:"pop 0.6s ease" }}>
        <Logo size={52} textSize={30} dotSize={15} />
        <div style={{ fontSize:13, color:"#86EFAC", marginTop:8, letterSpacing:2 }}>rutinini oluştur</div>
      </div>
      <style>{`@keyframes pop { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );

  // LANDING
  if (screen === SCREENS.LANDING) return (
    <div style={S.app}>
      <nav style={S.nav}>
        <Logo size={22} textSize={16} dotSize={10} />
        <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn("transparent","#16A34A"), border:"1.5px solid #16A34A", padding:"9px 20px", fontSize:14 }}>Lisans Kodu Gir</button>
      </nav>
      <div style={{ maxWidth:540, margin:"0 auto", padding:"64px 24px 40px", textAlign:"center" }}>
        <div style={{ display:"inline-block", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:30, padding:"6px 16px", fontSize:13, color:"#16A34A", marginBottom:28, fontWeight:500 }}>🔥 12.000+ kişi rutinini oluşturdu</div>
        <h1 style={{ fontSize:"clamp(30px,6vw,50px)", fontWeight:800, lineHeight:1.15, marginBottom:20, color:"#111" }}>Küçük alışkanlıklar,<br /><span style={{ color:"#16A34A" }}>büyük değişimler.</span></h1>
        <p style={{ fontSize:16, color:"#6B7280", lineHeight:1.75, marginBottom:40 }}>Kendi rutinlerini oluştur, takip et, geliştir.<br />Her gün biraz daha iyi bir sen.</p>
        <div style={{ ...S.card, marginBottom:20, background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", border:"1.5px solid #86EFAC" }}>
          <div style={{ fontSize:13, color:"#16A34A", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Tek Seferlik Ödeme</div>
          <div style={{ fontSize:48, fontWeight:900, color:"#111", lineHeight:1 }}>249₺</div>
          <div style={{ fontSize:14, color:"#6B7280", margin:"8px 0 20px" }}>1 Yıllık Tam Erişim · Sınırsız Rutin</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24, textAlign:"left" }}>
            {["✅ İstediğin rutinleri kendin oluştur","✅ Haftalık & aylık istatistikler","✅ Seri takibi & motivasyon sistemi","✅ Tamamlanmayan rutinler için bildirim","✅ Tek ödeme, abonelik yok"].map(f => (
              <div key={f} style={{ fontSize:14, color:"#374151" }}>{f}</div>
            ))}
          </div>
          <button onClick={() => window.open(SATIN_AL_URL,"_blank")} style={{ ...S.btn(), width:"100%", borderRadius:14, padding:"16px", fontSize:16, boxShadow:"0 4px 20px rgba(22,163,74,0.3)" }}>Hemen Satın Al →</button>
          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:10 }}>Ödeme sonrası lisans kodun e-postana gelir</div>
        </div>
        <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn("#F9FAFB","#374151"), width:"100%", borderRadius:14, padding:"14px", fontSize:14, border:"1px solid #E5E7EB" }}>Zaten satın aldım — Lisans kodumu gir</button>
        <div style={{ marginTop:48, textAlign:"left" }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#111", marginBottom:16, textAlign:"center" }}>Nasıl çalışır?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["1","💳","rutin.online'dan 249₺ ödeme yap","Güvenli ödeme, tek seferlik"],["2","📧","Lisans kodun e-postana gelir","Anında otomatik gönderilir"],["3","🔑","Kodu uygulamaya gir","1 yıllık erişim başlar"],["4","🔄","1 yıl sonra kolayca yenile","Hızlı yenileme, kesintisiz erişim"]].map(([n,e,t,s]) => (
              <div key={n} style={{ ...S.card, display:"flex", alignItems:"center", gap:14, padding:"16px 20px" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#F0FDF4", border:"1.5px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#16A34A", flexShrink:0 }}>{n}</div>
                <div style={{ fontSize:24, flexShrink:0 }}>{e}</div>
                <div><div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{t}</div><div style={{ fontSize:12, color:"#9CA3AF" }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // AKTİVASYON
  if (screen === SCREENS.ACTIVATE) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:400, padding:40 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Logo size={30} textSize={20} dotSize={12} />
          <div style={{ fontSize:20, fontWeight:800, color:"#111", marginTop:20, marginBottom:6 }}>Lisans Kodunu Gir</div>
          <div style={{ fontSize:14, color:"#9CA3AF", lineHeight:1.6 }}>rutin.online'dan satın alma sonrası e-postana gelen kodu gir</div>
        </div>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>LİSANS KODU</div>
          <input value={licenseInput} onChange={e => { setLicenseInput(e.target.value.toUpperCase()); setLicenseError(""); }} placeholder="RUTIN-XXXX-XXXX" style={{ ...S.input, letterSpacing:2, fontWeight:600, textAlign:"center", fontSize:18, borderColor:licenseError?"#EF4444":"#E5E7EB" }} onKeyDown={e => e.key==="Enter" && activateLicense()} />
          {licenseError && <div style={{ fontSize:12, color:"#EF4444", marginTop:8, textAlign:"center" }}>{licenseError}</div>}
        </div>
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#16A34A", textAlign:"center" }}>
          💡 Demo için <strong>RUTIN-2025-DEMO</strong> kodunu dene
        </div>
        <button onClick={activateLicense} disabled={licenseLoading || !licenseInput.trim()} style={{ ...S.btn(licenseLoading || !licenseInput.trim() ? "#D1D5DB":"#16A34A"), width:"100%", borderRadius:12, padding:"15px", fontSize:15, cursor:licenseLoading || !licenseInput.trim() ? "not-allowed":"pointer" }}>
          {licenseLoading ? "Kontrol ediliyor..." : "Aktivasyon Yap →"}
        </button>
        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"#9CA3AF" }}>Henüz satın almadın mı? <span onClick={() => setScreen(SCREENS.LANDING)} style={{ color:"#16A34A", cursor:"pointer", fontWeight:600 }}>Satın al</span></div>
        <div onClick={() => setScreen(SCREENS.LANDING)} style={{ textAlign:"center", marginTop:10, fontSize:12, color:"#D1D5DB", cursor:"pointer" }}>← Geri</div>
      </div>
    </div>
  );

  // SÜRESİ DOLMUŞ
  if (screen === SCREENS.EXPIRED) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:420, padding:40, textAlign:"center" }}>
        <Logo size={28} textSize={18} dotSize={11} />
        <div style={{ margin:"28px 0 8px", fontSize:48 }}>⏰</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#111", marginBottom:10 }}>Kullanım süren doldu</div>
        <div style={{ fontSize:14, color:"#6B7280", lineHeight:1.7, marginBottom:8 }}><strong>{licenseInput}</strong> lisansının<br />1 yıllık kullanım süresi sona erdi.</div>
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#DC2626", marginBottom:28 }}>Rutinlerine tekrar erişmek için lisansını yenile.</div>
        <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:14, padding:"20px", marginBottom:20 }}>
          <div style={{ fontSize:13, color:"#16A34A", fontWeight:600, marginBottom:4 }}>Yenileme Fiyatı</div>
          <div style={{ fontSize:42, fontWeight:900, color:"#111" }}>249₺</div>
          <div style={{ fontSize:13, color:"#9CA3AF" }}>+ 1 yıl daha tam erişim</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=Merhaba, ${licenseInput} lisansımı yenilemek istiyorum.`,"_blank")} style={{ ...S.btn("#25D366"), borderRadius:12, padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>💬</span> WhatsApp ile Yenile
          </button>
          <button onClick={() => window.open(`mailto:${CONTACT_EMAIL}?subject=Lisans Yenileme - ${licenseInput}&body=Merhaba, ${licenseInput} kodlu lisansımı yenilemek istiyorum.`,"_blank")} style={{ ...S.btn("#F9FAFB","#374151"), border:"1px solid #E5E7EB", borderRadius:12, padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>📧</span> E-posta ile Yenile
          </button>
        </div>
        <div style={{ fontSize:12, color:"#9CA3AF", marginTop:20, lineHeight:1.6 }}>Yenileme talebinde lisans kodun otomatik iletilir.<br />Genellikle 24 saat içinde yanıt verilir.</div>
      </div>
    </div>
  );

  // DASHBOARD
  if (screen === SCREENS.DASHBOARD) {
    const remaining = daysLeft(session?.expiresAt);
    const expiringSoon = remaining <= 30;
    return (
      <div style={S.app}>
        <nav style={S.nav}>
          <Logo size={20} textSize={15} dotSize={10} />
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={() => setScreen(SCREENS.STATS)} style={{ ...S.btn("#F0FDF4","#16A34A"), padding:"8px 14px", fontSize:13, border:"1px solid #BBF7D0" }}>📊</button>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#16A34A", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:14 }}>{session?.name?.[0]||"K"}</div>
          </div>
        </nav>

        {/* Süre uyarısı */}
        {expiringSoon && (
          <div style={{ background:remaining<=7?"#FEF2F2":"#FFFBEB", borderBottom:`1px solid ${remaining<=7?"#FECACA":"#FDE68A"}`, padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, color:remaining<=7?"#DC2626":"#D97706" }}>{remaining<=7?"⚠️":"🕐"} Lisansın <strong>{remaining} gün</strong> sonra doluyor</div>
            <button onClick={() => window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=Lisansımı yenilemek istiyorum.`,"_blank")} style={{ ...S.btn(remaining<=7?"#DC2626":"#D97706"), padding:"6px 14px", fontSize:12, borderRadius:8 }}>Yenile</button>
          </div>
        )}

        {/* Bildirim banner */}
        {notifPermission === "default" && (
          <div style={{ background:"#EFF6FF", borderBottom:"1px solid #BFDBFE", padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, color:"#1D4ED8" }}>🔔 Tamamlanmayan rutinler için bildirim al</div>
            <button onClick={requestNotification} style={{ ...S.btn("#2563EB"), padding:"6px 14px", fontSize:12, borderRadius:8 }}>İzin Ver</button>
          </div>
        )}

        <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 18px" }}>

          {/* Gün seçici */}
          <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
            {DAYS.map((d,i) => (
              <button key={d} onClick={() => setSelectedDay(i)} style={{ ...S.btn(selectedDay===i?"#16A34A":"white", selectedDay===i?"white":"#6B7280"), minWidth:52, padding:"10px 8px", borderRadius:12, fontSize:13, fontWeight:selectedDay===i?700:400, border:selectedDay===i?"none":"1px solid #E5E7EB", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:11 }}>{d}</span>
                <span style={{ fontSize:16, fontWeight:700 }}>{i+10}</span>
              </button>
            ))}
          </div>

          {/* İlerleme */}
          {routines.length > 0 && (
            <div style={{ ...S.card, marginBottom:18, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"#F0FDF4" }}>
                <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#16A34A,#4ADE80)", transition:"width 0.4s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#111" }}>{todayCompleted}/{routines.length} tamamlandı</div>
                  <div style={{ fontSize:13, color:"#9CA3AF", marginTop:2 }}>{progress===100?"🎉 Harika! Hepsini bitirdin!":`${routines.length-todayCompleted} rutin kaldı`}</div>
                </div>
                <div style={{ fontSize:36, fontWeight:900, color:progress===100?"#16A34A":"#374151" }}>{progress}%</div>
              </div>
            </div>
          )}

          {/* Liste başlığı */}
          <div style={{ marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#111" }}>Rutinlerin {routines.length>0 && <span style={{ fontSize:13, color:"#9CA3AF", fontWeight:400 }}>({routines.length})</span>}</div>
            <button onClick={() => setScreen(SCREENS.ADD)} style={{ ...S.btn(), padding:"8px 16px", fontSize:13, borderRadius:10 }}>+ Ekle</button>
          </div>

          {/* Boş durum */}
          {routines.length === 0 && (
            <div style={{ ...S.card, textAlign:"center", padding:"40px 24px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🌱</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#111", marginBottom:8 }}>Henüz rutinin yok</div>
              <div style={{ fontSize:14, color:"#9CA3AF", marginBottom:24, lineHeight:1.6 }}>İlk rutinini kendin ekle ya da<br />aşağıdaki önerilerden birini seç.</div>
              <button onClick={() => setScreen(SCREENS.ADD)} style={{ ...S.btn(), padding:"12px 28px", fontSize:14, borderRadius:12 }}>+ İlk Rutinini Ekle</button>
            </div>
          )}

          {/* Rutin listesi */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {routines.map(r => {
              const done = r.completedDays.includes(selectedDay);
              return (
                <div key={r.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:14, background:done?"#F0FDF4":"white", border:`1px solid ${done?"#BBF7D0":"#E8F5E9"}`, padding:"14px 16px", transition:"all 0.15s" }}>
                  <div onClick={() => toggle(r.id)} style={{ width:44, height:44, borderRadius:"50%", background:done?"#DCFCE7":"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, cursor:"pointer" }}>{r.emoji}</div>
                  <div onClick={() => toggle(r.id)} style={{ flex:1, cursor:"pointer" }}>
                    <div style={{ fontSize:15, fontWeight:600, color:done?"#16A34A":"#111", textDecoration:done?"line-through":"none" }}>{r.title}</div>
                    <div style={{ display:"flex", gap:14, marginTop:2 }}>
                      <span style={{ fontSize:12, color:"#9CA3AF" }}>⏰ {r.time||"—"}</span>
                      <span style={{ fontSize:12, color:"#F59E0B", fontWeight:600 }}>🔥 {r.streak} gün</span>
                    </div>
                  </div>
                  {/* Düzenle & Sil */}
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => { setEditR({...r}); setScreen(SCREENS.EDIT); }} style={{ width:32, height:32, borderRadius:8, background:"#F3F4F6", border:"none", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }} title="Düzenle">✏️</button>
                    <button onClick={() => setDeleteConfirm(r.id)} style={{ width:32, height:32, borderRadius:8, background:"#FEF2F2", border:"none", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }} title="Sil">🗑️</button>
                  </div>
                  {/* Tamamla checkbox */}
                  <div onClick={() => toggle(r.id)} style={{ width:28, height:28, borderRadius:"50%", background:done?"#16A34A":"transparent", border:`2px solid ${done?"#16A34A":"#D1D5DB"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.2s" }}>
                    {done && <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 5.5,10.5 12,3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Öneri rutinler */}
          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>💡 Rutin önerileri</div>
            <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:14 }}>Bir tıkla rutinine ekle</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {EXAMPLE_ROUTINES.filter(ex => !routines.find(r => r.title===ex.title)).slice(0,5).map(ex => (
                <div key={ex.title} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#FAFAFA", border:"1px dashed #D1FAE5" }}>
                  <span style={{ fontSize:20 }}>{ex.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:"#374151" }}>{ex.title}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF" }}>{ex.time} · {ex.category}</div>
                  </div>
                  <button onClick={() => addRoutine(ex)} style={{ ...S.btn("#F0FDF4","#16A34A"), padding:"6px 14px", fontSize:12, borderRadius:8, border:"1px solid #BBF7D0" }}>+ Ekle</button>
                </div>
              ))}
            </div>
          </div>

          {/* Lisans bilgisi */}
          <div style={{ ...S.card, marginTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px" }}>
            <div>
              <div style={{ fontSize:12, color:"#9CA3AF" }}>Lisans bitiş tarihi</div>
              <div style={{ fontSize:14, fontWeight:600, color:expiringSoon?"#DC2626":"#374151" }}>{formatDate(session?.expiresAt)}</div>
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:expiringSoon?"#DC2626":"#16A34A" }}>{remaining}g</div>
          </div>
        </div>

        {/* Silme onayı modal */}
        {deleteConfirm && (
          <div onClick={() => setDeleteConfirm(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
            <div onClick={e => e.stopPropagation()} style={{ ...S.card, maxWidth:340, width:"100%", padding:28, textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#111", marginBottom:8 }}>Rutini sil?</div>
              <div style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>Bu rutin ve tüm takip verisi silinecek. Geri alınamaz.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ ...S.btn("#F9FAFB","#374151"), flex:1, padding:"12px", borderRadius:12, border:"1px solid #E5E7EB" }}>Vazgeç</button>
                <button onClick={() => deleteRoutine(deleteConfirm)} style={{ ...S.btn("#EF4444"), flex:1, padding:"12px", borderRadius:12 }}>Sil</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:toast.color, color:"white", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:200, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // RUTİN EKLE
  if (screen === SCREENS.ADD) return (
    <div style={S.app}>
      <nav style={S.nav}>
        <button onClick={() => setScreen(SCREENS.DASHBOARD)} style={{ background:"transparent", border:"none", fontSize:22, cursor:"pointer", color:"#6B7280" }}>←</button>
        <div style={{ fontSize:16, fontWeight:700 }}>Yeni Rutin</div>
        <div style={{ width:32 }} />
      </nav>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>

        {/* Öneri örnekleri */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, color:"#6B7280", fontWeight:500, marginBottom:10 }}>⚡ HIZLI EKLE — ÖNERİLEN RUTİNLER</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {EXAMPLE_ROUTINES.filter(ex => !routines.find(r => r.title===ex.title)).map(ex => (
              <div key={ex.title} onClick={() => addRoutine(ex)} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", background:"#FAFAFA", border:"1px dashed #D1FAE5", transition:"background 0.15s" }}>
                <span style={{ fontSize:20 }}>{ex.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, color:"#374151", fontWeight:500 }}>{ex.title}</div>
                  <div style={{ fontSize:11, color:"#9CA3AF" }}>{ex.time}</div>
                </div>
                <span style={{ fontSize:20, color:"#16A34A" }}>+</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop:"1px solid #E5E7EB", paddingTop:24, marginBottom:16 }}>
          <div style={{ fontSize:13, color:"#6B7280", fontWeight:500, marginBottom:16 }}>✏️ VEYA KENDİN OLUŞTUR</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>EMOJİ SEÇ</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["⭐","🏃","💧","📚","🧘","✍️","🎯","💪","🥗","😴","🎵","🌿"].map(e => (
                <button key={e} onClick={() => setNewR(p => ({...p,emoji:e}))} style={{ width:44, height:44, borderRadius:12, background:newR.emoji===e?"#DCFCE7":"#F9FAFB", border:`1.5px solid ${newR.emoji===e?"#16A34A":"#E5E7EB"}`, fontSize:22, cursor:"pointer" }}>{e}</button>
              ))}
            </div>
          </div>
          {[["RUTİN ADI","title","text","Örn: Her sabah 10 dk nefes egzersizi"],["SAAT","time","text","Örn: 07:00"]].map(([label,key,type,ph]) => (
            <div key={key} style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>{label}</div>
              <input type={type} placeholder={ph} value={newR[key]} onChange={e => setNewR(p => ({...p,[key]:e.target.value}))} style={S.input} />
            </div>
          ))}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>KATEGORİ</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(CATS).map(([cat,color]) => (
                <button key={cat} onClick={() => setNewR(p => ({...p,category:cat}))} style={{ padding:"8px 16px", borderRadius:20, background:newR.category===cat?color:"#F9FAFB", color:newR.category===cat?"white":"#6B7280", border:`1px solid ${newR.category===cat?color:"#E5E7EB"}`, fontSize:13, cursor:"pointer", fontWeight:newR.category===cat?600:400 }}>{cat}</button>
              ))}
            </div>
          </div>
          <button onClick={() => addRoutine()} style={{ ...S.btn(), width:"100%", borderRadius:14, padding:"16px", fontSize:16, boxShadow:"0 4px 16px rgba(22,163,74,0.25)" }}>Rutini Kaydet ✓</button>
        </div>
      </div>
    </div>
  );

  // RUTİN DÜZENLE
  if (screen === SCREENS.EDIT && editR) return (
    <div style={S.app}>
      <nav style={S.nav}>
        <button onClick={() => { setEditR(null); setScreen(SCREENS.DASHBOARD); }} style={{ background:"transparent", border:"none", fontSize:22, cursor:"pointer", color:"#6B7280" }}>←</button>
        <div style={{ fontSize:16, fontWeight:700 }}>Rutini Düzenle</div>
        <div style={{ width:32 }} />
      </nav>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>EMOJİ SEÇ</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["⭐","🏃","💧","📚","🧘","✍️","🎯","💪","🥗","😴","🎵","🌿"].map(e => (
              <button key={e} onClick={() => setEditR(p => ({...p,emoji:e}))} style={{ width:44, height:44, borderRadius:12, background:editR.emoji===e?"#DCFCE7":"#F9FAFB", border:`1.5px solid ${editR.emoji===e?"#16A34A":"#E5E7EB"}`, fontSize:22, cursor:"pointer" }}>{e}</button>
            ))}
          </div>
        </div>
        {[["RUTİN ADI","title","text","Rutin adı"],["SAAT","time","text","Örn: 07:00"]].map(([label,key,type,ph]) => (
          <div key={key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>{label}</div>
            <input type={type} placeholder={ph} value={editR[key]} onChange={e => setEditR(p => ({...p,[key]:e.target.value}))} style={S.input} />
          </div>
        ))}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>KATEGORİ</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(CATS).map(([cat,color]) => (
              <button key={cat} onClick={() => setEditR(p => ({...p,category:cat}))} style={{ padding:"8px 16px", borderRadius:20, background:editR.category===cat?color:"#F9FAFB", color:editR.category===cat?"white":"#6B7280", border:`1px solid ${editR.category===cat?color:"#E5E7EB"}`, fontSize:13, cursor:"pointer", fontWeight:editR.category===cat?600:400 }}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { setDeleteConfirm(editR.id); setScreen(SCREENS.DASHBOARD); }} style={{ ...S.btn("#FEF2F2","#EF4444"), flex:1, padding:"14px", borderRadius:14, border:"1px solid #FECACA" }}>🗑️ Sil</button>
          <button onClick={saveEdit} style={{ ...S.btn(), flex:2, padding:"14px", borderRadius:14, boxShadow:"0 4px 16px rgba(22,163,74,0.25)" }}>Kaydet ✓</button>
        </div>
      </div>
    </div>
  );

  // İSTATİSTİKLER
  if (screen === SCREENS.STATS) return (
    <div style={S.app}>
      <nav style={S.nav}>
        <button onClick={() => setScreen(SCREENS.DASHBOARD)} style={{ background:"transparent", border:"none", fontSize:22, cursor:"pointer", color:"#6B7280" }}>←</button>
        <div style={{ fontSize:16, fontWeight:700 }}>İstatistikler</div>
        <div style={{ width:32 }} />
      </nav>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {[["🔥","En uzun seri",`${Math.max(0,...routines.map(r=>r.streak))} gün`],["✅","Toplam rutin",`${routines.length} adet`],["⭐","Bugün",`${todayCompleted}/${routines.length}`],["📅","Tamamlanan",`${routines.reduce((a,r)=>a+r.completedDays.length,0)} gün`]].map(([e,l,v]) => (
            <div key={l} style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{e}</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#111", marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:12, color:"#9CA3AF" }}>{l}</div>
            </div>
          ))}
        </div>
        {routines.length > 0 && (
          <div style={S.card}>
            <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:14 }}>Rutin performansı</div>
            {routines.map(r => {
              const pct = r.completedDays.length ? Math.round((r.completedDays.length/7)*100) : 0;
              return (
                <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ fontSize:20 }}>{r.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#374151", marginBottom:4 }}>{r.title}</div>
                    <div style={{ background:"#F3F4F6", borderRadius:4, height:6, overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:"#16A34A", borderRadius:4 }} />
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:"#9CA3AF", minWidth:32, textAlign:"right" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
