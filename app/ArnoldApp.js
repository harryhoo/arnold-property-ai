'use client'
import { useState, useRef } from 'react'

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_CRM = {
  "janet.thompson@gmail.com": {
    name: "Janet Thompson",
    nationality: "British",
    firstContact: "March 2022",
    lastContact: "March 2022",
    status: "Cold",
    intentScore: 45,
    history: [
      { date: "Mar 2022", type: "email", note: "Enquired about Black Mountain area villas" },
      { date: "Apr 2022", type: "viewing", note: "Viewed 2 properties near Black Mountain Golf Club" },
      { date: "May 2022", type: "email", note: "Decided not to proceed — daughter's UK university fees took priority" }
    ],
    preferences: { type: "Villa", location: "Black Mountain", budget: "15M THB", beds: 3, pool: true },
    lifeContext: "Husband recently retired and taking up golf. Daughter studying in UK (Edinburgh). Was very interested in Black Mountain area in 2022 but couldn't commit due to daughter's university fees.",
    lastHook: "Mentioned daughter starting university in Edinburgh"
  }
}

const MOCK_PROPERTIES = [
  { id: "HH001", title: "Black Mountain Golf Villa", type: "Villa", location: "Black Mountain", price: 14500000, priceDisplay: "฿14.5M", beds: 3, baths: 3, pool: true, golf: true, golfDist: 0.2, beachDist: 8.5, features: ["Golf membership included", "Mountain views", "Smart home system", "Double garage"], ownership: "Freehold (Chanote)", emoji: "🏌️", color: "#2d6a4f", score: 0 },
  { id: "HH002", title: "Hin Lek Fai Pool Villa", type: "Villa", location: "Hin Lek Fai", price: 8900000, priceDisplay: "฿8.9M", beds: 3, baths: 2, pool: true, golf: false, golfDist: 4.2, beachDist: 3.1, features: ["Private pool", "Hill views", "Covered terrace", "New build 2024"], ownership: "Freehold (Chanote)", emoji: "🌊", color: "#1a6b8a", score: 0 },
  { id: "HH003", title: "Khao Takiab Beachside Villa", type: "Villa", location: "Khao Takiab", price: 18200000, priceDisplay: "฿18.2M", beds: 4, baths: 4, pool: true, golf: false, golfDist: 6.5, beachDist: 0.3, features: ["Sea views", "200m to beach", "Home cinema", "Staff quarters"], ownership: "Leasehold (30yr renewable)", emoji: "🏖️", color: "#b5451b", score: 0 },
  { id: "HH004", title: "Pranburi Garden Villa", type: "Villa", location: "Pranburi", price: 6500000, priceDisplay: "฿6.5M", beds: 3, baths: 2, pool: true, golf: false, golfDist: 12, beachDist: 4.5, features: ["Large garden", "Quiet street", "Solar panels", "Pet friendly"], ownership: "Freehold (Chanote)", emoji: "🌿", color: "#4a7c59", score: 0 },
  { id: "HH005", title: "Palm Hills Golf Residence", type: "Villa", location: "Palm Hills", price: 12800000, priceDisplay: "฿12.8M", beds: 3, baths: 3, pool: true, golf: true, golfDist: 0.1, beachDist: 6.2, features: ["On Palm Hills Golf Course", "Fairway views", "Club membership available", "Modern design"], ownership: "Freehold (Chanote)", emoji: "⛳", color: "#5c7c3a", score: 0 },
  { id: "HH006", title: "Hua Hin Town Centre Condo", type: "Condo", location: "Town Centre", price: 3200000, priceDisplay: "฿3.2M", beds: 2, baths: 2, pool: true, golf: false, golfDist: 5, beachDist: 1.2, features: ["Rooftop pool", "Gym", "Night market walking distance", "Foreigner quota available"], ownership: "Freehold (Foreign quota)", emoji: "🏙️", color: "#7b5ea7", score: 0 },
]

const SAMPLE_EMAILS = [
  {
    label: "🏃 Impatient Viewer (Singapore)",
    from: "david.lim@sgmail.com",
    subject: "3 bedroom villa with pool - Hin Lek Fai area - URGENT",
    body: `Hi,\n\nI'm looking for a 3-bedroom villa with a private pool in the Hin Lek Fai area of Hua Hin. Budget around 10-12 million baht.\n\nI'm flying from Singapore this Tuesday and need to arrange viewings for Tuesday afternoon or Wednesday morning. My wife is coming too and we're serious buyers — we've been looking for 18 months.\n\nCan you send me what you have available and confirm viewing times ASAP?\n\nThanks\nDavid`
  },
  {
    label: "⛳ Returning Buyer (Janet Thompson)",
    from: "janet.thompson@gmail.com",
    subject: "Golf course properties",
    body: `Hello,\n\nI'm interested in looking at properties near a golf course in Hua Hin. My husband has just retired and has really got into golf, so something with easy access to a course would be ideal.\n\nWe're thinking 3 bedrooms, with a pool if possible. Budget is flexible but around 15 million baht.\n\nCould you send me some options?\n\nMany thanks,\nJanet`
  },
  {
    label: "🤔 Vague Enquiry (needs clarification)",
    from: "mike.brown@hotmail.com",
    subject: "Properties in Hua Hin",
    body: `Hi there,\n\nLooking for property in Hua Hin. Something nice with a pool. Let me know what you have.\n\nMike`
  }
]

// ─── SECURE API CALL (via Next.js route) ─────────────────────────────────────

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data.content?.[0]?.text || ''
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #c9a84c; --gold-light: #e8d5a0; --navy: #1a2744; --navy-mid: #243358;
    --cream: #faf8f3; --sand: #f0ead8; --text: #1a2744; --muted: #6b7a9a;
    --green: #2d6a4f; --red: #b5451b; --border: #ddd8c9;
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text); }
  .header { background: var(--navy); padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 64px; border-bottom: 2px solid var(--gold); position: sticky; top: 0; z-index: 100; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-mark { width: 36px; height: 36px; background: var(--gold); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: var(--navy); }
  .logo-text { color: white; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; }
  .logo-sub { color: var(--gold-light); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 1px; }
  .badge { background: linear-gradient(135deg, var(--gold), #a07830); color: var(--navy); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; }
  .tabs { display: flex; background: var(--navy-mid); padding: 0 32px; border-bottom: 1px solid rgba(201,168,76,0.3); overflow-x: auto; }
  .tab { padding: 14px 20px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; font-family: 'DM Sans', sans-serif; background: none; border-left: none; border-right: none; border-top: none; }
  .tab:hover { color: rgba(255,255,255,0.85); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .tab-num { background: rgba(201,168,76,0.2); color: var(--gold); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
  .tab.active .tab-num { background: var(--gold); color: var(--navy); }
  .main { padding: 32px; max-width: 1100px; margin: 0 auto; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); margin-bottom: 6px; }
  .section-sub { color: var(--muted); font-size: 14px; margin-bottom: 28px; line-height: 1.6; }
  .card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(26,39,68,0.06); }
  .card-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: var(--navy); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .email-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .chip { padding: 8px 16px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s; background: white; color: var(--text); font-family: 'DM Sans', sans-serif; }
  .chip:hover { border-color: var(--gold); }
  .chip.active { background: var(--navy); color: white; border-color: var(--navy); }
  .email-box { background: var(--sand); border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .email-meta { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
  .email-subject { font-weight: 600; font-size: 15px; margin-bottom: 12px; }
  .email-body { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
  textarea { width: 100%; min-height: 140px; border: 1.5px solid var(--border); border-radius: 8px; padding: 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; resize: vertical; outline: none; transition: border 0.2s; background: white; color: var(--text); }
  textarea:focus { border-color: var(--gold); }
  .btn { padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; font-family: 'DM Sans', sans-serif; }
  .btn-primary { background: var(--navy); color: white; }
  .btn-primary:hover { background: var(--navy-mid); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-gold { background: var(--gold); color: var(--navy); }
  .btn-gold:hover { background: #b8943e; }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--border); }
  .btn-outline:hover { border-color: var(--navy); }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .intent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .intent-item { background: var(--sand); border-radius: 8px; padding: 12px 14px; }
  .intent-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .intent-value { font-size: 14px; font-weight: 600; color: var(--navy); }
  .intent-value.highlight { color: var(--green); }
  .intent-value.warn { color: #d97706; }
  .intent-value.critical { color: var(--red); }
  .score-bar-wrap { margin-top: 16px; }
  .score-bar-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
  .score-bar-track { height: 10px; background: var(--sand); border-radius: 5px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 5px; transition: width 1s ease; }
  .crm-banner { background: linear-gradient(135deg, #1a2744, #243358); color: white; border-radius: 10px; padding: 18px 22px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 16px; border: 1px solid var(--gold); }
  .crm-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 20px; color: var(--navy); font-weight: 700; flex-shrink: 0; }
  .crm-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; margin-bottom: 3px; }
  .crm-tag { display: inline-block; background: rgba(201,168,76,0.2); color: var(--gold); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 10px; margin-right: 6px; margin-bottom: 6px; }
  .crm-note { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.5; margin-top: 8px; }
  .prop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .prop-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: white; transition: transform 0.2s, box-shadow 0.2s; }
  .prop-card.top { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold); }
  .prop-banner { height: 80px; display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative; }
  .prop-match-badge { position: absolute; top: 10px; right: 10px; background: var(--navy); color: var(--gold); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .prop-body { padding: 14px; }
  .prop-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; margin-bottom: 3px; }
  .prop-location { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
  .prop-price { font-size: 20px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
  .prop-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .prop-tag { font-size: 11px; background: var(--sand); color: var(--muted); padding: 3px 8px; border-radius: 4px; }
  .prop-tag.match { background: #d1fae5; color: #065f46; }
  .prop-reason { margin-top: 10px; font-size: 12px; color: var(--green); font-style: italic; border-top: 1px solid var(--border); padding-top: 10px; }
  .response-box { background: white; border: 1.5px solid var(--gold); border-radius: 10px; padding: 24px; }
  .response-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
  .response-from { font-size: 13px; color: var(--muted); }
  .response-body { font-size: 14px; line-height: 1.75; white-space: pre-wrap; }
  .portal-wrap { background: var(--navy); border-radius: 16px; overflow: hidden; border: 1px solid var(--gold); }
  .portal-header { background: var(--navy-mid); padding: 20px 28px; border-bottom: 1px solid rgba(201,168,76,0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .portal-title { font-family: 'Playfair Display', serif; color: white; font-size: 18px; }
  .portal-sub { color: rgba(255,255,255,0.5); font-size: 12px; }
  .portal-body { padding: 24px; }
  .portal-props { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .portal-prop { background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s; }
  .portal-prop:hover { background: rgba(255,255,255,0.1); border-color: var(--gold); }
  .portal-prop-emoji { font-size: 28px; margin-bottom: 8px; }
  .portal-prop-title { color: white; font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .portal-prop-price { color: var(--gold); font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .portal-prop-loc { color: rgba(255,255,255,0.5); font-size: 12px; }
  .chat-wrap { background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
  .chat-header { background: rgba(201,168,76,0.15); padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--gold); display: flex; align-items: center; gap: 8px; }
  .chat-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
  .chat-messages { padding: 16px; min-height: 160px; max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .chat-msg { display: flex; gap: 8px; align-items: flex-start; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-bubble { max-width: 78%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
  .chat-bubble.ai { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-bottom-left-radius: 3px; }
  .chat-bubble.user { background: var(--gold); color: var(--navy); font-weight: 500; border-bottom-right-radius: 3px; }
  .chat-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; }
  .chat-avatar.ai { background: var(--navy-mid); border: 1px solid rgba(201,168,76,0.4); color: var(--gold); font-weight: 700; }
  .chat-avatar.user { background: var(--gold); color: var(--navy); }
  .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; background: rgba(0,0,0,0.15); border-top: 1px solid rgba(255,255,255,0.06); }
  .chat-input { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 8px 16px; color: white; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; }
  .chat-input::placeholder { color: rgba(255,255,255,0.3); }
  .chat-send { background: var(--gold); color: var(--navy); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; flex-shrink: 0; }
  .booking-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .slot { border: 1.5px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.8); font-size: 13px; font-family: 'DM Sans', sans-serif; background: none; }
  .slot:hover { border-color: var(--gold); background: rgba(201,168,76,0.1); }
  .slot.booked { background: var(--gold); color: var(--navy); border-color: var(--gold); font-weight: 600; }
  .slot-day { font-size: 11px; opacity: 0.7; margin-bottom: 3px; }
  .slot-time { font-weight: 600; }
  .crm-table { width: 100%; border-collapse: collapse; }
  .crm-table th { background: var(--sand); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); padding: 10px 14px; text-align: left; }
  .crm-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
  .crm-table tr:hover td { background: var(--sand); }
  .score-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .score-high { background: #d1fae5; color: #065f46; }
  .score-med { background: #fef3c7; color: #92400e; }
  .score-low { background: #fee2e2; color: #991b1b; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
  .status-hot { background: var(--navy); color: var(--gold); }
  .status-warm { background: #fef3c7; color: #92400e; }
  .status-cold { background: #f3f4f6; color: #6b7280; }
  .status-returning { background: #ede9fe; color: #5b21b6; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } .tabs { padding: 0 12px; } .main { padding: 16px; } .header { padding: 0 16px; } }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }
  .alert-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  .alert-success { background: #f0fdf4; color: #065f46; border: 1px solid #bbf7d0; }
  .alert-warn { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .timeline { display: flex; flex-direction: column; gap: 12px; }
  .timeline-item { display: flex; gap: 14px; align-items: flex-start; }
  .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gold); margin-top: 4px; flex-shrink: 0; }
  .timeline-date { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
  .timeline-note { font-size: 13px; color: var(--text); }
  .loading-pulse { animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
`

export default function ArnoldApp() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedEmail, setSelectedEmail] = useState(SAMPLE_EMAILS[0])
  const [customEmail, setCustomEmail] = useState('')
  const [parsedIntent, setParsedIntent] = useState(null)
  const [matchedProps, setMatchedProps] = useState([])
  const [aiResponse, setAiResponse] = useState('')
  const [crmRecord, setCrmRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I'm your personal Arnold Property assistant. I can answer questions about any of your matched properties, help you understand the buying process in Thailand, or book a viewing. How can I help?" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [bookedSlot, setBookedSlot] = useState(null)
  const chatEndRef = useRef(null)

  const getEmailBody = () => customEmail || selectedEmail.body

  const runParser = async () => {
    setLoading(true)
    setLoadingMsg('Reading email and extracting intent signals...')
    setParsedIntent(null)
    setCrmRecord(null)
    setMatchedProps([])
    setAiResponse('')
    const crm = MOCK_CRM[selectedEmail.from] || null
    setCrmRecord(crm)
    const system = `You are an AI real estate email parser for Arnold Property in Hua Hin, Thailand. Extract buyer intent from emails and return ONLY valid JSON with exactly these fields:
{"name":"buyer name or Unknown","nationality":"inferred nationality or Unknown","propertyType":"Villa/Condo/Townhouse/Land/Unknown","location":"preferred area or Unknown","beds":number or null,"pool":true/false/null,"budgetMin":number in THB or null,"budgetMax":number in THB or null,"urgency":"CRITICAL/HIGH/MEDIUM/LOW","urgencyReason":"brief explanation","intentScore":number 1-100,"intentScoreBreakdown":"brief explanation","travelDate":"date string or null","buyOrRent":"buy/rent/unknown","tone":"excited/frustrated/casual/formal/urgent","missingInfo":["list"],"clarifyingQuestions":["question 1","question 2"]}
Return ONLY the JSON. No explanation, no markdown fences.`
    try {
      const raw = await callClaude(system, getEmailBody())
      const clean = raw.replace(/```json|```/g, '').trim()
      setParsedIntent(JSON.parse(clean))
    } catch (e) {
      setParsedIntent({ error: 'Parse failed: ' + e.message })
    }
    setLoading(false)
    setLoadingMsg('')
  }

  const runMatcher = async () => {
    if (!parsedIntent) return
    setLoading(true)
    setLoadingMsg('Scoring all properties against buyer requirements...')
    const system = `You are a property matching engine for Arnold Property, Hua Hin. Score each property 0-100 for fit against buyer requirements and return a short reason. Return ONLY a JSON array: [{"id":"HH001","score":85,"reason":"Matches golf requirement and budget perfectly"},...]. Include ALL properties. No markdown.`
    const user = `Buyer: ${JSON.stringify(parsedIntent)}\nProperties: ${JSON.stringify(MOCK_PROPERTIES.map(p => ({ id: p.id, title: p.title, type: p.type, location: p.location, price: p.price, beds: p.beds, pool: p.pool, golf: p.golf, features: p.features, ownership: p.ownership })))}`
    try {
      const raw = await callClaude(system, user)
      const scores = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const scored = MOCK_PROPERTIES.map(p => {
        const s = scores.find(x => x.id === p.id)
        return { ...p, score: s?.score || 0, reason: s?.reason || '' }
      }).sort((a, b) => b.score - a.score)
      setMatchedProps(scored)
    } catch {
      setMatchedProps(MOCK_PROPERTIES.map(p => ({ ...p, score: 0, reason: '' })))
    }
    setLoading(false)
    setLoadingMsg('')
  }

  const runResponse = async () => {
    if (!parsedIntent) return
    setLoading(true)
    setLoadingMsg('Drafting personalised email response...')
    const top = matchedProps.slice(0, 3)
    const system = `You are a senior real estate agent at Arnold Property, Hua Hin, Thailand. Write a warm, professional, personalised email to an inbound buyer. Never mention AI. Sign off as "Sarah Mitchell, Senior Property Consultant, Arnold Property". If CRM history exists, weave in a natural personal reference in the opening. Include: personalised greeting, 2-3 matched property highlights with key details, viewing booking invitation, mention of their private portal at [PORTAL_LINK], link to buying guide at [BUYING_GUIDE_LINK]. If info is missing, ask 1-2 clarifying questions naturally. Warm, expert, not pushy. Max 350 words.`
    const user = `Buyer intent: ${JSON.stringify(parsedIntent)}\nCRM: ${crmRecord ? JSON.stringify(crmRecord) : 'First-time enquiry'}\nTop properties: ${JSON.stringify(top.map(p => ({ title: p.title, price: p.priceDisplay, location: p.location, beds: p.beds, pool: p.pool, golf: p.golf, features: p.features.slice(0, 2), ownership: p.ownership, reason: p.reason })))}`
    try {
      const response = await callClaude(system, user)
      setAiResponse(response)
    } catch (e) {
      setAiResponse('Error: ' + e.message)
    }
    setLoading(false)
    setLoadingMsg('')
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    setChatMessages(m => [...m, { role: 'user', text: msg }])
    setChatLoading(true)
    const propCtx = (matchedProps.length > 0 ? matchedProps : MOCK_PROPERTIES).slice(0, 3).map(p => `${p.title}: ${p.priceDisplay}, ${p.beds}bed, pool:${p.pool}, golf:${p.golf}, ${p.location}, ${p.features.join(', ')}, ${p.ownership}`).join('\n')
    const system = `You are the Arnold Property AI assistant helping a buyer on their personal property portal. Properties:\n${propCtx}\nYou know about Thai property law, freehold vs leasehold, transfer fees, buying process, Hua Hin neighbourhoods. Concise, warm, expert. Max 80 words.`
    try {
      const reply = await callClaude(system, msg)
      setChatMessages(m => [...m, { role: 'ai', text: reply }])
    } catch {
      setChatMessages(m => [...m, { role: 'ai', text: 'Sorry, having trouble connecting. Please try again.' }])
    }
    setChatLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const scoreColor = s => s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444'
  const scorePillClass = s => s >= 70 ? 'score-high' : s >= 40 ? 'score-med' : 'score-low'
  const urgencyColor = u => u === 'CRITICAL' ? 'critical' : u === 'HIGH' ? 'highlight' : u === 'MEDIUM' ? 'warn' : ''
  const statusClass = s => ({ Hot: 'status-hot', Warm: 'status-warm', Cold: 'status-cold', Returning: 'status-returning' }[s] || 'status-warm')

  const viewingSlots = [
    { day: 'Tuesday', time: '10:00 AM' }, { day: 'Tuesday', time: '2:00 PM' }, { day: 'Tuesday', time: '4:30 PM' },
    { day: 'Wednesday', time: '9:30 AM' }, { day: 'Wednesday', time: '1:00 PM' }, { day: 'Wednesday', time: '3:00 PM' },
  ]

  const crmLeads = [
    { name: 'David Lim', email: 'david.lim@sgmail.com', nat: '🇸🇬 Singaporean', status: 'Hot', score: 88, last: 'Today', pref: '3-bed villa, Hin Lek Fai, ฿10-12M', note: 'Flight booked Tuesday. Spouse coming. 18 months searching.' },
    { name: 'Janet Thompson', email: 'janet.thompson@gmail.com', nat: '🇬🇧 British', status: 'Returning', score: 75, last: 'Today', pref: 'Golf villa, Black Mountain, ฿15M', note: 'Returning buyer. Husband retired + golfer. Daughter UK.' },
    { name: 'Mike Brown', email: 'mike.brown@hotmail.com', nat: '🇬🇧 British', status: 'Warm', score: 32, last: 'Today', pref: 'Villa with pool — vague', note: 'Very vague. Needs qualification. Clarifying questions sent.' },
    { name: 'Sophie Weber', email: 'sophie.weber@email.de', nat: '🇩🇪 German', status: 'Warm', score: 55, last: '5 days ago', pref: 'Condo, town centre, ฿3-5M', note: 'Rent first, buy later. Asked about foreign quota.' },
    { name: 'James Patterson', email: 'jpatterson@outlook.com', nat: '🇦🇺 Australian', status: 'Cold', score: 18, last: '3 months ago', pref: 'Land, Pranburi area', note: 'No follow-up since initial email. Re-engagement sent.' },
  ]

  const tabs = [
    { label: 'Email Parser', icon: '📧' },
    { label: 'Property Match', icon: '🏠' },
    { label: 'AI Response', icon: '✉️' },
    { label: 'Customer Portal', icon: '🖥️' },
    { label: 'CRM Memory', icon: '🧠' },
  ]

  return (
    <div>
      <style>{styles}</style>

      <div className="header">
        <div className="logo">
          <div className="logo-mark">A</div>
          <div>
            <div className="logo-text">Arnold Property</div>
            <div className="logo-sub">Hua Hin · Thailand</div>
          </div>
        </div>
        <div className="badge">⚡ AI Platform — Live Demo</div>
      </div>

      <div className="tabs">
        {tabs.map((t, i) => (
          <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
            <span className="tab-num">{i + 1}</span>{t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: 'var(--navy)', color: 'var(--gold)', padding: '10px 32px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="spinner" style={{ borderTopColor: 'var(--gold)', borderColor: 'rgba(201,168,76,0.3)' }} />
          <span className="loading-pulse">{loadingMsg}</span>
        </div>
      )}

      <div className="main">

        {/* TAB 0 — EMAIL PARSER */}
        {activeTab === 0 && (
          <div>
            <div className="section-title">📧 Email Parser & Intent Engine</div>
            <div className="section-sub">Select a sample inbound buyer email. The AI extracts all intent signals, scores urgency, and identifies missing information — in seconds.</div>
            <div className="card">
              <div className="card-title">📨 Select Sample Email</div>
              <div className="email-chips">
                {SAMPLE_EMAILS.map((e, i) => (
                  <div key={i} className={`chip ${selectedEmail === e ? 'active' : ''}`}
                    onClick={() => { setSelectedEmail(e); setCustomEmail('') }}>{e.label}</div>
                ))}
              </div>
              <div className="email-box">
                <div className="email-meta">From: {selectedEmail.from} · To: info@arnoldproperty.com</div>
                <div className="email-subject">{selectedEmail.subject}</div>
                <div className="email-body">{customEmail || selectedEmail.body}</div>
              </div>
              <textarea placeholder="Or paste your own buyer email here..." value={customEmail} onChange={e => setCustomEmail(e.target.value)} style={{ marginBottom: 14 }} />
              <button className="btn btn-primary" onClick={runParser} disabled={loading}>
                {loading ? <><div className="spinner" /> Parsing...</> : '⚡ Parse Email & Extract Intent'}
              </button>
            </div>

            {parsedIntent && !parsedIntent.error && (
              <>
                {crmRecord && (
                  <div className="crm-banner">
                    <div className="crm-avatar">{crmRecord.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="crm-name">🧠 Returning Customer Detected: {crmRecord.name}</div>
                      <div><span className="crm-tag">{crmRecord.nationality}</span><span className="crm-tag">First contact: {crmRecord.firstContact}</span><span className="crm-tag">Status: {crmRecord.status}</span></div>
                      <div className="crm-note">"{crmRecord.lifeContext}"</div>
                    </div>
                  </div>
                )}
                <div className="card">
                  <div className="card-title">🎯 Extracted Intent Signals</div>
                  <div className="intent-grid">
                    {[
                      ['Buyer Name', parsedIntent.name],
                      ['Property Type', parsedIntent.propertyType],
                      ['Location', parsedIntent.location],
                      ['Bedrooms', parsedIntent.beds ?? 'Not stated'],
                      ['Pool', parsedIntent.pool === true ? '✅ Required' : parsedIntent.pool === false ? '❌ No' : 'Not stated'],
                      ['Budget', parsedIntent.budgetMax ? `฿${(parsedIntent.budgetMin/1e6||0).toFixed(1)}M – ฿${(parsedIntent.budgetMax/1e6).toFixed(1)}M` : 'Not stated'],
                      ['Buy / Rent', parsedIntent.buyOrRent],
                      ['Email Tone', parsedIntent.tone],
                      ['Travel Date', parsedIntent.travelDate || 'Not mentioned'],
                      ['Nationality', parsedIntent.nationality],
                    ].map(([label, val]) => (
                      <div key={label} className="intent-item">
                        <div className="intent-label">{label}</div>
                        <div className="intent-value" style={{ textTransform: 'capitalize' }}>{String(val)}</div>
                      </div>
                    ))}
                    <div className="intent-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="intent-label">Urgency</div>
                      <div className={`intent-value ${urgencyColor(parsedIntent.urgency)}`}>{parsedIntent.urgency} — {parsedIntent.urgencyReason}</div>
                    </div>
                  </div>
                  <div className="score-bar-wrap">
                    <div className="score-bar-label">
                      <span style={{ fontWeight: 600 }}>Intent Score</span>
                      <span style={{ fontWeight: 700, color: scoreColor(parsedIntent.intentScore) }}>{parsedIntent.intentScore}/100 — {parsedIntent.intentScoreBreakdown}</span>
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${parsedIntent.intentScore}%`, background: scoreColor(parsedIntent.intentScore) }} />
                    </div>
                  </div>
                  {parsedIntent.clarifyingQuestions?.length > 0 && (
                    <>
                      <div className="divider" />
                      <div className="alert alert-warn">
                        <span>⚠️</span>
                        <div><strong>Clarifying questions will be included in response:</strong>
                          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                            {parsedIntent.clarifyingQuestions.map((q, i) => <li key={i} style={{ marginTop: 4 }}>{q}</li>)}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-gold" onClick={() => { setActiveTab(1); runMatcher() }}>Next: Match Properties →</button>
                  </div>
                </div>
              </>
            )}
            {parsedIntent?.error && <div className="alert alert-warn">⚠️ {parsedIntent.error}</div>}
          </div>
        )}

        {/* TAB 1 — PROPERTY MATCH */}
        {activeTab === 1 && (
          <div>
            <div className="section-title">🏠 Property Matching Engine</div>
            <div className="section-sub">AI scores Arnold's full inventory against the buyer's extracted requirements and ranks best matches with reasoning.</div>
            {!parsedIntent
              ? <div className="alert alert-info">ℹ️ Run the Email Parser first (Tab 1) to extract buyer intent.</div>
              : <>
                <div className="card">
                  <div className="card-title">🎯 Matching against buyer requirements</div>
                  <div className="intent-grid">
                    {[['Type', parsedIntent.propertyType], ['Location', parsedIntent.location], ['Beds', parsedIntent.beds ?? 'Any'], ['Budget', parsedIntent.budgetMax ? `฿${(parsedIntent.budgetMax/1e6).toFixed(1)}M max` : 'Open'], ['Pool', parsedIntent.pool === true ? 'Required' : 'Flexible']].map(([l, v]) => (
                      <div key={l} className="intent-item"><div className="intent-label">{l}</div><div className="intent-value">{String(v)}</div></div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={runMatcher} disabled={loading}>
                      {loading ? <><div className="spinner" /> Scoring...</> : '⚡ Run Property Matcher'}
                    </button>
                  </div>
                </div>
                {matchedProps.length > 0 && (
                  <div className="card">
                    <div className="card-title">🏆 Ranked Results — {matchedProps.length} properties scored</div>
                    <div className="prop-grid">
                      {matchedProps.map((p, i) => (
                        <div key={p.id} className={`prop-card ${i < 3 ? 'top' : ''}`}>
                          <div className="prop-banner" style={{ background: `${p.color}22` }}>
                            <span>{p.emoji}</span>
                            <div className="prop-match-badge" style={i >= 3 ? { background: '#f3f4f6', color: '#6b7280' } : {}}>
                              {i < 3 ? `#${i + 1} · ${p.score}%` : `${p.score}%`}
                            </div>
                          </div>
                          <div className="prop-body">
                            <div className="prop-title">{p.title}</div>
                            <div className="prop-location">📍 {p.location}</div>
                            <div className="prop-price">{p.priceDisplay}</div>
                            <div className="score-bar-track" style={{ marginBottom: 8, height: 6 }}>
                              <div className="score-bar-fill" style={{ width: `${p.score}%`, background: scoreColor(p.score) }} />
                            </div>
                            <div className="prop-tags">
                              <span className="prop-tag">{p.beds} bed</span>
                              {p.pool && <span className="prop-tag match">Pool ✓</span>}
                              {p.golf && <span className="prop-tag match">Golf ✓</span>}
                              <span className="prop-tag">{p.ownership.split(' ')[0]}</span>
                              {p.features.slice(0, 2).map((f, fi) => <span key={fi} className="prop-tag">{f}</span>)}
                            </div>
                            {p.reason && <div className="prop-reason">💡 {p.reason}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <button className="btn btn-gold" onClick={() => { setActiveTab(2); runResponse() }}>Next: Generate AI Response →</button>
                    </div>
                  </div>
                )}
              </>
            }
          </div>
        )}

        {/* TAB 2 — AI RESPONSE */}
        {activeTab === 2 && (
          <div>
            <div className="section-title">✉️ Personalised Response Generator</div>
            <div className="section-sub">AI drafts a warm, human-sounding email incorporating buyer intent, matched properties, and any CRM history — ready to review and send.</div>
            {!parsedIntent
              ? <div className="alert alert-info">ℹ️ Complete the Email Parser and Property Match steps first.</div>
              : <>
                {crmRecord && <div className="alert alert-success">🧠 <strong>CRM memory active:</strong> Response will naturally reference {crmRecord.name}'s prior history and life context.</div>}
                <div className="card">
                  <div className="card-title">⚡ Generate Response</div>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
                    Personalising for {parsedIntent.name} · {matchedProps.length > 0 ? `${Math.min(3, matchedProps.length)} matched properties` : 'inventory'} · {crmRecord ? 'Returning customer — CRM history included' : 'New enquiry'}
                  </p>
                  <button className="btn btn-primary" onClick={runResponse} disabled={loading}>
                    {loading ? <><div className="spinner" /> Writing...</> : '✉️ Generate Personalised Email'}
                  </button>
                </div>
                {aiResponse && (
                  <div className="card">
                    <div className="card-title">📤 Draft Response — Ready to Send</div>
                    <div className="response-box">
                      <div className="response-header">
                        <div>
                          <div className="response-from">To: {selectedEmail.from}</div>
                          <div className="response-from">Subject: Re: {selectedEmail.subject}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-outline" style={{ fontSize: 12, padding: '7px 14px' }}
                            onClick={() => navigator.clipboard.writeText(aiResponse)}>📋 Copy</button>
                          <button className="btn btn-gold" style={{ fontSize: 12, padding: '7px 14px' }}>✉️ Send (demo)</button>
                        </div>
                      </div>
                      <div className="response-body">{aiResponse}</div>
                    </div>
                    <div className="alert alert-success" style={{ marginTop: 16 }}>✅ <strong>Response generated in under 2 minutes</strong> from email received. CRM will auto-update on send.</div>
                    <button className="btn btn-gold" style={{ marginTop: 12 }} onClick={() => setActiveTab(3)}>Next: View Customer Portal →</button>
                  </div>
                )}
              </>
            }
          </div>
        )}

        {/* TAB 3 — CUSTOMER PORTAL */}
        {activeTab === 3 && (
          <div>
            <div className="section-title">🖥️ Customer Portal</div>
            <div className="section-sub">Every buyer receives a private portal link. This is what {parsedIntent?.name || 'the buyer'} sees when they click it — properties, AI chat, and viewing booking all in one place.</div>
            <div className="portal-wrap">
              <div className="portal-header">
                <div>
                  <div className="portal-title">Your Private Property Dashboard</div>
                  <div className="portal-sub">Welcome, {parsedIntent?.name || 'David Lim'} · Arnold Property · Hua Hin</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>🔒 Secure Portal</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>portal.arnoldproperty.com</div>
                </div>
              </div>
              <div className="portal-body">
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Your Matched Properties
                </div>
                <div className="portal-props">
                  {(matchedProps.length > 0 ? matchedProps : MOCK_PROPERTIES).slice(0, 3).map(p => (
                    <div key={p.id} className="portal-prop">
                      <div className="portal-prop-emoji">{p.emoji}</div>
                      <div className="portal-prop-title">{p.title}</div>
                      <div className="portal-prop-price">{p.priceDisplay}</div>
                      <div className="portal-prop-loc">📍 {p.location} · {p.beds} bed{p.pool ? ' · Pool ✓' : ''}{p.golf ? ' · Golf ✓' : ''}</div>
                    </div>
                  ))}
                </div>
                <div className="two-col">
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>AI Property Assistant</div>
                    <div className="chat-wrap">
                      <div className="chat-header"><div className="chat-dot" />Arnold AI · Online 24/7</div>
                      <div className="chat-messages">
                        {chatMessages.map((m, i) => (
                          <div key={i} className={`chat-msg ${m.role}`}>
                            <div className={`chat-avatar ${m.role}`}>{m.role === 'ai' ? 'A' : '👤'}</div>
                            <div className={`chat-bubble ${m.role}`}>{m.text}</div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="chat-msg ai">
                            <div className="chat-avatar ai">A</div>
                            <div className="chat-bubble ai" style={{ color: 'rgba(255,255,255,0.4)' }}>Thinking…</div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 16px', background: 'rgba(0,0,0,0.1)' }}>
                        {['What are transfer fees?', 'Freehold vs leasehold?', 'Best golf area?'].map(q => (
                          <div key={q} className="chip" style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                            onClick={() => setChatInput(q)}>{q}</div>
                        ))}
                      </div>
                      <div className="chat-input-row">
                        <input className="chat-input" placeholder="Ask about properties, Thai law, fees..." value={chatInput}
                          onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
                        <button className="chat-send" onClick={sendChat}>➤</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Book a Viewing</div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 16, border: '1px solid rgba(201,168,76,0.15)' }}>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 12 }}>Select your preferred slot:</div>
                      <div className="booking-slots">
                        {viewingSlots.map((s, i) => (
                          <button key={i} className={`slot ${bookedSlot === i ? 'booked' : ''}`} onClick={() => setBookedSlot(i)}>
                            <div className="slot-day">{s.day}</div>
                            <div className="slot-time">{s.time}</div>
                          </button>
                        ))}
                      </div>
                      {bookedSlot !== null && (
                        <div style={{ marginTop: 14, background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold)', borderRadius: 8, padding: 12, color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
                          ✅ Confirmed: {viewingSlots[bookedSlot].day} at {viewingSlots[bookedSlot].time}
                          <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Confirmation sent to your email. Agent will call to confirm.</div>
                        </div>
                      )}
                      <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Resources</div>
                        {['📄 Buying Property in Thailand as a Foreigner →', '🗺️ Hua Hin Neighbourhood Guide →', '💰 Transfer Fees & Tax Calculator →'].map(r => (
                          <div key={r} style={{ color: 'var(--gold)', fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>{r}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — CRM */}
        {activeTab === 4 && (
          <div>
            <div className="section-title">🧠 CRM Intelligence Engine</div>
            <div className="section-sub">Every buyer interaction is captured and enriched automatically. Agents see intent-scored leads, personalisation hooks, and full history at a glance.</div>
            <div className="card">
              <div className="card-title">📊 Lead Pipeline</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead><tr><th>Buyer</th><th>Status</th><th>Score</th><th>Last Contact</th><th>Preference</th><th>Agent Note</th></tr></thead>
                  <tbody>
                    {crmLeads.map((l, i) => (
                      <tr key={i}>
                        <td><div style={{ fontWeight: 600 }}>{l.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.email}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.nat}</div></td>
                        <td><span className={`status-badge ${statusClass(l.status)}`}>{l.status}</span></td>
                        <td><span className={`score-pill ${scorePillClass(l.score)}`}>{l.score}/100</span><div className="score-bar-track" style={{ marginTop: 6, width: 80, height: 5 }}><div className="score-bar-fill" style={{ width: `${l.score}%`, background: scoreColor(l.score) }} /></div></td>
                        <td>{l.last}</td>
                        <td style={{ maxWidth: 160, fontSize: 12 }}>{l.pref}</td>
                        <td style={{ maxWidth: 180, fontSize: 12, color: 'var(--muted)' }}>{l.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔍 Deep Profile — Janet Thompson (Returning Buyer)</div>
              <div className="two-col">
                <div>
                  <div className="crm-banner" style={{ marginBottom: 16 }}>
                    <div className="crm-avatar">J</div>
                    <div>
                      <div className="crm-name">Janet Thompson</div>
                      <span className="crm-tag">British</span><span className="crm-tag">Returning</span><span className="crm-tag">75/100</span>
                      <div className="crm-note">Husband retired + golf detected. Daughter UK context retained from 2022. AI response referenced both naturally.</div>
                    </div>
                  </div>
                  <div className="intent-grid">
                    {[['First Contact', 'March 2022'], ['Re-engaged', 'Today'], ['Budget', '฿15M'], ['Focus Area', 'Black Mountain']].map(([l, v]) => (
                      <div key={l} className="intent-item"><div className="intent-label">{l}</div><div className="intent-value">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)', marginBottom: 12 }}>📅 Interaction Timeline</div>
                  <div className="timeline">
                    {MOCK_CRM['janet.thompson@gmail.com'].history.map((h, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div><div className="timeline-date">{h.date} · {h.type}</div><div className="timeline-note">{h.note}</div></div>
                      </div>
                    ))}
                    <div className="timeline-item">
                      <div className="timeline-dot" style={{ background: '#22c55e' }} />
                      <div>
                        <div className="timeline-date">Today · email</div>
                        <div className="timeline-note" style={{ color: 'var(--green)', fontWeight: 600 }}>Re-engaged — golf properties. AI response sent in ~90 seconds referencing 2022 history and husband's golf.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">⚙️ Auto-Enrichment Rules Active</div>
              <div className="intent-grid">
                {[['🏌️ Life Event Detected', 'Husband retired + golf → preference updated'], ['📍 Location Retained', 'Black Mountain from 2022 history'], ['💰 Budget Consistent', '฿15M matches 2022 record'], ['🎯 Score Upgraded', '45 → 75 on re-engagement'], ['📧 Response Time', '~90 seconds, 24/7'], ['🔁 Re-engagement', 'Paused 90-day cold workflow']].map(([l, v]) => (
                  <div key={l} className="intent-item"><div className="intent-label">{l}</div><div className="intent-value" style={{ fontSize: 12 }}>{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
