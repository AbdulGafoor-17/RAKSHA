import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocketContext } from './context/SocketContext';
import { MissionHeader } from './components/navbar/MissionHeader';
import { LiveCrisisTicker } from './components/navbar/LiveCrisisTicker';
import { LandingPage } from './pages/LandingPage';
import { TacticalMap } from './components/map/TacticalMap';
import { EvacuationRouteCard } from './components/citizen/EvacuationRouteCard';
import { EvacuationGuidanceStepper } from './components/citizen/EvacuationGuidanceStepper';
import { EmergencyHotlinesModal } from './components/citizen/EmergencyHotlinesModal';
import { GoBagChecklistModal } from './components/citizen/GoBagChecklistModal';
import { ReportHazardModal } from './components/citizen/ReportHazardModal';
import { IncidentFilterTable } from './components/authority/IncidentFilterTable';
import { EmergencyBroadcastModal } from './components/authority/EmergencyBroadcastModal';
import { SituationReportModal } from './components/authority/SituationReportModal';
import { ShelterCapacityControl } from './components/shelter/ShelterCapacityControl';
import { DisasterSimulatorModal } from './components/simulation/DisasterSimulatorModal';
import { Button } from './components/common/Button';
import { StatCard } from './components/common/StatCard';
import { Badge } from './components/common/Badge';
import { api } from './services/api';
import type { Report, Shelter, RouteData, UserRole, ReportStatus } from './types';
import {
  Navigation,
  AlertTriangle,
  Radio,
  Building,
  Activity,
  Flame,
  RotateCw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  PackageCheck,
  FileText
} from 'lucide-react';

type ViewMode = 'landing' | 'citizen' | 'authority' | 'shelter' | 'auth';

function MainLayout() {
  const { user, role, switchRole } = useAuth();
  const {
    rerouteAlert,
    startEvacuationTracking,
    stopEvacuationTracking
  } = useSocketContext();

  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [reports, setReports] = useState<Report[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [highlightHazardId, setHighlightHazardId] = useState<string | undefined>(undefined);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isReportingMode, setIsReportingMode] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<[number, number]>([-122.4150, 37.7750]);
  const [showGuidance, setShowGuidance] = useState(true);

  // Global Modals State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isHotlinesOpen, setIsHotlinesOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isSitrepOpen, setIsSitrepOpen] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Citizen default GPS location (San Francisco Civic Center Corridor)
  const citizenLocation: [number, number] = [-122.4180, 37.7735];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [reportsData, sheltersData] = await Promise.all([
        api.getReports(),
        api.getShelters()
      ]);
      setReports(reportsData);
      setShelters(sheltersData);
      if (sheltersData.length > 0 && !selectedShelter) {
        setSelectedShelter(sheltersData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [selectedShelter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle dynamic route update pushed from WebSocket
  useEffect(() => {
    if (rerouteAlert && rerouteAlert.newRoute) {
      setActiveRoute(rerouteAlert.newRoute);
    }
  }, [rerouteAlert]);

  // Calculate Evacuation Route
  const handleCalculateRoute = async (targetShelterId?: string) => {
    setIsCalculatingRoute(true);
    try {
      const routeRes = await api.calculateRoute(citizenLocation, targetShelterId);
      setActiveRoute(routeRes);

      const destShelter =
        shelters.find((s) => (s.id || s._id) === targetShelterId) ||
        shelters[0];

      if (destShelter) {
        setSelectedShelter(destShelter);
      }

      // Register session with WebSocket for autonomous hazard reroute detection
      startEvacuationTracking({
        userId: user?.id || 'citizen-demo',
        startCoord: citizenLocation,
        shelterId: destShelter?.id || destShelter?._id || 'shelter-1',
        shelterCoord: routeRes.destination,
        routeCoords: routeRes.coordinates
      });
    } catch (err: any) {
      console.error('Route calculation failed:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleCancelEvacuation = () => {
    setActiveRoute(null);
    stopEvacuationTracking();
  };

  const handleMapClick = (coords: [number, number]) => {
    if (isReportingMode) {
      setClickedCoords(coords);
      setIsReportModalOpen(true);
      setIsReportingMode(false);
    }
  };

  const handleUpdateReportStatus = async (id: string, status: ReportStatus, dispatchNotes?: string) => {
    try {
      const updated = await api.updateReportStatus(id, status, dispatchNotes);
      setReports((prev) =>
        prev.map((r) => ((r.id || r._id) === id ? updated : r))
      );
    } catch (err) {
      console.error('Error updating report status:', err);
    }
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
  };

  const handleRoleSelectionFromLanding = async (newRole: UserRole) => {
    await switchRole(newRole);
    if (newRole === 'citizen') setCurrentView('citizen');
    else if (newRole === 'authority') setCurrentView('authority');
    else if (newRole === 'shelter_admin') setCurrentView('shelter');
  };

  // Stats for Authority
  const activeHazardsCount = reports.filter(
    (r) => r.type === 'hazard' && r.status !== 'resolved'
  ).length;
  const criticalHazardsCount = reports.filter(
    (r) => r.severity === 'critical' && r.status !== 'resolved'
  ).length;
  const totalBedsAvailable = shelters.reduce(
    (acc, s) => acc + (s.capacityAvailable || 0),
    0
  );
  const totalEvacueesInShelters = shelters.reduce(
    (acc, s) => acc + (s.activeEvacueesCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* 1. TOP MISSION NAVIGATION HEADER */}
      <MissionHeader
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenHotlines={() => setIsHotlinesOpen(true)}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        onOpenSitrep={() => setIsSitrepOpen(true)}
      />

      {/* 2. REAL-TIME CRISIS TICKER & DYNAMIC REROUTING ALERT BANNER */}
      <LiveCrisisTicker />

      {/* 3. MAIN DYNAMIC VIEW CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            onSelectRole={handleRoleSelectionFromLanding}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {/* VIEW 2: CITIZEN EVACUATION PORTAL */}
        {currentView === 'citizen' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col">
            {/* Citizen Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-cyan-500/30 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-display text-white">
                      Citizen Evacuation Navigation Portal
                    </h2>
                    <Badge variant="citizen">GPS ACTIVE</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Position: 37.7735° N, 122.4180° W • Autonomous Intercept Scanner Armed
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChecklistOpen(true)}
                  icon={<PackageCheck className="w-4 h-4 text-cyan-400" />}
                  className="font-mono text-xs"
                >
                  72h Go-Bag
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHotlinesOpen(true)}
                  icon={<PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />}
                  className="font-mono text-xs border-red-500/40 text-red-300 hover:border-red-400"
                >
                  Emergency SOS
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsReportModalOpen(true)}
                  icon={<AlertTriangle className="w-4 h-4" />}
                  className="font-mono text-xs"
                >
                  REPORT OBSTACLE
                </Button>

                {!activeRoute ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCalculateRoute()}
                    loading={isCalculatingRoute}
                    icon={<Navigation className="w-4 h-4" />}
                    className="font-mono text-xs"
                  >
                    ROUTE TO SAFE HAVEN
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEvacuation}
                    className="font-mono text-xs text-slate-400 hover:text-white"
                  >
                    CANCEL NAVIGATION
                  </Button>
                )}
              </div>
            </div>

            {/* Grid Layout: Map & Interactive Route Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[580px]">
              {/* Tactical Map (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col min-h-[460px]">
                <TacticalMap
                  reports={reports}
                  shelters={shelters}
                  userLocation={citizenLocation}
                  activeRoute={activeRoute}
                  onSelectShelter={(shelter) => {
                    setSelectedShelter(shelter);
                    handleCalculateRoute(shelter.id || shelter._id);
                  }}
                  onSelectHazard={(hazard) => setHighlightHazardId(hazard.id || hazard._id)}
                  onMapClick={handleMapClick}
                  isReportingMode={isReportingMode}
                  highlightHazardId={highlightHazardId}
                />
              </div>

              {/* Sidebar Info & Active Route Controls (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Active Route Card */}
                {activeRoute ? (
                  <>
                    <EvacuationRouteCard
                      route={activeRoute}
                      shelter={selectedShelter}
                      allShelters={shelters}
                      onSelectShelter={(s) => {
                        setSelectedShelter(s);
                        handleCalculateRoute(s.id || s._id);
                      }}
                      onCancelEvacuation={handleCancelEvacuation}
                      onToggleGuidance={() => setShowGuidance(!showGuidance)}
                      showGuidance={showGuidance}
                    />

                    {/* Turn-by-Turn Waypoint Guidance Stepper */}
                    {showGuidance && (
                      <EvacuationGuidanceStepper
                        route={activeRoute}
                        shelter={selectedShelter}
                      />
                    )}
                  </>
                ) : (
                  /* Route Request Prompt */
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-bold font-display text-white text-base">
                        Autonomous Evacuation Routing
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      RAKSHA continuously scans street sectors for flash floods, structural collapse,
                      and road blockages, instantly calculating detours in real time.
                    </p>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleCalculateRoute()}
                      loading={isCalculatingRoute}
                      icon={<Navigation className="w-4 h-4" />}
                      className="w-full font-mono text-xs"
                    >
                      CALCULATE ESCAPE CORRIDOR
                    </Button>
                  </div>
                )}

                {/* Nearest Regional Shelters List */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      REGIONAL SAFE HAVENS ({shelters.length})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {totalBedsAvailable} TOTAL BEDS
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {shelters.map((shelter) => (
                      <div
                        key={shelter.id || shelter._id}
                        onClick={() => {
                          setSelectedShelter(shelter);
                          handleCalculateRoute(shelter.id || shelter._id);
                        }}
                        className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                            {shelter.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {shelter.address}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400 block">
                            {shelter.capacityAvailable} Beds
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {shelter.suppliesStatus?.power === 'operational' ? 'Power OK' : 'Gen Backup'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Pin Hazard Button */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-mono mb-2">
                    Encountered an obstacle or water surge on the road?
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportingMode(!isReportingMode)}
                    className={`w-full font-mono text-xs ${
                      isReportingMode ? 'border-red-500 text-red-300 bg-red-950/40' : ''
                    }`}
                  >
                    {isReportingMode ? 'Cancel Map Click Mode' : '📍 Click Map to Pin Obstacle'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AUTHORITY COMMAND CENTER */}
        {currentView === 'authority' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col">
            {/* Top Command Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Incidents"
                value={activeHazardsCount}
                subtitle="Monitored in real time"
                icon={<Activity className="w-5 h-5" />}
                variant="amber"
                trend="+2 in last 10m"
              />
              <StatCard
                title="Critical Obstacles"
                value={criticalHazardsCount}
                subtitle="High-impact route blockades"
                icon={<Flame className="w-5 h-5" />}
                variant="red"
                trend="Triggering reroutes"
              />
              <StatCard
                title="Shelter Bed Surplus"
                value={totalBedsAvailable}
                subtitle="Available across 5 facilities"
                icon={<Building className="w-5 h-5" />}
                variant="green"
                trend="82% capacity margin"
              />
              <StatCard
                title="Evacuees Sheltered"
                value={totalEvacueesInShelters}
                subtitle="Registered citizens"
                icon={<ShieldCheck className="w-5 h-5" />}
                variant="blue"
                trend="All manifests verified"
              />
            </div>

            {/* Authority Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">
                    Metropolitan Emergency Operations Command
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Real-Time Dispatching • Multi-Agency Heatmap • Civil Alert Broadcaster
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSitrepOpen(true)}
                  icon={<FileText className="w-4 h-4 text-cyan-400" />}
                  className="font-mono text-xs"
                >
                  Generate SITREP
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`font-mono text-xs ${showHeatmap ? 'border-amber-400 text-amber-300' : ''}`}
                >
                  {showHeatmap ? 'Disable Heatmap' : 'Enable Danger Heatmap'}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  icon={<Radio className="w-4 h-4" />}
                  className="font-mono text-xs"
                >
                  BROADCAST ALERT
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={fetchData}
                  icon={<RotateCw className="w-4 h-4" />}
                  className="font-mono text-xs"
                >
                  REFRESH GRID
                </Button>
              </div>
            </div>

            {/* Tactical Map for Authority */}
            <div className="h-[430px] rounded-2xl overflow-hidden shadow-2xl">
              <TacticalMap
                reports={reports}
                shelters={shelters}
                userLocation={citizenLocation}
                activeRoute={activeRoute}
                showHeatmap={showHeatmap}
                highlightHazardId={highlightHazardId}
                onSelectHazard={(hazard) => setHighlightHazardId(hazard.id || hazard._id)}
              />
            </div>

            {/* Incident Filter & Triage Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  INCIDENT TRIAGE & UNIT DISPATCH DECK ({reports.length})
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  Instant Response Unit Dispatch & Resolution
                </span>
              </div>
              <IncidentFilterTable
                reports={reports}
                onSelectReport={(r) => setHighlightHazardId(r.id || r._id)}
                onUpdateStatus={handleUpdateReportStatus}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: SHELTER OPERATIONS */}
        {currentView === 'shelter' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col">
            {/* Shelter Header & Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">
                    Shelter Logistics & Evacuee Intake Console
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Real-time bed triage, arriving evacuee manifest admission, and supply telemetry
                  </p>
                </div>
              </div>

              {/* Shelter Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-mono text-slate-400 uppercase mr-1">Facility:</span>
                <select
                  value={selectedShelter?.id || selectedShelter?._id || ''}
                  onChange={(e) => {
                    const target = shelters.find(
                      (s) => (s.id || s._id) === e.target.value
                    );
                    if (target) setSelectedShelter(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 font-bold outline-none"
                >
                  {shelters.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} ({s.capacityAvailable} beds)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Shelter Controls */}
            {selectedShelter && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <ShelterCapacityControl
                    shelter={selectedShelter}
                    onShelterUpdated={(updated) => {
                      setSelectedShelter(updated);
                      setShelters((prev) =>
                        prev.map((s) =>
                          (s.id || s._id) === (updated.id || updated._id)
                            ? updated
                            : s
                        )
                      );
                    }}
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div className="h-[320px] rounded-2xl overflow-hidden shadow-2xl">
                    <TacticalMap
                      reports={reports}
                      shelters={[selectedShelter]}
                      userLocation={selectedShelter.location.coordinates}
                    />
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Facility Manifest & Telemetry Directives
                    </h4>
                    <div className="space-y-1 text-xs text-slate-400 font-mono">
                      <div>Contact Manager: {selectedShelter.contactInfo?.managerName || 'Operations Officer'}</div>
                      <div>Direct Comms: {selectedShelter.contactInfo?.phone || '(415) 555-0199'}</div>
                      <div>Facility Tags: {selectedShelter.tags?.join(', ') || 'Generator, Med Staff, Wheelchair'}</div>
                      <div>Status: 100% Operational • Connected to City Emergency Grid</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: AUTH & ROLE SWITCHER */}
        {currentView === 'auth' && (
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center">
            <div className="w-full glass-panel p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-blue-700 p-0.5 mx-auto mb-4 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                  <div className="w-full h-full bg-[#0d131f] rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-cyan-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">
                  Operator Identity & Role Console
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Active Operator: <span className="text-white font-bold">{user?.name}</span> ({role.toUpperCase()})
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button
                  onClick={async () => {
                    await switchRole('citizen');
                    setCurrentView('citizen');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    role === 'citizen'
                      ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                    ROLE: CITIZEN
                  </span>
                  <h4 className="text-base font-bold text-white font-display">Citizen Evacuee</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                    Hazard reporting, live GPS navigation, turn-by-turn guidance, and autonomous detour routing.
                  </p>
                </button>

                <button
                  onClick={async () => {
                    await switchRole('authority');
                    setCurrentView('authority');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    role === 'authority'
                      ? 'bg-blue-950/80 border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono text-blue-400 font-bold block mb-1">
                    ROLE: COMMAND
                  </span>
                  <h4 className="text-base font-bold text-white font-display">Emergency Authority</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                    Citywide hazard triage, unit dispatching, metropolitan alerts, and military SITREPs.
                  </p>
                </button>

                <button
                  onClick={async () => {
                    await switchRole('shelter_admin');
                    setCurrentView('shelter');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    role === 'shelter_admin'
                      ? 'bg-emerald-950/80 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">
                    ROLE: SHELTER OPS
                  </span>
                  <h4 className="text-base font-bold text-white font-display">Shelter Admin</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                    Live bed capacity slider, citizen admission intake, and emergency supply requisition.
                  </p>
                </button>
              </div>

              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentView('landing')}
                  className="font-mono text-xs"
                >
                  Return to Overview
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. GLOBAL POPUP MODALS */}
      {/* Hazard Report Modal */}
      <ReportHazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultCoords={clickedCoords}
        onReportCreated={fetchData}
      />

      {/* Disaster Simulator Modal */}
      <DisasterSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        activeRoute={activeRoute}
        onHazardInjected={fetchData}
      />

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Emergency Hotlines Modal */}
      <EmergencyHotlinesModal
        isOpen={isHotlinesOpen}
        onClose={() => setIsHotlinesOpen(false)}
      />

      {/* 72h Go-Bag Checklist Modal */}
      <GoBagChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />

      {/* Situation Report Modal */}
      <SituationReportModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        reports={reports}
        shelters={shelters}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainLayout />
      </SocketProvider>
    </AuthProvider>
  );
}
