import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://yzziswewoagxmbknthwo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6emlzd2V3b2FneG1ia250aHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzIyMTUsImV4cCI6MjA5NTY0ODIxNX0.MSWJ6RDsxIQUnoHL3NQRaDtAaTZyDHoQ8kBcziuW3vw";
const CONTACT_WHATSAPP = "905XXXXXXXXX";
const CONTACT_EMAIL = "destek@rutin.online";
const SATIN_AL_URL = "https://gitsinkilolar.myikas.com/rutinonline";

const api = async (path, options = {}) => {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || "API hatası"); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const DAYS = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const TODAY = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
const CATS = { spor:"#16A34A", sağlık:"#0EA5E9", gelişim:"#7C3AED", zihin:"#F59E0B" };
const SCREENS = { LANDING:"landing", ACTIVATE:"activate", REGISTER:"register", LOGIN:"login", EXPIRED:"expired", DASHBOARD:"dashboard", ADD:"add", EDIT:"edit", STATS:"stats", PROFILE:"profile" };

const EXAMPLE_ROUTINES = [
  { emoji:"📚", title:"Günde 30 dk kitap oku", time:"21:00", category:"gelişim" },
  { emoji:"🏃", title:"Günde 45 dk egzersiz yap", time:"07:00", category:"spor" },
  { emoji:"💧", title:"Günde 2 litre su iç", time:"Gün boyu", category:"sağlık" },
  { emoji:"🧘", title:"Günde 10 dk meditasyon yap", time:"07:30", category:"zihin" },
  { emoji:"✍️", title:"Her gece günlük tut", time:"22:00", category:"gelişim" },
  { emoji:"🌿", title:"Şeker tüketimini azalt", time:"Gün boyu", category:"sağlık" },
  { emoji:"😴", title:"23:00'da uyu", time:"23:00", category:"sağlık" },
  { emoji:"💪", title:"Günde 50 şınav çek", time:"08:00", category:"spor" },
  { emoji:"🥗", title:"Her öğün sebze ye", time:"Gün boyu", category:"sağlık" },
];

const VALID_LICENSES = {
  "RUTIN-ADMIN-EMRAH": { name:"Emrah (Admin)", expiresAt: new Date("2099-12-31") },
  "RUTIN-2025-DEMO": { name:"Demo Kullanıcı", expiresAt: new Date(Date.now() + 365*24*60*60*1000) },
  "RUTIN-FREE-2025": { name:"Ücretsiz Kullanıcı", expiresAt: new Date("2099-12-31") },
  "RUTIN-TEST-9999": { name:"Test Kullanıcı", expiresAt: new Date(Date.now() - 1000) },
};

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
function todayDate() { return new Date().toISOString().split("T")[0]; }

const S = {
  app: { minHeight:"100vh", background:"#F8FAF8", fontFamily:"'Segoe UI', system-ui, sans-serif", color:"#1A2E1A" },
  nav: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"white", borderBottom:"1px solid #E8F5E9", position:"sticky", top:0, zIndex:50 },
  btn: (bg="#16A34A", color="white") => ({ background:bg, color, border:"none", borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }),
  card: { background:"white", borderRadius:16, padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid #E8F5E9" },
  input: { width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"13px 16px", fontSize:15, outline:"none", boxSizing:"border-box", color:"#111", fontFamily:"inherit" },
};

// Fun stats hesapla
function calcFunStats(routines, completions) {
  const stats = [];
  const totalDays = completions.length;
  const uniqueDays = new Set(completions.map(c => c.completed_date)).size;

  // Genel
  if (uniqueDays > 0) {
    stats.push({ emoji:"🗓️", label:"Rutinini takip ettiğin gün", value: uniqueDays + " gün", color:"#16A34A" });
  }
  if (totalDays > 0) {
    stats.push({ emoji:"✅", label:"Toplam tamamlanan rutin", value: totalDays + " kez", color:"#0EA5E9" });
  }

  // Kategoriye göre
  const catCounts = {};
  routines.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + completions.filter(c => c.routine_id === r.id).length; });

  if (catCounts["spor"] > 0) {
    const mins = catCounts["spor"] * 45;
    const km = Math.round(catCounts["spor"] * 5.5);
    const cal = catCounts["spor"] * 320;
    stats.push({ emoji:"🏃", label:"Egzersiz yaptığın gün", value: catCounts["spor"] + " gün", color:"#16A34A" });
    stats.push({ emoji:"📍", label:"Tahminen koştuğun mesafe", value: km + " km", color:"#16A34A" });
    stats.push({ emoji:"🔥", label:"Tahminen yaktığın kalori", value: cal.toLocaleString("tr-TR") + " kcal", color:"#F59E0B" });
    stats.push({ emoji:"⏱️", label:"Egzersizde geçirdiğin süre", value: Math.round(mins/60) + " saat", color:"#16A34A" });
  }

  if (catCounts["sağlık"] > 0) {
    const litre = catCounts["sağlık"] * 2;
    stats.push({ emoji:"💧", label:"İçtiğin toplam su", value: litre + " litre", color:"#0EA5E9" });
    stats.push({ emoji:"🥗", label:"Sağlıklı öğün günü", value: catCounts["sağlık"] + " gün", color:"#0EA5E9" });
    if (litre > 0) stats.push({ emoji:"🌊", label:"Bu su ile doldurulabilecek küvet", value: Math.round(litre / 150) + " küvet", color:"#0EA5E9" });
  }

  if (catCounts["gelişim"] > 0) {
    const sayfa = catCounts["gelişim"] * 25;
    const dakika = catCounts["gelişim"] * 30;
    stats.push({ emoji:"📚", label:"Okuduğun tahmini sayfa", value: sayfa + " sayfa", color:"#7C3AED" });
    stats.push({ emoji:"🧠", label:"Kendine yatırdığın süre", value: Math.round(dakika/60) + " saat", color:"#7C3AED" });
    if (sayfa > 200) stats.push({ emoji:"📖", label:"Bu sayfa ile okunabilecek kitap", value: Math.round(sayfa/250) + " kitap", color:"#7C3AED" });
  }

  if (catCounts["zihin"] > 0) {
    const dakika = catCounts["zihin"] * 10;
    stats.push({ emoji:"🧘", label:"Meditasyon günü", value: catCounts["zihin"] + " gün", color:"#F59E0B" });
    stats.push({ emoji:"☮️", label:"Zihninle baş başa kaldığın süre", value: dakika + " dakika", color:"#F59E0B" });
  }

  // Streak
  const maxStreak = Math.max(0, ...routines.map(r => r.streak || 0));
  if (maxStreak >= 7) stats.push({ emoji:"🔥", label:"En uzun seri", value: maxStreak + " gün üst üste", color:"#EF4444" });
  if (maxStreak >= 30) stats.push({ emoji:"👑", label:"30 gün serisi — harika!", value: "Tebrikler!", color:"#F59E0B" });

  return stats;
}

export default function RutinOnline() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [prevScreen, setPrevScreen] = useState(null);
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [license, setLicense] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editR, setEditR] = useState(null);
  const [newR, setNewR] = useState({ title:"", emoji:"⭐", time:"", category:"spor" });
  const [licenseInput, setLicenseInput] = useState("");
  const [regForm, setRegForm] = useState({ fullName:"", email:"", password:"", confirmPassword:"" });
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName:"", currentPass:"", newPass:"", confirmPass:"" });
  const [profileMsg, setProfileMsg] = useState({ text:"", ok:true });
  const menuRef = useRef(null);

  const isIos = () => /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    setTimeout(() => setSplash(false), 1000);
    const saved = localStorage.getItem("rutin_user");
    if (saved) { const p = JSON.parse(saved); setUser(p.user); setLicense(p.license); setScreen(SCREENS.DASHBOARD); }
    window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); setDeferredPrompt(e); if (!isStandalone()) setShowInstallBanner(true); });
    if (isIos() && !isStandalone()) setShowInstallBanner(true);
    document.addEventListener("mousedown", e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); });
  }, []);

  useEffect(() => { if (user) { loadRoutines(); loadCompletions(); } }, [user]);

  const showToast = (msg, color="#16A34A") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const navigate = (to) => { setPrevScreen(screen); setScreen(to); };
  const goBack = () => { setScreen(prevScreen || SCREENS.DASHBOARD); setPrevScreen(null); };

  const handleInstall = async () => {
    if (isIos()) { setShowIosInstall(true); return; }
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") setShowInstallBanner(false); setDeferredPrompt(null); }
  };

  const loadRoutines = async () => {
    try { const data = await api("routines?user_id=eq." + user.id + "&order=created_at.asc"); setRoutines(data || []); } catch(e) { console.error(e); }
  };
  const loadCompletions = async () => {
    try { const data = await api("completions?order=completed_date.asc"); setCompletions(data || []); } catch(e) { console.error(e); }
  };

  const checkLicense = async (key) => {
    const cleanKey = key.trim().toUpperCase();
    // Check local first
    if (VALID_LICENSES[cleanKey]) {
      const lic = { license_key: cleanKey, ...VALID_LICENSES[cleanKey], expires_at: VALID_LICENSES[cleanKey].expiresAt };
      return { ...lic, expired: new Date(lic.expiresAt) < new Date() };
    }
    const data = await api("licenses?license_key=ilike." + cleanKey + "&limit=1");
    if (!data || data.length === 0) throw new Error("Geçersiz lisans kodu. Lütfen kontrol et.");
    const lic = data[0];
    return { ...lic, expired: new Date(lic.expires_at) < new Date() };
  };

  const handleActivate = async () => {
    setError(""); setLoading(true);
    try { const lic = await checkLicense(licenseInput); setLicense(lic); if (lic.expired) { setScreen(SCREENS.EXPIRED); return; } setScreen(SCREENS.REGISTER); }
    catch(e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError("");
    if (!regForm.fullName.trim()) { setError("Ad soyad gerekli."); return; }
    if (!regForm.email.trim()) { setError("E-posta gerekli."); return; }
    if (regForm.password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (regForm.password !== regForm.confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    try {
      const existing = await api("users?email=eq." + regForm.email.trim() + "&limit=1");
      if (existing && existing.length > 0) { setError("Bu e-posta zaten kayıtlı. Giriş yap."); return; }
      const passHash = btoa(regForm.password + "_rutin_salt");
      const newUser = await api("users", { method:"POST", body:JSON.stringify({ email:regForm.email.trim().toLowerCase(), password_hash:passHash, full_name:regForm.fullName.trim(), license_key:license.license_key }) });
      const u = Array.isArray(newUser) ? newUser[0] : newUser;
      setUser(u); localStorage.setItem("rutin_user", JSON.stringify({ user:u, license }));
      setScreen(SCREENS.DASHBOARD); showToast("Hoş geldin, " + u.full_name.split(" ")[0] + "!");
    } catch(e) { setError(e.message || "Kayıt hatası."); } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const passHash = btoa(loginForm.password + "_rutin_salt");
      const data = await api("users?email=eq." + loginForm.email.trim().toLowerCase() + "&password_hash=eq." + encodeURIComponent(passHash) + "&limit=1");
      if (!data || data.length === 0) { setError("E-posta veya şifre hatalı."); return; }
      const u = data[0]; const lic = await checkLicense(u.license_key);
      setUser(u); setLicense(lic); localStorage.setItem("rutin_user", JSON.stringify({ user:u, license:lic }));
      if (lic.expired) { setScreen(SCREENS.EXPIRED); return; }
      setScreen(SCREENS.DASHBOARD); showToast("Tekrar hoş geldin!");
    } catch(e) { setError(e.message || "Giriş hatası."); } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("rutin_user");
    setUser(null); setLicense(null); setRoutines([]); setCompletions([]);
    setShowUserMenu(false); setScreen(SCREENS.LANDING);
  };

  const handleProfileSave = async () => {
    setProfileMsg({ text:"", ok:true });
    if (!profileForm.fullName.trim()) { setProfileMsg({ text:"Ad soyad boş olamaz.", ok:false }); return; }
    try {
      await api("users?id=eq." + user.id, { method:"PATCH", body:JSON.stringify({ full_name:profileForm.fullName.trim() }) });
      if (profileForm.newPass) {
        if (profileForm.newPass.length < 6) { setProfileMsg({ text:"Yeni şifre en az 6 karakter olmalı.", ok:false }); return; }
        if (profileForm.newPass !== profileForm.confirmPass) { setProfileMsg({ text:"Yeni şifreler eşleşmiyor.", ok:false }); return; }
        const oldHash = btoa(profileForm.currentPass + "_rutin_salt");
        const check = await api("users?id=eq." + user.id + "&password_hash=eq." + encodeURIComponent(oldHash) + "&limit=1");
        if (!check || check.length === 0) { setProfileMsg({ text:"Mevcut şifre hatalı.", ok:false }); return; }
        const newHash = btoa(profileForm.newPass + "_rutin_salt");
        await api("users?id=eq." + user.id, { method:"PATCH", body:JSON.stringify({ password_hash:newHash }) });
      }
      const updated = { ...user, full_name:profileForm.fullName.trim() };
      setUser(updated); localStorage.setItem("rutin_user", JSON.stringify({ user:updated, license }));
      setProfileMsg({ text:"Bilgiler güncellendi!", ok:true });
      setProfileForm(p => ({ ...p, currentPass:"", newPass:"", confirmPass:"" }));
    } catch(e) { setProfileMsg({ text:"Güncelleme hatası.", ok:false }); }
  };

  const toggle = async (routineId) => {
    const date = todayDate();
    const existing = completions.find(c => c.routine_id === routineId && c.completed_date === date);
    const routine = routines.find(r => r.id === routineId);
    try {
      if (existing) {
        await api("completions?id=eq." + existing.id, { method:"DELETE", prefer:"return=minimal" });
        setCompletions(p => p.filter(c => c.id !== existing.id));
        await api("routines?id=eq." + routineId, { method:"PATCH", body:JSON.stringify({ streak:Math.max(0,(routine?.streak||1)-1) }) });
        setRoutines(p => p.map(r => r.id === routineId ? { ...r, streak:Math.max(0,(r.streak||1)-1) } : r));
      } else {
        const data = await api("completions", { method:"POST", body:JSON.stringify({ routine_id:routineId, completed_date:date }) });
        const added = Array.isArray(data) ? data[0] : data;
        setCompletions(p => [...p, added]);
        await api("routines?id=eq." + routineId, { method:"PATCH", body:JSON.stringify({ streak:(routine?.streak||0)+1 }) });
        setRoutines(p => p.map(r => r.id === routineId ? { ...r, streak:(r.streak||0)+1 } : r));
      }
    } catch(e) { showToast("İşlem başarısız.", "#EF4444"); }
  };

  const addRoutine = async (preset=null) => {
    const r = preset || newR;
    if (!r.title.trim()) return;
    try {
      const data = await api("routines", { method:"POST", body:JSON.stringify({ user_id:user.id, title:r.title, emoji:r.emoji, time:r.time, category:r.category }) });
      const added = Array.isArray(data) ? data[0] : data;
      setRoutines(p => [...p, added]);
      if (!preset) { setNewR({ title:"", emoji:"⭐", time:"", category:"spor" }); setScreen(SCREENS.DASHBOARD); }
      showToast(r.title + " eklendi");
    } catch(e) { showToast("Eklenemedi.", "#EF4444"); }
  };

  const saveEdit = async () => {
    if (!editR?.title.trim()) return;
    try {
      await api("routines?id=eq." + editR.id, { method:"PATCH", body:JSON.stringify({ title:editR.title, emoji:editR.emoji, time:editR.time, category:editR.category }) });
      setRoutines(p => p.map(r => r.id === editR.id ? { ...r, ...editR } : r));
      showToast("Rutin güncellendi"); setEditR(null); setScreen(SCREENS.DASHBOARD);
    } catch(e) { showToast("Güncellenemedi.", "#EF4444"); }
  };

  const deleteRoutine = async (id) => {
    const r = routines.find(r => r.id === id);
    try {
      await api("routines?id=eq." + id, { method:"DELETE", prefer:"return=minimal" });
      setRoutines(p => p.filter(r => r.id !== id)); setDeleteConfirm(null);
      showToast((r?.title || "Rutin") + " silindi", "#6B7280");
      if (screen === SCREENS.EDIT) setScreen(SCREENS.DASHBOARD);
    } catch(e) { showToast("Silinemedi.", "#EF4444"); }
  };

  const isCompletedToday = (routineId) => completions.some(c => c.routine_id === routineId && c.completed_date === todayDate());
  const todayCompleted = routines.filter(r => isCompletedToday(r.id)).length;
  const progress = routines.length ? Math.round((todayCompleted / routines.length) * 100) : 0;

  // ── NAV BAR ──────────────────────────────────────────────────
  const AppNav = ({ showBack=false, showHome=false, title="" }) => (
    <div style={S.nav}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {showBack && (
          <button onClick={goBack} style={{ background:"#F0FDF4", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", color:"#16A34A" }}>←</button>
        )}
        {showHome && (
          <button onClick={() => setScreen(SCREENS.DASHBOARD)} style={{ background:"#F0FDF4", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#16A34A" }}>🏠</button>
        )}
        {!showBack && !showHome && <Logo size={20} textSize={15} dotSize={10} />}
        {title && <span style={{ fontSize:16, fontWeight:700, color:"#111", marginLeft:4 }}>{title}</span>}
      </div>
      {user && (
        <div ref={menuRef} style={{ position:"relative" }}>
          <div onClick={() => setShowUserMenu(p => !p)} style={{ width:36, height:36, borderRadius:"50%", background:"#16A34A", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:15, cursor:"pointer", userSelect:"none" }}>
            {user.full_name?.[0]?.toUpperCase() || "K"}
          </div>
          {showUserMenu && (
            <div style={{ position:"absolute", top:44, right:0, background:"white", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,0.12)", border:"1px solid #E8F5E9", minWidth:160, zIndex:100, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px 6px", fontSize:12, color:"#9CA3AF", borderBottom:"1px solid #F3F4F6" }}>{user.full_name}</div>
              <button onClick={() => { setProfileForm({ fullName:user.full_name, currentPass:"", newPass:"", confirmPass:"" }); setShowUserMenu(false); navigate(SCREENS.PROFILE); }} style={{ width:"100%", background:"transparent", border:"none", padding:"12px 16px", textAlign:"left", fontSize:14, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
                👤 Profilim
              </button>
              <button onClick={handleLogout} style={{ width:"100%", background:"transparent", border:"none", padding:"12px 16px", textAlign:"left", fontSize:14, color:"#EF4444", cursor:"pointer", display:"flex", alignItems:"center", gap:10, borderTop:"1px solid #F3F4F6" }}>
                🚪 Çıkış Yap
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── SPLASH ───────────────────────────────────────────────────
  if (splash) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", background:"white" }}>
      <div style={{ textAlign:"center" }}>
        <Logo size={52} textSize={30} dotSize={15} />
        <div style={{ fontSize:13, color:"#86EFAC", marginTop:8, letterSpacing:2 }}>rutinini oluştur</div>
      </div>
    </div>
  );

  // ── LANDING ──────────────────────────────────────────────────
  if (screen === SCREENS.LANDING) return (
    <div style={S.app}>
      {showIosInstall && (
        <div onClick={() => setShowIosInstall(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...S.card, width:"100%", maxWidth:420, padding:28, textAlign:"center", borderRadius:24 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📱</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:16 }}>Ana Ekrana Ekle</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {["1. Alttaki Paylaş butonuna bas","2. Ana Ekrana Ekle seçeneğine bas","Hazır! Uygulama yüklendi."].map((t,i) => (
                <div key={i} style={{ background:i===2?"#F0FDF4":"#F9FAFB", border:i===2?"1px solid #BBF7D0":"none", borderRadius:12, padding:"12px 16px", textAlign:"left", fontSize:14, color:"#374151" }}>{t}</div>
              ))}
            </div>
            <button onClick={() => setShowIosInstall(false)} style={{ ...S.btn(), width:"100%", borderRadius:14, padding:"14px" }}>Anladım</button>
          </div>
        </div>
      )}
      <nav style={S.nav}>
        <Logo size={22} textSize={16} dotSize={10} />
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setScreen(SCREENS.LOGIN)} style={{ ...S.btn("transparent","#16A34A"), border:"1.5px solid #16A34A", padding:"9px 20px", fontSize:14 }}>Giriş Yap</button>
          <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn(), padding:"9px 20px", fontSize:14 }}>Başla</button>
        </div>
      </nav>
      {showInstallBanner && (
        <div style={{ background:"#F0FDF4", borderBottom:"1px solid #BBF7D0", padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>📲</span>
            <div><div style={{ fontSize:13, fontWeight:600, color:"#16A34A" }}>Uygulamayı telefonuna yükle</div><div style={{ fontSize:12, color:"#6B7280" }}>Ana ekrandan hızlıca eriş</div></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleInstall} style={{ ...S.btn(), padding:"8px 16px", fontSize:13, borderRadius:10 }}>Yükle</button>
            <button onClick={() => setShowInstallBanner(false)} style={{ ...S.btn("transparent","#9CA3AF"), padding:"8px 12px", fontSize:14, borderRadius:10 }}>X</button>
          </div>
        </div>
      )}
      <div style={{ maxWidth:580, margin:"0 auto", padding:"56px 24px 60px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h1 style={{ fontSize:"clamp(28px,6vw,48px)", fontWeight:800, lineHeight:1.15, marginBottom:16, color:"#111" }}>Küçük alışkanlıklar,<br /><span style={{ color:"#16A34A" }}>büyük değişimler.</span></h1>
          <p style={{ fontSize:16, color:"#6B7280", lineHeight:1.75, marginBottom:32, maxWidth:440, margin:"0 auto 32px" }}>Kendi günlük rutinlerini oluştur, takip et ve geliştir. Her cihazda senkronize, tek ödeme.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn(), borderRadius:14, padding:"16px 36px", fontSize:16, boxShadow:"0 4px 20px rgba(22,163,74,0.3)" }}>Hemen Başla</button>
            <button onClick={handleInstall} style={{ ...S.btn("#F0FDF4","#16A34A"), borderRadius:14, padding:"16px 24px", fontSize:15, border:"1px solid #BBF7D0" }}>Telefona Yükle</button>
          </div>
        </div>
        <div style={{ background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", borderRadius:24, padding:24, marginBottom:48, border:"1px solid #BBF7D0" }}>
          <div style={{ fontSize:13, color:"#16A34A", fontWeight:600, textAlign:"center", marginBottom:20, letterSpacing:1, textTransform:"uppercase" }}>Uygulama Önizlemesi</div>
          <div style={{ ...S.card, borderRadius:20, overflow:"hidden" }}>
            <div style={{ height:4, background:"#F0FDF4" }}><div style={{ width:"60%", height:"100%", background:"linear-gradient(90deg,#16A34A,#4ADE80)" }} /></div>
            <div style={{ padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div><div style={{ fontSize:18, fontWeight:800, color:"#111" }}>3/5 tamamlandı</div><div style={{ fontSize:12, color:"#9CA3AF" }}>2 rutin kaldı</div></div>
                <div style={{ fontSize:32, fontWeight:900, color:"#16A34A" }}>60%</div>
              </div>
              {[["🏃","Günde 45 dk egzersiz yap",true,12],["💧","Günde 2 litre su iç",true,7],["📚","Günde 30 dk kitap oku",false,5]].map(([e,t,done,s]) => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:done?"#F0FDF4":"#FAFAFA", borderRadius:12, border:"1px solid " + (done?"#BBF7D0":"#F3F4F6"), marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:done?"#DCFCE7":"#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{e}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:done?"#16A34A":"#374151", textDecoration:done?"line-through":"none" }}>{t}</div>
                    <div style={{ fontSize:11, color:"#F59E0B", fontWeight:600 }}>🔥 {s} gün serisi</div>
                  </div>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:done?"#16A34A":"transparent", border:"2px solid " + (done?"#16A34A":"#D1D5DB"), display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {done && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111", textAlign:"center", marginBottom:20 }}>Neden rutin.online?</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["🎯","Kendin Oluştur","Hazır rutin yok. Her şeyi kendin belirlersin."],["🔥","Seri Takibi","Günlük serini kır, motivasyonunu koru."],["📱","Her Cihazda","Telefon, tablet, bilgisayar — her yerde senkronize."],["🔔","Hatırlatıcılar","Tamamlanmayan rutinler için bildirim al."],["📊","İstatistikler","Haftalık ve aylık gelişimini takip et."],["🔒","Güvenli","Bilgilerin şifreli ve güvende."]].map(([e,t,s]) => (
              <div key={t} style={{ ...S.card }}><div style={{ fontSize:28, marginBottom:8 }}>{e}</div><div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>{t}</div><div style={{ fontSize:12, color:"#9CA3AF", lineHeight:1.5 }}>{s}</div></div>
            ))}
          </div>
        </div>
        <div style={{ ...S.card, marginBottom:16, background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", border:"1.5px solid #86EFAC", textAlign:"center" }}>
          <div style={{ fontSize:13, color:"#16A34A", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Tek Seferlik Ödeme</div>
          <div style={{ fontSize:56, fontWeight:900, color:"#111", lineHeight:1 }}>199₺</div>
          <div style={{ fontSize:14, color:"#6B7280", margin:"8px 0 4px" }}>1 Yıllık Tam Erişim</div>
          <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:24 }}>Abonelik yok, otomatik ücret yok</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24, textAlign:"left" }}>
            {["Sınırsız rutin oluştur","Tüm cihazlarda senkronize","Seri takibi ve motivasyon sistemi","Tamamlanmayan rutinler için bildirim","1 yıl boyunca tüm güncellemeler"].map(f => (
              <div key={f} style={{ fontSize:14, color:"#374151" }}>{"✅ " + f}</div>
            ))}
          </div>
          <button onClick={() => window.open(SATIN_AL_URL,"_blank")} style={{ ...S.btn(), width:"100%", borderRadius:14, padding:"16px", fontSize:16, boxShadow:"0 4px 20px rgba(22,163,74,0.3)" }}>Hemen Satın Al</button>
          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:10 }}>Ödeme sonrası lisans kodun e-postana gelir</div>
        </div>
        <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn("#F9FAFB","#374151"), width:"100%", borderRadius:14, padding:"14px", fontSize:14, border:"1px solid #E5E7EB", marginBottom:48 }}>Zaten satın aldım — Lisans kodumu gir</button>
        <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap", marginBottom:48, padding:"20px", background:"white", borderRadius:16, border:"1px solid #E8F5E9" }}>
          {[["🔒","256-bit Şifreleme"],["💳","Güvenli Ödeme"],["📧","24s İçinde Teslimat"],["🔄","1 Yıl Erişim"]].map(([e,t]) => (
            <div key={t} style={{ textAlign:"center" }}><div style={{ fontSize:24, marginBottom:4 }}>{e}</div><div style={{ fontSize:11, color:"#9CA3AF", fontWeight:500 }}>{t}</div></div>
          ))}
        </div>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111", textAlign:"center", marginBottom:8 }}>Tanıdık geliyor mu?</div>
          <div style={{ fontSize:14, color:"#9CA3AF", textAlign:"center", marginBottom:24 }}>Yarından itibaren başlıyorum diyenlerin büyük çoğunluğu hiç başlayamıyor.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["😓","Her sabah aynı his","Alarm çalıyor, erteliyor, suçluluk duyuyorsun. Güne zaten yenik başlıyorsun."],["📋","Liste yapıyorsun ama...","Deftere yazıyorsun ama 3 gün sonra her şey unutuluyor."],["🔁","Sürekli sıfırlıyorsun","Bir hafta harika gidiyor, sonra her şey sıfırlanıyor. Yeniden başlamak giderek zorlaşıyor."],["😤","Motivasyon gelmiyor","Motive olunca başlarım diyorsun ama o gün bir türlü gelmiyor."]].map(([e,t,s]) => (
              <div key={t} style={{ display:"flex", gap:14, padding:"16px 18px", background:"#FFF7ED", borderRadius:14, border:"1px solid #FED7AA" }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{e}</span>
                <div><div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>{t}</div><div style={{ fontSize:13, color:"#6B7280", lineHeight:1.6 }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:48, background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", borderRadius:24, padding:"32px 24px", border:"1px solid #BBF7D0" }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111", textAlign:"center", marginBottom:8 }}>Rutin, kader değiştirir.</div>
          <div style={{ fontSize:14, color:"#6B7280", textAlign:"center", marginBottom:28, lineHeight:1.7 }}>Başarılı insanlar daha yetenekli değil, sadece doğru alışkanlıklara sahipler.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["🧠","Beyin otomatik çalışır","Bir davranışı 21 kez tekrarladığında beyin onu otomatikleştirir."],["⚡","Küçük adımlar, büyük sonuçlar","Her gün yüzde 1 daha iyi olmak, 1 yılda 37 kat daha iyi olmak demektir."],["🎯","Takip etmek motivasyonu artırır","Araştırmalar gösteriyor: görsel takip edenler alışkanlıklarını 2 kat daha fazla sürdürüyor."],["🌅","Sabah rutini her şeyi değiştirir","Dünyanın en başarılı insanlarının büyük çoğunluğunun düzenli bir sabah rutini var."]].map(([e,t,s]) => (
              <div key={t} style={{ background:"white", borderRadius:14, padding:"16px 18px", border:"1px solid #BBF7D0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ fontSize:22 }}>{e}</span><div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{t}</div></div>
                <div style={{ fontSize:13, color:"#6B7280", lineHeight:1.6 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111", textAlign:"center", marginBottom:8 }}>Kullananlar ne diyor?</div>
          <div style={{ fontSize:14, color:"#9CA3AF", textAlign:"center", marginBottom:24 }}>Gerçek kullanıcılar, gerçek deneyimler</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[{ name:"Ayşe K.", role:"Öğretmen, 34", text:"3 aydır her sabah rutinime bakıyorum. Spor, okuma, su içme hepsini düzenli yapıyorum artık.", emoji:"👩" },{ name:"Mert T.", role:"Yazılımcı, 28", text:"Farklı uygulamalar denedim. Bu kadar sade ve işlevsel bir şey bulamadım.", emoji:"👨" },{ name:"Selin Y.", role:"Girişimci, 31", text:"Tek seferlik ödeme kararımı kolaylaştırdı. 6 aydır kullanıyorum, değer.", emoji:"👩" },{ name:"Ahmet D.", role:"Öğrenci, 22", text:"Sınav döneminde rutin kurmak çok zordu. Bu uygulama sayesinde dengemeni korudum.", emoji:"🎓" }].map((r,i) => (
              <div key={i} style={{ ...S.card, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#F0FDF4", border:"1px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{r.emoji}</div>
                  <div><div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{r.name}</div><div style={{ fontSize:12, color:"#9CA3AF" }}>{r.role}</div></div>
                  <div style={{ marginLeft:"auto", color:"#F59E0B", fontSize:14 }}>{"★★★★★"}</div>
                </div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.7, fontStyle:"italic" }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111", textAlign:"center", marginBottom:20 }}>Sık Sorulan Sorular</div>
          {[["Satın aldıktan sonra ne olur?","Ödeme tamamlanınca lisans kodun 24 saat içinde e-posta adresine gönderilir."],["1 yıl sonra ne olur?","1 yıllık kullanım süren dolduğunda uygulama yenileme talep eder."],["Farklı cihazlarda çalışır mı?","Evet! Hesabın her cihazda senkronize çalışır."],["Telefona yükleyebilir miyim?","Evet. Sayfanın üstündeki Telefona Yükle butonuyla ana ekranına ekleyebilirsin."],["İade politikası nedir?","Memnun kalmazsan ilk 7 gün içinde iade yapabiliriz."]].map(([q,a],i) => (
            <div key={i} style={{ ...S.card, marginBottom:8, cursor:"pointer" }} onClick={() => setFaqOpen(faqOpen===i?null:i)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#111", paddingRight:12 }}>{q}</div>
                <div style={{ fontSize:18, color:"#16A34A", flexShrink:0 }}>{faqOpen===i?"-":"+"}</div>
              </div>
              {faqOpen===i && <div style={{ fontSize:14, color:"#6B7280", lineHeight:1.7, marginTop:12, paddingTop:12, borderTop:"1px solid #E8F5E9" }}>{a}</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", background:"linear-gradient(135deg,#16A34A,#4ADE80)", borderRadius:24, padding:"40px 24px" }}>
          <div style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:8 }}>Rutinini bugün oluştur</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.85)", marginBottom:24 }}>Tek ödeme, 1 yıl tam erişim, her cihazda</div>
          <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn("white","#16A34A"), borderRadius:14, padding:"16px 40px", fontSize:16, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>Hemen Başla</button>
        </div>
        <div style={{ textAlign:"center", marginTop:32, fontSize:12, color:"#D1D5DB" }}>rutin.online - {new Date().getFullYear()} - {CONTACT_EMAIL}</div>
      </div>
    </div>
  );

  // ── AKTİVASYON ───────────────────────────────────────────────
  if (screen === SCREENS.ACTIVATE) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:400, padding:40 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}><Logo size={30} textSize={20} dotSize={12} /><div style={{ fontSize:20, fontWeight:800, color:"#111", marginTop:20, marginBottom:6 }}>Lisans Kodunu Gir</div><div style={{ fontSize:14, color:"#9CA3AF", lineHeight:1.6 }}>Satın alma sonrası e-postana gelen kodu gir</div></div>
        <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>LİSANS KODU</div>
        <input value={licenseInput} onChange={e => { setLicenseInput(e.target.value.toUpperCase()); setError(""); }} placeholder="RUTIN-XXXX-XXXX" style={{ ...S.input, letterSpacing:2, fontWeight:600, textAlign:"center", fontSize:18, borderColor:error?"#EF4444":"#E5E7EB", marginBottom:8 }} onKeyDown={e => e.key==="Enter" && handleActivate()} />
        {error && <div style={{ fontSize:12, color:"#EF4444", marginBottom:8, textAlign:"center" }}>{error}</div>}
        <button onClick={handleActivate} disabled={loading || !licenseInput.trim()} style={{ ...S.btn(loading||!licenseInput.trim()?"#D1D5DB":"#16A34A"), width:"100%", borderRadius:12, padding:"15px", fontSize:15, cursor:loading||!licenseInput.trim()?"not-allowed":"pointer", marginBottom:16 }}>{loading?"Kontrol ediliyor...":"Devam Et"}</button>
        <div style={{ textAlign:"center", fontSize:13, color:"#9CA3AF" }}>Hesabın var mı? <span onClick={() => setScreen(SCREENS.LOGIN)} style={{ color:"#16A34A", cursor:"pointer", fontWeight:600 }}>Giriş yap</span></div>
        <button onClick={() => setScreen(SCREENS.LANDING)} style={{ ...S.btn("transparent","#9CA3AF"), width:"100%", padding:"10px", fontSize:13, marginTop:8 }}>← Geri</button>
      </div>
    </div>
  );

  // ── KAYIT ────────────────────────────────────────────────────
  if (screen === SCREENS.REGISTER) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:400, padding:40 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}><Logo size={28} textSize={18} dotSize={11} /><div style={{ fontSize:20, fontWeight:800, color:"#111", marginTop:20, marginBottom:4 }}>Hesabını Oluştur</div><div style={{ fontSize:13, color:"#9CA3AF" }}>Lisans: <strong style={{ color:"#16A34A" }}>{license?.license_key}</strong></div></div>
        {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#DC2626", marginBottom:16, textAlign:"center" }}>{error}</div>}
        {[["AD SOYAD","fullName","text","Adın ve soyadın"],["E-POSTA","email","email","ornek@gmail.com"],["ŞİFRE","password","password","En az 6 karakter"],["ŞİFRE TEKRAR","confirmPassword","password","Şifreni tekrar gir"]].map(([label,key,type,ph]) => (
          <div key={key} style={{ marginBottom:14 }}><div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:6 }}>{label}</div><input type={type} placeholder={ph} value={regForm[key]} onChange={e => setRegForm(p => ({ ...p,[key]:e.target.value }))} style={S.input} /></div>
        ))}
        <button onClick={handleRegister} disabled={loading} style={{ ...S.btn(loading?"#D1D5DB":"#16A34A"), width:"100%", borderRadius:12, padding:"15px", fontSize:15, marginTop:8, cursor:loading?"not-allowed":"pointer" }}>{loading?"Kaydediliyor...":"Hesabı Oluştur"}</button>
        <button onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ ...S.btn("transparent","#9CA3AF"), width:"100%", padding:"10px", fontSize:13, marginTop:8 }}>← Geri</button>
      </div>
    </div>
  );

  // ── GİRİŞ ────────────────────────────────────────────────────
  if (screen === SCREENS.LOGIN) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:400, padding:40 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}><Logo size={28} textSize={18} dotSize={11} /><div style={{ fontSize:20, fontWeight:800, color:"#111", marginTop:20, marginBottom:6 }}>Tekrar Hoş Geldin</div><div style={{ fontSize:13, color:"#9CA3AF" }}>E-posta ve şifrenle giriş yap</div></div>
        {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#DC2626", marginBottom:16, textAlign:"center" }}>{error}</div>}
        {[["E-POSTA","email","email","ornek@gmail.com"],["ŞİFRE","password","password","Şifren"]].map(([label,key,type,ph]) => (
          <div key={key} style={{ marginBottom:14 }}><div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:6 }}>{label}</div><input type={type} placeholder={ph} value={loginForm[key]} onChange={e => setLoginForm(p => ({ ...p,[key]:e.target.value }))} style={S.input} onKeyDown={e => e.key==="Enter" && handleLogin()} /></div>
        ))}
        <button onClick={handleLogin} disabled={loading} style={{ ...S.btn(loading?"#D1D5DB":"#16A34A"), width:"100%", borderRadius:12, padding:"15px", fontSize:15, marginTop:8, cursor:loading?"not-allowed":"pointer" }}>{loading?"Giriş yapılıyor...":"Giriş Yap"}</button>
        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#9CA3AF" }}>Hesabın yok mu? <span onClick={() => setScreen(SCREENS.ACTIVATE)} style={{ color:"#16A34A", cursor:"pointer", fontWeight:600 }}>Lisans koduyla kayıt ol</span></div>
        <button onClick={() => setScreen(SCREENS.LANDING)} style={{ ...S.btn("transparent","#9CA3AF"), width:"100%", padding:"10px", fontSize:13, marginTop:8 }}>← Geri</button>
      </div>
    </div>
  );

  // ── SÜRESİ DOLMUŞ ────────────────────────────────────────────
  if (screen === SCREENS.EXPIRED) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:420, padding:40, textAlign:"center" }}>
        <Logo size={28} textSize={18} dotSize={11} />
        <div style={{ margin:"28px 0 8px", fontSize:48 }}>⏰</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#111", marginBottom:10 }}>Kullanım süren doldu</div>
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#DC2626", marginBottom:28 }}>Rutinlerine tekrar erişmek için lisansını yenile.</div>
        <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:14, padding:"20px", marginBottom:20 }}>
          <div style={{ fontSize:13, color:"#16A34A", fontWeight:600, marginBottom:4 }}>Yenileme Fiyatı</div>
          <div style={{ fontSize:42, fontWeight:900, color:"#111" }}>199₺</div>
          <div style={{ fontSize:13, color:"#9CA3AF" }}>+ 1 yıl daha tam erişim</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => window.open("https://wa.me/" + CONTACT_WHATSAPP + "?text=Merhaba, lisansimi yenilemek istiyorum.","_blank")} style={{ ...S.btn("#25D366"), borderRadius:12, padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>💬 WhatsApp ile Yenile</button>
          <button onClick={() => window.open("mailto:" + CONTACT_EMAIL + "?subject=Lisans Yenileme","_blank")} style={{ ...S.btn("#F9FAFB","#374151"), border:"1px solid #E5E7EB", borderRadius:12, padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>📧 E-posta ile Yenile</button>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────
  if (screen === SCREENS.DASHBOARD) {
    const remaining = license ? daysLeft(license.expires_at || license.expiresAt) : 0;
    const expiringSoon = remaining <= 30;
    return (
      <div style={S.app}>
        <AppNav />
        {expiringSoon && (
          <div style={{ background:remaining<=7?"#FEF2F2":"#FFFBEB", borderBottom:"1px solid " + (remaining<=7?"#FECACA":"#FDE68A"), padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, color:remaining<=7?"#DC2626":"#D97706" }}>{remaining<=7?"⚠️":"🕐"} Lisansın <strong>{remaining} gün</strong> sonra doluyor</div>
            <button onClick={() => window.open("https://wa.me/" + CONTACT_WHATSAPP + "?text=Lisansimi yenilemek istiyorum.","_blank")} style={{ ...S.btn(remaining<=7?"#DC2626":"#D97706"), padding:"6px 14px", fontSize:12, borderRadius:8 }}>Yenile</button>
          </div>
        )}
        <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 18px" }}>
          <div style={{ marginBottom:8, fontSize:14, color:"#9CA3AF" }}>Merhaba, <strong style={{ color:"#111" }}>{user?.full_name?.split(" ")[0]}</strong> 👋</div>
          {routines.length > 0 && (
            <div style={{ ...S.card, marginBottom:18, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"#F0FDF4" }}><div style={{ width:progress + "%", height:"100%", background:"linear-gradient(90deg,#16A34A,#4ADE80)", transition:"width 0.4s ease" }} /></div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                <div><div style={{ fontSize:20, fontWeight:800, color:"#111" }}>{todayCompleted}/{routines.length} tamamlandı</div><div style={{ fontSize:13, color:"#9CA3AF", marginTop:2 }}>{progress===100?"Harika! Hepsini bitirdin!":(routines.length-todayCompleted) + " rutin kaldı"}</div></div>
                <div style={{ fontSize:36, fontWeight:900, color:progress===100?"#16A34A":"#374151" }}>{progress}%</div>
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
            {DAYS.map((d,i) => (
              <button key={d} onClick={() => setSelectedDay(i)} style={{ ...S.btn(selectedDay===i?"#16A34A":"white", selectedDay===i?"white":"#6B7280"), minWidth:52, padding:"10px 8px", borderRadius:12, fontSize:13, fontWeight:selectedDay===i?700:400, border:selectedDay===i?"none":"1px solid #E5E7EB", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:11 }}>{d}</span><span style={{ fontSize:16, fontWeight:700 }}>{i+10}</span>
              </button>
            ))}
          </div>
          <div style={{ marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#111" }}>Rutinlerin {routines.length > 0 && <span style={{ fontSize:13, color:"#9CA3AF", fontWeight:400 }}>({routines.length})</span>}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => navigate(SCREENS.STATS)} style={{ ...S.btn("#F0FDF4","#16A34A"), padding:"8px 14px", fontSize:13, border:"1px solid #BBF7D0" }}>📊 İstatistik</button>
              <button onClick={() => navigate(SCREENS.ADD)} style={{ ...S.btn(), padding:"8px 16px", fontSize:13, borderRadius:10 }}>+ Ekle</button>
            </div>
          </div>
          {routines.length === 0 && (
            <div style={{ ...S.card, textAlign:"center", padding:"40px 24px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🌱</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#111", marginBottom:8 }}>Henüz rutinin yok</div>
              <div style={{ fontSize:14, color:"#9CA3AF", marginBottom:24, lineHeight:1.6 }}>İlk rutinini kendin ekle ya da aşağıdaki önerilerden birini seç.</div>
              <button onClick={() => navigate(SCREENS.ADD)} style={{ ...S.btn(), padding:"12px 28px", fontSize:14, borderRadius:12 }}>+ İlk Rutinini Ekle</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {routines.map(r => {
              const done = isCompletedToday(r.id);
              return (
                <div key={r.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:14, background:done?"#F0FDF4":"white", border:"1px solid " + (done?"#BBF7D0":"#E8F5E9"), padding:"14px 16px", transition:"all 0.15s" }}>
                  <div onClick={() => toggle(r.id)} style={{ width:44, height:44, borderRadius:"50%", background:done?"#DCFCE7":"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, cursor:"pointer" }}>{r.emoji}</div>
                  <div onClick={() => toggle(r.id)} style={{ flex:1, cursor:"pointer" }}>
                    <div style={{ fontSize:15, fontWeight:600, color:done?"#16A34A":"#111", textDecoration:done?"line-through":"none" }}>{r.title}</div>
                    <div style={{ display:"flex", gap:14, marginTop:2 }}><span style={{ fontSize:12, color:"#9CA3AF" }}>⏰ {r.time||"—"}</span><span style={{ fontSize:12, color:"#F59E0B", fontWeight:600 }}>🔥 {r.streak||0} gün</span></div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => { setEditR({...r}); navigate(SCREENS.EDIT); }} style={{ width:32, height:32, borderRadius:8, background:"#F3F4F6", border:"none", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                    <button onClick={() => setDeleteConfirm(r.id)} style={{ width:32, height:32, borderRadius:8, background:"#FEF2F2", border:"none", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
                  </div>
                  <div onClick={() => toggle(r.id)} style={{ width:28, height:28, borderRadius:"50%", background:done?"#16A34A":"transparent", border:"2px solid " + (done?"#16A34A":"#D1D5DB"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.2s" }}>
                    {done && <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 5.5,10.5 12,3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
              );
            })}
          </div>
          {EXAMPLE_ROUTINES.filter(ex => !routines.find(r => r.title===ex.title)).length > 0 && (
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>💡 Rutin önerileri</div>
              <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:14 }}>Bir tıkla rutinine ekle</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {EXAMPLE_ROUTINES.filter(ex => !routines.find(r => r.title===ex.title)).slice(0,5).map(ex => (
                  <div key={ex.title} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#FAFAFA", border:"1px dashed #D1FAE5" }}>
                    <span style={{ fontSize:20 }}>{ex.emoji}</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:14, color:"#374151" }}>{ex.title}</div><div style={{ fontSize:11, color:"#9CA3AF" }}>{ex.time}</div></div>
                    <button onClick={() => addRoutine(ex)} style={{ ...S.btn("#F0FDF4","#16A34A"), padding:"6px 14px", fontSize:12, borderRadius:8, border:"1px solid #BBF7D0" }}>+ Ekle</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ ...S.card, marginTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px" }}>
            <div><div style={{ fontSize:12, color:"#9CA3AF" }}>Lisans bitiş tarihi</div><div style={{ fontSize:14, fontWeight:600, color:expiringSoon?"#DC2626":"#374151" }}>{license ? formatDate(license.expires_at || license.expiresAt) : "—"}</div></div>
            <div style={{ fontSize:24, fontWeight:800, color:expiringSoon?"#DC2626":"#16A34A" }}>{remaining}g</div>
          </div>
        </div>
        {deleteConfirm && (
          <div onClick={() => setDeleteConfirm(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
            <div onClick={e => e.stopPropagation()} style={{ ...S.card, maxWidth:340, width:"100%", padding:28, textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#111", marginBottom:8 }}>Rutini sil?</div>
              <div style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>Bu rutin ve tüm takip verisi silinecek.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ ...S.btn("#F9FAFB","#374151"), flex:1, padding:"12px", borderRadius:12, border:"1px solid #E5E7EB" }}>Vazgeç</button>
                <button onClick={() => deleteRoutine(deleteConfirm)} style={{ ...S.btn("#EF4444"), flex:1, padding:"12px", borderRadius:12 }}>Sil</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:toast.color, color:"white", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:200, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>{toast.msg}</div>}
      </div>
    );
  }

  // ── RUTİN EKLE ───────────────────────────────────────────────
  if (screen === SCREENS.ADD) return (
    <div style={S.app}>
      <AppNav showBack={true} showHome={true} title="Yeni Rutin" />
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, color:"#6B7280", fontWeight:500, marginBottom:10 }}>⚡ HIZLI EKLE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {EXAMPLE_ROUTINES.filter(ex => !routines.find(r => r.title===ex.title)).map(ex => (
              <div key={ex.title} onClick={() => addRoutine(ex)} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", background:"#FAFAFA", border:"1px dashed #D1FAE5" }}>
                <span style={{ fontSize:20 }}>{ex.emoji}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:14, color:"#374151", fontWeight:500 }}>{ex.title}</div><div style={{ fontSize:11, color:"#9CA3AF" }}>{ex.time}</div></div>
                <span style={{ fontSize:20, color:"#16A34A" }}>+</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop:"1px solid #E5E7EB", paddingTop:24 }}>
          <div style={{ fontSize:13, color:"#6B7280", fontWeight:500, marginBottom:16 }}>✏️ VEYA KENDİN OLUŞTUR</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>EMOJİ</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["⭐","🏃","💧","📚","🧘","✍️","🎯","💪","🥗","😴","🎵","🌿"].map(e => (
                <button key={e} onClick={() => setNewR(p => ({ ...p,emoji:e }))} style={{ width:44, height:44, borderRadius:12, background:newR.emoji===e?"#DCFCE7":"#F9FAFB", border:"1.5px solid " + (newR.emoji===e?"#16A34A":"#E5E7EB"), fontSize:22, cursor:"pointer" }}>{e}</button>
              ))}
            </div>
          </div>
          {[["RUTİN ADI","title","text","Örn: Her sabah 10 dk yürü"],["SAAT","time","text","Örn: 07:00"]].map(([label,key,type,ph]) => (
            <div key={key} style={{ marginBottom:14 }}><div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>{label}</div><input type={type} placeholder={ph} value={newR[key]} onChange={e => setNewR(p => ({ ...p,[key]:e.target.value }))} style={S.input} /></div>
          ))}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>KATEGORİ</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(CATS).map(([cat,color]) => (
                <button key={cat} onClick={() => setNewR(p => ({ ...p,category:cat }))} style={{ padding:"8px 16px", borderRadius:20, background:newR.category===cat?color:"#F9FAFB", color:newR.category===cat?"white":"#6B7280", border:"1px solid " + (newR.category===cat?color:"#E5E7EB"), fontSize:13, cursor:"pointer", fontWeight:newR.category===cat?600:400 }}>{cat}</button>
              ))}
            </div>
          </div>
          <button onClick={() => addRoutine()} style={{ ...S.btn(), width:"100%", borderRadius:14, padding:"16px", fontSize:16 }}>Rutini Kaydet</button>
        </div>
      </div>
    </div>
  );

  // ── RUTİN DÜZENLE ────────────────────────────────────────────
  if (screen === SCREENS.EDIT && editR) return (
    <div style={S.app}>
      <AppNav showBack={true} showHome={true} title="Rutini Düzenle" />
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>EMOJİ</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["⭐","🏃","💧","📚","🧘","✍️","🎯","💪","🥗","😴","🎵","🌿"].map(e => (
              <button key={e} onClick={() => setEditR(p => ({ ...p,emoji:e }))} style={{ width:44, height:44, borderRadius:12, background:editR.emoji===e?"#DCFCE7":"#F9FAFB", border:"1.5px solid " + (editR.emoji===e?"#16A34A":"#E5E7EB"), fontSize:22, cursor:"pointer" }}>{e}</button>
            ))}
          </div>
        </div>
        {[["RUTİN ADI","title","text","Rutin adı"],["SAAT","time","text","Örn: 07:00"]].map(([label,key,type,ph]) => (
          <div key={key} style={{ marginBottom:14 }}><div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>{label}</div><input type={type} placeholder={ph} value={editR[key]||""} onChange={e => setEditR(p => ({ ...p,[key]:e.target.value }))} style={S.input} /></div>
        ))}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>KATEGORİ</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(CATS).map(([cat,color]) => (
              <button key={cat} onClick={() => setEditR(p => ({ ...p,category:cat }))} style={{ padding:"8px 16px", borderRadius:20, background:editR.category===cat?color:"#F9FAFB", color:editR.category===cat?"white":"#6B7280", border:"1px solid " + (editR.category===cat?color:"#E5E7EB"), fontSize:13, cursor:"pointer", fontWeight:editR.category===cat?600:400 }}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { setDeleteConfirm(editR.id); setScreen(SCREENS.DASHBOARD); }} style={{ ...S.btn("#FEF2F2","#EF4444"), flex:1, padding:"14px", borderRadius:14, border:"1px solid #FECACA" }}>Sil</button>
          <button onClick={saveEdit} style={{ ...S.btn(), flex:2, padding:"14px", borderRadius:14 }}>Kaydet</button>
        </div>
      </div>
    </div>
  );

  // ── İSTATİSTİKLER ─────────────────────────────────────────────
  if (screen === SCREENS.STATS) {
    const funStats = calcFunStats(routines, completions);
    return (
      <div style={S.app}>
        <AppNav showBack={true} showHome={true} title="İstatistikler" />
        <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            {[["🔥","En uzun seri",Math.max(0,...routines.map(r=>r.streak||0)) + " gün"],["✅","Toplam rutin",routines.length + " adet"],["⭐","Bugün",todayCompleted + "/" + routines.length],["📅","Tamamlanan",completions.length + " gün"]].map(([e,l,v]) => (
              <div key={l} style={{ ...S.card, textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{e}</div>
                <div style={{ fontSize:20, fontWeight:800, color:"#111", marginBottom:2 }}>{v}</div>
                <div style={{ fontSize:12, color:"#9CA3AF" }}>{l}</div>
              </div>
            ))}
          </div>
          {routines.length > 0 && (
            <div style={{ ...S.card, marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:14 }}>Rutin performansı</div>
              {routines.map(r => {
                const pct = Math.min(100, Math.round(((r.streak||0)/30)*100));
                return (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                    <div style={{ fontSize:20 }}>{r.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"#374151", marginBottom:4 }}>{r.title}</div>
                      <div style={{ background:"#F3F4F6", borderRadius:4, height:6, overflow:"hidden" }}><div style={{ width:pct + "%", height:"100%", background:CATS[r.category]||"#16A34A", borderRadius:4 }} /></div>
                    </div>
                    <div style={{ fontSize:12, color:"#9CA3AF", minWidth:40, textAlign:"right" }}>🔥 {r.streak||0}</div>
                  </div>
                );
              })}
            </div>
          )}
          {funStats.length > 0 && (
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#111", marginBottom:4 }}>Biliyor muydun?</div>
              <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:16 }}>Rutinlerinle şimdiye kadar bunları başardın</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {funStats.map((s,i) => (
                  <div key={i} style={{ ...S.card, display:"flex", alignItems:"center", gap:16, padding:"16px 18px", borderLeft:"4px solid " + s.color }}>
                    <div style={{ fontSize:32, flexShrink:0 }}>{s.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:"#6B7280", marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {funStats.length === 0 && routines.length > 0 && (
            <div style={{ ...S.card, textAlign:"center", padding:"32px 24px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#111", marginBottom:8 }}>Henüz veri yok</div>
              <div style={{ fontSize:13, color:"#9CA3AF", lineHeight:1.6 }}>Rutinlerini tamamlamaya başlayınca burada eğlenceli istatistikler göreceksin!</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PROFİL ───────────────────────────────────────────────────
  if (screen === SCREENS.PROFILE) return (
    <div style={S.app}>
      <AppNav showBack={true} showHome={true} title="Profilim" />
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ ...S.card, textAlign:"center", padding:"28px", marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"#16A34A", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:28, margin:"0 auto 16px" }}>
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"#111" }}>{user?.full_name}</div>
          <div style={{ fontSize:14, color:"#9CA3AF", marginTop:4 }}>{user?.email}</div>
          <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:16, paddingTop:16, borderTop:"1px solid #E8F5E9" }}>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:"#16A34A" }}>{routines.length}</div><div style={{ fontSize:12, color:"#9CA3AF" }}>Rutin</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:"#F59E0B" }}>{Math.max(0,...routines.map(r=>r.streak||0))}</div><div style={{ fontSize:12, color:"#9CA3AF" }}>En uzun seri</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:"#7C3AED" }}>{completions.length}</div><div style={{ fontSize:12, color:"#9CA3AF" }}>Tamamlanan</div></div>
          </div>
        </div>

        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#111", marginBottom:16 }}>Kişisel Bilgiler</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>AD SOYAD</div>
            <input value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName:e.target.value }))} style={S.input} placeholder="Adın ve soyadın" />
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:8 }}>E-POSTA</div>
            <input value={user?.email} disabled style={{ ...S.input, background:"#F9FAFB", color:"#9CA3AF", cursor:"not-allowed" }} />
            <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>E-posta değiştirilemez</div>
          </div>

          <div style={{ borderTop:"1px solid #E8F5E9", paddingTop:16, marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#111", marginBottom:4 }}>Şifre Değiştir</div>
            <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:16 }}>Şifreni değiştirmek istemiyorsan bu alanları boş bırak</div>
            {[["MEVCUT ŞİFRE","currentPass","Mevcut şifren"],["YENİ ŞİFRE","newPass","En az 6 karakter"],["YENİ ŞİFRE TEKRAR","confirmPass","Yeni şifreni tekrar gir"]].map(([label,key,ph]) => (
              <div key={key} style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:6 }}>{label}</div>
                <input type="password" placeholder={ph} value={profileForm[key]} onChange={e => setProfileForm(p => ({ ...p,[key]:e.target.value }))} style={S.input} />
              </div>
            ))}
          </div>

          {profileMsg.text && (
            <div style={{ background:profileMsg.ok?"#F0FDF4":"#FEF2F2", border:"1px solid " + (profileMsg.ok?"#BBF7D0":"#FECACA"), borderRadius:10, padding:"10px 14px", fontSize:13, color:profileMsg.ok?"#16A34A":"#DC2626", marginBottom:16, textAlign:"center" }}>
              {profileMsg.text}
            </div>
          )}

          <button onClick={handleProfileSave} style={{ ...S.btn(), width:"100%", borderRadius:12, padding:"14px", fontSize:15 }}>Kaydet</button>
        </div>

        <div style={{ ...S.card, border:"1px solid #FEE2E2" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>Lisans Bilgisi</div>
          <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:12 }}>Bitiş: {license ? formatDate(license.expires_at || license.expiresAt) : "—"}</div>
          <button onClick={() => window.open("https://wa.me/" + CONTACT_WHATSAPP + "?text=Lisansimi yenilemek istiyorum.","_blank")} style={{ ...S.btn("#25D366"), width:"100%", borderRadius:12, padding:"12px", fontSize:14 }}>💬 Lisansı Yenile</button>
        </div>
      </div>
    </div>
  );
}
