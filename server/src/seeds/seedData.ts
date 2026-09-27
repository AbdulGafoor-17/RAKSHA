import bcrypt from 'bcryptjs';

export const SEED_USERS = [
  {
    name: 'Aarav Patel',
    email: 'citizen@raksha.org',
    password: 'Password123!',
    role: 'citizen' as const,
    location: { type: 'Point' as const, coordinates: [-122.4150, 37.7750] as [number, number] },
    phone: '+1 (555) 392-1084',
    organization: 'Resident'
  },
  {
    name: 'Commander Elena Vance',
    email: 'authority@raksha.org',
    password: 'Password123!',
    role: 'authority' as const,
    location: { type: 'Point' as const, coordinates: [-122.4194, 37.7749] as [number, number] },
    phone: '+1 (555) 911-0022',
    organization: 'Unified Disaster Management Agency (UDMA)'
  },
  {
    name: 'Marcus Brody',
    email: 'shelter@raksha.org',
    password: 'Password123!',
    role: 'shelter_admin' as const,
    location: { type: 'Point' as const, coordinates: [-122.4167, 37.7793] as [number, number] },
    phone: '+1 (555) 441-8920',
    organization: 'Civic Center Red Cross Triage Depot'
  }
];

export const SEED_SHELTERS = [
  {
    id: 'shelter-1',
    name: 'Civic Center Central Safe Haven',
    location: { type: 'Point' as const, coordinates: [-122.4167, 37.7793] as [number, number] },
    address: '99 Grove St, Civic Center, CA 94102',
    capacityTotal: 600,
    capacityAvailable: 412,
    suppliesStatus: {
      medical: 'ample' as const,
      food: 'ample' as const,
      water: 'ample' as const,
      power: 'operational' as const,
      bedding: 'ample' as const
    },
    contactInfo: {
      phone: '+1 (555) 902-1200',
      email: 'civic.haven@raksha.org',
      managerName: 'Marcus Brody'
    },
    isOpen: true,
    tags: ['Trauma Center', 'Generator Power', 'Wheelchair Access', 'Cots & Blankets'],
    activeEvacueesCount: 188
  },
  {
    id: 'shelter-2',
    name: 'Moscone Emergency Relief Pavilion',
    location: { type: 'Point' as const, coordinates: [-122.4018, 37.7842] as [number, number] },
    address: '747 Howard St, SoMa, CA 94103',
    capacityTotal: 1200,
    capacityAvailable: 780,
    suppliesStatus: {
      medical: 'ample' as const,
      food: 'moderate' as const,
      water: 'ample' as const,
      power: 'operational' as const,
      bedding: 'moderate' as const
    },
    contactInfo: {
      phone: '+1 (555) 902-1201',
      email: 'moscone.shelter@raksha.org',
      managerName: 'Sarah Lin'
    },
    isOpen: true,
    tags: ['Mega Shelter', 'Food Distribution', 'Pet Friendly', 'Pediatric Unit'],
    activeEvacueesCount: 420
  },
  {
    id: 'shelter-3',
    name: 'Presidio Highland Fort Relief Center',
    location: { type: 'Point' as const, coordinates: [-122.4662, 37.7989] as [number, number] },
    address: '210 Lincoln Blvd, Presidio, CA 94129',
    capacityTotal: 450,
    capacityAvailable: 310,
    suppliesStatus: {
      medical: 'ample' as const,
      food: 'ample' as const,
      water: 'ample' as const,
      power: 'generator' as const,
      bedding: 'ample' as const
    },
    contactInfo: {
      phone: '+1 (555) 902-1202',
      email: 'presidio.fort@raksha.org',
      managerName: 'Capt. David Ross'
    },
    isOpen: true,
    tags: ['High Elevation (Flood Safe)', 'Helipad Evacuation', 'Emergency Surgical'],
    activeEvacueesCount: 140
  },
  {
    id: 'shelter-4',
    name: 'Mission Cultural Sanctuary & Shelter',
    location: { type: 'Point' as const, coordinates: [-122.4180, 37.7599] as [number, number] },
    address: '2868 Mission St, Mission District, CA 94110',
    capacityTotal: 300,
    capacityAvailable: 64,
    suppliesStatus: {
      medical: 'moderate' as const,
      food: 'critical' as const,
      water: 'moderate' as const,
      power: 'operational' as const,
      bedding: 'critical' as const
    },
    contactInfo: {
      phone: '+1 (555) 902-1203',
      email: 'mission.sanctuary@raksha.org',
      managerName: 'Rosa Martinez'
    },
    isOpen: true,
    tags: ['Multilingual Staff', 'Community Kitchen', 'Child Care Hub'],
    activeEvacueesCount: 236
  },
  {
    id: 'shelter-5',
    name: 'Pier 27 Maritime Rapid Evac Dock',
    location: { type: 'Point' as const, coordinates: [-122.4022, 37.8024] as [number, number] },
    address: 'The Embarcadero Pier 27, CA 94111',
    capacityTotal: 500,
    capacityAvailable: 380,
    suppliesStatus: {
      medical: 'ample' as const,
      food: 'ample' as const,
      water: 'ample' as const,
      power: 'generator' as const,
      bedding: 'ample' as const
    },
    contactInfo: {
      phone: '+1 (555) 902-1204',
      email: 'pier27.maritime@raksha.org',
      managerName: 'Harbor Master Jenkins'
    },
    isOpen: true,
    tags: ['Waterborne Ferry Evacuation', 'Water Desalination Hub', 'Logistics Depot'],
    activeEvacueesCount: 120
  }
];

export const SEED_REPORTS = [
  {
    id: 'report-1',
    type: 'hazard' as const,
    hazardCategory: 'flood',
    title: 'Severe Flash Inundation & Culvert Burst',
    description: 'Rapidly rising water over 3.5 ft deep. Submerged vehicles and blocked intersection. High current toward south.',
    location: { type: 'Point' as const, coordinates: [-122.4105, 37.7815] as [number, number] },
    address: 'Market St & 6th St, Downtown corridor',
    severity: 'critical' as const,
    impactRadiusMeters: 220,
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'citizen-001', name: 'James Wilson', role: 'citizen' },
    verified: true,
    dispatchNotes: 'Rescue Boat Unit 4 deployed to evacuate ground floor storefronts.'
  },
  {
    id: 'report-2',
    type: 'hazard' as const,
    hazardCategory: 'fire',
    title: 'Electrical Substation Explosion & Toxic Gas Plume',
    description: 'Heavy chemical smoke blowing northeast. Ongoing localized fires with active power grid arcs.',
    location: { type: 'Point' as const, coordinates: [-122.3995, 37.7890] as [number, number] },
    address: 'Howard St & 1st St',
    severity: 'high' as const,
    impactRadiusMeters: 250,
    status: 'dispatched' as const,
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'auth-002', name: 'Hazard Patrol Bravo', role: 'authority' },
    verified: true,
    dispatchNotes: 'Hazmat Engine 12 on scene. Air quality monitoring active.'
  },
  {
    id: 'report-3',
    type: 'hazard' as const,
    hazardCategory: 'road_blocked',
    title: 'Flyover Structural Crack & Fallen Debris',
    description: 'Concrete chunks fallen onto northbound lanes. Police barricades placed. Complete highway closure.',
    location: { type: 'Point' as const, coordinates: [-122.4080, 37.7680] as [number, number] },
    address: 'Hwy 101 / Central Freeway Overpass',
    severity: 'critical' as const,
    impactRadiusMeters: 180,
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'citizen-003', name: 'Priya Sharma', role: 'citizen' },
    verified: true,
    dispatchNotes: 'Structural engineers dispatched to evaluate beam integrity.'
  },
  {
    id: 'report-4',
    type: 'hazard' as const,
    hazardCategory: 'other',
    title: 'Downed High-Voltage Transformers',
    description: 'Transformer sparked and collapsed across sidewalk. Sparks visible during rain showers.',
    location: { type: 'Point' as const, coordinates: [-122.4215, 37.7645] as [number, number] },
    address: 'Valencia St & 18th St',
    severity: 'medium' as const,
    impactRadiusMeters: 100,
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'citizen-004', name: 'Carlos Mendez', role: 'citizen' },
    verified: false,
    dispatchNotes: 'Power utility notified for line shutoff.'
  },
  {
    id: 'report-5',
    type: 'need' as const,
    hazardCategory: 'medical',
    title: 'Senior Living Center - Emergency Dialysis Power Outage',
    description: '14 patients requiring continuous dialysis and oxygen concentrators. Backup generator running out of fuel in 45 minutes.',
    location: { type: 'Point' as const, coordinates: [-122.4140, 37.7720] as [number, number] },
    address: 'Mission Elderly Care Facility, 11th St',
    severity: 'critical' as const,
    impactRadiusMeters: 50,
    status: 'dispatched' as const,
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'citizen-005', name: 'Nurse Sarah Jenkins', role: 'citizen' },
    verified: true,
    dispatchNotes: 'Ambulance Unit 9 & Mobile Diesel Generator Unit en route.'
  },
  {
    id: 'report-6',
    type: 'need' as const,
    hazardCategory: 'water_food',
    title: 'Family of 5 Trapped on Upper Porch by Rising Water',
    description: 'Ground floor flooded. Two young children and an infant. No dry drinking water or baby formula remaining.',
    location: { type: 'Point' as const, coordinates: [-122.4050, 37.7760] as [number, number] },
    address: 'Folsom St & 8th St',
    severity: 'high' as const,
    impactRadiusMeters: 60,
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    reportedBy: { id: 'citizen-006', name: 'David Cho', role: 'citizen' },
    verified: true,
    dispatchNotes: 'Queued for Zodiac rescue boat dispatch.'
  }
];
