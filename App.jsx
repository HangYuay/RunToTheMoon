import { useState, useEffect, useRef } from "react";

/* ── DATA ── */
const EVENTS = [
  { id:"e1",  name:"Bangkok Marathon 2026",                  date:"2026-01-18", location:"กรุงเทพมหานคร",                      distances:["FM","HM","10K","5K"], type:"road" },
  { id:"e2",  name:"Chiangmai Marathon 2026",                date:"2026-01-25", location:"เชียงใหม่",                           distances:["FM","HM","10K"],      type:"road" },
  { id:"e3",  name:"ซาเลเซียน มินิมาราธอน 2026",             date:"2026-03-01", location:"หัวหิน, ประจวบคีรีขันธ์",             distances:["10K","5K","3K"],      type:"road" },
  { id:"e4",  name:"Bangkok Vertical Run 2026",              date:"2026-03-07", location:"วัน แบงค็อก ทาวเวอร์ 4",             distances:["50 ชั้น"],           type:"special" },
  { id:"e5",  name:"Kapong Trail PhangNga #4",               date:"2026-04-12", location:"กะปง, พังงา",                         distances:["Trail"],              type:"trail" },
  { id:"e6",  name:"Supersports 10 Mile Run 2026",           date:"2026-05-24", location:"การท่าเรือฯ, กรุงเทพฯ",              distances:["16K","10K","5K"],     type:"road" },
  { id:"e7",  name:"GI TRAIL RUNNING 2026 ระยอง",           date:"2026-05-23", location:"เขานางหย่อง, ระยอง",                 distances:["Trail","10K"],        type:"trail" },
  { id:"e8",  name:"VISAKHA DAY RUN ร้อยเอ็ด",             date:"2026-05-31", location:"วัดสระพังทอง, ร้อยเอ็ด",             distances:["10K","5K"],           type:"road" },
  { id:"e9",  name:"เพชรบุรีฮาล์ฟมาราธอน 2026",             date:"2026-06-27", location:"หาดเจ้าสำราญ, เพชรบุรี",             distances:["HM","10K","5K"],      type:"road" },
  { id:"e10", name:"ก้าวท้าใจ 10K Championship 2026",       date:"2026-06-21", location:"ลานคนเมือง, กรุงเทพฯ",               distances:["10K"],                type:"road" },
  { id:"e11", name:"Kamphaeng Phet Marathon 2026",           date:"2026-07-05", location:"อุทยานประวัติศาสตร์กำแพงเพชร",      distances:["FM","HM","10K"],      type:"road" },
  { id:"e12", name:"12 สิงหา ฮาล์ฟมาราธอน กรุงเทพฯ",        date:"2026-08-16", location:"ศูนย์ประชุมแห่งชาติสิริกิติ์",      distances:["HM","10K","5K"],      type:"road" },
  { id:"e13", name:"Lower North Trail Series สนาม 2",        date:"2026-09-13", location:"อุทยานฯ แม่วงก์, นครสวรรค์",         distances:["Trail"],              type:"trail" },
  { id:"e14", name:"คลองเพกา เทรล 2026",                    date:"2026-10-18", location:"ปราจีนบุรี",                          distances:["Trail","10K","5K"],   type:"trail" },
  { id:"e15", name:"ระยองฟรุ๊ตฟาร์มรัน 2569",               date:"2026-06-14", location:"ระยอง",                               distances:["HM","10K","Fun Run"], type:"road" },
  { id:"e16", name:"สามร้อยยอด รัน ฟัน เฟส 2026",           date:"2026-05-25", location:"คีรีวง, นครศรีธรรมราช",              distances:["10K","5K","Fun Run"], type:"road" },
  { id:"e17", name:"น้ำหนาวจีโอพาร์คเทรล 2026",             date:"2026-11-08", location:"เพชรบูรณ์",                           distances:["Trail","10K"],        type:"trail" },
  { id:"e18", name:"เดิน-วิ่งการกุศล ราชภัฏเลย 2026",       date:"2026-11-08", location:"มหาวิทยาลัยราชภัฏเลย",               distances:["10K","5K","3K"],      type:"road" },
];

const DIST_OPTS = ["FM (42.195K)","HM (21.1K)","30K","25K","21K","15K","10K","5K","3K","Trail","Fun Run","อื่นๆ"];
const distKm = s => ({"FM (42.195K)":42.195,"HM (21.1K)":21.1,"30K":30,"25K":25,"21K":21,"15K":15,"10K":10,"5K":5,"3K":3}[s]||null);
const EMPTY_RUN  = {eventId:"",customEvent:"",date:"",distance:"",customKm:"",time:"",bib:"",position:"",notes:"",medal:false,cert:false};
const EMPTY_PROF = {firstName:"",lastName:"",email:"",phone:"",dob:"",gender:"",weight:"",height:"",photo:""};

/* ── UTILS ── */
const fmtDate = d => d ? new Date(d).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"}) : "—";
const fmtPace = (t,km) => {
  if(!t||!km) return "—";
  const p=t.split(":").map(Number);
  let s=p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:0;
  if(!s) return "—";
  const ps=s/km; return `${Math.floor(ps/60)}:${String(Math.round(ps%60)).padStart(2,"0")} /กม.`;
};
const calcBMI = (w,h) => {
  const wn=parseFloat(w),hn=parseFloat(h)/100;
  if(!wn||!hn) return null;
  const v=wn/(hn*hn);
  const [label,color]=v<18.5?["ต่ำกว่าเกณฑ์","#3b82f6"]:v<25?["ปกติ","#22c55e"]:v<30?["น้ำหนักเกิน","#f59e0b"]:["อ้วน","#ef4444"];
  return {v:v.toFixed(1),label,color};
};
const calcAge = dob => dob?Math.floor((Date.now()-new Date(dob))/(1000*60*60*24*365.25)):null;

/* ── DESIGN TOKENS ── */
const glass = "rgba(255,255,255,0.82)";
const glassBorder = "rgba(255,255,255,0.6)";
const glassDark = "rgba(255,255,255,0.55)";
const accent = "#ff6b35";
const accentSoft = "rgba(255,107,53,0.12)";
const textPrimary = "#1a1a2e";
const textSub = "#4a4a6a";
const textMuted = "#8888aa";
const borderColor = "rgba(180,180,220,0.3)";
const green = "#16a34a", amber = "#d97706", blue = "#2563eb";
const typeTheme = {
  road:    {color:green, bg:"rgba(22,163,74,0.12)",   label:"Road"},
  trail:   {color:amber, bg:"rgba(217,119,6,0.12)",   label:"Trail"},
  special: {color:blue,  bg:"rgba(37,99,235,0.12)",   label:"Special"},
};

/* ── ANIME SVG BACKGROUND ── */
const AnimeBg = () => (
  <svg viewBox="0 0 520 900" xmlns="http://www.w3.org/2000/svg"
    style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,objectFit:"cover",pointerEvents:"none"}}>

    {/* Sky gradient */}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fce4d6"/>
        <stop offset="45%" stopColor="#ffd6e7"/>
        <stop offset="100%" stopColor="#e8d5f5"/>
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe066"/>
        <stop offset="100%" stopColor="#ffb347"/>
      </linearGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8f5e9"/>
        <stop offset="100%" stopColor="#c8e6c9"/>
      </linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b0bec5"/>
        <stop offset="100%" stopColor="#90a4ae"/>
      </linearGradient>
      <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9575cd"/>
        <stop offset="100%" stopColor="#7e57c2"/>
      </linearGradient>
      <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ce93d8"/>
        <stop offset="100%" stopColor="#ba68c8"/>
      </linearGradient>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff8a65"/>
        <stop offset="100%" stopColor="#ff7043"/>
      </linearGradient>
      <filter id="blur1">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
    </defs>

    {/* Sky */}
    <rect width="520" height="900" fill="url(#sky)"/>

    {/* Sun */}
    <circle cx="400" cy="140" r="55" fill="url(#sun)" opacity="0.85"/>
    {/* Sun rays */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
      <line key={a}
        x1={400+Math.cos(a*Math.PI/180)*60} y1={140+Math.sin(a*Math.PI/180)*60}
        x2={400+Math.cos(a*Math.PI/180)*80} y2={140+Math.sin(a*Math.PI/180)*80}
        stroke="#ffe066" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    ))}

    {/* Clouds */}
    {[[60,80,0.9],[150,60,0.7],[320,50,0.8],[420,90,0.65],[60,160,0.5],[280,130,0.6]].map(([cx,cy,op],i)=>(
      <g key={i} opacity={op} filter="url(#blur1)">
        <ellipse cx={cx} cy={cy} rx={38} ry={16} fill="white"/>
        <ellipse cx={cx-18} cy={cy+4} rx={22} ry={13} fill="white"/>
        <ellipse cx={cx+18} cy={cy+4} rx={22} ry={13} fill="white"/>
        <ellipse cx={cx} cy={cy+6} rx={30} ry={12} fill="white"/>
      </g>
    ))}

    {/* Far mountains */}
    <polygon points="0,520 90,360 180,430 280,340 380,420 480,330 520,390 520,520" fill="url(#mt1)" opacity="0.55"/>
    {/* Near mountains */}
    <polygon points="0,570 130,400 250,480 360,395 480,465 520,440 520,570" fill="url(#mt2)" opacity="0.65"/>

    {/* Mountain snow caps */}
    <polygon points="90,360 75,390 105,390" fill="white" opacity="0.7"/>
    <polygon points="280,340 265,375 295,375" fill="white" opacity="0.65"/>
    <polygon points="480,330 465,365 495,365" fill="white" opacity="0.7"/>

    {/* Ground */}
    <rect x="0" y="555" width="520" height="345" fill="url(#ground)"/>

    {/* Road */}
    <polygon points="80,900 150,570 370,570 440,900" fill="url(#road)" opacity="0.9"/>
    {/* Road dashes */}
    {[620,670,720,770,820].map((y,i)=>(
      <rect key={i} x="252" y={y} width="16" height="28" rx="2" fill="white" opacity="0.7"/>
    ))}

    {/* Trees left */}
    {[[30,540],[55,520],[20,560]].map(([x,y],i)=>(
      <g key={i}>
        <polygon points={`${x},${y} ${x-18},${y+40} ${x+18},${y+40}`} fill="#388e3c" opacity="0.8"/>
        <polygon points={`${x},${y+20} ${x-14},${y+52} ${x+14},${y+52}`} fill="#43a047" opacity="0.85"/>
        <rect x={x-4} y={y+50} width="8" height="18" rx="2" fill="#5d4037" opacity="0.8"/>
      </g>
    ))}

    {/* Trees right */}
    {[[470,535],[495,515],[455,558]].map(([x,y],i)=>(
      <g key={i}>
        <polygon points={`${x},${y} ${x-18},${y+40} ${x+18},${y+40}`} fill="#2e7d32" opacity="0.8"/>
        <polygon points={`${x},${y+20} ${x-14},${y+52} ${x+14},${y+52}`} fill="#388e3c" opacity="0.85"/>
        <rect x={x-4} y={y+50} width="8" height="18" rx="2" fill="#5d4037" opacity="0.8"/>
      </g>
    ))}

    {/* Anime runner girl — centered */}
    <g transform="translate(210, 560)">
      {/* Shadow */}
      <ellipse cx="50" cy="195" rx="38" ry="8" fill="rgba(0,0,0,0.12)"/>

      {/* Back leg (trailing) */}
      <g transform="rotate(-18,50,120)">
        <rect x="42" y="118" width="14" height="52" rx="7" fill="#f8bbd0"/>
        {/* Shoe */}
        <ellipse cx="44" cy="172" rx="12" ry="6" fill="#e91e63" transform="rotate(25,44,172)"/>
      </g>

      {/* Body / jacket */}
      <rect x="26" y="70" width="48" height="58" rx="14" fill="url(#body)"/>
      {/* White stripe */}
      <rect x="46" y="70" width="8" height="58" rx="4" fill="rgba(255,255,255,0.5)"/>
      {/* Race bib */}
      <rect x="32" y="84" width="36" height="26" rx="4" fill="white" opacity="0.9"/>
      <rect x="36" y="88" width="28" height="5" rx="2" fill="#ff6b35" opacity="0.8"/>
      <rect x="36" y="96" width="20" height="4" rx="2" fill="#aaa" opacity="0.6"/>
      <rect x="36" y="103" width="16" height="3" rx="1.5" fill="#aaa" opacity="0.5"/>

      {/* Front arm (pumping forward) */}
      <g transform="rotate(-40,50,80)">
        <rect x="16" y="76" width="13" height="42" rx="6" fill="#ff8a65"/>
        <circle cx="22" cy="120" r="7" fill="#ffcc80"/>
      </g>

      {/* Back arm */}
      <g transform="rotate(30,50,80)">
        <rect x="71" y="78" width="13" height="38" rx="6" fill="#ff8a65"/>
        <circle cx="77" cy="118" r="7" fill="#ffcc80"/>
      </g>

      {/* Front leg (striding forward) */}
      <g transform="rotate(22,50,120)">
        <rect x="40" y="118" width="14" height="54" rx="7" fill="#f8bbd0"/>
        {/* Knee highlight */}
        <circle cx="47" cy="145" r="6" fill="#fce4ec" opacity="0.6"/>
        {/* Shoe */}
        <ellipse cx="56" cy="174" rx="14" ry="6" fill="#e91e63" transform="rotate(-15,56,174)"/>
        <rect x="44" y="168" width="24" height="8" rx="4" fill="#c2185b" opacity="0.8"/>
      </g>

      {/* Shorts */}
      <rect x="30" y="120" width="40" height="22" rx="6" fill="#7c4dff"/>

      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="#ffcc80"/>

      {/* Hair — flowing back */}
      <path d="M24,32 Q10,20 14,50 Q18,65 28,68 Q20,55 26,40 Q30,30 24,32" fill="#3e2723"/>
      <path d="M50,18 Q30,10 24,30 Q24,20 40,16 Q50,14 60,18 Q74,22 76,40 Q72,30 62,22 Q56,18 50,18" fill="#4e342e"/>
      <path d="M76,40 Q80,60 70,72 Q76,58 74,44 Q76,40 76,40" fill="#3e2723"/>
      {/* Ponytail flowing back */}
      <path d="M70,38 Q100,30 115,50 Q120,60 108,65 Q95,68 85,58 Q78,50 70,42" fill="#4e342e"/>
      <path d="M108,65 Q120,72 118,82 Q110,78 100,72 Q108,70 108,65" fill="#3e2723"/>

      {/* Face */}
      {/* Eyes (big anime style) */}
      <ellipse cx="42" cy="46" rx="6" ry="7" fill="white"/>
      <ellipse cx="58" cy="46" rx="6" ry="7" fill="white"/>
      <ellipse cx="43" cy="47" rx="4.5" ry="5.5" fill="#5c3d11"/>
      <ellipse cx="59" cy="47" rx="4.5" ry="5.5" fill="#5c3d11"/>
      <circle cx="43" cy="47" r="3" fill="#1a0a00"/>
      <circle cx="59" cy="47" r="3" fill="#1a0a00"/>
      <circle cx="44.5" cy="45" r="1.5" fill="white"/>
      <circle cx="60.5" cy="45" r="1.5" fill="white"/>
      {/* Eyelashes */}
      <path d="M36,42 Q38,39 42,41" fill="none" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M64,42 Q62,39 58,41" fill="none" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eyebrows */}
      <path d="M37,38 Q42,35 47,38" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round"/>
      <path d="M53,38 Q58,35 63,38" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round"/>
      {/* Nose */}
      <circle cx="50" cy="53" r="1.5" fill="#e0a060" opacity="0.7"/>
      {/* Smile */}
      <path d="M44,59 Q50,64 56,59" fill="none" stroke="#c27840" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="37" cy="56" rx="6" ry="3.5" fill="#ff8a80" opacity="0.35"/>
      <ellipse cx="63" cy="56" rx="6" ry="3.5" fill="#ff8a80" opacity="0.35"/>

      {/* Headband */}
      <path d="M25,34 Q50,28 75,34" fill="none" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round"/>

      {/* Speed lines */}
      {[[-10,80],[-18,100],[-14,118],[-8,135],[-20,95]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={x-28-i*4} y2={y+1} stroke="rgba(255,107,53,0.35)" strokeWidth={2-i*0.25} strokeLinecap="round"/>
      ))}
    </g>

    {/* Petal particles drifting */}
    {[[80,300,12],[160,200,9],[420,250,10],[350,180,8],[50,400,11],[480,320,9],[260,160,7]].map(([cx,cy,r],i)=>(
      <g key={i} opacity="0.55">
        <ellipse cx={cx} cy={cy} rx={r/2} ry={r} fill="#ffb7c5" transform={`rotate(${i*37},${cx},${cy})`}/>
      </g>
    ))}

    {/* Subtle vignette */}
    <rect width="520" height="900" fill="rgba(255,240,255,0.18)"/>
  </svg>
);

/* ── AVATAR ── */
function Avatar({p, size=40}) {
  if(p.photo) return <img src={p.photo} alt="" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.8)",flexShrink:0}}/>;
  const init=((p.firstName||"R")[0]+(p.lastName||"")[0]||"").toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${accent},#ff9a6c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:"#fff",flexShrink:0,fontFamily:"'Prompt',sans-serif"}}>{init}</div>;
}

/* ── RING ── */
function Ring({pct=0,color,size=56,label,value}) {
  const r=20,c=2*Math.PI*r,dash=Math.min(pct,100)/100*c;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="5"/>
          <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${c-dash}`} strokeDashoffset={c*.25} strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color,fontFamily:"'Prompt',sans-serif"}}>{value}</div>
      </div>
      <div style={{fontSize:10,color:textSub,fontWeight:600,textAlign:"center",lineHeight:1.3,fontFamily:"'Prompt',sans-serif"}}>{label}</div>
    </div>
  );
}

/* ── STAT CARD ── */
function Stat({icon,label,value,unit,color}) {
  return (
    <div style={{background:glass,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:`1px solid ${glassBorder}`,borderRadius:16,padding:"14px 10px",display:"flex",flexDirection:"column",gap:2,boxShadow:"0 2px 16px rgba(180,120,220,0.10)"}}>
      <div style={{fontSize:26,lineHeight:1,marginBottom:2}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:700,color:color||accent,lineHeight:1.1,fontFamily:"'Prompt',sans-serif"}}>{value}</div>
      <div style={{fontSize:10,color:textSub,fontWeight:500,lineHeight:1.3}}>{label}</div>
      <div style={{fontSize:9,color:textMuted}}>{unit}</div>
    </div>
  );
}

/* ── CHIP ── */
const Chip = ({color,bg,children}) => (
  <span style={{display:"inline-flex",alignItems:"center",fontSize:10,fontWeight:600,color,background:bg,borderRadius:20,padding:"2px 8px",letterSpacing:0.2,fontFamily:"'Prompt',sans-serif"}}>{children}</span>
);

/* ── GLASS CARD ── */
const GCard = ({style,children,...rest}) => (
  <div style={{background:glass,backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",border:`1px solid ${glassBorder}`,borderRadius:18,boxShadow:"0 2px 20px rgba(180,120,220,0.08)",...style}} {...rest}>{children}</div>
);

/* ── LABEL ── */
const Lbl = ({children}) => (
  <div style={{fontSize:10,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",color:textMuted,marginBottom:5,fontFamily:"'Prompt',sans-serif"}}>{children}</div>
);

/* ── INPUTS ── */
const inputSt = {display:"block",width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.7)",backdropFilter:"blur(8px)",border:`1px solid ${borderColor}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:textPrimary,fontFamily:"'Prompt',sans-serif",outline:"none",marginBottom:11};

/* ── MAIN APP ── */
export default function App() {
  const [runs,   setRuns]   = useState([]);
  const [prof,   setProf]   = useState(EMPTY_PROF);
  const [runForm,setRunForm] = useState(EMPTY_RUN);
  const [proForm,setProForm] = useState(EMPTY_PROF);
  const [page,   setPage]   = useState("dashboard");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [aiTxt,  setAiTxt]  = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [toast,  setToast]  = useState("");
  const [menuOpen,setMenuOpen] = useState(false);
  const fileRef = useRef();

  useEffect(()=>{
    (async()=>{
      try{const r=await window.storage.get("runs_v5");if(r)setRuns(JSON.parse(r.value));}catch{}
      try{const p=await window.storage.get("prof_v4");if(p){const d=JSON.parse(p.value);setProf(d);setProForm(d);}}catch{}
    })();
  },[]);

  const saveRuns=d=>window.storage.set("runs_v5",JSON.stringify(d)).catch(()=>{});
  const saveProf=d=>window.storage.set("prof_v4",JSON.stringify(d)).catch(()=>{});
  const pop=msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};

  const totalKm=runs.reduce((s,r)=>s+(r.distKm||0),0);
  const fmC=runs.filter(r=>r.distance==="FM (42.195K)").length;
  const hmC=runs.filter(r=>r.distance==="HM (21.1K)").length;
  const trC=runs.filter(r=>r.distance==="Trail").length;
  const medC=runs.filter(r=>r.medal).length;
  const bmi=calcBMI(prof.weight,prof.height);
  const age=calcAge(prof.dob);
  const hasProf=prof.firstName||prof.email;
  const selEv=EVENTS.find(e=>e.id===runForm.eventId);

  const filtRuns=filter==="all"?runs:runs.filter(r=>{
    const ev=EVENTS.find(e=>e.id===r.eventId);
    return filter==="custom"?!r.eventId:ev?.type===filter;
  });

  const submitRun=()=>{
    if(!runForm.date||!runForm.distance||(!runForm.eventId&&!runForm.customEvent)){pop("กรุณากรอกข้อมูลให้ครบ");return;}
    const km=distKm(runForm.distance)||parseFloat(runForm.customKm)||null;
    const entry={id:editId||`r${Date.now()}`,...runForm,distKm:km,
      pace:fmtPace(runForm.time,km),eventName:selEv?.name||runForm.customEvent,location:selEv?.location||"",
      createdAt:editId?(runs.find(r=>r.id===editId)?.createdAt||Date.now()):Date.now()};
    const upd=editId?runs.map(r=>r.id===editId?entry:r):[entry,...runs];
    setRuns(upd);saveRuns(upd);setRunForm(EMPTY_RUN);setEditId(null);setPage("history");
    pop(editId?"✓ แก้ไขข้อมูลแล้ว":"✓ บันทึกการวิ่งแล้ว");
  };
  const delRun=id=>{const u=runs.filter(r=>r.id!==id);setRuns(u);saveRuns(u);pop("ลบรายการแล้ว");};
  const editRun=r=>{setRunForm({...r});setEditId(r.id);setPage("run");};
  const saveProfFn=()=>{setProf({...proForm});saveProf({...proForm});setPage("dashboard");pop("✓ บันทึกข้อมูลนักวิ่งแล้ว");};
  const onPhoto=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>setProForm(p=>({...p,photo:ev.target.result}));rd.readAsDataURL(f);};

  const fetchAI=async()=>{
    if(!runs.length){pop("ยังไม่มีข้อมูลการวิ่ง");return;}
    setAiLoad(true);setShowAI(true);setAiTxt("");
    try{
      const sum=runs.map(r=>`${r.date}: ${r.eventName} (${r.distance}${r.time?", "+r.time:""}${r.pace&&r.pace!=="—"?", pace "+r.pace:""})`).join("\n");
      const pi=prof.firstName?`นักวิ่ง: ${prof.firstName} ${prof.lastName}${prof.weight?", "+prof.weight+"kg":""}${prof.height?", "+prof.height+"cm":""}`:""
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,
          messages:[{role:"user",content:`คุณเป็นโค้ชวิ่งชาวไทย ${pi}\nวิเคราะห์การวิ่งเป็นภาษาไทย กระชับ ใช้ emoji:\n\n${sum}\n\nสรุปพัฒนาการ จุดแข็ง คำแนะนำ`}]})});
      const d=await res.json();
      setAiTxt(d.content?.map(c=>c.text||"").join("")||"ไม่สามารถวิเคราะห์ได้");
    }catch{setAiTxt("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");}
    setAiLoad(false);
  };

  const upcoming=EVENTS.filter(e=>new Date(e.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const f = {fontFamily:"'Prompt',sans-serif"};

  /* NAV ITEMS */
  const navItems=[
    ["dashboard","🏠","หน้าหลัก"],
    ["run","✏️","บันทึก"],
    ["history","📋","ประวัติ"],
    ["events","📅","ปฏิทิน"],
    ["profile","👤","โปรไฟล์"],
  ];

  return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",...f}}>
      <AnimeBg/>

      {/* Full overlay for glassmorphism depth */}
      <div style={{position:"fixed",inset:0,background:"rgba(255,240,248,0.15)",zIndex:1,pointerEvents:"none"}}/>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,
          background:glass,backdropFilter:"blur(20px)",border:`1px solid ${glassBorder}`,
          borderRadius:14,padding:"10px 22px",fontSize:13,color:textPrimary,fontWeight:600,
          boxShadow:"0 4px 24px rgba(180,120,220,0.2)",whiteSpace:"nowrap",...f}}>
          {toast}
        </div>
      )}

      <div style={{maxWidth:520,margin:"0 auto",padding:"0 0 90px",position:"relative",zIndex:2}}
        onClick={()=>setMenuOpen(false)}>

        {/* ── TOPBAR ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 18px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("dashboard")}>
            <div style={{width:42,height:42,borderRadius:14,background:`linear-gradient(135deg,${accent},#ff9a6c)`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
              boxShadow:`0 4px 16px rgba(255,107,53,0.35)`}}>
              🏃
            </div>
            <div>
              <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.5,color:textPrimary,lineHeight:1}}>
                RunLog <span style={{color:accent}}>TH</span>
              </div>
              <div style={{fontSize:9,color:textMuted,letterSpacing:1.8,textTransform:"uppercase",marginTop:1}}>ปี 2569 · Thailand</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* + dropdown */}
            <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setMenuOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:12,border:"none",
                  background:`linear-gradient(135deg,${accent},#ff8c5a)`,color:"#fff",
                  fontSize:12,fontWeight:700,cursor:"pointer",...f,
                  boxShadow:`0 4px 16px rgba(255,107,53,0.4)`,letterSpacing:.2}}>
                <span style={{fontSize:16,lineHeight:1}}>＋</span> บันทึกการวิ่ง
              </button>
              {menuOpen&&(
                <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,
                  background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",
                  border:`1px solid ${glassBorder}`,borderRadius:16,
                  padding:8,zIndex:200,minWidth:192,boxShadow:"0 12px 40px rgba(180,120,220,0.2)"}}>
                  {[["run","✏️","บันทึกการวิ่งใหม่"],["history","📋","ประวัติการวิ่ง"],["events","📅","ปฏิทินงานวิ่ง"]].map(([v,ic,lb])=>(
                    <button key={v} onClick={()=>{setPage(v);setMenuOpen(false);}}
                      style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 13px",borderRadius:10,border:"none",
                        background:page===v?accentSoft:"transparent",color:page===v?accent:textPrimary,
                        fontSize:13,textAlign:"left",cursor:"pointer",...f,fontWeight:page===v?700:400}}>
                      <span style={{fontSize:18}}>{ic}</span>{lb}
                    </button>
                  ))}
                  <div style={{height:1,background:borderColor,margin:"4px 0"}}/>
                  <button onClick={()=>{setPage("profile");setMenuOpen(false);}}
                    style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 13px",borderRadius:10,border:"none",
                      background:page==="profile"?accentSoft:"transparent",color:page==="profile"?accent:textSub,
                      fontSize:13,textAlign:"left",cursor:"pointer",...f}}>
                    <span style={{fontSize:18}}>👤</span>ข้อมูลนักวิ่ง
                  </button>
                </div>
              )}
            </div>
            <button onClick={()=>setPage("profile")} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
              <Avatar p={prof} size={40}/>
            </button>
          </div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,
          background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",
          borderTop:`1px solid ${glassBorder}`,zIndex:100,display:"flex",padding:"6px 8px 10px"}}>
          {navItems.map(([v,ic,lb])=>(
            <button key={v} onClick={()=>setPage(v)}
              style={{flex:1,padding:"6px 2px 2px",borderRadius:12,border:"none",cursor:"pointer",
                background:page===v?accentSoft:"transparent",color:page===v?accent:textMuted,
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,...f,
                transition:"all .15s"}}>
              <span style={{fontSize:22,lineHeight:1}}>{ic}</span>
              <span style={{fontSize:9,fontWeight:page===v?700:500,letterSpacing:.3}}>{lb}</span>
            </button>
          ))}
        </div>

        {/* divider */}
        <div style={{height:1,background:borderColor,margin:"14px 18px 0",opacity:.5}}/>

        {/* ════════════ DASHBOARD ════════════ */}
        {page==="dashboard"&&(
          <div style={{padding:"14px 18px 0"}}>

            {/* Hero profile card */}
            <GCard style={{padding:"18px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
              onClick={()=>setPage("profile")}>
              <Avatar p={prof} size={62}/>
              <div style={{flex:1,minWidth:0}}>
                {hasProf?(
                  <>
                    <div style={{fontSize:19,fontWeight:700,color:textPrimary,letterSpacing:-0.3,lineHeight:1.2}}>
                      {prof.firstName} <span style={{color:accent}}>{prof.lastName}</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6,alignItems:"center"}}>
                      {age&&<Chip color={blue} bg="rgba(37,99,235,0.1)">{age} ปี</Chip>}
                      {prof.gender&&<Chip color={textSub} bg="rgba(100,100,150,0.1)">{prof.gender==="male"?"♂ ชาย":"♀ หญิง"}</Chip>}
                      {bmi&&<Chip color={bmi.color} bg={bmi.color+"18"}>BMI {bmi.v} · {bmi.label}</Chip>}
                    </div>
                    {prof.email&&<div style={{fontSize:11,color:textMuted,marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>✉ {prof.email}</div>}
                  </>
                ):(
                  <>
                    <div style={{fontSize:15,fontWeight:700,color:textPrimary}}>สวัสดี นักวิ่ง! 👋</div>
                    <div style={{fontSize:12,color:textMuted,marginTop:4}}>แตะเพื่อกรอกข้อมูลของคุณ →</div>
                  </>
                )}
              </div>
              {bmi&&prof.weight&&(
                <div style={{textAlign:"center",background:bmi.color+"15",borderRadius:12,padding:"10px 12px",minWidth:50}}>
                  <div style={{fontSize:20,fontWeight:700,color:bmi.color,lineHeight:1}}>{bmi.v}</div>
                  <div style={{fontSize:8,color:bmi.color,fontWeight:600,marginTop:2,letterSpacing:.5}}>BMI</div>
                </div>
              )}
            </GCard>

            {/* Stats 4-col */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
              <Stat icon="🏃" label="วิ่งทั้งหมด" value={runs.length} unit="ครั้ง"/>
              <Stat icon="📍" label="ระยะรวม" value={totalKm>=1000?(totalKm/1000).toFixed(1)+"K":Math.round(totalKm)} unit="กม." color={blue}/>
              <Stat icon="🥇" label="เหรียญ" value={medC} unit="เหรียญ" color={amber}/>
              <Stat icon="🌲" label="เทรล" value={trC} unit="ครั้ง" color={green}/>
            </div>

            {/* Body stats */}
            {(prof.weight||prof.height)&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                {[
                  prof.weight&&{icon:"⚖️",lb:"น้ำหนัก",val:prof.weight,unit:"kg",c:blue},
                  prof.height&&{icon:"📏",lb:"ส่วนสูง",val:prof.height,unit:"cm",c:textSub},
                  bmi&&{icon:"💊",lb:`BMI · ${bmi.label}`,val:bmi.v,unit:"",c:bmi.color},
                ].filter(Boolean).map((s,i)=>(
                  <GCard key={i} style={{padding:"12px 10px",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{s.icon}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.c,lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:9,color:textSub,marginTop:3,fontWeight:500,lineHeight:1.3}}>{s.lb}<br/>{s.unit&&<span style={{opacity:.7}}>{s.unit}</span>}</div>
                  </GCard>
                ))}
              </div>
            )}

            {/* Breakdown rings */}
            {runs.length>0&&(
              <GCard style={{padding:"14px 18px",marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:1.4,textTransform:"uppercase",color:textMuted,marginBottom:12}}>สัดส่วนการวิ่ง</div>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  {[{l:"Road",v:runs.length-trC,c:green},{l:"Trail",v:trC,c:amber},{l:"Marathon",v:fmC,c:accent},{l:"Half",v:hmC,c:blue}].map(s=>(
                    <Ring key={s.l} pct={runs.length?s.v/runs.length*100:0} color={s.c} label={s.l} value={s.v}/>
                  ))}
                </div>
              </GCard>
            )}

            {/* Recent runs */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:1.4,textTransform:"uppercase",color:textMuted}}>รายการล่าสุด</div>
              <button onClick={()=>setPage("history")} style={{background:"none",border:"none",color:accent,fontSize:12,fontWeight:700,cursor:"pointer",...f}}>ดูทั้งหมด →</button>
            </div>

            {runs.length===0?(
              <GCard style={{padding:"28px 20px",textAlign:"center",marginBottom:12,border:`1.5px dashed ${borderColor}`}}>
                <div style={{fontSize:36,marginBottom:8}}>🏃‍♀️</div>
                <div style={{fontSize:14,fontWeight:600,color:textPrimary}}>ยังไม่มีข้อมูลการวิ่ง</div>
                <div style={{fontSize:12,color:textMuted,marginTop:4}}>กด <b style={{color:accent}}>+ บันทึกการวิ่ง</b> เพื่อเริ่มต้น</div>
              </GCard>
            ):runs.slice(0,3).map(r=>{
              const ev=EVENTS.find(e=>e.id===r.eventId);
              const tt=ev?typeTheme[ev.type]:null;
              return(
                <GCard key={r.id} style={{padding:"12px 15px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                  onClick={()=>editRun(r)}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:textPrimary,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.eventName}</div>
                    <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                      {tt&&<Chip color={tt.color} bg={tt.bg}>{tt.label}</Chip>}
                      <span style={{fontSize:10,color:textMuted}}>{fmtDate(r.date)}</span>
                      <span style={{fontSize:10,color:textMuted}}>· {r.distance}</span>
                      {r.medal&&<span style={{fontSize:13}}>🥇</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",minWidth:68,marginLeft:10}}>
                    <div style={{fontSize:15,fontWeight:700,color:accent}}>{r.time||"—"}</div>
                    <div style={{fontSize:10,color:textMuted,marginTop:1}}>{r.pace}</div>
                  </div>
                </GCard>
              );
            })}

            {/* Upcoming */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14,marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:1.4,textTransform:"uppercase",color:textMuted}}>งานวิ่งที่กำลังจะมา</div>
              <button onClick={()=>setPage("events")} style={{background:"none",border:"none",color:accent,fontSize:12,fontWeight:700,cursor:"pointer",...f}}>ดูทั้งหมด →</button>
            </div>
            {upcoming.slice(0,3).map(e=>{
              const tt=typeTheme[e.type];
              return(
                <GCard key={e.id} style={{padding:"11px 15px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:textPrimary,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <Chip color={tt.color} bg={tt.bg}>{tt.label}</Chip>
                      <span style={{fontSize:10,color:textMuted}}>📍 {e.location}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",minWidth:72,marginLeft:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:accent}}>{fmtDate(e.date)}</div>
                  </div>
                </GCard>
              );
            })}

            {/* AI Coach */}
            <div style={{marginTop:14}}>
              <button onClick={fetchAI} style={{width:"100%",padding:"13px",borderRadius:14,
                border:`1px solid rgba(167,139,250,0.35)`,background:"rgba(245,243,255,0.7)",backdropFilter:"blur(12px)",
                cursor:"pointer",...f,fontSize:13,fontWeight:700,color:"#7c3aed",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                boxShadow:"0 2px 16px rgba(167,139,250,0.15)"}}>
                <span style={{fontSize:20}}>✨</span> วิเคราะห์การวิ่งด้วย AI Coach
              </button>
            </div>
            {showAI&&(
              <GCard style={{marginTop:10,padding:"14px 16px",marginBottom:4,border:"1px solid rgba(167,139,250,0.25)"}}>
                <div style={{fontSize:10,color:"#7c3aed",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>✨ AI Coach</div>
                {aiLoad?<div style={{color:textMuted,fontSize:13}}>กำลังวิเคราะห์...</div>
                  :<div style={{fontSize:13,lineHeight:1.9,color:textSub,whiteSpace:"pre-wrap"}}>{aiTxt}</div>}
              </GCard>
            )}
          </div>
        )}

        {/* ════════════ PROFILE ════════════ */}
        {page==="profile"&&(
          <div style={{padding:"16px 18px 0"}}>
            <div style={{fontSize:16,fontWeight:700,color:textPrimary,marginBottom:16}}>👤 ข้อมูลนักวิ่ง</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{position:"relative"}}>
                <Avatar p={proForm} size={90}/>
                <button onClick={()=>fileRef.current.click()}
                  style={{position:"absolute",bottom:2,right:2,width:28,height:28,borderRadius:"50%",
                    background:accent,border:"2px solid white",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:`0 2px 8px ${accent}55`}}>📷</button>
              </div>
              <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={onPhoto}/>
              <div style={{fontSize:11,color:textMuted}}>แตะกล้องเพื่อเปลี่ยนรูปภาพ</div>
            </div>

            <GCard style={{padding:"16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>ชื่อ</Lbl><input value={proForm.firstName} onChange={e=>setProForm(p=>({...p,firstName:e.target.value}))} placeholder="ชื่อ" style={inputSt}/></div>
                <div><Lbl>นามสกุล</Lbl><input value={proForm.lastName} onChange={e=>setProForm(p=>({...p,lastName:e.target.value}))} placeholder="นามสกุล" style={inputSt}/></div>
              </div>
              <Lbl>อีเมล์</Lbl>
              <input type="email" value={proForm.email} onChange={e=>setProForm(p=>({...p,email:e.target.value}))} placeholder="example@email.com" style={inputSt}/>
              <Lbl>เบอร์โทรศัพท์</Lbl>
              <input type="tel" value={proForm.phone||""} onChange={e=>setProForm(p=>({...p,phone:e.target.value}))} placeholder="08x-xxx-xxxx" style={inputSt}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>วันเกิด</Lbl><input type="date" value={proForm.dob||""} onChange={e=>setProForm(p=>({...p,dob:e.target.value}))} style={inputSt}/></div>
                <div>
                  <Lbl>เพศ</Lbl>
                  <select value={proForm.gender||""} onChange={e=>setProForm(p=>({...p,gender:e.target.value}))} style={{...inputSt,cursor:"pointer"}}>
                    <option value="">— เลือก —</option>
                    <option value="male">♂ ชาย</option>
                    <option value="female">♀ หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>น้ำหนัก (kg)</Lbl><input type="number" value={proForm.weight} onChange={e=>setProForm(p=>({...p,weight:e.target.value}))} placeholder="เช่น 65" style={inputSt}/></div>
                <div><Lbl>ส่วนสูง (cm)</Lbl><input type="number" value={proForm.height} onChange={e=>setProForm(p=>({...p,height:e.target.value}))} placeholder="เช่น 170" style={inputSt}/></div>
              </div>
              {(()=>{const b=calcBMI(proForm.weight,proForm.height);return b&&(
                <div style={{background:b.color+"12",border:`1px solid ${b.color}30`,borderRadius:12,padding:"12px 14px",marginBottom:11,display:"flex",alignItems:"center",gap:14}}>
                  <div style={{textAlign:"center",minWidth:50}}>
                    <div style={{fontSize:24,fontWeight:700,color:b.color,lineHeight:1}}>{b.v}</div>
                    <div style={{fontSize:9,color:b.color,fontWeight:600,marginTop:2}}>BMI</div>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:b.color}}>{b.label}</div>
                    <div style={{fontSize:11,color:textSub,marginTop:2}}>{b.label==="ปกติ"?"สุขภาพดี เหมาะกับการวิ่ง 💪":b.label==="น้ำหนักเกิน"?"ลดน้ำหนักช่วยพัฒนาการวิ่ง":b.label==="ต่ำกว่าเกณฑ์"?"เพิ่มโภชนาการก่อนซ้อมหนัก":"ปรึกษาแพทย์ก่อนออกกำลังกาย"}</div>
                  </div>
                </div>
              );})()}
            </GCard>
            <button onClick={saveProfFn} style={{width:"100%",marginTop:12,padding:"13px",borderRadius:12,border:"none",
              background:`linear-gradient(135deg,${accent},#ff8c5a)`,color:"#fff",fontSize:13,fontWeight:700,
              cursor:"pointer",...f,boxShadow:`0 4px 16px ${accent}40`}}>
              💾 บันทึกข้อมูลนักวิ่ง
            </button>
          </div>
        )}

        {/* ════════════ LOG RUN ════════════ */}
        {page==="run"&&(
          <div style={{padding:"16px 18px 0"}}>
            <div style={{fontSize:16,fontWeight:700,color:textPrimary,marginBottom:16}}>{editId?"✏️ แก้ไขการวิ่ง":"✏️ บันทึกการวิ่งใหม่"}</div>
            <GCard style={{padding:"16px"}}>
              <Lbl>เลือกงานวิ่ง</Lbl>
              <select value={runForm.eventId} onChange={e=>setRunForm({...runForm,eventId:e.target.value,customEvent:""})} style={{...inputSt,cursor:"pointer"}}>
                <option value="">— เลือกงานวิ่งในปฏิทิน —</option>
                {EVENTS.map(e=><option key={e.id} value={e.id}>{e.name} ({fmtDate(e.date)})</option>)}
                <option value="custom">🔖 งานวิ่งอื่น (กรอกเอง)</option>
              </select>
              {runForm.eventId==="custom"&&(
                <><Lbl>ชื่องานวิ่ง</Lbl><input value={runForm.customEvent} onChange={e=>setRunForm({...runForm,customEvent:e.target.value})} placeholder="ชื่องานวิ่ง" style={inputSt}/></>
              )}
              {selEv&&(
                <div style={{background:accentSoft,border:`1px solid rgba(255,107,53,0.2)`,borderRadius:10,padding:"8px 12px",marginBottom:11,fontSize:11,color:textSub}}>
                  📍 {selEv.location} · <span style={{color:typeTheme[selEv.type].color,fontWeight:600}}>{typeTheme[selEv.type].label}</span>
                </div>
              )}
              <Lbl>วันที่แข่งขัน</Lbl>
              <input type="date" value={runForm.date} onChange={e=>setRunForm({...runForm,date:e.target.value})} style={inputSt}/>
              <Lbl>ประเภทระยะ</Lbl>
              <select value={runForm.distance} onChange={e=>setRunForm({...runForm,distance:e.target.value})} style={{...inputSt,cursor:"pointer"}}>
                <option value="">— เลือกระยะ —</option>
                {(selEv?.distances||DIST_OPTS).map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {runForm.distance==="อื่นๆ"&&(
                <><Lbl>ระยะทาง (กม.)</Lbl><input type="number" value={runForm.customKm} onChange={e=>setRunForm({...runForm,customKm:e.target.value})} placeholder="เช่น 7.5" style={inputSt}/></>
              )}
              <Lbl>เวลา (ชม:นาที:วินาที)</Lbl>
              <input value={runForm.time} onChange={e=>setRunForm({...runForm,time:e.target.value})} placeholder="เช่น 1:02:34" style={inputSt}/>
              {runForm.time&&<div style={{fontSize:11,color:accent,marginTop:-7,marginBottom:10,fontWeight:600}}>⚡ Pace: {fmtPace(runForm.time,distKm(runForm.distance)||parseFloat(runForm.customKm))}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>BIB</Lbl><input value={runForm.bib} onChange={e=>setRunForm({...runForm,bib:e.target.value})} placeholder="เช่น 1234" style={inputSt}/></div>
                <div><Lbl>อันดับ</Lbl><input value={runForm.position} onChange={e=>setRunForm({...runForm,position:e.target.value})} placeholder="เช่น 42" style={inputSt}/></div>
              </div>
              <div style={{display:"flex",gap:20,marginBottom:11}}>
                {[["medal","🥇 ได้เหรียญ"],["cert","📜 ใบประกาศ"]].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,cursor:"pointer",color:runForm[k]?accent:textSub,fontWeight:600,...f}}>
                    <input type="checkbox" checked={runForm[k]} onChange={e=>setRunForm({...runForm,[k]:e.target.checked})} style={{accentColor:accent}}/>{l}
                  </label>
                ))}
              </div>
              <Lbl>บันทึกเพิ่มเติม</Lbl>
              <textarea value={runForm.notes} onChange={e=>setRunForm({...runForm,notes:e.target.value})}
                placeholder="ความรู้สึก, สภาพอากาศ, บาดเจ็บ..." rows={3}
                style={{...inputSt,resize:"vertical"}}/>
            </GCard>
            <button onClick={submitRun} style={{width:"100%",marginTop:12,padding:"13px",borderRadius:12,border:"none",
              background:`linear-gradient(135deg,${accent},#ff8c5a)`,color:"#fff",fontSize:13,fontWeight:700,
              cursor:"pointer",...f,boxShadow:`0 4px 16px ${accent}40`}}>
              {editId?"💾 บันทึกการแก้ไข":"🏃 บันทึกการวิ่ง"}
            </button>
            {editId&&<button onClick={()=>{setRunForm(EMPTY_RUN);setEditId(null);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:`1px solid ${borderColor}`,background:"rgba(255,255,255,0.6)",color:textSub,fontSize:12,cursor:"pointer",...f}}>ยกเลิก</button>}
          </div>
        )}

        {/* ════════════ HISTORY ════════════ */}
        {page==="history"&&(
          <div style={{padding:"16px 18px 0"}}>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[["all","ทั้งหมด"],["road","🌅 Road"],["trail","🌲 Trail"],["custom","🔖 กำหนดเอง"]].map(([f2,l])=>(
                <button key={f2} onClick={()=>setFilter(f2)}
                  style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${filter===f2?accent:borderColor}`,
                    cursor:"pointer",fontSize:11,fontWeight:700,...f,
                    background:filter===f2?accentSoft:"rgba(255,255,255,0.6)",
                    color:filter===f2?accent:textSub,backdropFilter:"blur(8px)"}}>
                  {l}
                </button>
              ))}
            </div>
            {filtRuns.length===0&&<div style={{textAlign:"center",color:textMuted,padding:36,fontSize:14}}>ไม่มีข้อมูล 🏃</div>}
            {filtRuns.map(r=>{
              const ev=EVENTS.find(e=>e.id===r.eventId);
              const tt=ev?typeTheme[ev.type]:null;
              return(
                <GCard key={r.id} style={{padding:"13px 15px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                        {tt&&<Chip color={tt.color} bg={tt.bg}>{tt.label}</Chip>}
                        {r.medal&&<span style={{fontSize:15}}>🥇</span>}
                        {r.cert&&<span style={{fontSize:15}}>📜</span>}
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:textPrimary,marginBottom:3,lineHeight:1.3}}>{r.eventName}</div>
                      <div style={{fontSize:11,color:textMuted}}>{fmtDate(r.date)} · {r.distance}</div>
                      {r.location&&<div style={{fontSize:11,color:textMuted}}>📍 {r.location}</div>}
                      {r.bib&&<div style={{fontSize:11,color:textMuted}}>BIB: {r.bib}{r.position?` · อันดับ ${r.position}`:""}</div>}
                      {r.notes&&<div style={{fontSize:11,color:textMuted,marginTop:3,fontStyle:"italic",lineHeight:1.5}}>{r.notes}</div>}
                    </div>
                    <div style={{textAlign:"right",minWidth:68,marginLeft:10}}>
                      <div style={{fontSize:16,fontWeight:700,color:accent}}>{r.time||"—"}</div>
                      <div style={{fontSize:10,color:textMuted,marginBottom:8}}>{r.pace}</div>
                      <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                        <button onClick={()=>editRun(r)} style={{background:"rgba(255,255,255,0.7)",border:`1px solid ${borderColor}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13,color:textSub}}>✏️</button>
                        <button onClick={()=>delRun(r.id)} style={{background:"#fff0f0",border:"1px solid #fecaca",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13,color:"#ef4444"}}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </GCard>
              );
            })}
          </div>
        )}

        {/* ════════════ EVENTS ════════════ */}
        {page==="events"&&(
          <div style={{padding:"16px 18px 0"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:1.4,textTransform:"uppercase",color:textMuted,marginBottom:12}}>ปฏิทินงานวิ่ง ปี 2569</div>
            {[...EVENTS].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e=>{
              const isPast=new Date(e.date)<new Date();
              const logged=runs.find(r=>r.eventId===e.id);
              const tt=typeTheme[e.type];
              return(
                <GCard key={e.id} style={{padding:"12px 15px",marginBottom:8,
                  border:`1px solid ${logged?"rgba(255,107,53,0.35)":glassBorder}`,
                  opacity:isPast&&!logged?.5:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:5,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
                        <Chip color={tt.color} bg={tt.bg}>{tt.label}</Chip>
                        {logged&&<Chip color={accent} bg={accentSoft}>✓ บันทึกแล้ว</Chip>}
                        {!isPast&&!logged&&<Chip color={green} bg="rgba(22,163,74,0.1)">กำลังจะมา</Chip>}
                      </div>
                      <div style={{fontSize:12,fontWeight:600,color:textPrimary,marginBottom:2}}>{e.name}</div>
                      <div style={{fontSize:10,color:textMuted}}>📍 {e.location}</div>
                      <div style={{fontSize:10,color:textMuted}}>📏 {e.distances.join(" / ")}</div>
                    </div>
                    <div style={{textAlign:"right",minWidth:64,marginLeft:10}}>
                      <div style={{fontSize:11,fontWeight:600,color:isPast?textMuted:accent,marginBottom:6}}>{fmtDate(e.date)}</div>
                      {!logged&&(
                        <button onClick={()=>{setRunForm({...EMPTY_RUN,eventId:e.id,date:e.date});setPage("run");}}
                          style={{background:`linear-gradient(135deg,${accent},#ff8c5a)`,border:"none",borderRadius:8,padding:"5px 10px",
                            cursor:"pointer",fontSize:10,color:"#fff",...f,fontWeight:700,
                            boxShadow:`0 2px 8px ${accent}35`}}>
                          + บันทึก
                        </button>
                      )}
                    </div>
                  </div>
                </GCard>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
