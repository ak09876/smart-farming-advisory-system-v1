import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  CloudSun,
  BarChart3,
  Tractor,
  ShoppingBag,
  Bell,
  Settings as SettingsIcon,
  Activity,
  ChevronDown,
  MapPin,
  Calendar,
  AlertTriangle,
  Search,
  Droplet,
} from "lucide-react";

// Your existing UI primitives (relative imports for Vite)
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";

// Charts
import {
  ResponsiveContainer,
  ComposedChart as RComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

// --- Mock data --- //
const weather = { city: "Pune, IN", today: 29, hi: 31, lo: 24, rainChance: 40 };
const weekly = [
  { day: "Mon", rain: 8, yield: 14, moisture: 32 },
  { day: "Tue", rain: 12, yield: 15, moisture: 38 },
  { day: "Wed", rain: 5, yield: 16, moisture: 28 },
  { day: "Thu", rain: 9, yield: 18, moisture: 36 },
  { day: "Fri", rain: 2, yield: 17, moisture: 25 },
  { day: "Sat", rain: 3, yield: 19, moisture: 27 },
  { day: "Sun", rain: 6, yield: 20, moisture: 30 },
];

const tasks = [
  { id: 1, title: "Irrigate Plot A (Drip: 45 mins)", due: "Today", priority: "High" },
  { id: 2, title: "Scout pests in Soy Field", due: "Today", priority: "Medium" },
  { id: 3, title: "Refill Urea (50kg)", due: "Tomorrow", priority: "Low" },
];

const orders = [
  { id: "ORD-1042", item: "Tomatoes (Grade A)", qty: 120, price: "₹18,600", status: "Packed" },
  { id: "ORD-1041", item: "Onion (Red)", qty: 300, price: "₹27,000", status: "In Transit" },
  { id: "ORD-1039", item: "Okra (Lady Finger)", qty: 80, price: "₹9,200", status: "Delivered" },
];

const irrigations = [
  { id: "IRR-208", plot: "Plot A • Drip", crop: "Tomato", startedAt: "Today 16:40 IST", duration: "45 min", flow: "28 L/min", status: "Running" },
  { id: "IRR-207", plot: "Plot B • Sprinkler", crop: "Soy", startedAt: "Today 06:15 IST", duration: "30 min", flow: "40 L/min", status: "Completed" },
  { id: "IRR-206", plot: "Plot C • Flood", crop: "Sugarcane", startedAt: "Yesterday 18:50 IST", duration: "60 min", flow: "—", status: "Completed" },
];

const alerts = [
  { id: 1, type: "Weather", msg: "Rain expected tonight. Delay pesticide spray.", icon: <CloudSun className="h-4 w-4" /> },
  { id: 2, type: "Soil", msg: "Soil moisture low in Plot B (22%).", icon: <Activity className="h-4 w-4" /> },
  { id: 3, type: "Market", msg: "Tomato prices trending +6% week-over-week.", icon: <BarChart3 className="h-4 w-4" /> },
];

// Crop groups (short version here; extend as needed)
const cropGroups = [
  { name: "Cereals & Millets", items: ["Rice","Wheat","Maize (Corn)","Barley","Sorghum (Jowar)","Pearl Millet (Bajra)","Finger Millet (Ragi)"] },
  { name: "Vegetables", items: ["Potato","Onion","Tomato","Brinjal (Eggplant)","Okra (Lady's Finger)","Cabbage","Cauliflower"] },
  { name: "Fibres", items: ["Cotton","Jute","Mesta (Kenaf)","Sunn Hemp"] },
  { name: "Oil Crops", items: ["Groundnut (Peanut)","Rapeseed–Mustard","Soybean","Sunflower","Sesame (Til)"] },
  { name: "Pulses", items: ["Chickpea (Gram)","Pigeonpea (Tur/Arhar)","Mung Bean (Green Gram)","Urad Bean (Black Gram)","Lentil (Masur)"] },
  { name: "Spices", items: ["Black Pepper","Chilli","Turmeric","Coriander","Cumin","Fennel"] },
  { name: "Fruits", items: ["Mango","Banana","Citrus","Apple","Grapes","Guava","Pomegranate"] },
  { name: "Plantation", items: ["Tea","Coffee","Rubber","Coconut","Arecanut","Cocoa","Cashew","Oil Palm"] },
  { name: "Dryfruits & Nuts", items: ["Almond","Walnut","Cashew","Pistachio","Raisins","Dates"] },
  { name: "Others (India)", items: ["Guar Seed","Betel Leaf (Paan)","Tobacco","Psyllium (Isabgol)","Sugarcane"] },
];

const indiaStates = [
  "All India",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"
];

const cropSeasonMap = {
  "Rice": ["Kharif", "Rabi", "Zaid"],
  "Wheat": ["Rabi"],
  "Maize (Corn)": ["Kharif", "Rabi"],
  "Cotton": ["Kharif"],
  "Groundnut (Peanut)": ["Kharif"],
  "Rapeseed–Mustard": ["Rabi"],
  "Soybean": ["Kharif"],
  "Chickpea (Gram)": ["Rabi"],
  "Pigeonpea (Tur/Arhar)": ["Kharif"],
  "Onion": ["Kharif", "Rabi", "Zaid"],
  "Potato": ["Rabi"],
  "Tomato": ["Kharif", "Rabi"],
};

const cropStateMap = {
  "Rice": ["Punjab","Haryana","Uttar Pradesh","Bihar","West Bengal","Odisha","Chhattisgarh","Andhra Pradesh","Telangana","Tamil Nadu","Assam","Maharashtra"],
  "Wheat": ["Punjab","Haryana","Uttar Pradesh","Rajasthan","Madhya Pradesh","Bihar"],
  "Cotton": ["Maharashtra","Gujarat","Telangana","Andhra Pradesh","Punjab","Haryana","Rajasthan"],
  "Soybean": ["Madhya Pradesh","Maharashtra","Rajasthan"],
  "Groundnut (Peanut)": ["Gujarat","Andhra Pradesh","Karnataka","Tamil Nadu","Telangana"],
  "Tomato": ["Andhra Pradesh","Karnataka","Maharashtra","Odisha","West Bengal","Bihar","Uttar Pradesh","Gujarat"]
};

const cropProfilesSeed = {
  "Rice": {
    agronomy: "Warm-season cereal; prefers puddled fields. Optimum temp 20–35°C. Common practices: nursery raising, puddling, transplanting, 2–3 split N doses.",
    sowing: [
      { state: "Punjab/Haryana", season: "Kharif", window: "Jun–Jul (transplant)" },
      { state: "Tamil Nadu", season: "Rabi", window: "Oct–Nov (Samba)" },
      { state: "Odisha/WB", season: "Kharif", window: "Jun–Jul" },
    ],
  },
  "Wheat": {
    agronomy: "Cool-season cereal; ideal temp 15–25°C. Sown on conserved moisture; timely irrigation at CRI, booting, flowering.",
    sowing: [ { state: "Punjab/Haryana/UP", season: "Rabi", window: "Nov–Dec" } ],
  },
  "Tomato": {
    agronomy: "Requires well-drained soils; staking and pruning improve yields. Balanced NPK with Ca/B to prevent BER.",
    sowing: [
      { state: "AP/Karnataka", season: "Kharif", window: "Jun–Aug (transplant)" },
      { state: "Maharashtra", season: "Rabi", window: "Oct–Nov" },
    ],
  },
};

function StatCard({ icon, label, value, sub }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function AnimatedBackground() {
  const blobs = useMemo(() => ([
    { id: 'saffron', size: 520, style: { top: '-10%', left: '-8%', background: 'radial-gradient(closest-side, rgba(255,153,51,0.40), rgba(255,153,51,0))' }, initial: { x: 0, y: 0 }, animate: { x: [0, 140, -100, 60, 0], y: [0, 120, -80, 40, 0] }, duration: 65 },
    { id: 'white', size: 640, style: { top: '30%', left: '20%', background: 'radial-gradient(closest-side, rgba(255,255,255,0.50), rgba(255,255,255,0))' }, initial: { x: 0, y: 0 }, animate: { x: [0, -120, 80, -40, 0], y: [0, 60, -50, 80, 0] }, duration: 80 },
    { id: 'green', size: 560, style: { bottom: '-12%', right: '-6%', background: 'radial-gradient(closest-side, rgba(19,136,8,0.35), rgba(19,136,8,0))' }, initial: { x: 0, y: 0 }, animate: { x: [0, -160, 90, -60, 0], y: [0, -100, 60, -40, 0] }, duration: 70 },
  ]), []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((b) => (
        <motion.div
          key={b.id}
          initial={b.initial}
          animate={b.animate}
          transition={{ duration: b.duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          style={{ ...b.style, width: b.size, height: b.size }}
          className="absolute blur-3xl rounded-full mix-blend-multiply"
        />
      ))}
    </div>
  );
}

function CropDrawer({ open, onClose, cropName, stateFilter, profile }) {
  const name = cropName || "";
  const agmarknetUrl = name ? `https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity=${encodeURIComponent(name)}` : undefined;
  const mspUrl = "https://cacp.dacnet.gov.in/";
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name || "Crop"}</h3>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        <p className="text-sm text-muted-foreground">Quick profile: agronomy, sowing windows, market links.</p>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Agronomy</div>
            <p>{profile?.agronomy || "Details coming soon. Toggle Live data once backend is ready."}</p>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Sowing Windows {stateFilter && stateFilter !== 'All India' ? `• ${stateFilter}` : ''}</div>
            <div className="rounded-lg border p-3">
              {(profile?.sowing?.length ? profile.sowing : [{ state: "All India", season: "Kharif", window: "Jun–Jul" }]).map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b last:border-b-0">
                  <span>{row.state}</span>
                  <span className="text-muted-foreground">{row.season} • {row.window}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Market</div>
            <div className="flex gap-3">
              {agmarknetUrl && (
                <a target="_blank" rel="noreferrer" className="underline" href={agmarknetUrl}>Agmarknet prices</a>
              )}
              <a target="_blank" rel="noreferrer" className="underline" href={mspUrl}>MSP (official)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarmerPlatform() {
  const [env, setEnv] = useState("develop");
  const [range, setRange] = useState("Last 7 days");

  // Crops tab state
  const [cropSearch, setCropSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all"); // all | Kharif | Rabi | Zaid
  const [stateFilter, setStateFilter] = useState("All India");
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [useLive, setUseLive] = useState(false);
  const [groups, setGroups] = useState(cropGroups);
  const [profile, setProfile] = useState(null);

  const moistureAvg = useMemo(() => {
    const sum = weekly.reduce((a, b) => a + b.moisture, 0);
    return Math.round((sum / weekly.length) * 10) / 10;
  }, []);

  useEffect(() => {
    if (!useLive) return; // For dev API (see below), proxy /api to localhost:4000
    // Example (uncomment when server.js is running and vite proxy is set):
    // fetch('/api/crops/india').then(r => r.json()).then(json => setGroups(json.groups)).catch(()=>{});
  }, [useLive]);

  useEffect(() => {
    if (!useLive || !drawerOpen || !selectedCrop) return;
    // Example (uncomment when server.js is running and vite proxy is set):
    // fetch(`/api/crops/profile?name=${encodeURIComponent(selectedCrop)}&state=${encodeURIComponent(stateFilter)}`)
    //   .then(r => r.json()).then(json => setProfile(json.profile)).catch(()=>{});
  }, [useLive, drawerOpen, selectedCrop, stateFilter]);

  const filteredGroups = useMemo(() => {
    const q = cropSearch.trim().toLowerCase();
    const season = seasonFilter === "all" ? null : seasonFilter;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const matchesQ = !q || item.toLowerCase().includes(q);
          const matchesSeason = !season || (cropSeasonMap[item] ? cropSeasonMap[item].includes(season) : true);
          const matchesState = stateFilter === "All India" || (cropStateMap[item] ? cropStateMap[item].includes(stateFilter) : true);
          return matchesQ && matchesSeason && matchesState;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, cropSearch, seasonFilter, stateFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF9933]/15 via-white to-[#138808]/15">
      <AnimatedBackground />

      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-600 grid place-content-center shadow-sm">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">Farmer Complete</div>
              <div className="text-xs text-muted-foreground -mt-0.5">Unified farm ops & marketplace</div>
            </div>
            <Badge className="ml-3 capitalize" variant="secondary">{env}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="w-72 pl-8" placeholder="Search fields, orders, inputs…" />
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setRange(range === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days')}>
                {range} <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEnv(env === 'develop' ? 'main' : 'develop')}>
              {env}
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white grid place-content-center">3</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="landing" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="landing">Public Landing</TabsTrigger>
            <TabsTrigger value="dashboard">Farmer Dashboard</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
          </TabsList>

          {/* LANDING */}
          <TabsContent value="landing" className="mt-6">
            <section className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-3" variant="secondary">New</Badge>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Plan crops. Monitor fields. Sell produce.
                </h1>
                <p className="mt-3 text-muted-foreground text-base md:text-lg">
                  Farmer Complete brings planning, advisories, inventory, and marketplace together—
                  so you can run a profitable farm from one place.
                </p>
                <div className="mt-5 flex gap-3">
                  <Button size="lg">Get Started</Button>
                  <Button size="lg" variant="outline">View Docs</Button>
                </div>
                <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <div className="font-semibold text-foreground">12k+</div>
                    Acres Managed
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">96%</div>
                    On-time Tasks
                  </div>
                  <div>
                    <div className="font-semibold text-foreground"><span className="tabular-nums">99.9%</span></div>
                    Platform Uptime
                  </div>
                </div>
              </div>

              {/* Mock screenshot */}
              <div>
                <div className="rounded-2xl p-4 bg-white shadow-xl border">
                  <div className="h-6 w-32 rounded-full bg-slate-100 mb-3" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-3">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border" />
                      <div className="h-40 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 border" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-24 rounded-xl bg-slate-100 border" />
                      <div className="h-24 rounded-xl bg-slate-100 border" />
                      <div className="h-24 rounded-xl bg-slate-100 border" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10 grid md:grid-cols-3 gap-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><Tractor className="h-5 w-5" /> Operations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Plan seasons, schedule irrigation, and track inputs across plots.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><CloudSun className="h-5 w-5" /> Advisory</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Weather-aware guidance and pest alerts tailored to your crops.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Marketplace</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Sell harvests directly to buyers and source quality inputs.
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="mt-6">
            {/* Breadcrumb / context */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Farm: Green Acres</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>Season: Kharif 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2"><SettingsIcon className="h-4 w-4" /> Settings</Button>
                <Button size="sm" className="gap-2"><Tractor className="h-4 w-4" /> New Task</Button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard icon={<CloudSun className="h-4 w-4 text-emerald-600" />} label={`Weather • ${weather.city}`} value={`${weather.today}°C`} sub={`H:${weather.hi}°  L:${weather.lo}°  Rain ${weather.rainChance}%`} />
              <StatCard icon={<Activity className="h-4 w-4 text-sky-600" />} label="Soil Moisture (avg)" value={`${moistureAvg}%`} sub="Optimal: 30–45%" />
              <StatCard icon={<BarChart3 className="h-4 w-4 text-indigo-600" />} label="Yield Forecast" value="+7.8%" sub="vs last season" />
              <StatCard icon={<ShoppingBag className="h-4 w-4 text-amber-600" />} label="Active Orders" value="5" sub="2 dispatching today" />
            </div>

            {/* Charts & lists */}
            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Yield vs Rainfall</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weekly} />
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Field Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm mb-1">NDVI (vegetation index)</div>
                      <Progress value={78} />
                    </div>
                    <div>
                      <div className="text-sm mb-1">Pest Risk (lower is better)</div>
                      <Progress value={28} />
                    </div>
                    <div>
                      <div className="text-sm mb-1">Irrigation Completion</div>
                      <Progress value={62} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Today's Tasks</CardTitle>
                  <Button size="sm" variant="outline">View all</Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between rounded-xl border p-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "secondary" : "outline"}>
                            {t.priority}
                          </Badge>
                          <div>
                            <div className="font-medium">{t.title}</div>
                            <div className="text-xs text-muted-foreground">Due: {t.due}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">Complete</Button>
                          <Button size="sm">Start</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-start justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{o.item}</div>
                          <div className="text-xs text-muted-foreground">{o.id} • Qty {o.qty}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{o.price}</div>
                          <Badge className="mt-1" variant="secondary">{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {alerts.map((a) => (
                <Card key={a.id} className="border-amber-200/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" /> Alert · {a.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="mt-0.5">{a.icon}</div>
                    <span>{a.msg}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CROPS */}
          <TabsContent value="crops" className="mt-6">
            <section className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input value={cropSearch} onChange={(e) => setCropSearch(e.target.value)} className="w-64" placeholder="Search crops…" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="h-9 rounded-md border px-2">
                    <option value="all">All seasons</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                  </select>
                  <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="h-9 rounded-md border px-2 w-56">
                    {indiaStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Button size="sm" variant={useLive ? "default" : "outline"} onClick={() => setUseLive((v) => !v)}>
                    {useLive ? "Live data: ON" : "Live data: OFF"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Major and commonly grown crops organized by category. Click a crop to view its profile.</p>
            </section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((g) => (
                <Card key={g.name} className="backdrop-blur supports-[backdrop-filter]:bg-white/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{g.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <Badge key={item} asChild variant="secondary" className="whitespace-nowrap cursor-pointer">
                          <button onClick={() => { setSelectedCrop(item); setProfile(cropProfilesSeed[item] || null); setDrawerOpen(true); }}>{item}</button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <CropDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} cropName={selectedCrop} stateFilter={stateFilter} profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ComposedChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="currentColor" stopOpacity={0.2} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="right" dataKey="rain" name="Rain (mm)" fill="currentColor" opacity={0.35} />
        <Area yAxisId="left" type="monotone" dataKey="yield" name="Yield Index" stroke="currentColor" fillOpacity={1} fill="url(#colorYield)" />
      </RComposedChart>
    </ResponsiveContainer>
  );
}

function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: `${value}%` }} />
    </div>
  );
}