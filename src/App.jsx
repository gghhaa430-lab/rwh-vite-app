import { useState, useEffect, useRef } from "react";

// ── MOCK DATA ─────────────────────────────────────────────────
const DRIVER_PROFILES = {
  driver1: { id:"driver1", name:"Harsh", email:"harsh@localride.app", password:"harsh123", role:"driver", phone:"+1 506 555 0192", initials:"H", vehicle:{ make:"Toyota", model:"Camry", year:2021, color:"White", plate:"NB 4872 X" }, rating:4.8, totalRides:312, memberSince:"Jan 2024", area:"Moncton / Riverview", available:true, seats:4 },
  driver2: { id:"driver2", name:"Amandeep S.", email:"aman@localride.app", password:"aman123", role:"driver", phone:"+1 506 555 0344", initials:"AS", vehicle:{ make:"Honda", model:"Civic", year:2020, color:"Blue", plate:"NB 2241 K" }, rating:4.6, totalRides:189, memberSince:"Mar 2024", area:"Dieppe / Moncton", available:true, seats:3 },
  driver3: { id:"driver3", name:"Raj Kumar", email:"raj@localride.app", password:"raj123", role:"driver", phone:"+1 506 555 0581", initials:"RK", vehicle:{ make:"Kia", model:"Sorento", year:2022, color:"Black", plate:"NB 8819 P" }, rating:4.9, totalRides:527, memberSince:"Nov 2023", area:"Moncton / Fredericton", available:false, seats:6 },
};
const DRIVERS = Object.values(DRIVER_PROFILES);

const MOCK_RIDES = [
  { id:"1", passengerName:"Priya Sharma", passengerId:"p_demo", pickup:"Moncton Mall", drop:"Riverview High School", date:"2026-06-05", time:"08:00", status:"accepted", recurring:"everyday", notes:"2 passengers", driverId:"driver1", driverName:"Harsh", fare:{min:8,max:12}, completedAt:null, cancelReason:null, isGroup:false, seats:1, passengers:[{id:"p_demo",name:"Priya Sharma"}], cashConfirmed:false },
  { id:"2", passengerName:"Raj Patel", passengerId:"p2", pickup:"Downtown Moncton", drop:"NBCC Campus", date:"2026-05-28", time:"09:30", status:"completed", recurring:"none", notes:"", driverId:"driver1", driverName:"Harsh", fare:{min:6,max:9}, completedAt:"2026-05-28", cancelReason:null, isGroup:false, seats:1, passengers:[{id:"p2",name:"Raj Patel"}], cashConfirmed:true },
  { id:"3", passengerName:"Sara Ahmed", passengerId:"p3", pickup:"Dieppe Walmart", drop:"Champlain Mall", date:"2026-06-06", time:"14:00", status:"pending", recurring:"mon-wed-fri", notes:"Has a stroller", driverId:null, driverName:null, fare:{min:7,max:11}, completedAt:null, cancelReason:null, isGroup:true, seats:3, passengers:[{id:"p3",name:"Sara Ahmed"}], cashConfirmed:false },
  { id:"4", passengerName:"Priya Sharma", passengerId:"p_demo", pickup:"Champlain Mall", drop:"Moncton Downtown", date:"2026-05-20", time:"18:00", status:"completed", recurring:"none", notes:"", driverId:"driver1", driverName:"Harsh", fare:{min:5,max:8}, completedAt:"2026-05-20", cancelReason:null, isGroup:false, seats:1, passengers:[{id:"p_demo",name:"Priya Sharma"}], cashConfirmed:true },
  { id:"5", passengerName:"Priya Sharma", passengerId:"p_demo", pickup:"NBCC Campus", drop:"Riverview", date:"2026-05-15", time:"17:00", status:"declined", recurring:"none", notes:"", driverId:null, driverName:null, fare:{min:9,max:14}, completedAt:null, cancelReason:null, isGroup:false, seats:1, passengers:[{id:"p_demo",name:"Priya Sharma"}], cashConfirmed:false },
  { id:"6", passengerName:"Amir Hassan", passengerId:"p4", pickup:"Moncton Airport", drop:"Downtown Moncton", date:"2026-06-07", time:"10:00", status:"pending", recurring:"none", notes:"Big luggage, need space", driverId:null, driverName:null, fare:{min:12,max:18}, completedAt:null, cancelReason:null, isGroup:true, seats:2, passengers:[{id:"p4",name:"Amir Hassan"}], cashConfirmed:false },
];

const MOCK_MESSAGES = {
  "1": [
    { id:"m1", sender:"driver", senderName:"Harsh", text:"Hey! I'll be there by 7:55 AM. Look for a white Toyota.", time:"07:30" },
    { id:"m2", sender:"passenger", senderName:"Priya", text:"Perfect, I'll be at the main entrance. Thanks!", time:"07:32" },
    { id:"m3", sender:"driver", senderName:"Harsh", text:"On my way now 🚗", time:"07:50" },
  ],
};

const MOCK_NOTIFS = [
  { id:"n1", type:"accepted", title:"RIDE ACCEPTED", body:"Harsh confirmed your ride for Jun 5 at 8:00 AM", time:"2 min ago", read:false },
  { id:"n2", type:"completed", title:"RIDE COMPLETE", body:"Your ride on May 28 to NBCC Campus is done", time:"5 days ago", read:true },
  { id:"n3", type:"new_request", title:"NEW REQUEST", body:"Sara Ahmed needs a ride to Champlain Mall", time:"1 hr ago", read:false },
];

const CANCEL_REASONS = ["Change of plans","Wrong location entered","Driver taking too long","Found another ride","Emergency","Other"];
const RECURRING_OPTIONS = [
  { value:"none", label:"ONE TIME" },
  { value:"everyday", label:"EVERY DAY" },
  { value:"mon-wed-fri", label:"MON / WED / FRI" },
  { value:"tue-thu", label:"TUE / THU" },
  { value:"weekdays", label:"WEEKDAYS (MON–FRI)" },
];
const AREAS = ["ALL AREAS","MONCTON","RIVERVIEW","DIEPPE","AIRPORT","FREDERICTON"];

const CITY_DISTANCES = { "moncton mall-riverview high school":6.2,"downtown moncton-nbcc campus":3.8,"dieppe walmart-champlain mall":4.5,"champlain mall-moncton downtown":5.1,"nbcc campus-riverview":7.3,"moncton airport-downtown moncton":14.2 };
function estimateFare(pickup,drop){ const k=`${pickup.toLowerCase()}-${drop.toLowerCase()}`; const km=CITY_DISTANCES[k]||(Math.random()*6+3); const b=3,r=1.8; return { min:Math.round(b+km*r*0.85), max:Math.round(b+km*r*1.15), km:Math.round(km*10)/10 }; }
function shareText(ride){ return `🚗 LOCAL RIDE REQUEST\n📍 FROM: ${ride.pickup}\n🏁 TO: ${ride.drop}\n📅 ${ride.date} AT ${ride.time}\n👤 ${ride.passengerName}${ride.isGroup?`\n💺 ${ride.seats} SEATS AVAILABLE`:""}\nJOIN VIA LOCAL RIDE APP!`; }

const STATUS_META = {
  pending:   { label:"PENDING",   color:"#000",    bg:"#FFF3CD", bar:"#FFC107" },
  accepted:  { label:"CONFIRMED", color:"#000",    bg:"#D4EDDA", bar:"#000" },
  declined:  { label:"DECLINED",  color:"#fff",    bg:"#DC3545", bar:"#DC3545" },
  completed: { label:"COMPLETE",  color:"#000",    bg:"#E8E8E8", bar:"#666" },
  cancelled: { label:"CANCELLED", color:"#fff",    bg:"#666",    bar:"#666" },
};

// ── GLOBAL STYLES ─────────────────────────────────────────────
const G = {
  app: { minHeight:"100vh", background:"#fff", fontFamily:"'Barlow Condensed','Arial Narrow','Arial',sans-serif", color:"#000", maxWidth:430, margin:"0 auto", position:"relative" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"2px solid #000", position:"sticky", top:0, background:"#fff", zIndex:10 },
  logo: { fontSize:20, fontWeight:800, letterSpacing:"0.05em", textTransform:"uppercase" },
  headerRight: { fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#666" },
  content: { padding:"0 0 100px" },
  nav: { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, display:"flex", background:"#000", padding:"0", zIndex:20 },
  navBtn: a => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"14px 0 18px", border:"none", cursor:"pointer", background: a ? "#fff" : "#000", color: a ? "#000" : "#fff", fontSize:9, fontWeight:700, fontFamily:"inherit", letterSpacing:"0.15em", textTransform:"uppercase", transition:"all 0.15s", borderTop: a ? "3px solid #000" : "3px solid transparent" }),
  section: { padding:"24px 20px 0" },
  sectionTitle: { fontSize:11, fontWeight:700, letterSpacing:"0.2em", color:"#999", textTransform:"uppercase", marginBottom:14, paddingBottom:8, borderBottom:"1px solid #eee" },
  bigTitle: { fontSize:28, fontWeight:800, letterSpacing:"-0.02em", textTransform:"uppercase", lineHeight:1.1, marginBottom:6 },
  sub: { fontSize:14, color:"#666", marginBottom:24, lineHeight:1.4 },
  card: { border:"1px solid #000", marginBottom:12, background:"#fff" },
  cardHeader: { background:"#000", color:"#fff", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  cardHeaderText: { fontSize:14, fontWeight:800, letterSpacing:"0.05em", textTransform:"uppercase" },
  cardBody: { padding:"14px 16px" },
  input: { width:"100%", background:"#fff", border:"2px solid #000", padding:"14px 16px", color:"#000", fontSize:15, fontWeight:600, outline:"none", boxSizing:"border-box", marginBottom:14, fontFamily:"inherit", letterSpacing:"0.02em" },
  label: { fontSize:11, fontWeight:800, color:"#000", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6, display:"block" },
  btnPrimary: { width:"100%", padding:"16px", background:"#000", color:"#fff", border:"none", cursor:"pointer", fontWeight:800, fontSize:14, fontFamily:"inherit", letterSpacing:"0.15em", textTransform:"uppercase", transition:"all 0.15s" },
  btnSecondary: { width:"100%", padding:"14px", background:"#fff", color:"#000", border:"2px solid #000", cursor:"pointer", fontWeight:800, fontSize:13, fontFamily:"inherit", letterSpacing:"0.12em", textTransform:"uppercase", transition:"all 0.15s" },
  btnSmBlack: { padding:"8px 16px", background:"#000", color:"#fff", border:"none", cursor:"pointer", fontWeight:800, fontSize:11, fontFamily:"inherit", letterSpacing:"0.12em", textTransform:"uppercase" },
  btnSmOutline: { padding:"8px 16px", background:"#fff", color:"#000", border:"1.5px solid #000", cursor:"pointer", fontWeight:800, fontSize:11, fontFamily:"inherit", letterSpacing:"0.12em", textTransform:"uppercase" },
  btnSmRed: { padding:"8px 16px", background:"#DC3545", color:"#fff", border:"none", cursor:"pointer", fontWeight:800, fontSize:11, fontFamily:"inherit", letterSpacing:"0.12em", textTransform:"uppercase" },
  btnSmGreen: { padding:"8px 16px", background:"#198754", color:"#fff", border:"none", cursor:"pointer", fontWeight:800, fontSize:11, fontFamily:"inherit", letterSpacing:"0.12em", textTransform:"uppercase" },
  iconBtn: { width:36, height:36, background:"none", border:"2px solid #000", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", flexShrink:0 },
  empty: { textAlign:"center", padding:"48px 20px", color:"#999" },
  select: { width:"100%", background:"#fff", border:"2px solid #000", padding:"14px 16px", color:"#000", fontSize:14, fontWeight:700, outline:"none", boxSizing:"border-box", marginBottom:14, fontFamily:"inherit", letterSpacing:"0.05em", appearance:"none" },
  textarea: { width:"100%", background:"#fff", border:"2px solid #000", padding:"14px 16px", color:"#000", fontSize:14, fontWeight:600, outline:"none", boxSizing:"border-box", marginBottom:14, fontFamily:"inherit", resize:"none", minHeight:80 },
};

// ── ICONS (minimal SVG) ───────────────────────────────────────
const Ic = ({d,size=18,color="currentColor",sw=2,fill="none"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const I = {
  car:     "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5a2 2 0 0 1-2 2h-2m-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  plus:    "M12 5v14M5 12h14",
  list:    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  chat:    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  history: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  check:   "M20 6L9 17l-5-5",
  back:    "M19 12H5M12 19l-7-7 7-7",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  board:   "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  dollar:  "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  share:   "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cancel:  "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  whatsapp:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12.05 1.5C6.198 1.5 1.5 6.198 1.5 12.05c0 1.909.511 3.697 1.403 5.235L1.5 22.5l5.352-1.378A10.513 10.513 0 0 0 12.05 22.6c5.852 0 10.55-4.698 10.55-10.55C22.6 6.198 17.902 1.5 12.05 1.5z",
};

// ── STATUS BADGE ──────────────────────────────────────────────
const StatusBadge = ({status}) => {
  const m = STATUS_META[status]||STATUS_META.pending;
  return <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", background:m.bg, color:m.color, padding:"4px 10px", border:"1.5px solid #000" }}>{m.label}</span>;
};

// ── PROGRESS BAR (like Star Security) ────────────────────────
const ProgressBar = ({status,full=false}) => {
  const pct = status==="completed"?100:status==="accepted"?70:status==="pending"?30:status==="declined"||status==="cancelled"?100:0;
  const color = status==="declined"||status==="cancelled" ? "#DC3545" : "#000";
  return (
    <div style={{ height:6, background:"#E0E0E0", margin:"10px 0", width:"100%" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color, transition:"width 0.3s" }}/>
    </div>
  );
};

// ── ROUTE ROW ─────────────────────────────────────────────────
const RouteRow = ({pickup,drop}) => (
  <div style={{ fontSize:12, letterSpacing:"0.05em", color:"#444", marginBottom:10 }}>
    <span style={{ fontWeight:800, color:"#000" }}>FROM</span> {pickup}
    <span style={{ margin:"0 8px", color:"#999" }}>—</span>
    <span style={{ fontWeight:800, color:"#000" }}>TO</span> {drop}
  </div>
);

// ── MODAL SHELL ───────────────────────────────────────────────
const Modal = ({onClose,title,children}) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,maxWidth:430,margin:"0 auto" }}>
    <div style={{ background:"#fff",width:"100%",border:"2px solid #000",borderBottom:"none",padding:"24px 20px 40px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <span style={{ fontSize:16,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase" }}>{title}</span>
        <button onClick={onClose} style={{ ...G.iconBtn,width:30,height:30 }}><Ic d="M18 6L6 18M6 6l12 12" size={16}/></button>
      </div>
      {children}
    </div>
  </div>
);

// ── CANCEL MODAL ──────────────────────────────────────────────
const CancelModal = ({ride,onConfirm,onClose}) => {
  const [reason,setReason] = useState("");
  const [custom,setCustom] = useState("");
  return (
    <Modal onClose={onClose} title="Cancel Ride">
      <div style={{ fontSize:12,color:"#666",marginBottom:16,letterSpacing:"0.05em" }}>{ride.pickup} → {ride.drop}</div>
      <div style={{ ...G.label,marginBottom:12 }}>Select reason</div>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
        {CANCEL_REASONS.map(r=>(
          <button key={r} onClick={()=>setReason(r)} style={{ padding:"12px 16px",border:`2px solid ${reason===r?"#000":"#ccc"}`,background:reason===r?"#000":"#fff",color:reason===r?"#fff":"#000",fontSize:12,fontWeight:700,fontFamily:"inherit",cursor:"pointer",textAlign:"left",letterSpacing:"0.05em",textTransform:"uppercase" }}>{r}</button>
        ))}
      </div>
      {reason==="Other"&&<textarea style={G.textarea} placeholder="Describe the reason..." value={custom} onChange={e=>setCustom(e.target.value)}/>}
      <div style={{ display:"flex",gap:10 }}>
        <button style={{ ...G.btnSecondary,flex:1 }} onClick={onClose}>KEEP RIDE</button>
        <button style={{ flex:1,padding:"14px",background:reason?"#DC3545":"#ccc",color:"#fff",border:"none",cursor:reason?"pointer":"not-allowed",fontWeight:800,fontSize:13,fontFamily:"inherit",letterSpacing:"0.12em",textTransform:"uppercase" }} onClick={()=>reason&&onConfirm(reason==="Other"?custom||"Other":reason)} disabled={!reason}>CANCEL RIDE</button>
      </div>
    </Modal>
  );
};

// ── CASH MODAL ────────────────────────────────────────────────
const CashModal = ({ride,userRole,onConfirm,onClose}) => (
  <Modal onClose={onClose} title="Confirm Cash Payment">
    <div style={{ textAlign:"center",marginBottom:20 }}>
      <div style={{ fontSize:48,fontWeight:800,letterSpacing:"-2px",marginBottom:4 }}>${ride.fare?.min}–${ride.fare?.max}</div>
      <div style={{ fontSize:12,color:"#666",letterSpacing:"0.1em",textTransform:"uppercase" }}>Cash · Estimated Fare</div>
    </div>
    <RouteRow pickup={ride.pickup} drop={ride.drop}/>
    <div style={{ fontSize:12,color:"#666",marginBottom:20,padding:"12px",border:"1px solid #eee",letterSpacing:"0.03em" }}>
      {userRole==="driver" ? `Confirm you received cash from ${ride.passengerName}` : `Confirm you paid cash to ${ride.driverName||"the driver"}`}
    </div>
    <div style={{ display:"flex",gap:10 }}>
      <button style={{ ...G.btnSecondary,flex:1 }} onClick={onClose}>CANCEL</button>
      <button style={{ flex:1,padding:"14px",background:"#198754",color:"#fff",border:"none",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"inherit",letterSpacing:"0.12em",textTransform:"uppercase" }} onClick={onConfirm}>✓ CONFIRM PAID</button>
    </div>
  </Modal>
);

// ── SHARE MODAL ───────────────────────────────────────────────
const ShareModal = ({ride,onClose}) => {
  const [copied,setCopied] = useState(false);
  const text = shareText(ride);
  const wa = () => { if(navigator.share){navigator.share({title:"Local Ride",text}).catch(()=>{});}else{window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");} };
  const copy = () => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <Modal onClose={onClose} title="Share Ride">
      <div style={{ background:"#f8f8f8",border:"1px solid #eee",padding:"14px",marginBottom:16,fontSize:12,lineHeight:1.8,letterSpacing:"0.03em",whiteSpace:"pre-line",fontFamily:"monospace" }}>{text}</div>
      <button style={{ ...G.btnPrimary,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }} onClick={wa}>
        <Ic d={I.whatsapp} size={18} color="#fff"/> SHARE ON WHATSAPP
      </button>
      <button style={G.btnSecondary} onClick={copy}>{copied?"✓ COPIED!":"COPY TEXT"}</button>
    </Modal>
  );
};

// ── CHAT SCREEN ───────────────────────────────────────────────
function ChatScreen({ride,user,onBack}) {
  const [messages,setMessages] = useState(MOCK_MESSAGES[ride.id]||[]);
  const [text,setText] = useState("");
  const ref = useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send = () => {
    if(!text.trim()) return;
    setMessages(m=>[...m,{id:"m_"+Date.now(),sender:user.role==="driver"?"driver":"passenger",senderName:user.name,text:text.trim(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    setText("");
  };
  const isMe = m => (user.role==="driver"&&m.sender==="driver")||(user.role==="passenger"&&m.sender==="passenger");
  return (
    <div style={{ ...G.app,display:"flex",flexDirection:"column",height:"100vh" }}>
      <div style={{ ...G.header }}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase" }}>{user.role==="driver"?ride.passengerName:ride.driverName||"Driver"}</div>
          <div style={{ fontSize:10,letterSpacing:"0.12em",color:"#666",textTransform:"uppercase" }}>{ride.pickup} → {ride.drop}</div>
        </div>
        <div style={{ fontSize:10,fontWeight:800,letterSpacing:"0.1em",color:"#198754",textTransform:"uppercase" }}>● ACTIVE</div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12 }}>
        {messages.length===0&&<div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No messages yet.</div></div>}
        {messages.map(m=>(
          <div key={m.id} style={{ display:"flex",flexDirection:"column",alignItems:isMe(m)?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%",background:isMe(m)?"#000":"#f0f0f0",color:isMe(m)?"#fff":"#000",padding:"10px 14px",border:`2px solid ${isMe(m)?"#000":"#ddd"}` }}>
              <div style={{ fontSize:13,lineHeight:1.4,fontWeight:600 }}>{m.text}</div>
            </div>
            <div style={{ fontSize:10,color:"#999",marginTop:4,letterSpacing:"0.05em" }}>{m.time}</div>
          </div>
        ))}
        <div ref={ref}/>
      </div>
      <div style={{ padding:"12px 20px 20px",borderTop:"2px solid #000",display:"flex",gap:10 }}>
        <input style={{ ...G.input,marginBottom:0,flex:1 }} placeholder="TYPE A MESSAGE..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button onClick={send} style={{ width:50,height:50,background:"#000",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic d={I.send} size={18} color="#fff"/></button>
      </div>
    </div>
  );
}

// ── NOTIF SCREEN ──────────────────────────────────────────────
function NotifScreen({notifs,onMark,onBack}) {
  const unread = notifs.filter(n=>!n.read).length;
  return (
    <div style={G.app}>
      <div style={G.header}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={G.logo}>LOCAL RIDE</div>
          <div style={{ fontSize:10,letterSpacing:"0.15em",color:"#666",textTransform:"uppercase" }}>NOTIFICATIONS</div>
        </div>
        {unread>0&&<button onClick={onMark} style={G.btnSmBlack}>MARK ALL READ</button>}
      </div>
      <div style={G.content}>
        <div style={G.section}>
          {notifs.length===0
            ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No notifications.</div></div>
            : notifs.map(n=>(
              <div key={n.id} style={{ ...G.card, borderLeft:`4px solid ${n.read?"#eee":"#000"}`, opacity:n.read?0.6:1, marginBottom:10 }}>
                <div style={G.cardBody}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                    <div style={{ fontSize:13,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase" }}>{n.title}</div>
                    <div style={{ fontSize:10,color:"#999",letterSpacing:"0.05em",flexShrink:0,marginLeft:10 }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize:13,color:"#555",lineHeight:1.5 }}>{n.body}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── HISTORY SCREEN ────────────────────────────────────────────
function HistoryScreen({rides,user,onBack,onChat,onShare}) {
  const [filter,setFilter] = useState("all");
  const shown = filter==="all"?rides:rides.filter(r=>r.status===filter);
  const done = rides.filter(r=>r.status==="completed").length;
  return (
    <div style={G.app}>
      <div style={G.header}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={G.logo}>LOCAL RIDE</div>
          <div style={{ fontSize:10,letterSpacing:"0.15em",color:"#666",textTransform:"uppercase" }}>RIDE HISTORY</div>
        </div>
        <div style={{ fontSize:12,fontWeight:800,letterSpacing:"0.05em",color:"#666" }}>{done}/{rides.length} DONE</div>
      </div>
      <div style={G.content}>
        {/* Stats */}
        <div style={{ display:"flex",borderBottom:"2px solid #000" }}>
          {[{n:rides.length,l:"TOTAL"},{n:done,l:"COMPLETED"},{n:rides.length>0?Math.round(done/rides.length*100):0,l:"SUCCESS %",s:"%"}].map(s=>(
            <div key={s.l} style={{ flex:1,padding:"20px 0",textAlign:"center",borderRight:"1px solid #eee" }}>
              <div style={{ fontSize:32,fontWeight:800,letterSpacing:"-1px" }}>{s.n}{s.s||""}</div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.15em",color:"#999",textTransform:"uppercase",marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Filter tabs */}
        <div style={{ display:"flex",borderBottom:"2px solid #000" }}>
          {["all","completed","cancelled","declined"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ flex:1,padding:"12px 0",border:"none",cursor:"pointer",fontWeight:800,fontSize:10,fontFamily:"inherit",letterSpacing:"0.12em",textTransform:"uppercase",background:filter===f?"#000":"#fff",color:filter===f?"#fff":"#666",borderRight:"1px solid #eee",transition:"all 0.15s" }}>
              {f==="all"?"ALL":f.slice(0,4).toUpperCase()}
            </button>
          ))}
        </div>
        <div style={G.section}>
          {shown.length===0
            ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No rides found.</div></div>
            : shown.map(r=>(
              <div key={r.id} style={G.card}>
                <div style={G.cardHeader}>
                  <div style={G.cardHeaderText}>{user.role==="driver"?r.passengerName:r.driverName||"AWAITING DRIVER"}</div>
                  <StatusBadge status={r.status}/>
                </div>
                <div style={G.cardBody}>
                  <div style={{ fontSize:10,letterSpacing:"0.12em",color:"#999",textTransform:"uppercase",marginBottom:8 }}>{r.date} · {r.time}</div>
                  <RouteRow pickup={r.pickup} drop={r.drop}/>
                  <ProgressBar status={r.status}/>
                  {r.cancelReason&&<div style={{ fontSize:11,color:"#DC3545",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",marginTop:6 }}>REASON: {r.cancelReason}</div>}
                  {r.cashConfirmed&&<div style={{ fontSize:11,color:"#198754",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",marginTop:6 }}>✓ CASH CONFIRMED</div>}
                  <div style={{ display:"flex",gap:8,marginTop:12 }}>
                    {(r.status==="accepted"||r.status==="completed")&&<button style={G.btnSmOutline} onClick={()=>onChat(r)}>CHAT</button>}
                    <button style={G.btnSmOutline} onClick={()=>onShare(r)}>SHARE</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── DRIVERS SCREEN ────────────────────────────────────────────
function DriversScreen({onBack,onRequest}) {
  const [area,setArea] = useState("ALL AREAS");
  const [onlyAvail,setOnlyAvail] = useState(false);
  const [expanded,setExpanded] = useState(null);
  const filtered = DRIVERS.filter(d=>(area==="ALL AREAS"||d.area.toUpperCase().includes(area))&&(!onlyAvail||d.available));
  return (
    <div style={G.app}>
      <div style={G.header}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={G.logo}>LOCAL RIDE</div>
          <div style={{ fontSize:10,letterSpacing:"0.15em",color:"#666",textTransform:"uppercase" }}>LOCAL DRIVERS</div>
        </div>
        <div style={{ fontSize:12,fontWeight:800,letterSpacing:"0.05em",color:"#666" }}>{filtered.length} FOUND</div>
      </div>
      <div style={G.content}>
        {/* Area filter */}
        <div style={{ display:"flex",overflowX:"auto",borderBottom:"2px solid #000",padding:"0" }}>
          {AREAS.map(a=>(
            <button key={a} onClick={()=>setArea(a)} style={{ padding:"12px 16px",border:"none",borderRight:"1px solid #eee",cursor:"pointer",fontWeight:800,fontSize:9,fontFamily:"inherit",letterSpacing:"0.12em",background:area===a?"#000":"#fff",color:area===a?"#fff":"#666",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s" }}>{a}</button>
          ))}
        </div>
        {/* Avail toggle */}
        <div style={{ padding:"14px 20px",borderBottom:"1px solid #eee",display:"flex",alignItems:"center",gap:12 }}>
          <div onClick={()=>setOnlyAvail(o=>!o)} style={{ width:44,height:24,border:"2px solid #000",position:"relative",cursor:"pointer",background:onlyAvail?"#000":"#fff",transition:"all 0.2s" }}>
            <div style={{ width:16,height:16,background:onlyAvail?"#fff":"#000",position:"absolute",top:2,left:onlyAvail?22:2,transition:"all 0.2s" }}/>
          </div>
          <span style={{ fontSize:11,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase" }}>Available only</span>
        </div>
        <div style={G.section}>
          {filtered.length===0
            ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No drivers in this area.</div></div>
            : filtered.map(d=>(
              <div key={d.id} style={G.card}>
                <div style={{ ...G.cardHeader,cursor:"pointer" }} onClick={()=>setExpanded(expanded===d.id?null:d.id)}>
                  <div>
                    <div style={G.cardHeaderText}>{d.name.toUpperCase()}</div>
                    <div style={{ fontSize:10,color:"#aaa",letterSpacing:"0.08em",marginTop:2 }}>{d.area} · ★ {d.rating} · {d.totalRides} RIDES</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:10,fontWeight:800,letterSpacing:"0.1em",padding:"4px 10px",background:d.available?"#198754":"#DC3545",color:"#fff" }}>{d.available?"OPEN":"BUSY"}</span>
                    <span style={{ color:"#aaa",fontSize:12 }}>{expanded===d.id?"▲":"▼"}</span>
                  </div>
                </div>
                {/* Progress bar for rating */}
                <div style={{ height:4,background:"#333" }}>
                  <div style={{ height:"100%",width:`${(d.rating/5)*100}%`,background:"#fff" }}/>
                </div>
                {expanded===d.id&&(
                  <div style={G.cardBody}>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px",marginBottom:14 }}>
                      {[{l:"VEHICLE",v:`${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}`},{l:"COLOR",v:d.vehicle.color},{l:"PLATE",v:d.vehicle.plate},{l:"MAX SEATS",v:`${d.seats} passengers`},{l:"AREA",v:d.area},{l:"MEMBER SINCE",v:d.memberSince}].map(r=>(
                        <div key={r.l}>
                          <div style={{ fontSize:9,fontWeight:800,letterSpacing:"0.15em",color:"#999",textTransform:"uppercase",marginBottom:3 }}>{r.l}</div>
                          <div style={{ fontSize:13,fontWeight:700 }}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:10,color:"#198754",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",padding:"8px 0",borderTop:"1px solid #eee",marginBottom:12 }}>✓ VERIFIED · BACKGROUND CHECKED</div>
                    {d.available&&<button style={G.btnPrimary} onClick={e=>{e.stopPropagation();onRequest(d);}}>REQUEST THIS DRIVER</button>}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── RIDE BOARD ────────────────────────────────────────────────
function RideBoardScreen({rides,user,onBack,onJoin,onOffer}) {
  const [filter,setFilter] = useState("all");
  const pub = rides.filter(r=>r.status==="pending");
  const shown = filter==="group"?pub.filter(r=>r.isGroup):filter==="solo"?pub.filter(r=>!r.isGroup):pub;
  const alreadyJoined = r => r.passengers?.some(p=>p.id===user.id);
  return (
    <div style={G.app}>
      <div style={G.header}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={G.logo}>LOCAL RIDE</div>
          <div style={{ fontSize:10,letterSpacing:"0.15em",color:"#666",textTransform:"uppercase" }}>PUBLIC RIDE BOARD</div>
        </div>
        <div style={{ fontSize:12,fontWeight:800,letterSpacing:"0.05em",color:"#666" }}>{shown.length} OPEN</div>
      </div>
      <div style={G.content}>
        <div style={{ display:"flex",borderBottom:"2px solid #000" }}>
          {[{v:"all",l:"ALL"},{v:"group",l:"GROUP"},{v:"solo",l:"SOLO"}].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)} style={{ flex:1,padding:"14px 0",border:"none",borderRight:"1px solid #eee",cursor:"pointer",fontWeight:800,fontSize:11,fontFamily:"inherit",letterSpacing:"0.15em",textTransform:"uppercase",background:filter===f.v?"#000":"#fff",color:filter===f.v?"#fff":"#666",transition:"all 0.15s" }}>{f.l}</button>
          ))}
        </div>
        <div style={G.section}>
          {shown.length===0
            ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No open requests right now.</div></div>
            : shown.map(r=>(
              <div key={r.id} style={G.card}>
                <div style={G.cardHeader}>
                  <div>
                    <div style={G.cardHeaderText}>{r.passengerName.toUpperCase()}</div>
                    <div style={{ fontSize:10,color:"#aaa",letterSpacing:"0.08em",marginTop:2 }}>{r.date} · {r.time}{r.isGroup?` · GROUP · ${r.seats} SEATS`:""}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#fff" }}>${r.fare.min}–${r.fare.max}</div>
                    <div style={{ fontSize:9,color:"#aaa",letterSpacing:"0.1em" }}>CASH</div>
                  </div>
                </div>
                <div style={G.cardBody}>
                  <RouteRow pickup={r.pickup} drop={r.drop}/>
                  {r.isGroup&&r.passengers?.length>0&&(
                    <div style={{ fontSize:11,color:"#666",letterSpacing:"0.05em",marginBottom:10 }}>
                      {r.passengers.length}/{r.seats} PASSENGERS JOINED
                      <div style={{ height:4,background:"#eee",marginTop:6 }}>
                        <div style={{ height:"100%",width:`${(r.passengers.length/r.seats)*100}%`,background:"#000" }}/>
                      </div>
                    </div>
                  )}
                  {r.notes&&<div style={{ fontSize:12,color:"#666",marginBottom:10,fontStyle:"italic" }}>{r.notes}</div>}
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {user.role==="driver"&&!alreadyJoined(r)&&<button style={G.btnSmGreen} onClick={()=>onOffer(r)}>OFFER RIDE</button>}
                    {user.role==="passenger"&&r.isGroup&&!alreadyJoined(r)&&r.passengers?.length<r.seats&&<button style={G.btnSmBlack} onClick={()=>onJoin(r)}>JOIN RIDE</button>}
                    {alreadyJoined(r)&&<span style={{ fontSize:10,fontWeight:800,letterSpacing:"0.1em",color:"#198754",textTransform:"uppercase",padding:"8px 0" }}>✓ JOINED</span>}
                    <button style={{ ...G.btnSmOutline,background:"#25D366",border:"none",color:"#fff",display:"flex",alignItems:"center",gap:5 }} onClick={()=>{const t=shareText(r);if(navigator.share){navigator.share({title:"Local Ride",text:t}).catch(()=>{});}else{window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank");}}}>
                      <Ic d={I.whatsapp} size={13} color="#fff"/> SHARE
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── FARE SCREEN ───────────────────────────────────────────────
function FareScreen({onBack,onBook}) {
  const [pickup,setPickup] = useState("");
  const [drop,setDrop] = useState("");
  const [est,setEst] = useState(null);
  return (
    <div style={G.app}>
      <div style={G.header}>
        <button style={{ ...G.iconBtn,marginRight:12 }} onClick={onBack}><Ic d={I.back} size={16}/></button>
        <div style={G.logo}>FARE ESTIMATE</div>
      </div>
      <div style={G.content}>
        <div style={{ padding:"24px 20px" }}>
          <div style={G.label}>PICKUP LOCATION</div>
          <input style={G.input} placeholder="e.g. Moncton Mall" value={pickup} onChange={e=>setPickup(e.target.value)}/>
          <div style={G.label}>DROP LOCATION</div>
          <input style={{ ...G.input,marginBottom:20 }} placeholder="e.g. NBCC Campus" value={drop} onChange={e=>setDrop(e.target.value)}/>
          <button style={G.btnPrimary} onClick={()=>{if(pickup&&drop)setEst(estimateFare(pickup,drop));}}>CALCULATE ESTIMATE</button>
        </div>
        {est&&(
          <div>
            <div style={{ borderTop:"2px solid #000",borderBottom:"2px solid #000",padding:"32px 20px",textAlign:"center",background:"#000",color:"#fff" }}>
              <div style={{ fontSize:56,fontWeight:800,letterSpacing:"-3px" }}>${est.min}–${est.max}</div>
              <div style={{ fontSize:11,letterSpacing:"0.2em",color:"#aaa",marginTop:6 }}>CASH · {est.km} KM APPROX</div>
            </div>
            <div style={{ padding:"20px" }}>
              {[{l:"BASE FARE",v:"$3.00"},{l:`DISTANCE (${est.km} KM × $1.80)`,v:`$${(est.km*1.8).toFixed(2)}`},{l:"ESTIMATE RANGE",v:"±15%"},{l:"PAYMENT",v:"CASH ONLY"}].map(r=>(
                <div key={r.l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #eee" }}>
                  <span style={{ fontSize:11,fontWeight:800,letterSpacing:"0.1em",color:"#666",textTransform:"uppercase" }}>{r.l}</span>
                  <span style={{ fontSize:13,fontWeight:800 }}>{r.v}</span>
                </div>
              ))}
              <div style={{ fontSize:11,color:"#666",padding:"14px",border:"1px solid #eee",marginTop:16,marginBottom:20,letterSpacing:"0.03em",lineHeight:1.6 }}>
                Final fare is agreed between passenger and driver. This is an estimate only.
              </div>
              <button style={G.btnPrimary} onClick={()=>onBook({pickup,drop,fare:est})}>BOOK THIS RIDE</button>
            </div>
          </div>
        )}
        {!est&&(
          <div style={{ padding:"0 20px" }}>
            <div style={G.sectionTitle}>POPULAR ROUTES</div>
            {[{from:"Moncton Mall",to:"Riverview High School",fare:"$8–12"},{from:"Downtown Moncton",to:"NBCC Campus",fare:"$6–9"},{from:"Dieppe Walmart",to:"Champlain Mall",fare:"$7–11"},{from:"Moncton Airport",to:"Downtown",fare:"$12–18"}].map(r=>(
              <button key={r.from} onClick={()=>{setPickup(r.from);setDrop(r.to);}} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid #eee",background:"none",border:"none",borderBottom:"1px solid #eee",cursor:"pointer",textAlign:"left",fontFamily:"inherit" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:800,letterSpacing:"0.03em",textTransform:"uppercase" }}>{r.from}</div>
                  <div style={{ fontSize:11,color:"#999",letterSpacing:"0.05em",marginTop:3 }}>→ {r.to}</div>
                </div>
                <div style={{ fontSize:18,fontWeight:800 }}>{r.fare}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RIDE CARD ─────────────────────────────────────────────────
function RideCard({ride,showActions,onAccept,onDecline,onChat,onCancel,onComplete,onCash,onShare,userRole}) {
  const rec = RECURRING_OPTIONS.find(o=>o.value===ride.recurring);
  const canCancel = userRole==="passenger"&&(ride.status==="pending"||ride.status==="accepted");
  const driver = ride.driverId ? DRIVER_PROFILES[ride.driverId] : null;
  return (
    <div style={G.card}>
      <div style={G.cardHeader}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={G.cardHeaderText}>{userRole==="driver"?ride.passengerName.toUpperCase():ride.driverName?ride.driverName.toUpperCase():"AWAITING DRIVER"}</span>
            {ride.isGroup&&<span style={{ fontSize:9,fontWeight:800,letterSpacing:"0.1em",background:"#444",padding:"3px 8px" }}>GROUP</span>}
            {ride.cashConfirmed&&<span style={{ fontSize:9,fontWeight:800,letterSpacing:"0.1em",background:"#198754",padding:"3px 8px" }}>PAID</span>}
          </div>
          <div style={{ fontSize:10,color:"#aaa",letterSpacing:"0.08em",marginTop:4 }}>
            {ride.date} · {ride.time}{ride.recurring!=="none"?` · ${rec?.label}`:""}
          </div>
        </div>
        <StatusBadge status={ride.status}/>
      </div>

      {/* Progress bar */}
      <ProgressBar status={ride.status}/>

      <div style={G.cardBody}>
        <RouteRow pickup={ride.pickup} drop={ride.drop}/>

        {/* Driver info for passenger */}
        {userRole==="passenger"&&driver&&(
          <div style={{ fontSize:11,letterSpacing:"0.05em",color:"#555",padding:"10px",background:"#f8f8f8",border:"1px solid #eee",marginBottom:10 }}>
            <span style={{ fontWeight:800,color:"#000" }}>DRIVER </span>{driver.name} · {driver.vehicle.color} {driver.vehicle.make} · {driver.vehicle.plate} · ★ {driver.rating}
          </div>
        )}

        {/* Fare */}
        {ride.fare&&(
          <div style={{ fontSize:11,fontWeight:800,letterSpacing:"0.1em",color:"#000",marginBottom:10,textTransform:"uppercase" }}>
            ESTIMATED FARE: ${ride.fare.min}–${ride.fare.max} CASH
          </div>
        )}

        {/* Group seats */}
        {ride.isGroup&&(
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:"0.1em",color:"#666",textTransform:"uppercase",marginBottom:6 }}>{ride.passengers?.length||0}/{ride.seats} PASSENGERS</div>
            <div style={{ height:4,background:"#eee" }}>
              <div style={{ height:"100%",width:`${((ride.passengers?.length||0)/ride.seats)*100}%`,background:"#000" }}/>
            </div>
          </div>
        )}

        {ride.notes&&<div style={{ fontSize:12,color:"#666",marginBottom:10,fontStyle:"italic" }}>{ride.notes}</div>}
        {ride.cancelReason&&<div style={{ fontSize:11,color:"#DC3545",fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:10 }}>CANCELLED: {ride.cancelReason}</div>}

        {/* Actions */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {showActions&&<><button style={G.btnSmGreen} onClick={onAccept}>✓ ACCEPT</button><button style={G.btnSmRed} onClick={onDecline}>✕ DECLINE</button></>}
          {ride.status==="accepted"&&userRole==="driver"&&<button style={G.btnSmBlack} onClick={onComplete}>✓ COMPLETE</button>}
          {ride.status==="accepted"&&<button style={G.btnSmOutline} onClick={onChat}>CHAT</button>}
          {(ride.status==="accepted"||ride.status==="completed")&&!ride.cashConfirmed&&<button style={{ ...G.btnSmOutline,borderColor:"#198754",color:"#198754" }} onClick={onCash}>💵 CASH</button>}
          {canCancel&&<button style={G.btnSmRed} onClick={onCancel}>CANCEL</button>}
          <button style={{ ...G.btnSmOutline,background:"#25D366",border:"none",color:"#fff",display:"flex",alignItems:"center",gap:4 }} onClick={onShare}><Ic d={I.whatsapp} size={12} color="#fff"/>SHARE</button>
        </div>
      </div>
    </div>
  );
}

// ── PASSENGER APP ─────────────────────────────────────────────
function PassengerApp({user,onLogout}) {
  const [tab,setTab] = useState("home");
  const [screen,setScreen] = useState(null);
  const [chatRide,setChatRide] = useState(null);
  const [cancelRide,setCancelRide] = useState(null);
  const [cashRide,setCashRide] = useState(null);
  const [shareRide,setShareRide] = useState(null);
  const [rides,setRides] = useState(MOCK_RIDES.filter(r=>r.passengerId==="p_demo"));
  const [allRides,setAllRides] = useState(MOCK_RIDES);
  const [notifs,setNotifs] = useState(MOCK_NOTIFS.filter(n=>n.type!=="new_request"));
  const [form,setForm] = useState({pickup:"",drop:"",date:"",time:"",recurring:"none",notes:"",isGroup:false,seats:1,fare:null});
  const [posted,setPosted] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const unread = notifs.filter(n=>!n.read).length;

  const addNotif=(type,title,body)=>setNotifs(ns=>[{id:"n_"+Date.now(),type,title,body,time:"Just now",read:false},...ns]);
  const submitRide=()=>{
    if(!form.pickup||!form.drop||!form.date||!form.time) return;
    const fare=form.fare||estimateFare(form.pickup,form.drop);
    const r={id:"r_"+Date.now(),passengerName:user.name,passengerId:user.id,pickup:form.pickup,drop:form.drop,date:form.date,time:form.time,recurring:form.recurring,notes:form.notes,status:"pending",driverId:null,driverName:null,fare,completedAt:null,cancelReason:null,isGroup:form.isGroup,seats:parseInt(form.seats)||1,passengers:[{id:user.id,name:user.name}],cashConfirmed:false};
    setRides(rs=>[r,...rs]);
    setAllRides(rs=>[r,...rs]);
    addNotif("posted","RIDE POSTED",`Your ride to ${form.drop} is now on the board.`);
    setForm({pickup:"",drop:"",date:"",time:"",recurring:"none",notes:"",isGroup:false,seats:1,fare:null});
    setPosted(true);
    setTimeout(()=>{setPosted(false);setTab("home");},1600);
  };
  const cancelConfirm=(id,reason)=>{setRides(rs=>rs.map(r=>r.id===id?{...r,status:"cancelled",cancelReason:reason}:r));addNotif("cancelled","RIDE CANCELLED",`Your ride has been cancelled.`);setCancelRide(null);};
  const cashConfirm=(id)=>{setRides(rs=>rs.map(r=>r.id===id?{...r,cashConfirmed:true}:r));addNotif("cash","PAYMENT CONFIRMED","Cash payment confirmed.");setCashRide(null);};
  const joinRide=(ride)=>{setAllRides(rs=>rs.map(r=>r.id===ride.id?{...r,passengers:[...r.passengers,{id:user.id,name:user.name}]}:r));addNotif("joined","JOINED RIDE",`You joined the group ride to ${ride.drop}`);};
  const bookFromFare=({pickup,drop,fare})=>{setForm(f=>({...f,pickup,drop,fare}));setScreen(null);setTab("book");};
  const openChat=r=>{setChatRide(r);setScreen("chat");};

  if(screen==="chat"&&chatRide) return <ChatScreen ride={chatRide} user={user} onBack={()=>setScreen(null)}/>;
  if(screen==="notifs") return <NotifScreen notifs={notifs} onMark={()=>setNotifs(ns=>ns.map(n=>({...n,read:true})))} onBack={()=>setScreen(null)}/>;
  if(screen==="history") return <HistoryScreen rides={rides} user={user} onBack={()=>setScreen(null)} onChat={openChat} onShare={setShareRide}/>;
  if(screen==="fare") return <FareScreen onBack={()=>setScreen(null)} onBook={bookFromFare}/>;
  if(screen==="drivers") return <DriversScreen onBack={()=>setScreen(null)} onRequest={d=>{addNotif("driver","DRIVER FOUND",`${d.name} is available in your area.`);setScreen(null);}}/>;
  if(screen==="board") return <RideBoardScreen rides={allRides} user={user} onBack={()=>setScreen(null)} onJoin={joinRide} onOffer={()=>{}}/>;

  const pending=rides.filter(r=>r.status==="pending").length;
  const accepted=rides.filter(r=>r.status==="accepted").length;
  const active=rides.filter(r=>!["completed","declined","cancelled"].includes(r.status));

  return (
    <div style={G.app}>
      {cancelRide&&<CancelModal ride={cancelRide} onConfirm={reason=>cancelConfirm(cancelRide.id,reason)} onClose={()=>setCancelRide(null)}/>}
      {cashRide&&<CashModal ride={cashRide} userRole="passenger" onConfirm={()=>cashConfirm(cashRide.id)} onClose={()=>setCashRide(null)}/>}
      {shareRide&&<ShareModal ride={shareRide} onClose={()=>setShareRide(null)}/>}

      <div style={G.header}>
        <div style={G.logo}>LOCAL RIDE</div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ fontSize:11,fontWeight:800,letterSpacing:"0.08em",color:"#666",textTransform:"uppercase" }}>{user.name?.toUpperCase()}</div>
          {unread>0&&<div style={{ width:8,height:8,borderRadius:"50%",background:"#DC3545" }}/>}
          <button style={G.iconBtn} onClick={()=>setScreen("notifs")}><Ic d={I.bell} size={16}/></button>
          <button style={G.iconBtn} onClick={onLogout}><Ic d={I.logout} size={16}/></button>
        </div>
      </div>

      <div style={G.content}>
        {tab==="home"&&<>
          {/* Stats bar */}
          <div style={{ display:"flex",borderBottom:"2px solid #000" }}>
            {[{n:pending,l:"PENDING"},{n:accepted,l:"CONFIRMED"},{n:rides.length,l:"TOTAL"}].map(s=>(
              <div key={s.l} style={{ flex:1,padding:"18px 0",textAlign:"center",borderRight:"1px solid #eee" }}>
                <div style={{ fontSize:28,fontWeight:800,letterSpacing:"-1px" }}>{s.n}</div>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.15em",color:"#999",textTransform:"uppercase",marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Hero action */}
          <div style={{ padding:"20px" }}>
            <button onClick={()=>setTab("book")} style={G.btnPrimary}>+ BOOK A RIDE</button>
          </div>

          {/* Quick actions grid */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:"1px solid #eee",borderLeft:"1px solid #eee" }}>
            {[
              {l:"FARE\nESTIMATE",ic:I.dollar,a:()=>setScreen("fare")},
              {l:"LOCAL\nDRIVERS",ic:I.users,a:()=>setScreen("drivers")},
              {l:"RIDE\nBOARD",ic:I.board,a:()=>setScreen("board")},
              {l:"HISTORY",ic:I.history,a:()=>setScreen("history")},
              {l:"ALERTS",ic:I.bell,a:()=>setScreen("notifs"),badge:unread},
            ].map(q=>(
              <button key={q.l} onClick={q.a} style={{ padding:"18px 10px",border:"none",borderRight:"1px solid #eee",borderBottom:"1px solid #eee",cursor:"pointer",background:"#fff",color:"#000",fontFamily:"inherit",fontWeight:800,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:8,position:"relative",textAlign:"center",lineHeight:1.4,transition:"all 0.15s" }}>
                <Ic d={q.ic} size={22}/>{q.l}
                {q.badge>0&&<div style={{ position:"absolute",top:10,right:10,width:8,height:8,borderRadius:"50%",background:"#DC3545" }}/>}
              </button>
            ))}
          </div>

          {/* Active rides */}
          <div style={{ ...G.section,marginTop:8 }}>
            <div style={G.sectionTitle}>ACTIVE RIDES</div>
            {active.length===0
              ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No active rides.<br/>Post one to get started.</div></div>
              : active.map(r=><RideCard key={r.id} ride={r} userRole="passenger" onChat={()=>openChat(r)} onCancel={()=>setCancelRide(r)} onCash={()=>setCashRide(r)} onShare={()=>setShareRide(r)}/>)}
          </div>
        </>}

        {tab==="book"&&(
          <div style={{ padding:"24px 20px" }}>
            <div style={G.bigTitle}>POST A RIDE</div>
            <div style={G.sub}>Enter your route and we'll find you a driver.</div>
            {posted&&<div style={{ background:"#198754",color:"#fff",padding:"14px 16px",fontWeight:800,fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20 }}>✓ RIDE POSTED ON BOARD!</div>}
            {form.fare&&<div style={{ background:"#000",color:"#fff",padding:"14px 16px",fontWeight:800,fontSize:16,letterSpacing:"0.05em",marginBottom:20 }}>ESTIMATED: ${form.fare.min}–${form.fare.max} CASH</div>}
            <button onClick={()=>setScreen("fare")} style={{ ...G.btnSmOutline,marginBottom:20,fontSize:10,letterSpacing:"0.12em" }}>CHECK FARE ESTIMATE FIRST →</button>
            <div style={G.label}>PICKUP LOCATION</div>
            <input style={G.input} placeholder="Enter pickup address" value={form.pickup} onChange={set("pickup")}/>
            <div style={G.label}>DROP LOCATION</div>
            <input style={G.input} placeholder="Enter drop address" value={form.drop} onChange={set("drop")}/>
            <div style={{ display:"flex",gap:14 }}>
              <div style={{ flex:1 }}><div style={G.label}>DATE</div><input style={{ ...G.input,marginBottom:0 }} type="date" value={form.date} onChange={set("date")}/></div>
              <div style={{ flex:1 }}><div style={G.label}>TIME</div><input style={{ ...G.input,marginBottom:0 }} type="time" value={form.time} onChange={set("time")}/></div>
            </div>
            <div style={{ height:14 }}/>
            <div style={G.label}>RECURRING</div>
            <select style={G.select} value={form.recurring} onChange={set("recurring")}>{RECURRING_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
            {/* Group toggle */}
            <div style={{ border:"2px solid #000",padding:"14px 16px",marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase" }}>GROUP RIDE</div>
                  <div style={{ fontSize:11,color:"#666",marginTop:2 }}>Allow multiple passengers to join</div>
                </div>
                <div onClick={()=>setForm(f=>({...f,isGroup:!f.isGroup}))} style={{ width:48,height:26,border:"2px solid #000",position:"relative",cursor:"pointer",background:form.isGroup?"#000":"#fff",transition:"all 0.2s" }}>
                  <div style={{ width:18,height:18,background:form.isGroup?"#fff":"#000",position:"absolute",top:2,left:form.isGroup?24:2,transition:"all 0.2s" }}/>
                </div>
              </div>
              {form.isGroup&&(
                <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid #eee" }}>
                  <div style={G.label}>AVAILABLE SEATS</div>
                  <select style={{ ...G.select,marginBottom:0 }} value={form.seats} onChange={set("seats")}>{[2,3,4,5,6].map(n=><option key={n} value={n}>{n} PASSENGERS</option>)}</select>
                </div>
              )}
            </div>
            <div style={G.label}>NOTES (OPTIONAL)</div>
            <textarea style={G.textarea} placeholder="e.g. 2 passengers, have stroller, big luggage..." value={form.notes} onChange={set("notes")}/>
            <button style={G.btnPrimary} onClick={submitRide}>POST RIDE REQUEST</button>
          </div>
        )}

        {tab==="rides"&&(
          <div style={G.section}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontSize:18,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase" }}>MY RIDES</div>
              <button style={G.btnSmOutline} onClick={()=>setScreen("history")}>FULL HISTORY</button>
            </div>
            {rides.length===0
              ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No rides yet.</div></div>
              : rides.map(r=><RideCard key={r.id} ride={r} userRole="passenger" onChat={()=>openChat(r)} onCancel={()=>setCancelRide(r)} onCash={()=>setCashRide(r)} onShare={()=>setShareRide(r)}/>)}
          </div>
        )}
      </div>

      <div style={G.nav}>
        {[{id:"home",l:"HOME",ic:I.car},{id:"book",l:"BOOK",ic:I.plus},{id:"rides",l:"RIDES",ic:I.list}].map(n=>(
          <button key={n.id} style={G.navBtn(tab===n.id)} onClick={()=>setTab(n.id)}>
            <Ic d={n.ic} size={20} color="currentColor"/>{n.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── DRIVER APP ────────────────────────────────────────────────
function DriverApp({user,onLogout}) {
  const [tab,setTab] = useState("requests");
  const [screen,setScreen] = useState(null);
  const [chatRide,setChatRide] = useState(null);
  const [cashRide,setCashRide] = useState(null);
  const [shareRide,setShareRide] = useState(null);
  const [online,setOnline] = useState(true);
  const [rides,setRides] = useState(MOCK_RIDES);
  const [notifs,setNotifs] = useState(MOCK_NOTIFS.filter(n=>n.type==="new_request"));
  const [profileOpen,setProfileOpen] = useState(false);
  const unread = notifs.filter(n=>!n.read).length;
  const myProfile = DRIVER_PROFILES[user.id];

  const addNotif=(type,title,body)=>setNotifs(ns=>[{id:"n_"+Date.now(),type,title,body,time:"Just now",read:false},...ns]);
  const updateStatus=(id,status)=>{setRides(rs=>rs.map(r=>r.id===id?{...r,status,driverId:status==="accepted"?user.id:r.driverId,driverName:status==="accepted"?user.name:r.driverName}:r));if(status==="accepted")addNotif("accepted","RIDE ACCEPTED","You accepted a ride.");};
  const markComplete=id=>setRides(rs=>rs.map(r=>r.id===id?{...r,status:"completed",completedAt:new Date().toISOString().split("T")[0]}:r));
  const cashConfirm=id=>{setRides(rs=>rs.map(r=>r.id===id?{...r,cashConfirmed:true}:r));addNotif("cash","CASH RECEIVED","Payment confirmed.");setCashRide(null);};
  const openChat=r=>{setChatRide(r);setScreen("chat");};

  if(screen==="chat"&&chatRide) return <ChatScreen ride={chatRide} user={user} onBack={()=>setScreen(null)}/>;
  if(screen==="notifs") return <NotifScreen notifs={notifs} onMark={()=>setNotifs(ns=>ns.map(n=>({...n,read:true})))} onBack={()=>setScreen(null)}/>;
  if(screen==="history") return <HistoryScreen rides={rides.filter(r=>["completed","declined","cancelled"].includes(r.status))} user={user} onBack={()=>setScreen(null)} onChat={openChat} onShare={setShareRide}/>;
  if(screen==="board") return <RideBoardScreen rides={rides} user={user} onBack={()=>setScreen(null)} onJoin={()=>{}} onOffer={r=>{updateStatus(r.id,"accepted");setScreen(null);}}/>;

  const pending=rides.filter(r=>r.status==="pending").length;
  const accepted=rides.filter(r=>r.status==="accepted").length;
  const done=rides.filter(r=>r.status==="completed").length;

  return (
    <div style={G.app}>
      {cashRide&&<CashModal ride={cashRide} userRole="driver" onConfirm={()=>cashConfirm(cashRide.id)} onClose={()=>setCashRide(null)}/>}
      {shareRide&&<ShareModal ride={shareRide} onClose={()=>setShareRide(null)}/>}

      <div style={G.header}>
        <div style={G.logo}>LOCAL RIDE</div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div onClick={()=>setOnline(o=>!o)} style={{ display:"flex",alignItems:"center",gap:6,border:"2px solid #000",padding:"6px 12px",cursor:"pointer",background:online?"#000":"#fff" }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:online?"#4CAF50":"#999" }}/>
            <span style={{ fontSize:10,fontWeight:800,letterSpacing:"0.15em",color:online?"#fff":"#000" }}>{online?"ONLINE":"OFFLINE"}</span>
          </div>
          <button style={G.iconBtn} onClick={()=>setScreen("notifs")}><Ic d={I.bell} size={16}/>{unread>0&&<span style={{ position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#DC3545" }}/>}</button>
          <button style={G.iconBtn} onClick={onLogout}><Ic d={I.logout} size={16}/></button>
        </div>
      </div>

      <div style={G.content}>
        {/* Stats */}
        <div style={{ display:"flex",borderBottom:"2px solid #000" }}>
          {[{n:pending,l:"NEW"},{n:accepted,l:"ACTIVE"},{n:done,l:"DONE"}].map(s=>(
            <div key={s.l} style={{ flex:1,padding:"18px 0",textAlign:"center",borderRight:"1px solid #eee" }}>
              <div style={{ fontSize:28,fontWeight:800,letterSpacing:"-1px" }}>{s.n}</div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.15em",color:"#999",textTransform:"uppercase",marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Driver profile */}
        {myProfile&&(
          <div style={{ borderBottom:"1px solid #eee" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",cursor:"pointer" }} onClick={()=>setProfileOpen(o=>!o)}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:40,height:40,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0 }}>{myProfile.initials}</div>
                <div>
                  <div style={{ fontSize:14,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase" }}>{myProfile.name}</div>
                  <div style={{ fontSize:10,color:"#666",letterSpacing:"0.08em" }}>★ {myProfile.rating} · {myProfile.totalRides} RIDES</div>
                </div>
              </div>
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#666" }}>{profileOpen?"▲ HIDE":"▼ PROFILE"}</span>
            </div>
            {profileOpen&&(
              <div style={{ padding:"0 20px 16px",borderTop:"1px solid #eee" }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px",marginTop:14 }}>
                  {[{l:"VEHICLE",v:`${myProfile.vehicle.year} ${myProfile.vehicle.make} ${myProfile.vehicle.model}`},{l:"COLOR",v:myProfile.vehicle.color},{l:"PLATE",v:myProfile.vehicle.plate},{l:"AREA",v:myProfile.area}].map(r=>(
                    <div key={r.l}><div style={{ fontSize:9,fontWeight:800,letterSpacing:"0.15em",color:"#999",marginBottom:3 }}>{r.l}</div><div style={{ fontSize:13,fontWeight:700 }}>{r.v}</div></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"2px solid #000",borderLeft:"1px solid #eee" }}>
          {[{l:"RIDE\nBOARD",ic:I.board,a:()=>setScreen("board")},{l:"HISTORY",ic:I.history,a:()=>setScreen("history")},{l:"ALERTS",ic:I.bell,a:()=>setScreen("notifs"),badge:unread}].map(q=>(
            <button key={q.l} onClick={q.a} style={{ padding:"16px 10px",border:"none",borderRight:"1px solid #eee",cursor:"pointer",background:"#fff",color:"#000",fontFamily:"inherit",fontWeight:800,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:8,position:"relative",lineHeight:1.4 }}>
              <Ic d={q.ic} size={22}/>{q.l}
              {q.badge>0&&<div style={{ position:"absolute",top:10,right:10,width:8,height:8,borderRadius:"50%",background:"#DC3545" }}/>}
            </button>
          ))}
        </div>

        {tab==="requests"&&(
          <div style={G.section}>
            <div style={G.sectionTitle}>INCOMING REQUESTS</div>
            {!online&&<div style={{ background:"#DC3545",color:"#fff",padding:"12px 16px",fontWeight:800,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14 }}>YOU ARE OFFLINE — GO ONLINE TO ACCEPT RIDES</div>}
            {rides.filter(r=>r.status==="pending").length===0
              ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>All caught up!</div></div>
              : rides.filter(r=>r.status==="pending").map(r=>(
                <RideCard key={r.id} ride={r} showActions={online} userRole="driver"
                  onAccept={()=>updateStatus(r.id,"accepted")} onDecline={()=>updateStatus(r.id,"declined")}
                  onChat={()=>openChat(r)} onCash={()=>setCashRide(r)} onShare={()=>setShareRide(r)}/>
              ))}
          </div>
        )}
        {tab==="confirmed"&&(
          <div style={G.section}>
            <div style={G.sectionTitle}>ACTIVE RIDES</div>
            {rides.filter(r=>r.status==="accepted").length===0
              ? <div style={G.empty}><div style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>No active rides.</div></div>
              : rides.filter(r=>r.status==="accepted").map(r=>(
                <RideCard key={r.id} ride={r} userRole="driver"
                  onChat={()=>openChat(r)} onComplete={()=>markComplete(r.id)} onCash={()=>setCashRide(r)} onShare={()=>setShareRide(r)}/>
              ))}
          </div>
        )}
        {tab==="all"&&(
          <div style={G.section}>
            <div style={G.sectionTitle}>ALL RIDES</div>
            {rides.map(r=>(
              <RideCard key={r.id} ride={r} showActions={r.status==="pending"&&online} userRole="driver"
                onAccept={()=>updateStatus(r.id,"accepted")} onDecline={()=>updateStatus(r.id,"declined")}
                onChat={()=>openChat(r)} onComplete={()=>markComplete(r.id)} onCash={()=>setCashRide(r)} onShare={()=>setShareRide(r)}/>
            ))}
          </div>
        )}
      </div>

      <div style={G.nav}>
        {[{id:"requests",l:"REQUESTS",ic:I.bell},{id:"confirmed",l:"ACTIVE",ic:I.check},{id:"all",l:"ALL",ic:I.list}].map(n=>(
          <button key={n.id} style={G.navBtn(tab===n.id)} onClick={()=>setTab(n.id)}>
            <Ic d={n.ic} size={20} color="currentColor"/>{n.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────
function AuthScreen({onLogin}) {
  const [role,setRole] = useState("passenger");
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({name:"",email:"",phone:"",password:""});
  const [err,setErr] = useState("");
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const submit = () => {
    setErr(""); if(!form.email||!form.password){setErr("Please fill all fields.");return;}
    if(role==="driver"){const d=DRIVERS.find(d=>d.email===form.email&&d.password===form.password);if(!d){setErr("Invalid driver credentials.");return;}onLogin({...d});return;}
    if(mode==="signup"){if(!form.name||!form.phone){setErr("Please fill all fields.");return;}onLogin({name:form.name,email:form.email,phone:form.phone,role:"passenger",id:"p_demo"});}
    else{onLogin({name:form.email.split("@")[0],email:form.email,role:"passenger",id:"p_demo"});}
  };
  return (
    <div style={{ minHeight:"100vh",background:"#fff",fontFamily:"'Barlow Condensed','Arial Narrow','Arial',sans-serif",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto" }}>
      {/* Header */}
      <div style={{ padding:"20px",borderBottom:"2px solid #000",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:20,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase" }}>LOCAL RIDE</div>
        <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.15em",color:"#666",textTransform:"uppercase" }}>RIDES NEAR YOU</div>
      </div>
      <div style={{ padding:"40px 24px" }}>
        <div style={{ fontSize:36,fontWeight:800,letterSpacing:"-0.02em",textTransform:"uppercase",marginBottom:8 }}>SIGN IN</div>
        <div style={{ fontSize:15,color:"#666",marginBottom:32,lineHeight:1.5 }}>
          {role==="passenger" ? "Enter your details to view and book rides." : "Enter your driver credentials to manage rides."}
        </div>

        {/* Role toggle */}
        <div style={{ display:"flex",marginBottom:28,border:"2px solid #000" }}>
          {["passenger","driver"].map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{ flex:1,padding:"14px 0",border:"none",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"inherit",letterSpacing:"0.12em",textTransform:"uppercase",background:role===r?"#000":"#fff",color:role===r?"#fff":"#000",transition:"all 0.15s" }}>{r.toUpperCase()}</button>
          ))}
        </div>

        {/* Mode toggle (passenger only) */}
        {role==="passenger"&&(
          <div style={{ display:"flex",marginBottom:24,borderBottom:"2px solid #000" }}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{ flex:1,padding:"12px 0",border:"none",cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"inherit",letterSpacing:"0.15em",textTransform:"uppercase",background:"#fff",color:mode===m?"#000":"#999",borderBottom:mode===m?"3px solid #000":"3px solid transparent",marginBottom:-2,transition:"all 0.15s" }}>{m==="login"?"LOG IN":"SIGN UP"}</button>
            ))}
          </div>
        )}

        {err&&<div style={{ background:"#DC3545",color:"#fff",padding:"12px 16px",fontWeight:800,fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:20 }}>{err}</div>}

        {role==="passenger"&&mode==="signup"&&<>
          <div style={G.label}>FULL NAME</div>
          <input style={G.input} placeholder="Your full name" value={form.name} onChange={set("name")}/>
          <div style={G.label}>PHONE NUMBER</div>
          <input style={G.input} placeholder="+1 506 000 0000" value={form.phone} onChange={set("phone")}/>
        </>}

        <div style={G.label}>{role==="driver"?"EMAIL":"EMAIL ADDRESS"}</div>
        <input style={G.input} placeholder="you@email.com" value={form.email} onChange={set("email")} type="email"/>
        <div style={G.label}>PASSWORD</div>
        <input style={{ ...G.input,marginBottom:24 }} placeholder="••••••••" value={form.password} onChange={set("password")} type="password"/>

        <button style={G.btnPrimary} onClick={submit}>GET STARTED</button>

        {role==="driver"&&(
          <div style={{ marginTop:16,padding:"12px",border:"1px solid #eee",fontSize:11,color:"#999",letterSpacing:"0.05em",lineHeight:1.8 }}>
            TEST: harsh@localride.app / harsh123
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(null);
  useEffect(()=>{
    const l=document.createElement("link");
    l.href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap";
    l.rel="stylesheet";
    document.head.appendChild(l);
  },[]);
  if(!user) return <AuthScreen onLogin={setUser}/>;
  if(user.role==="driver") return <DriverApp user={user} onLogout={()=>setUser(null)}/>;
  return <PassengerApp user={user} onLogout={()=>setUser(null)}/>;
}