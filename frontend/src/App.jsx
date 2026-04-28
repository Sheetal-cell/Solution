import { useState, useEffect } from "react";
import logo from "./assets/image.png";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import {
  Truck,
  MapPin,
  AlertTriangle,
  Route,
  BarChart3,
  ShieldCheck,
  CloudRain,
  Navigation,
  PackageCheck,
  Zap,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Clock,
  Gauge,
  Activity,
  Layers,
  Cpu,
  TriangleAlert,
  CheckCircle,
  ChevronRight,
  Home,
  Map,
  BrainCircuit,
  Bell,
  CloudSun,
  Star,
  TrendingUp,
} from "lucide-react";
import { analyzeShipment } from "./api";
import "./App.css";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEMO_SHIPMENTS = [
  {
    id: "SC-2026-001",
    source: "Kolkata",
    destination: "Delhi",
    cargo: "Electronics",
    priority: "High",
  },
  {
    id: "SC-2026-002",
    source: "Mumbai",
    destination: "Bengaluru",
    cargo: "Medicines",
    priority: "Critical",
  },
  {
    id: "SC-2026-003",
    source: "Chennai",
    destination: "Hyderabad",
    cargo: "Food Supplies",
    priority: "Medium",
  },
];

const PAGES = [
  { id: "home", label: "Home", icon: <Home size={15} /> },
  { id: "analyze", label: "Analyze", icon: <Activity size={15} /> },
  { id: "map", label: "Route Map", icon: <Map size={15} /> },
  { id: "ai", label: "AI Summary", icon: <BrainCircuit size={15} /> },
  { id: "alerts", label: "Alerts", icon: <Bell size={15} /> },
  { id: "weather", label: "Weather", icon: <CloudSun size={15} /> },
  { id: "recommendation", label: "Recommendation", icon: <Star size={15} /> },
];

// Simplify coordinates to max N points
function simplifyCoords(coords, maxPoints = 15) {
  if (!coords || coords.length === 0) return [];
  if (coords.length <= maxPoints) return coords;
  const step = Math.floor(coords.length / maxPoints);
  const result = [];
  for (let i = 0; i < coords.length; i += step) {
    result.push(coords[i]);
    if (result.length >= maxPoints) break;
  }
  if (coords[coords.length - 1] !== result[result.length - 1]) {
    result.push(coords[coords.length - 1]);
  }
  return result;
}

// Generate AI summary from result fields (frontend-only, no extra API call needed)
function buildAISummary(result) {
  if (!result) return "";
  const distance = result.routeInfo?.distanceKm
    ? `${result.routeInfo.distanceKm.toFixed(0)} km`
    : "an unknown distance";
  const duration = result.routeInfo?.durationHours
    ? `${result.routeInfo.durationHours.toFixed(1)} hours`
    : "an unknown duration";
  const weatherNote =
    result.weather?.issues?.length > 0
      ? `Weather conditions show ${result.weather.issues.join(", ").toLowerCase()}, which add to the disruption probability.`
      : `Current weather conditions are within acceptable parameters.`;
  return `The shipment from ${result.source} to ${result.destination} is traveling approximately ${distance} with an estimated transit time of ${duration}. The current risk score of ${result.riskScore}/100 (${result.riskLevel}) is driven by the following factors: ${result.reason}. ${weatherNote} Immediate action is recommended: ${result.recommendation} — this is projected to save ${result.etaSaved || "significant time"} in delivery time.`;
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("home");
  const [form, setForm] = useState({
    shipmentId: "SC-2026-001",
    source: "Kolkata",
    destination: "Delhi",
    cargo: "Electronics",
    priority: "High",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function loadDemo(item) {
    setForm({
      shipmentId: item.id,
      source: item.source,
      destination: item.destination,
      cargo: item.cargo,
      priority: item.priority,
    });
    setPage("analyze");
  }

  async function handleAnalyze() {
    if (!form.source || !form.destination) {
      setError("Please provide source and destination.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setAiSummary("");
    try {
      const data = await analyzeShipment(form);
      if (data.error || data.message?.includes("Failed")) {
        throw new Error(data.message || "Analysis failed");
      }
      setResult(data);
      setPage("analyze");
    } catch (err) {
      setError(err.message || "Backend connection failed. Please ensure your server is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateSummary() {
    setAiLoading(true);
    setAiSummary("");
    // Simulate a small delay for UX feel, then build from result fields
    setTimeout(() => {
      setAiSummary(buildAISummary(result));
      setAiLoading(false);
    }, 900);
  }

  const riskBadgeClass =
    result?.riskLevel === "Low"
      ? "risk-badge badge-low"
      : result?.riskLevel === "Medium"
      ? "risk-badge badge-medium"
      : "risk-badge badge-high";

  const simplifiedCurrentRoute = simplifyCoords(result?.currentRoute);
  const simplifiedOptimizedRoute = simplifyCoords(result?.optimizedRoute);
  const mapCenter = simplifiedOptimizedRoute?.[0] ||
    simplifiedCurrentRoute?.[0] || [22.5, 80.5];

  return (
    <>
      {/* Animated background */}
      <div className="bg-canvas">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
      </div>
      <div className="bg-grid" />

      <div className="app">
        {/* ─── NAVBAR ─── */}
        <nav className="navbar">
          <button
            className="logo"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setPage("home")}
          >
            <img
  src={logo}
  alt="NAVYA Routes"
  style={{ height: 28, marginRight: 8 }}
/>
<span style={{ fontWeight: 700 }}>NAVYA Routes</span>
          </button>

          <div className="nav-links">
            {PAGES.map((p) => (
              <button
                key={p.id}
                className={`nav-link ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="cta-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? <span className="spinner" /> : <Zap size={15} />}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </nav>

        {/* ─── HOME PAGE ─── */}
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-tag">
  Google Solution Challenge 2026 · AI for Resilient Logistics
</div>
              <div className="hero-text">
                <div className="hero-tag">
                  AI-Powered Route Intelligence Platform
                </div>
                <h1>
                  Predict disruptions before
                  <br />
                  they impact{" "}
                  <span className="accent">delivery.</span>
                </h1>
                <p className="hero-sub">
                  NAVYA Routes uses real-time geospatial data, weather intelligence,
and AI-driven risk modeling to predict delays, optimize routes,
and ensure resilient logistics operations.
                </p>
                <div className="hero-btns">
                  <button
                    className="btn-primary"
                    onClick={() => setPage("analyze")}
                  >
                    <Activity size={17} />
                    Open Dashboard
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    <Zap size={17} />
                    {loading ? "Analyzing..." : "Quick Analyze"}
                  </button>
                </div>
              </div>

              <div className="hero-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <ShieldCheck size={28} color="var(--green)" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Risk Prediction Engine</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Real-time disruption detection</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
                  Combines geocoding, route optimization, weather intelligence,
and AI-driven predictive analytics to detect disruptions
and recommend optimal logistics decisions in real time.
                </p>
                <div className="hero-stats">
                  <div className="hero-stat">
                    <div className="hero-stat-val">4</div>
                    <div className="hero-stat-label">Live APIs</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-val">RT</div>
                    <div className="hero-stat-label">Real-Time</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-val">AI</div>
                    <div className="hero-stat-label">Powered</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-val">100</div>
                    <div className="hero-stat-label">Risk Scale</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Demo Shipments on home */}
            <div className="section">
              <div className="section-header">
                <div className="section-dot" />
                <h2 className="section-title">Demo Shipments</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {DEMO_SHIPMENTS.map((s) => (
                  <div
                    key={s.id}
                    className="panel"
                    style={{ cursor: "pointer" }}
                    onClick={() => loadDemo(s)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)", fontWeight: 700, marginBottom: 8 }}>
                          {s.id}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                          {s.source} → {s.destination}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{s.cargo}</div>
                      </div>
                      <div className="demo-badge">{s.priority}</div>
                    </div>
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 13, fontWeight: 600 }}>
                      <ChevronRight size={14} />
                      Click to analyze
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── ANALYZE PAGE ─── */}
        {page === "analyze" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">Shipment Analysis Dashboard</h2>
            </div>

            <div className="dashboard-grid">
              {/* LEFT: Form */}
              <div>
                <div className="panel">
                  <div className="panel-title">
                    <Truck size={18} />
                    Shipment Simulator
                  </div>

                  {error && (
                    <div className="error-banner">
                      <TriangleAlert size={16} />
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Shipment ID</label>
                    <input
                      className="form-input"
                      name="shipmentId"
                      value={form.shipmentId}
                      onChange={handleChange}
                      placeholder="e.g. SC-2026-001"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source City</label>
                    <input
                      className="form-input"
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      placeholder="e.g. Kolkata"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination City</label>
                    <input
                      className="form-input"
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder="e.g. Delhi"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cargo Type</label>
                    <input
                      className="form-input"
                      name="cargo"
                      value={form.cargo}
                      onChange={handleChange}
                      placeholder="e.g. Electronics"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <button
                    className="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Analyzing Route...
                      </>
                    ) : (
                      <>
                        <Zap size={17} />
                        Run Risk Analysis
                      </>
                    )}
                  </button>
                </div>

                <div className="panel" style={{ marginTop: 20 }}>
                  <div className="demo-label">Demo Shipments</div>
                  {DEMO_SHIPMENTS.map((item) => (
                    <button
                      key={item.id}
                      className="demo-btn"
                      onClick={() => loadDemo(item)}
                    >
                      <span>
                        <strong style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{item.id}</strong>
                        <br />
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
                          {item.source} → {item.destination}
                        </span>
                      </span>
                      <span className="demo-badge">{item.priority}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: Results */}
              <div className="panel">
                {!result ? (
                  <div className="empty-state">
                    <BarChart3 size={56} />
                    <h3>No shipment analyzed yet</h3>
                    <p>
                      Fill in the form and click Run Risk Analysis to see the
                      full risk breakdown, route optimization, and AI
                      recommendation.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="stats-grid">
                      <StatCard
                        icon={<PackageCheck size={20} />}
                        label="Shipment ID"
                        value={result.shipmentId}
                      />
                      <StatCard
                        icon={<Gauge size={20} />}
                        label="Risk Level"
                        value={result.riskLevel}
                        highlight={true}
                      />
                      <StatCard
                        icon={<Clock size={20} />}
                        label="ETA Saved"
                        value={result.etaSaved || "—"}
                      />
                    </div>

                    {/* Route Info */}
                    {result.routeInfo && (
                      <div className="route-info-bar">
                        <div className="route-info-item">
                          <Route size={16} />
                          <div>
                            <div className="route-info-val">
                              {result.routeInfo.distanceKm?.toFixed(0)} km
                            </div>
                            <div className="route-info-lbl">Total Distance</div>
                          </div>
                        </div>
                        <div className="route-info-item">
                          <Clock size={16} />
                          <div>
                            <div className="route-info-val">
                              {result.routeInfo.durationHours?.toFixed(1)} hrs
                            </div>
                            <div className="route-info-lbl">Est. Duration</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Score */}
                    <div className="risk-panel">
                      <div className="risk-header">
                        <div>
                          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>
                            RISK SCORE
                          </div>
                          <div className="risk-score-big">{result.riskScore}<span style={{ fontSize: 18, color: "var(--muted)" }}>/100</span></div>
                        </div>
                        <span className={riskBadgeClass}>{result.riskLevel}</span>
                      </div>
                      <div className="risk-bar-track">
                        <div
                          className="risk-bar-fill"
                          style={{ width: `${result.riskScore}%` }}
                        />
                      </div>
                      <p className="risk-reason">{result.reason}</p>
                    </div>

                    {/* Recommendation */}
                    <div className="rec-panel">
                      <Navigation size={20} className="rec-icon" />
                      <div>
                        <div className="rec-title">Recommended Action</div>
                        <div className="rec-text">{result.recommendation}</div>
                        {result.etaSaved && (
                          <div className="rec-eta">
                            <TrendingUp size={14} />
                            Save {result.etaSaved}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn-secondary" style={{ fontSize: 13, padding: "9px 16px" }} onClick={() => setPage("map")}>
                        <Map size={14} /> View Route Map
                      </button>
                      <button className="btn-secondary" style={{ fontSize: 13, padding: "9px 16px" }} onClick={() => setPage("alerts")}>
                        <Bell size={14} /> View Alerts
                      </button>
                      <button className="btn-secondary" style={{ fontSize: 13, padding: "9px 16px" }} onClick={() => setPage("ai")}>
                        <BrainCircuit size={14} /> AI Summary
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── MAP PAGE ─── */}
        {page === "map" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">Live Route Optimization Map</h2>
            </div>

            {!result ? (
              <div className="panel">
                <div className="empty-state">
                  <Map size={56} />
                  <h3>No route data available</h3>
                  <p>Run an analysis first to view the route map.</p>
                  <button className="btn-primary" onClick={() => setPage("analyze")}>
                    <Activity size={15} /> Go to Analyze
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <div style={{ width: 24, height: 4, background: "#f43f5e", borderRadius: 2 }} />
                    Current Route
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <div style={{ width: 24, height: 4, background: "var(--green)", borderRadius: 2 }} />
                    Optimized Route
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {result.source} → {result.destination}
                  </div>
                </div>

                <div className="panel" style={{ padding: 8 }}>
                  <div className="map-container">
                    <MapContainer
                      center={mapCenter}
                      zoom={5}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution="© OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {simplifiedCurrentRoute.length > 0 && (
                        <Polyline
                          positions={simplifiedCurrentRoute}
                          pathOptions={{ color: "#f43f5e", weight: 4, opacity: 0.8 }}
                        />
                      )}
                      {simplifiedOptimizedRoute.length > 0 && (
                        <Polyline
                          positions={simplifiedOptimizedRoute}
                          pathOptions={{ color: "#00ff88", weight: 5, opacity: 0.9 }}
                        />
                      )}
                      {simplifiedOptimizedRoute[0] && (
                        <Marker position={simplifiedOptimizedRoute[0]}>
                          <Popup>📍 {result.source} (Origin)</Popup>
                        </Marker>
                      )}
                      {simplifiedOptimizedRoute[simplifiedOptimizedRoute.length - 1] && (
                        <Marker
                          position={simplifiedOptimizedRoute[simplifiedOptimizedRoute.length - 1]}
                        >
                          <Popup>🏁 {result.destination} (Destination)</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>

                {result.routeInfo && (
                  <div className="route-info-bar" style={{ marginTop: 16 }}>
                    <div className="route-info-item">
                      <Route size={16} />
                      <div>
                        <div className="route-info-val">{result.routeInfo.distanceKm?.toFixed(0)} km</div>
                        <div className="route-info-lbl">Route Distance</div>
                      </div>
                    </div>
                    <div className="route-info-item">
                      <Clock size={16} />
                      <div>
                        <div className="route-info-val">{result.routeInfo.durationHours?.toFixed(1)} hrs</div>
                        <div className="route-info-lbl">Est. Travel Time</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── AI SUMMARY PAGE ─── */}
        {page === "ai" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">AI Logistics Summary</h2>
            </div>

            {!result ? (
              <div className="panel">
                <div className="empty-state">
                  <BrainCircuit size={56} />
                  <h3>No analysis to summarize</h3>
                  <p>Run a shipment analysis first.</p>
                  <button className="btn-primary" onClick={() => setPage("analyze")}>
                    <Activity size={15} /> Go to Analyze
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="ai-panel">
                  <div className="ai-header">
                    <div className="ai-dot" />
                    <div className="ai-title">NAVYA ROUTES AI ENGINE</div>
                  </div>

                  {aiSummary ? (
                    <p className="ai-text">{aiSummary}</p>
                  ) : (
                    <p className="ai-text" style={{ color: "var(--muted)" }}>
                      Click "Generate AI Summary" to produce a 3–4 sentence
                      intelligent breakdown of this shipment's risk, route, and
                      recommended action.
                    </p>
                  )}

                  <button
                    className="ai-gen-btn"
                    onClick={handleGenerateSummary}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <span
                          className="spinner"
                          style={{ borderColor: "rgba(34,211,238,0.3)", borderTopColor: "var(--cyan)" }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BrainCircuit size={15} />
                        {aiSummary ? "Regenerate Summary" : "Generate AI Summary"}
                      </>
                    )}
                  </button>
                </div>

                {/* Quick stats below */}
                <div className="divider" />
                <div className="stats-grid" style={{ marginTop: 16 }}>
                  <StatCard icon={<PackageCheck size={20} />} label="Shipment" value={result.shipmentId} />
                  <StatCard icon={<Gauge size={20} />} label="Risk Score" value={`${result.riskScore}/100`} highlight />
                  <StatCard icon={<Clock size={20} />} label="ETA Saved" value={result.etaSaved || "—"} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ALERTS PAGE ─── */}
        {page === "alerts" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">Disruption Alerts</h2>
            </div>

            {!result?.alerts?.length ? (
              <div className="panel">
                <div className="empty-state">
                  <Bell size={56} />
                  <h3>No alerts generated</h3>
                  <p>Run an analysis to see live disruption alerts.</p>
                  <button className="btn-primary" onClick={() => setPage("analyze")}>
                    <Activity size={15} /> Go to Analyze
                  </button>
                </div>
              </div>
            ) : (
              <div className="alerts-grid">
                {result.alerts.map((alert, i) => (
                  <AlertCard key={i} alert={alert} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── WEATHER PAGE ─── */}
        {page === "weather" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">Weather Conditions</h2>
            </div>

            {!result?.weather ? (
              <div className="panel">
                <div className="empty-state">
                  <CloudSun size={56} />
                  <h3>No weather data available</h3>
                  <p>Run an analysis to fetch live weather conditions.</p>
                  <button className="btn-primary" onClick={() => setPage("analyze")}>
                    <Activity size={15} /> Go to Analyze
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="weather-grid">
                  {result.weather.temperature !== undefined && (
                    <WeatherCard
                      icon={<Thermometer size={22} />}
                      value={`${result.weather.temperature}°C`}
                      label="Temperature"
                    />
                  )}
                  {result.weather.windSpeed !== undefined && (
                    <WeatherCard
                      icon={<Wind size={22} />}
                      value={`${result.weather.windSpeed} km/h`}
                      label="Wind Speed"
                    />
                  )}
                  {result.weather.rain !== undefined && (
                    <WeatherCard
                      icon={<CloudRain size={22} />}
                      value={`${result.weather.rain} mm`}
                      label="Rainfall"
                    />
                  )}
                  {result.weather.humidity !== undefined && (
                    <WeatherCard
                      icon={<Activity size={22} />}
                      value={`${result.weather.humidity}%`}
                      label="Humidity"
                    />
                  )}
                </div>

                {result.weather.issues?.length > 0 && (
                  <>
                    <div className="divider" />
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>
                      Active Weather Issues
                    </div>
                    <div className="issues-list">
                      {result.weather.issues.map((issue, i) => (
                        <span key={i} className="issue-chip">{issue}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── RECOMMENDATION PAGE ─── */}
        {page === "recommendation" && (
          <div className="section" style={{ paddingTop: 32 }}>
            <div className="section-header">
              <div className="section-dot" />
              <h2 className="section-title">Route Recommendation</h2>
            </div>

            {!result ? (
              <div className="panel">
                <div className="empty-state">
                  <Navigation size={56} />
                  <h3>No recommendation yet</h3>
                  <p>Run an analysis to get an optimized route recommendation.</p>
                  <button className="btn-primary" onClick={() => setPage("analyze")}>
                    <Activity size={15} /> Go to Analyze
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="rec-panel" style={{ marginBottom: 20 }}>
                  <Navigation size={24} className="rec-icon" />
                  <div>
                    <div className="rec-title">AI Recommendation</div>
                    <div className="rec-text" style={{ fontSize: 16 }}>
                      {result.recommendation}
                    </div>
                    {result.etaSaved && (
                      <div className="rec-eta">
                        <TrendingUp size={14} />
                        Estimated time saved: {result.etaSaved}
                      </div>
                    )}
                  </div>
                </div>

                <div className="stats-grid">
                  <StatCard
                    icon={<MapPin size={20} />}
                    label="Origin"
                    value={result.source}
                  />
                  <StatCard
                    icon={<CheckCircle size={20} />}
                    label="Destination"
                    value={result.destination}
                  />
                  <StatCard
                    icon={<Layers size={20} />}
                    label="Cargo"
                    value={result.cargo || form.cargo}
                  />
                </div>

                {result.routeInfo && (
                  <>
                    <div className="divider" />
                    <div className="route-info-bar">
                      <div className="route-info-item">
                        <Route size={16} />
                        <div>
                          <div className="route-info-val">
                            {result.routeInfo.distanceKm?.toFixed(0)} km
                          </div>
                          <div className="route-info-lbl">Distance</div>
                        </div>
                      </div>
                      <div className="route-info-item">
                        <Clock size={16} />
                        <div>
                          <div className="route-info-val">
                            {result.routeInfo.durationHours?.toFixed(1)} hrs
                          </div>
                          <div className="route-info-lbl">Duration</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ marginTop: 16 }}>
                  <button
                    className="btn-primary"
                    onClick={() => setPage("map")}
                    style={{ fontSize: 14 }}
                  >
                    <Map size={15} /> View on Map
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <footer>
          <div className="footer-logo">
           <img src={logo} alt="NAVYA Routes" style={{ height: 18 }} />
NAVYA Routes
          </div>
          <span>
           Predictive Routing · Real-Time Risk Intelligence · AI-Powered Logistics Optimization
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
            v2.0.0 · 2026
          </span>
        </footer>
      </div>
    </>
  );
}

// ─── HELPER COMPONENTS ───

function StatCard({ icon, label, value, highlight }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={highlight ? { color: "var(--green)" } : {}}
      >
        {value}
      </div>
    </div>
  );
}

function AlertCard({ alert }) {
  const typeClass =
    alert.type === "Weather"
      ? "icon-weather"
      : alert.type === "Traffic"
      ? "icon-traffic"
      : alert.type === "Priority"
      ? "icon-priority"
      : "icon-route";

  const sevClass =
    alert.severity === "High"
      ? "sev-high"
      : alert.severity === "Medium"
      ? "sev-medium"
      : "sev-low";

  return (
    <div className="alert-card">
      <div className={`alert-icon-wrap ${typeClass}`}>
        {alert.type === "Weather" ? (
          <CloudRain size={18} />
        ) : alert.type === "Traffic" ? (
          <AlertTriangle size={18} />
        ) : alert.type === "Priority" ? (
          <Zap size={18} />
        ) : (
          <Route size={18} />
        )}
      </div>
      <div>
        <div className="alert-title">{alert.title}</div>
        <span className={`alert-severity ${sevClass}`}>{alert.severity}</span>
        <p className="alert-msg">{alert.message}</p>
      </div>
    </div>
  );
}

function WeatherCard({ icon, value, label }) {
  return (
    <div className="weather-card">
      <div style={{ color: "var(--cyan)", marginBottom: 10 }}>{icon}</div>
      <div className="weather-val">{value}</div>
      <div className="weather-key">{label}</div>
    </div>
  );
}
