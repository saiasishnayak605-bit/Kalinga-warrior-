import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Award, Star, Check, ArrowRight, Building2, Sparkles } from "lucide-react";

const TEMPLATES = [
  { id: "plaque", name: "Gold Plaque", desc: "Navy & brass, formal" },
  { id: "badge", name: "Modern Badge", desc: "Parchment, clean corners" },
  { id: "ribbon", name: "Classic Ribbon", desc: "Ink & ribbon banner" },
];

const PLANS = [
  { name: "Starter", price: "₹499", period: "/month", blurb: "For small teams getting started", features: ["Up to 25 frames / month", "3 templates", "PNG downloads"] },
  { name: "Team", price: "₹1,499", period: "/month", blurb: "For growing companies", features: ["Unlimited frames", "All templates", "Custom logo placement", "Priority support"], featured: true },
  { name: "Business", price: "₹3,999", period: "/month", blurb: "For larger organisations", features: ["Everything in Team", "Bulk upload (CSV)", "Video export", "Dedicated onboarding"] },
];

function drawFrame(ctx, { template, img, name, level, company }) {
  const W = 640, H = 800;
  ctx.clearRect(0, 0, W, H);

  const ink = "#12151C", brass = "#C9A227", parchment = "#F4EFE4", slate = "#6B7280";

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

const MOCK_PLAN = { name: "Starter", quota: 10 };

export default function PodiumApp() {
  const [template, setTemplate] = useState("plaque");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [company, setCompany] = useState("");
  const [imgObj, setImgObj] = useState(null);
  const [usedThisMonth, setUsedThisMonth] = useState(3);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const remaining = MOCK_PLAN.quota - usedThisMonth;
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

  const handleDownload = () => {
    if (outOfQuota) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${(name || "achievement").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setUsedThisMonth(u => u + 1);
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#0B0D12", color: "#F4EFE4", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .fraunces { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        input, select { font-family: 'Inter', sans-serif; }
        ::selection { background: #C9A227; color: #12151C; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 48px", borderBottom: "1px solid #23262F" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Award size={22} color="#C9A227" />
          <span className="fraunces" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>Podium</span>
        </div>
        <a href="#studio" style={{ color: "#C9A227", textDecoration: "none", fontSize: 14, fontWeight: 600, border: "1px solid #C9A227", padding: "9px 20px", borderRadius: 2 }}>Try the Studio →</a>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 48px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div className="mono" style={{ color: "#C9A227", fontSize: 13, letterSpacing: 3, marginBottom: 18 }}>EMPLOYEE RECOGNITION, FRAMED</div>
        <h1 className="fraunces" style={{ fontSize: 56, lineHeight: 1.1, fontWeight: 700, margin: "0 0 22px", maxWidth: 780, marginLeft: "auto", marginRight: "auto" }}>
          Every milestone deserves its own plaque.
        </h1>
        <p style={{ color: "#9BA0AC", fontSize: 18, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Upload a photo, pick a level, and get a branded achievement frame in seconds — no design team required.
        </p>
        <a href="#studio" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#C9A227", color: "#12151C", padding: "14px 28px", borderRadius: 2, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
          Build your first frame <ArrowRight size={16} />
        </a>
      </section>

      {/* STUDIO */}
      <section id="studio" style={{ padding: "40px 48px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 48, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 className="fraunces" style={{ fontSize: 28, fontWeight: 600 }}>The Studio</h2>
              <div className="mono" style={{ fontSize: 12, color: outOfQuota ? "#D97757" : "#9BA0AC", border: `1px solid ${outOfQuota ? "#D97757" : "#3A3F4B"}`, padding: "6px 12px", borderRadius: 2 }}>
                {MOCK_PLAN.name} · {Math.max(remaining, 0)}/{MOCK_PLAN.quota} left this month
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div className="mono" style={{ fontSize: 12, color: "#C9A227", marginBottom: 10, letterSpacing: 1 }}>01 · TEMPLATE</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    style={{
                      padding: "10px 16px", borderRadius: 2, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: template === t.id ? "#C9A227" : "transparent",
                      color: template === t.id ? "#12151C" : "#F4EFE4",
                      border: `1px solid ${template === t.id ? "#C9A227" : "#3A3F4B"}`
                    }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div className="mono" style={{ fontSize: 12, color: "#C9A227", marginBottom: 10, letterSpacing: 1 }}>02 · PHOTO</div>
              <button onClick={() => fileRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px dashed #3A3F4B", color: "#9BA0AC", padding: "14px 18px", borderRadius: 2, width: "100%", cursor: "pointer", fontSize: 14 }}>
                <Upload size={16} /> {imgObj ? "Photo uploaded — click to replace" : "Upload a photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>

            <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
              <div>
                <div className="mono" style={{ fontSize: 12, color: "#C9A227", marginBottom: 8, letterSpacing: 1 }}>03 · DETAILS</div>
                <input placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)}
                  style={{ width: "100%", background: "#161920", border: "1px solid #3A3F4B", color: "#F4EFE4", padding: "11px 14px", borderRadius: 2, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
                <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                  style={{ width: "100%", background: "#161920", border: "1px solid #3A3F4B", color: "#F4EFE4", padding: "11px 14px", borderRadius: 2, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
                <input placeholder="Level / rank (e.g. Gold Achiever)" value={level} onChange={e => setLevel(e.target.value)}
                  style={{ width: "100%", background: "#161920", border: "1px solid #3A3F4B", color: "#F4EFE4", padding: "11px 14px", borderRadius: 2, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>

            <button onClick={handleDownload} disabled={outOfQuota}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 2, fontWeight: 700, border: "none", fontSize: 14,
                background: outOfQuota ? "#3A3F4B" : "#F4EFE4",
                color: outOfQuota ? "#9BA0AC" : "#12151C",
                cursor: outOfQuota ? "not-allowed" : "pointer"
              }}>
              <Download size={16} /> {outOfQuota ? "Monthly limit reached — upgrade to continue" : "Download PNG"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} width={640} height={800} style={{ width: "100%", maxWidth: 380, borderRadius: 2, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 48px", background: "#0F1116", borderTop: "1px solid #23262F" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div className="mono" style={{ color: "#C9A227", fontSize: 13, letterSpacing: 3, marginBottom: 14 }}>PRICING</div>
            <h2 className="fraunces" style={{ fontSize: 36, fontWeight: 600 }}>Pick a plan, cancel anytime</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{
                border: `1px solid ${p.featured ? "#C9A227" : "#23262F"}`,
                background: p.featured ? "#161920" : "transparent",
                borderRadius: 2, padding: 28, position: "relative"
              }}>
                {p.featured && <div className="mono" style={{ position: "absolute", top: -12, left: 28, background: "#C9A227", color: "#12151C", fontSize: 11, fontWeight: 700, padding: "4px 10px", letterSpacing: 1 }}>MOST POPULAR</div>}
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#9BA0AC" }}>{p.name}</div>
                <div style={{ marginBottom: 6 }}>
                  <span className="fraunces" style={{ fontSize: 34, fontWeight: 700 }}>{p.price}</span>
                  <span style={{ color: "#6B7280", fontSize: 14 }}>{p.period}</span>
                </div>
                <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 22 }}>{p.blurb}</div>
                <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "#D8DAE0" }}>
                      <Check size={15} color="#C9A227" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "12px", borderRadius: 2, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: p.featured ? "#C9A227" : "transparent",
                  color: p.featured ? "#12151C" : "#F4EFE4",
                  border: `1px solid ${p.featured ? "#C9A227" : "#3A3F4B"}`
                }}>
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: "30px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#6B7280", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Building2 size={14} /> Podium — recognition, framed</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={13} color="#C9A227" /> Prototype build</div>
      </footer>
    </div>
  );
}
