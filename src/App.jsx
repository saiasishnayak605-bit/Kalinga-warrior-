import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Check, ArrowRight, LogIn, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient";

function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#E8862B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#navLogoGrad)" />
      <path d="M50 26 L68 38 L68 60 Q68 76 50 82 Q32 76 32 60 L32 38 Z" fill="#FFFFFF" opacity="0.95" />
      <path d="M50 42 L57 54 L50 66 L43 54 Z" fill="#E8862B" />
    </svg>
  );
}

const TEMPLATES = [
  { id: "plaque", name: "Gold Plaque", desc: "Navy & brass, formal" },
  { id: "badge", name: "Modern Badge", desc: "Parchment, clean corners" },
  { id: "ribbon", name: "Classic Ribbon", desc: "Ink & ribbon banner" },
];

const PLANS = [
  { key: "starter", name: "Starter", price: "₹199", period: "/month", blurb: "For individuals, occasional use", features: ["10 downloads / month", "Basic templates", "PNG downloads"] },
  { key: "pro", name: "Pro", price: "₹499", period: "/month", blurb: "For regular / active users", features: ["30 downloads / month", "All templates", "Priority support"], featured: true },
  { key: "unlimited", name: "Unlimited", price: "₹999", period: "/month", blurb: "For power users, teams", features: ["Unlimited downloads", "All templates", "Priority support"] },
];

function drawFrame(ctx, { template, img, name, level, company }) {
  const W = 640, H = 800;
  ctx.clearRect(0, 0, W, H);

  const ink = "#12151C", brass = "#C9A227", parchment = "#F4EFE4";

  if (template === "plaque") {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = brass;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(38, 38, W - 76, H - 76);

    const cx = W / 2, cy = 300, r = 140;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    else { ctx.fillStyle = "#2A2F3A"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    ctx.restore();
    ctx.strokeStyle = brass;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = brass;
    ctx.font = "600 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((company || "YOUR COMPANY").toUpperCase(), cx, 500);

    ctx.fillStyle = "#F4EFE4";
    ctx.font = "700 44px Fraunces, Georgia, serif";
    ctx.fillText(name || "Employee Name", cx, 560);

    ctx.fillStyle = brass;
    ctx.font = "500 22px 'IBM Plex Mono', monospace";
    ctx.fillText((level || "LEVEL 1").toUpperCase(), cx, 605);

    ctx.strokeStyle = brass;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 90, 625); ctx.lineTo(cx + 90, 625); ctx.stroke();
  }

  if (template === "badge") {
    ctx.fillStyle = parchment;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = brass;
    ctx.lineWidth = 3;
    const m = 30, cl = 46;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + cl * dy);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cl * dx, y);
      ctx.stroke();
    });

    const cx = W / 2, sq = 260, sy = 130;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - sq / 2, sy, sq, sq);
    ctx.restore();
    if (img) ctx.drawImage(img, cx - sq / 2, sy, sq, sq);

    ctx.textAlign = "center";
    ctx.fillStyle = "#8A6D1F";
    ctx.font = "600 18px Inter, sans-serif";
    ctx.fillText((company || "YOUR COMPANY").toUpperCase(), cx, sy + sq + 60);

    ctx.fillStyle = ink;
    ctx.font = "700 42px Fraunces, Georgia, serif";
    ctx.fillText(name || "Employee Name", cx, sy + sq + 115);

    ctx.fillStyle = brass;
    ctx.font = "600 20px 'IBM Plex Mono', monospace";
    ctx.fillText((level || "LEVEL 1").toUpperCase(), cx, sy + sq + 155);
  }

  if (template === "ribbon") {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(201,162,39,${0.02 + (i % 5) * 0.005})`;
      ctx.fillRect(0, i * 20, W, 1);
    }

    const cx = W / 2, r = 130, cy = 260;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    else { ctx.fillStyle = "#2A2F3A"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    ctx.restore();

    ctx.fillStyle = brass;
    ctx.beginPath();
    ctx.moveTo(cx - 170, 430); ctx.lineTo(cx + 170, 430); ctx.lineTo(cx + 170, 500);
    ctx.lineTo(cx, 470); ctx.lineTo(cx - 170, 500); ctx.closePath();
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = ink;
    ctx.font = "700 24px 'IBM Plex Mono', monospace";
    ctx.fillText((level || "LEVEL 1").toUpperCase(), cx, 470);

    ctx.fillStyle = "#F4EFE4";
    ctx.font = "700 40px Fraunces, Georgia, serif";
    ctx.fillText(name || "Employee Name", cx, 555);

    ctx.fillStyle = brass;
    ctx.font = "500 18px Inter, sans-serif";
    ctx.fillText((company || "YOUR COMPANY").toUpperCase(), cx, 590);

    [[-1], [1]].forEach(([s]) => {
      ctx.fillStyle = brass;
      ctx.beginPath();
      ctx.arc(cx + s * 200, 260, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

const QUOTA_BY_PLAN = { starter: 10, pro: 30, unlimited: 999999 };

const inputStyle = {
  width: "100%", background: "#FFFFFF", border: "1px solid #EBDCC8", color: "#2B2118",
  padding: "12px 16px", borderRadius: 12, fontSize: 14, marginBottom: 10, boxSizing: "border-box",
};

const primaryBtnStyle = {
  width: "100%", background: "linear-gradient(135deg, #FFD166, #E8862B)", color: "#2B2118",
  padding: "13px", borderRadius: 999, fontWeight: 700, border: "none", cursor: "pointer",
  boxShadow: "0 8px 20px rgba(232,134,43,0.28)",
};

function AuthBox({ onAuthed }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async () => {
    setBusy(true); setError("");
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) { setError(error.message); return; }
        setResetSent(true);
        return;
      }
      const { data, error } = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      if (data?.user) onAuthed(data.user);
      else if (mode === "signup") setError("Check your email to confirm your account, then log in.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const cardStyle = { maxWidth: 380, margin: "40px auto", padding: 32, borderRadius: 24, background: "#FFFFFF", boxShadow: "0 20px 50px rgba(232,134,43,0.12)", border: "1px solid #F5E8D6" };

  if (mode === "reset" && resetSent) {
    return (
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h2 className="heading" style={{ fontSize: 20, marginBottom: 10, color: "#2B2118" }}>Check your email</h2>
        <p style={{ color: "#8A7A6D", fontSize: 14, marginBottom: 18 }}>We sent a password reset link to {email}.</p>
        <span onClick={() => { setMode("login"); setResetSent(false); }} style={{ color: "#E8862B", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Back to log in</span>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2 className="heading" style={{ fontSize: 22, marginBottom: 18, color: "#2B2118" }}>
        {mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Log in"}
      </h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      {mode !== "reset" && (
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
      )}
      {error && <div style={{ color: "#C9540F", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button onClick={submit} disabled={busy} style={{ ...primaryBtnStyle, marginBottom: 12 }}>
        {busy ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "reset" ? "Send reset link" : "Log in"}
      </button>
      {mode === "login" && (
        <div style={{ textAlign: "center", fontSize: 13, marginBottom: 10 }}>
          <span onClick={() => setMode("reset")} style={{ color: "#8A7A6D", cursor: "pointer" }}>Forgot password?</span>
        </div>
      )}
      <div style={{ textAlign: "center", fontSize: 13, color: "#8A7A6D" }}>
        {mode === "reset" ? (
          <span onClick={() => setMode("login")} style={{ color: "#E8862B", cursor: "pointer", fontWeight: 600 }}>Back to log in</span>
        ) : (
          <>
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <span onClick={() => setMode(mode === "signup" ? "login" : "signup")} style={{ color: "#E8862B", cursor: "pointer", fontWeight: 600 }}>
              {mode === "signup" ? "Log in" : "Sign up"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function NewPasswordForm({ onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    onDone();
  };

  return (
    <div style={{ maxWidth: 380, margin: "40px auto", padding: 32, borderRadius: 24, background: "#FFFFFF", boxShadow: "0 20px 50px rgba(232,134,43,0.12)", border: "1px solid #F5E8D6" }}>
      <h2 className="heading" style={{ fontSize: 20, marginBottom: 14, color: "#2B2118" }}>Set a new password</h2>
      <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
      {error && <div style={{ color: "#C9540F", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button onClick={submit} disabled={busy} style={primaryBtnStyle}>
        {busy ? "Saving…" : "Save new password"}
      </button>
    </div>
  );
}

export default function PodiumApp() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState("plaque");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [company, setCompany] = useState("");
  const [imgObj, setImgObj] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setIsRecovering(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async (userId) => {
    let { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!data) {
      const { data: created } = await supabase.from("profiles")
        .insert({ id: userId, plan: "starter", downloads_used: 0 }).select().single();
      data = created;
    }
    setProfile(data);
  }, []);

  useEffect(() => { if (session?.user) loadProfile(session.user.id); }, [session, loadProfile]);

  const [checkoutBusy, setCheckoutBusy] = useState(null);

  const handleSubscribe = async (planKey) => {
    if (!session) { window.location.hash = "#studio"; return; }
    setCheckoutBusy(planKey);
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, userId: session.user.id, userEmail: session.user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Kalinga Warrior",
        description: `${planKey} plan`,
        theme: { color: "#E8862B" },
        prefill: { email: session.user.email },
        handler: function () {
          alert("Payment successful! Your plan will update in a few seconds.");
          setTimeout(() => loadProfile(session.user.id), 4000);
        },
      });
      rzp.open();
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckoutBusy(null);
    }
  };

  const quota = profile ? QUOTA_BY_PLAN[profile.plan] ?? 10 : 10;
  const usedThisMonth = profile?.downloads_used ?? 0;
  const remaining = quota - usedThisMonth;
  const outOfQuota = remaining <= 0;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawFrame(ctx, { template, img: imgObj, name, level, company });
  }, [template, imgObj, name, level, company]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => setImgObj(img);
    img.src = URL.createObjectURL(file);
  };

  const handleDownload = async () => {
    if (outOfQuota) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${(name || "achievement").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    const newCount = usedThisMonth + 1;
    setProfile(p => ({ ...p, downloads_used: newCount }));
    await supabase.from("profiles").update({ downloads_used: newCount }).eq("id", session.user.id);
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#FFFBF5", color: "#2B2118", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:wght@600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .heading { font-family: 'Poppins', sans-serif; }
        .label { font-family: 'Inter', sans-serif; font-weight: 600; text-transform: uppercase; }
        input, select { font-family: 'Inter', sans-serif; }
        ::selection { background: #FFD166; color: #2B2118; }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-studio { grid-template-columns: 1fr 1.1fr; }
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-studio { grid-template-columns: 1fr; }
          h1 { font-size: 36px !important; }
          nav { padding: 16px 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        button, a { transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
        button:hover:not(:disabled), a:hover { opacity: 0.9; }
        button:active:not(:disabled) { transform: scale(0.98); }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", background: "rgba(255,251,245,0.9)", backdropFilter: "blur(6px)", borderBottom: "1px solid #F5E8D6", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={30} />
          <span className="heading" style={{ fontSize: 19, fontWeight: 700, color: "#2B2118" }}>Kalinga Warrior</span>
        </div>
        <a href="#studio" style={{
          color: "#FFFFFF", textDecoration: "none", fontSize: 14, fontWeight: 700,
          background: "linear-gradient(135deg, #FFD166, #E8862B)", padding: "10px 22px", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 16px rgba(232,134,43,0.25)",
        }}>
          {session ? (
            <span onClick={(e) => { e.preventDefault(); supabase.auth.signOut(); }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} /> Log out
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><LogIn size={14} /> Try the Studio</span>
          )}
        </a>
      </nav>

      {/* HERO */}
      <section style={{ padding: "72px 48px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,209,102,0.35), rgba(255,209,102,0))", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Reveal delay={0.1}>
            <div className="label" style={{ color: "#E8862B", fontSize: 13, letterSpacing: 2, marginBottom: 18 }}>Employee recognition, framed</div>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="heading" style={{ fontSize: 54, lineHeight: 1.15, fontWeight: 700, margin: "0 0 22px", maxWidth: 780, marginLeft: "auto", marginRight: "auto", color: "#2B2118" }}>
              Every milestone deserves its own plaque.
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{ color: "#8A7A6D", fontSize: 18, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Upload a photo, pick a level, and get a branded achievement frame in seconds — no design team required.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <a href="#studio" style={{
              display: "inline-flex", alignItems: "center", gap: 8, color: "#FFFFFF", padding: "15px 30px",
              borderRadius: 999, fontWeight: 700, textDecoration: "none", fontSize: 15,
              background: "linear-gradient(135deg, #FFD166, #E8862B)", boxShadow: "0 12px 30px rgba(232,134,43,0.3)",
            }}>
              Build your first frame <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="grid-3" style={{ padding: "0 48px 90px", maxWidth: 900, margin: "0 auto", display: "grid", gap: 32 }}>
        {[
          { n: "01", t: "Pick a template", d: "Choose from plaque, badge, or ribbon styles." },
          { n: "02", t: "Add your photo", d: "Upload once, it's composited automatically." },
          { n: "03", t: "Download & share", d: "Get a branded PNG, ready to post or print." },
        ].map((step, i) => (
          <Reveal key={step.n} delay={i * 0.15} style={{ textAlign: "center", background: "#FFFFFF", borderRadius: 20, padding: "28px 20px", boxShadow: "0 10px 30px rgba(43,33,24,0.05)", border: "1px solid #F5E8D6" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #FFD166, #E8862B)", color: "#fff", fontWeight: 700, fontSize: 14,
            }}>{step.n}</div>
            <div className="heading" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: "#2B2118" }}>{step.t}</div>
            <div style={{ color: "#8A7A6D", fontSize: 14, lineHeight: 1.5 }}>{step.d}</div>
          </Reveal>
        ))}
      </section>

      {/* STUDIO */}
      <section id="studio" style={{ padding: "20px 48px 100px", maxWidth: 1100, margin: "0 auto" }}>
        {isRecovering ? (
          <NewPasswordForm onDone={() => setIsRecovering(false)} />
        ) : !session ? (
          <AuthBox onAuthed={() => {}} />
        ) : (
        <div className="grid-studio" style={{ display: "grid", gap: 48, alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: 28, boxShadow: "0 10px 30px rgba(43,33,24,0.05)", border: "1px solid #F5E8D6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 className="heading" style={{ fontSize: 24, fontWeight: 600, color: "#2B2118" }}>The Studio</h2>
              <div className="label" style={{ fontSize: 11, letterSpacing: 1, color: outOfQuota ? "#C9540F" : "#8A7A6D", background: outOfQuota ? "#FDEDE3" : "#FFF3E2", padding: "6px 12px", borderRadius: 999 }}>
                {(profile?.plan ?? "starter").toUpperCase()} · {Math.max(remaining, 0)}/{quota} left
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div className="label" style={{ fontSize: 11, color: "#E8862B", marginBottom: 10, letterSpacing: 1 }}>01 · Template</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    style={{
                      padding: "10px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: template === t.id ? "linear-gradient(135deg, #FFD166, #E8862B)" : "#FFF3E2",
                      color: template === t.id ? "#FFFFFF" : "#8A7A6D",
                      border: "none",
                    }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div className="label" style={{ fontSize: 11, color: "#E8862B", marginBottom: 10, letterSpacing: 1 }}>02 · Photo</div>
              <button onClick={() => fileRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF9F2", border: "1.5px dashed #F0C98A", color: "#8A7A6D", padding: "14px 18px", borderRadius: 14, width: "100%", cursor: "pointer", fontSize: 14 }}>
                <Upload size={16} /> {imgObj ? "Photo uploaded — click to replace" : "Upload a photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>

            <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
              <div>
                <div className="label" style={{ fontSize: 11, color: "#E8862B", marginBottom: 8, letterSpacing: 1 }}>03 · Details</div>
                <input placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
                <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <input placeholder="Level / rank (e.g. Gold Achiever)" value={level} onChange={e => setLevel(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
            </div>

            <button onClick={handleDownload} disabled={outOfQuota}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 999, fontWeight: 700, border: "none", fontSize: 14,
                background: outOfQuota ? "#EFE3D2" : "linear-gradient(135deg, #FFD166, #E8862B)",
                color: outOfQuota ? "#B3A290" : "#FFFFFF",
                cursor: outOfQuota ? "not-allowed" : "pointer",
                boxShadow: outOfQuota ? "none" : "0 8px 20px rgba(232,134,43,0.28)",
              }}>
              <Download size={16} /> {outOfQuota ? "Monthly limit reached — upgrade to continue" : "Download PNG"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} width={640} height={800} style={{ width: "100%", maxWidth: 380, borderRadius: 20, boxShadow: "0 30px 70px rgba(43,33,24,0.18)" }} />
          </div>
        </div>
        )}
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 48px", background: "#FFF3E2" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div className="label" style={{ color: "#E8862B", fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>Pricing</div>
            <h2 className="heading" style={{ fontSize: 34, fontWeight: 600, color: "#2B2118" }}>Pick a plan, cancel anytime</h2>
          </div>
          <div className="grid-3" style={{ display: "grid", gap: 24 }}>
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.15} style={{
                border: p.featured ? "2px solid #E8862B" : "1px solid #F0DFC5",
                background: "#FFFFFF",
                borderRadius: 24, padding: 28, position: "relative",
                boxShadow: p.featured ? "0 16px 40px rgba(232,134,43,0.18)" : "0 10px 30px rgba(43,33,24,0.04)",
              }}>
                {p.featured && <div className="label" style={{ position: "absolute", top: -13, left: 28, background: "linear-gradient(135deg, #FFD166, #E8862B)", color: "#FFFFFF", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999, letterSpacing: 1 }}>Most popular</div>}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#8A7A6D" }}>{p.name}</div>
                <div style={{ marginBottom: 6 }}>
                  <span className="heading" style={{ fontSize: 32, fontWeight: 700, color: "#2B2118" }}>{p.price}</span>
                  <span style={{ color: "#B3A290", fontSize: 14 }}>{p.period}</span>
                </div>
                <div style={{ color: "#B3A290", fontSize: 13, marginBottom: 22 }}>{p.blurb}</div>
                <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "#5A4C3F" }}>
                      <Check size={15} color="#E8862B" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => handleSubscribe(p.key)} disabled={checkoutBusy === p.key}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    background: p.featured ? "linear-gradient(135deg, #FFD166, #E8862B)" : "#FFF3E2",
                    color: p.featured ? "#FFFFFF" : "#2B2118",
                    border: "none",
                  }}>
                  {checkoutBusy === p.key ? "Opening…" : `Choose ${p.name}`}
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 48px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="label" style={{ color: "#E8862B", fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>Questions</div>
          <h2 className="heading" style={{ fontSize: 30, fontWeight: 600, color: "#2B2118" }}>Before you start</h2>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          {[
            { q: "Can I cancel anytime?", a: "Yes — subscriptions can be cancelled at any point and you'll keep access until the end of your current billing cycle." },
            { q: "Is my photo stored securely?", a: "Photos are stored in an access-controlled database tied only to your account — no one else can see or download them." },
            { q: "How does billing work?", a: "You're charged automatically each month via UPI or card through Razorpay, a licensed Indian payment processor. No manual payment or screenshots needed." },
            { q: "What happens if I run out of downloads?", a: "You can upgrade to a higher plan anytime, and your new limit applies immediately." },
          ].map((item, i) => (
            <Reveal key={item.q} delay={i * 0.1} style={{ background: "#FFFFFF", borderRadius: 16, padding: 22, border: "1px solid #F5E8D6" }}>
              <div className="heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#2B2118" }}>{item.q}</div>
              <div style={{ color: "#8A7A6D", fontSize: 14, lineHeight: 1.6 }}>{item.a}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <footer style={{ padding: "36px 48px", borderTop: "1px solid #F0DFC5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, color: "#B3A290", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={18} /> © {new Date().getFullYear()} Kalinga Warrior</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a href="#" style={{ color: "#8A7A6D", textDecoration: "none" }}>Terms</a>
            <a href="#" style={{ color: "#8A7A6D", textDecoration: "none" }}>Privacy</a>
            <a href="mailto:hello@kalinga-warrior.vercel.app" style={{ color: "#8A7A6D", textDecoration: "none" }}>Contact</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>Secure payments via Razorpay</div>
        </div>
      </footer>
    </div>
  );
}
