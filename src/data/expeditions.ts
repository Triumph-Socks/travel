/* ============================================================
   AETHERIA EXPEDITIONS — Core Data Architecture
   Schema: ExpeditionPackage / ChapterItinerary / Waypoint /
           CulturalNote / ImageGallery / BookingPricing
   ============================================================ */

export type Terrain = "Highlands" | "Coastal" | "Jungle";
export type Vibe = "Ancient History" | "Adrenaline" | "Eco-Luxury" | "Wildlife";
export type WeatherKind = "sun" | "cloud" | "rain" | "mist" | "wind";

export interface Waypoint {
  id: string;
  name: string;
  /** percentage coordinates on the plate map (0–100) */
  x: number;
  y: number;
  elevation: string;
  weather: { tempC: number; condition: string; kind: WeatherKind };
  photo: string;
  culturalNote: string;
  /** elevation profile sparkline, metres */
  profile: number[];
}

export interface DiaryEntry {
  day: number;
  title: string;
  story: string;
  food?: string;
  lodging?: string;
  elevation?: string;
}

export interface ChapterItinerary {
  numeral: string;
  title: string;
  place: string;
  daysLabel: string;
  narrative: string;
  image: string;
  highlights: string[];
  entries: DiaryEntry[];
}

export interface CulturalNote {
  title: string;
  text: string;
  source: string;
}

export interface GearItem {
  name: string;
  kg: number;
  essential: boolean;
}

export interface ExpeditionFitness {
  level: "Gentle" | "Moderate" | "Demanding";
  elevationGainM: number;
  dailyHours: string;
  note: string;
}

export interface ExpeditionPackage {
  id: string;
  plateNo: string;
  title: string;
  subtitle: string;
  region: string;
  coords: string;
  terrain: Terrain;
  vibes: Vibe[];
  days: number;
  distanceKm: number;
  elevationGain: number;
  price: number;
  parkFee: number;
  rating: number;
  reviews: number;
  bestSeason: string;
  groupMax: number;
  image: string;
  gallery: string[];
  stampText: string;
  fitness: ExpeditionFitness;
  chapters: ChapterItinerary[];
  waypoints: Waypoint[];
  culturalNotes: CulturalNote[];
  gear: GearItem[];
  included: string[];
}

export interface GuideTier {
  id: string;
  name: string;
  detail: string;
  price: number; // flat per booking
}

export interface AddOn {
  id: string;
  name: string;
  detail: string;
  price: number; // per traveller
  image?: string;
  tag: string;
}

export interface Booking {
  ref: string;
  pkgId: string;
  start: string; // ISO date
  end: string;
  nights: number;
  guests: number;
  guide: string;
  addons: string[];
  total: number;
  createdAt: number;
}

/* ---------------- imagery plates ---------------- */

const IMG = {
  sigiriya: "https://image.qwenlm.ai/generated-images/60f9840d-2903-4348-844f-d1ab3ffaa9f4/_result.png",
  ella: "https://image.qwenlm.ai/generated-images/60b750ab-26fb-4ab2-ad29-74c0a09c5ee5/_result.png",
  yala: "https://image.qwenlm.ai/generated-images/f1937d4d-e4e9-43e2-a3b4-e0524ac3e3a7/_result.png",
  galle: "https://image.qwenlm.ai/generated-images/9ffa55d7-57a3-461c-8472-522cba9879e5/_result.png",
  balloon: "https://image.qwenlm.ai/generated-images/7e85bf4f-769d-4920-b8f0-03f426ef5e47/_result.png",
  highlands: "https://image.qwenlm.ai/generated-images/0a912c63-4fa5-48cf-9343-c06c31de8c2d/_result.png",
};

export const PLATE_MAP_TEXTURE =
  "https://image.qwenlm.ai/generated-images/253c378e-4abe-442e-8ca3-47712ffa1ab2/_result.png";

export const GUIDE_TIERS: GuideTier[] = [
  { id: "shared", name: "Shared Naturalist", detail: "A resident naturalist for your party of up to six — the house classic.", price: 0 },
  { id: "private", name: "Private Naturalist", detail: "One guide, one party. Route bent to your pace and curiosities.", price: 180 },
  { id: "master", name: "Master Tracker & Camp Chef", detail: "Our senior tracker plus a chef who cooks the route's folklore.", price: 420 },
];

export const ADDONS: AddOn[] = [
  { id: "balloon", name: "Dawn Balloon over the Reservoir", detail: "Ninety minutes aloft above ancient tank country, champagne on landing.", price: 290, image: IMG.balloon, tag: "Signature" },
  { id: "night", name: "Night Patrol, Block One", detail: "Spotlight safari after dusk, when the leopard walks.", price: 95, tag: "Wild" },
  { id: "rail", name: "Observation Rail Car", detail: "First-class glass-roof carriage on the highland line.", price: 60, tag: "Scenic" },
  { id: "feast", name: "Village Feast & Cooking Ritual", detail: "Clay-pot curries with a grandmother who refuses written recipes.", price: 45, tag: "Table" },
  { id: "ayurveda", name: "Herbal Bath & Ayurveda Hour", detail: "Warm oil, pounded herbs, and a nap you will not apologise for.", price: 55, tag: "Rest" },
];

/* ---------------- the four routes ---------------- */

export const EXPEDITIONS: ExpeditionPackage[] = [
  {
    id: "sigiriya",
    plateNo: "No. I",
    title: "The Ancient Kingdom of Sigiriya",
    subtitle: "Lion rock, mirror walls and the reservoir kingdom of the first engineers",
    region: "Cultural Triangle",
    coords: "07°57′N 80°45′E",
    terrain: "Highlands",
    vibes: ["Ancient History", "Adrenaline"],
    days: 6,
    distanceKm: 84,
    elevationGain: 1240,
    price: 1480,
    parkFee: 112,
    rating: 4.9,
    reviews: 212,
    bestSeason: "Dec — Apr",
    groupMax: 6,
    image: IMG.sigiriya,
    gallery: [IMG.sigiriya, IMG.balloon, IMG.highlands, IMG.ella],
    stampText: "CHARTED 1831",
    fitness: {
      level: "Moderate",
      elevationGainM: 1240,
      dailyHours: "4–6 h on foot",
      note: "The lion's staircase is 1,200 steps of near-vertical intent. Knees should arrive friendly.",
    },
    chapters: [
      {
        numeral: "I",
        title: "The Lion Rock",
        place: "Sigiriya & Pidurangala",
        daysLabel: "Days 1 – 2",
        narrative:
          "In the fifth century, a parricide king built a palace in the sky and dared the world to climb it. You will climb it before the heat does — up frescoes, past the mirror wall's thousand-year graffiti, through the lion's paws and onto a plateau that holds an entire ruined city the size of a football field, suspended on rock.",
        image: IMG.sigiriya,
        highlights: ["Sunrise ascent before the crowds", "Mirror wall graffiti, 1,500 yrs old", "Pidurangala sunset counter-view"],
        entries: [
          { day: 1, title: "Arrival at the foot of the rock", story: "Jeep from Habarana through lemur-quiet forest. Evening climb of Pidurangala for the view *of* Sigiriya, all floodlit stone and bat smoke.", food: "Wood-fired hoppers with seeni sambol", lodging: "Herakles Gardens, jungle-edge pavilions", elevation: "+210 m" },
          { day: 2, title: "The Lion's staircase", story: "05:40 start. Frescoes, mirror wall, sky palace. Breakfast on the summit plateau while the mist burns off the water gardens two hundred metres below.", food: "King coconut on the descent", lodging: "Same pavilions — the pool earns its keep", elevation: "+370 m / −370 m" },
        ],
      },
      {
        numeral: "II",
        title: "Reservoir Kingdom",
        place: "Minneriya & Polonnaruwa",
        daysLabel: "Days 3 – 4",
        narrative:
          "Two thousand years before the modern dam, Sinhalese engineers moved entire rivers with earth and gravity. The tanks still hold. At dusk, three hundred elephants gather on the receding grass of Minneriya — the largest meeting of Asian elephants on earth, and you will sit quietly at its edge.",
        image: IMG.balloon,
        highlights: ["The Gathering — 300+ elephants", "Polonnaruwa by bicycle", "Balloon option at first light"],
        entries: [
          { day: 3, title: "The Gathering at Minneriya", story: "Morning cycle through Polonnaruwa's Buddha avenues; afternoon jeep to the tank as herds arrive in family processions, calves drafted like small grey boats.", food: "Curried jackfruit, buffalo curd & treacle", lodging: "Lakefront cabanas, Kalawewa", elevation: "negligible" },
          { day: 4, title: "A city planned like a mandala", story: "Full morning in Polonnaruwa — the Quadrangle, Gal Vihara's reclining Buddha carved from a single boulder. Optional dawn balloon over the reservoir chain.", food: "Village kitchen lunch with a paddy view", lodging: "Cabanas, second night", elevation: "+60 m" },
        ],
      },
      {
        numeral: "III",
        title: "Painted Caverns",
        place: "Dambulla & the Spice Gardens",
        daysLabel: "Days 5 – 6",
        narrative:
          "Five caves, one overhanging rock, and two millennia of pigment. Dambulla's golden Buddhas were repainted by kings who wanted their devotion to outlast their dynasties — it outlasted everything. Afterward, the spice gardens of Matale smell the way the island's trade history actually felt.",
        image: IMG.highlands,
        highlights: ["153 statues under one rock lip", "Cinnamon peeling, done properly", "Farewell feast by lamplight"],
        entries: [
          { day: 5, title: "Five caves of gold", story: "Dambulla at opening hour, ceiling murals in torch-light softness. Afternoon among cardamom, clove and vanilla vines with the garden's third-generation keeper.", food: "Spice-infused afternoon tea", lodging: "Kandyan-style manor, Matale", elevation: "+160 m" },
          { day: 6, title: "The long table", story: "A slow morning, a longer lunch. The expedition closes with a lamplit Kandyan feast and the presentation of your hand-bound field journal.", food: "Eleven-curry farewell feast", lodging: "Departure — or extend toward Kandy", elevation: "—" },
        ],
      },
    ],
    waypoints: [
      { id: "pidurangala", name: "Pidurangala", x: 45, y: 28.5, elevation: "290 m", weather: { tempC: 31, condition: "Dry & hazy", kind: "sun" }, photo: IMG.sigiriya, culturalNote: "Monks have kept a cave temple here since the 5th century — the climb ends at a reclining Buddha.", profile: [40, 120, 210, 260, 290, 240, 120] },
      { id: "sigiriya", name: "Sigiriya Rock", x: 47.5, y: 31, elevation: "370 m", weather: { tempC: 32, condition: "Still air", kind: "sun" }, photo: IMG.sigiriya, culturalNote: "The sky palace ran on a pumped fountain system that still works after 1,600 years.", profile: [30, 90, 200, 300, 370, 370, 300, 150] },
      { id: "minneriya", name: "Minneriya Tank", x: 53, y: 34, elevation: "92 m", weather: { tempC: 33, condition: "Hot, light wind", kind: "wind" }, photo: IMG.balloon, culturalNote: "Built by King Mahasen in 276 AD — locals still call him 'the great tank builder'.", profile: [90, 92, 95, 92, 90, 93, 92] },
      { id: "polonnaruwa", name: "Polonnaruwa", x: 57.5, y: 37, elevation: "78 m", weather: { tempC: 33, condition: "Bright", kind: "sun" }, photo: IMG.highlands, culturalNote: "The city was laid out as a mandala; the king's swimming pool is still tiled.", profile: [80, 78, 75, 78, 82, 78, 74] },
      { id: "dambulla", name: "Dambulla Caves", x: 46, y: 39.5, elevation: "180 m", weather: { tempC: 30, condition: "Cave-cool", kind: "cloud" }, photo: IMG.ella, culturalNote: "The largest cave temple complex on the island — paint layers span 2,000 years.", profile: [50, 110, 150, 180, 170, 120, 60] },
      { id: "matale", name: "Matale Spice Gardens", x: 45, y: 44, elevation: "320 m", weather: { tempC: 28, condition: "Garden shade", kind: "cloud" }, photo: IMG.highlands, culturalNote: "Matale's cinnamon once perfumed every royal court in Europe.", profile: [200, 240, 290, 320, 300, 260, 230] },
    ],
    culturalNotes: [
      { title: "On kings & clouds", text: "Kashyapa chose the rock because he feared the ground — his father's ghost, he said, walked on flat earth. He ruled eighteen years before the fear caught him anyway.", source: "Culavamsa chronicle, abridged" },
      { title: "The graffiti rule", text: "A thousand years of visitors scratched verses on the mirror wall. The oldest reads: 'I came with my friends and did not write my name — only my wonder.'", source: "Paranavitana translations" },
    ],
    gear: [
      { name: "Broken-in trail shoes", kg: 1.6, essential: true },
      { name: "3 L water + electrolytes", kg: 3.0, essential: true },
      { name: "Wide-brim hat", kg: 0.2, essential: true },
      { name: "Sun shirt (long sleeve)", kg: 0.3, essential: true },
      { name: "Headlamp, red mode", kg: 0.1, essential: true },
      { name: "Light rain shell", kg: 0.4, essential: false },
      { name: "Binoculars 8×42", kg: 0.9, essential: false },
      { name: "Film camera / 35 mm", kg: 0.6, essential: false },
      { name: "Knee sleeves for the descent", kg: 0.2, essential: false },
    ],
    included: ["5 nights in pavilions & cabanas", "All park & monument permits", "Jeep safaris, naturalist aboard", "Meals as noted per chapter", "Hand-bound field journal", "Transfers from Bandaranaike (CMB)"],
  },

  {
    id: "ella",
    plateNo: "No. II",
    title: "Cloud Forests of Ella",
    subtitle: "Nine arches, tea trails and the highland rail line above the clouds",
    region: "Hill Country",
    coords: "06°52′N 81°03′E",
    terrain: "Highlands",
    vibes: ["Eco-Luxury", "Adrenaline"],
    days: 5,
    distanceKm: 62,
    elevationGain: 1580,
    price: 1240,
    parkFee: 48,
    rating: 4.8,
    reviews: 187,
    bestSeason: "Jan — Sep",
    groupMax: 6,
    image: IMG.ella,
    gallery: [IMG.ella, IMG.highlands, IMG.sigiriya, IMG.galle],
    stampText: "SURVEYED 1891",
    fitness: {
      level: "Moderate",
      elevationGainM: 1580,
      dailyHours: "3–5 h on foot",
      note: "Cloud-forest steps are slick and endless. The reward is tea that tastes like the air up here.",
    },
    chapters: [
      {
        numeral: "I",
        title: "The Nine Arch Crossing",
        place: "Demodara Valley",
        daysLabel: "Days 1 – 2",
        narrative:
          "When the British ran out of steel in 1921, local masons bridged the Demodara gap with nine arches of brick, rock and egg-white mortar. Twice a day a blue train leans around the bend and crosses it at a walking pace. You will photograph it, and then you will walk the viaduct yourself after the last carriage clears.",
        image: IMG.ella,
        highlights: ["Train crossing from the tea rows", "Walk the viaduct at dusk", "Demodara loop tunnel"],
        entries: [
          { day: 1, title: "Into the gap", story: "Climb through cardamom shade to the ridge above the viaduct. The 09:30 arrives trailing cloud. Afternoon in the tea factory — withering, rolling, firing, tasting.", food: "Tea-leaf salad, rarely on menus", lodging: "Cliff-edge nine-arch guesthouse", elevation: "+420 m" },
          { day: 2, title: "Under the arches", story: "Dawn below the viaduct, when mist pools in the paddy. Follow the rail bed to the spiral loop tunnel that eats a train and returns it lower than it entered.", food: "Egg hoppers at the station café", lodging: "Same guesthouse", elevation: "+260 m / −540 m" },
        ],
      },
      {
        numeral: "II",
        title: "Tea Trails of Haputale",
        place: "Little Adam's Peak & Lipton's Seat",
        daysLabel: "Days 3 – 4",
        narrative:
          "Thomas Lipton declared this view 'the finest seat in the world' and named it after himself, which tells you everything about him and nothing about the view. The ridgelines roll like frozen green water; pluckers move through the rows with the patience of tides.",
        image: IMG.highlands,
        highlights: ["Little Adam's Peak sunrise", "Lipton's Seat panorama", "Plucker's breakfast in the rows"],
        entries: [
          { day: 3, title: "The small peak", story: "Pre-dawn climb of Little Adam's Peak. Below, the Ella Gap opens like a door; behind, three ridgelines repeat into haze. Long lunch in Haputale bazaar.", food: "Rotti with lunu miris, roadside", lodging: "Tea-planter's bungalow, 1,900 m", elevation: "+380 m" },
          { day: 4, title: "The finest seat", story: "Walk the ridge to Lipton's Seat through working plantations — ask before you photograph, you will be invited in. Sunset with the planter's own 1948 map.", food: "Bungalow high tea, absurdly good", lodging: "Bungalow, second night", elevation: "+520 m / −310 m" },
        ],
      },
      {
        numeral: "III",
        title: "Falls & the Highland Rail",
        place: "Ravana Falls to Nuwara Eliya",
        daysLabel: "Day 5",
        narrative:
          "Ravana Falls drops 25 metres into a pool the Ramayana claims for a princess. Then the route ends the only way a hill-country story should — on the slowest train in Asia, doors open, legs out, cloud coming in through the window like a guest.",
        image: IMG.ella,
        highlights: ["Ravana cave & falls", "The blue train, doors open", "Farewell at the Nuwara Eliya station"],
        entries: [
          { day: 5, title: "Water, then rail", story: "Morning at Ravana — the cave, the falls, the monkeys conducting their own customs checks. Board the observation car at 11:10; the expedition closes as tea country slides past at 15 km/h.", food: "Station vade & strong tea", lodging: "Journey's end — extendable", elevation: "+180 m" },
        ],
      },
    ],
    waypoints: [
      { id: "ellagap", name: "Ella Gap", x: 57, y: 60, elevation: "1,041 m", weather: { tempC: 21, condition: "Cloud doors", kind: "mist" }, photo: IMG.ella, culturalNote: "On clear days the gap frames the southern sea, 80 km away.", profile: [700, 860, 1041, 980, 900, 840] },
      { id: "ninearch", name: "Nine Arch Bridge", x: 59.5, y: 61.5, elevation: "950 m", weather: { tempC: 22, condition: "Mist by 15:00", kind: "cloud" }, photo: IMG.ella, culturalNote: "Egg-white mortar, no steel — and the arches have not shifted a millimetre.", profile: [800, 880, 950, 950, 910, 860] },
      { id: "littleadam", name: "Little Adam's Peak", x: 57.5, y: 58.5, elevation: "1,141 m", weather: { tempC: 19, condition: "Cool ridge wind", kind: "wind" }, photo: IMG.highlands, culturalNote: "Named in playful contrast to Adam's Peak, the sacred one far to the west.", profile: [900, 1000, 1090, 1141, 1100, 980] },
      { id: "liptons", name: "Lipton's Seat", x: 62, y: 63, elevation: "1,970 m", weather: { tempC: 16, condition: "Cloud inversion", kind: "mist" }, photo: IMG.highlands, culturalNote: "Lipton raced his tea from pluck to London pot in under six weeks. A record at the time.", profile: [1400, 1650, 1900, 1970, 1930, 1800] },
      { id: "ravana", name: "Ravana Falls", x: 59, y: 64.5, elevation: "1,010 m", weather: { tempC: 20, condition: "Spray showers", kind: "rain" }, photo: IMG.ella, culturalNote: "Legend keeps the princess Sita bathing here; locals still leave offerings at the cave mouth.", profile: [1010, 990, 1000, 950, 800, 700] },
    ],
    culturalNotes: [
      { title: "Why the train is slow", text: "The hill line was engineered to climb 1:44 grades with 1890s steam — the speed limit is structural. Nobody has ever complained successfully.", source: "Ceylon Government Railway notes" },
      { title: "Two leaves & a bud", text: "A plucker picks roughly 20 kg of leaf a day, and only the top two leaves and a bud. Your single cup is about nine of her movements.", source: "Estate ledgers, Haputale" },
    ],
    gear: [
      { name: "Grippy trail shoes (mud!)", kg: 1.6, essential: true },
      { name: "Warm layer — it is 14°C up here", kg: 0.8, essential: true },
      { name: "Packable rain shell", kg: 0.4, essential: true },
      { name: "Daypack 18 L", kg: 0.7, essential: true },
      { name: "2 L water", kg: 2.0, essential: true },
      { name: "Leeches socks (monsoon legs)", kg: 0.1, essential: false },
      { name: "Journal & pencil", kg: 0.3, essential: false },
      { name: "Small umbrella, bazaar-grade", kg: 0.4, essential: false },
    ],
    included: ["4 nights: guesthouse & planter's bungalow", "Observation-class rail tickets", "Tea factory & estate entries", "Breakfasts + meals as noted", "Resident hill-country naturalist", "Transfers from Colombo or Kandy"],
  },

  {
    id: "yala",
    plateNo: "No. III",
    title: "Leopards of the Southern Wilds",
    subtitle: "Dawn patrols, salt lagoons and the highest density of leopards on earth",
    region: "Yala & Bundala",
    coords: "06°25′N 81°31′E",
    terrain: "Jungle",
    vibes: ["Wildlife", "Adrenaline"],
    days: 4,
    distanceKm: 148,
    elevationGain: 240,
    price: 1090,
    parkFee: 165,
    rating: 4.9,
    reviews: 243,
    bestSeason: "Feb — Jul",
    groupMax: 5,
    image: IMG.yala,
    gallery: [IMG.yala, IMG.galle, IMG.sigiriya, IMG.highlands],
    stampText: "PATROLLED 1938",
    fitness: {
      level: "Gentle",
      elevationGainM: 240,
      dailyHours: "3 h on foot + long jeeps",
      note: "The work is done sitting very still. Patience is the only muscle tested.",
    },
    chapters: [
      {
        numeral: "I",
        title: "Block One, First Light",
        place: "Yala National Park",
        daysLabel: "Days 1 – 2",
        narrative:
          "Block One holds more leopards per square kilometre than anywhere on the planet, and they know it — these cats walk the open ground at midday, indifferent to jeeps. Your tracker reads pugmarks the way other people read newsprint.",
        image: IMG.yala,
        highlights: ["Dawn gate entry, 05:30", "Leopard territories, tracked daily", "Sundowner on Patanangala beach"],
        entries: [
          { day: 1, title: "The gate at dawn", story: "Through Kirinda gate before the sun, thermos in hand. Morning territories: Kumbukkan riverline, the rock pools, the boulder where a certain male naps by appointment.", food: "Bush breakfast at the tank bund", lodging: "Tented camp under kumbuk trees", elevation: "negligible" },
          { day: 2, title: "Reading the sand", story: "Tracker's masterclass — pug, drag mark, scrape. Afternoon siesta the way the park demands it, then the evening patrol when the light goes amber.", food: "Campfire kottu", lodging: "Same camp, better stories", elevation: "+40 m" },
        ],
      },
      {
        numeral: "II",
        title: "Lagoons & Bird Tides",
        place: "Bundala Ramsar Wetlands",
        daysLabel: "Day 3",
        narrative:
          "Where Yala is a cat kingdom, Bundala is a bird parliament — 197 species argue over the salt pans each winter, flamingos arriving in delegations of several thousand. The lagoons turn pink at certain hours, and no photograph has ever believed it correctly.",
        image: IMG.galle,
        highlights: ["197 recorded species", "Flamingo congregations", "Salt-pan light at 17:00"],
        entries: [
          { day: 3, title: "The pink hour", story: "Morning hides on the lagoon edge with the camp's ornithologist. Afternoon walk on the salt pans — centuries of hand-raked harvest, unchanged since the Kandyan kings.", food: "Crab curry, lagoon-side", lodging: "Wetland-edge chalets", elevation: "flat" },
        ],
      },
      {
        numeral: "III",
        title: "The Night Patrol",
        place: "Situlpawwa & the fringe blocks",
        daysLabel: "Day 4",
        narrative:
          "After dark the park changes management. Civets, fishing cats, the occasional sloth bear — and on the fringe blocks, leopards hunting beyond the reach of daytime jeeps. A 2,200-year-old monastery sits on the hill above, which has seen all of this before.",
        image: IMG.yala,
        highlights: ["Spotlight safari, fringe blocks", "Situlpawwa monastery climb", "Farewell under the Milky Way"],
        entries: [
          { day: 4, title: "What walks at night", story: "Situlpawwa's 200 steps at first light, white dagoba over green ocean of canopy. Night patrol at 19:00 — red-filtered spots only, voices low. The expedition closes with the sky doing its full southern-ceiling performance.", food: "Tracker's farewell fry-up", lodging: "Departure", elevation: "+120 m" },
        ],
      },
    ],
    waypoints: [
      { id: "kirinda", name: "Kirinda Gate", x: 65, y: 73.5, elevation: "8 m", weather: { tempC: 30, condition: "Sea breeze", kind: "wind" }, photo: IMG.yala, culturalNote: "The gate village was rebuilt after the 2004 wave; the temple bell that rang the warning is still rung each December.", profile: [2, 5, 8, 6, 4, 8] },
      { id: "blockone", name: "Block One Plains", x: 67.5, y: 71.5, elevation: "15 m", weather: { tempC: 34, condition: "Dry monsoon", kind: "sun" }, photo: IMG.yala, culturalNote: "Leopard density here runs ~1 per km² — roughly one cat per six football fields.", profile: [10, 12, 15, 18, 15, 12] },
      { id: "yalatank", name: "Yala Tank", x: 65.5, y: 69.5, elevation: "22 m", weather: { tempC: 33, condition: "Still heat", kind: "sun" }, photo: IMG.highlands, culturalNote: "The tanks are medieval irrigation — elephants drink from 12th-century engineering.", profile: [18, 20, 22, 24, 22, 19] },
      { id: "bundala", name: "Bundala Lagoons", x: 61.5, y: 75, elevation: "2 m", weather: { tempC: 31, condition: "Salt glare", kind: "sun" }, photo: IMG.galle, culturalNote: "A Ramsar site since 1991 — the flamingos winter here from as far as Siberia.", profile: [0, 1, 2, 3, 2, 1] },
      { id: "situlpawwa", name: "Situlpawwa Rock", x: 68, y: 74, elevation: "120 m", weather: { tempC: 29, condition: "Hill wind", kind: "wind" }, photo: IMG.sigiriya, culturalNote: "The name means 'place where the mind is calmed' — monks have tested this for 22 centuries.", profile: [5, 40, 90, 120, 95, 40] },
    ],
    culturalNotes: [
      { title: "Naming the cats", text: "Trackers name every leopard by whisker map. The famous 'Charles' vanished for a year and returned thinner and smug; his daughter now holds his boulder.", source: "Camp tracker oral record" },
      { title: "Park silence law", text: "Engines off within 50 m of a sighting. The rule exists because a leopard heard an idling jeep in 1974 and the trackers have not forgiven anyone since.", source: "Yala patrol handbook" },
    ],
    gear: [
      { name: "Neutral-tone clothing (no white)", kg: 1.0, essential: true },
      { name: "Dust mask or shemagh", kg: 0.2, essential: true },
      { name: "Sun hat with strap", kg: 0.2, essential: true },
      { name: "2 L water, insulated", kg: 2.0, essential: true },
      { name: "Binoculars 10×42", kg: 0.9, essential: true },
      { name: "300 mm+ lens or bridge camera", kg: 1.8, essential: false },
      { name: "Bean bag for the jeep rail", kg: 1.2, essential: false },
      { name: "Headlamp, red mode only", kg: 0.1, essential: true },
    ],
    included: ["3 nights: tented camp & wetland chalets", "6 game drives, tracker & naturalist", "All national park fees", "Full board in the field", "Spotlight night patrol", "Transfers from Galle or Hambantota"],
  },

  {
    id: "galle",
    plateNo: "No. IV",
    title: "The Fortress Coast",
    subtitle: "Dutch ramparts, the whale road and mangrove creeks of the southern shore",
    region: "Southern Coast",
    coords: "06°01′N 80°13′E",
    terrain: "Coastal",
    vibes: ["Eco-Luxury", "Ancient History"],
    days: 5,
    distanceKm: 96,
    elevationGain: 310,
    price: 1150,
    parkFee: 88,
    rating: 4.7,
    reviews: 164,
    bestSeason: "Nov — Apr",
    groupMax: 8,
    image: IMG.galle,
    gallery: [IMG.galle, IMG.ella, IMG.balloon, IMG.sigiriya],
    stampText: "FORTIFIED 1588",
    fitness: {
      level: "Gentle",
      elevationGainM: 310,
      dailyHours: "2–4 h on foot",
      note: "Rampart walks and boat seats. The hardest decision is which bakery.",
    },
    chapters: [
      {
        numeral: "I",
        title: "Ramparts at Golden Hour",
        place: "Galle Fort",
        daysLabel: "Days 1 – 2",
        narrative:
          "The Portuguese started it, the Dutch perfected it, the British ran the clock, and now the fort belongs to evening walkers — an entire 17th-century walled city doing its slow parade against the Indian Ocean sunset. Fourteen bastions, one lighthouse, and bakeries that smell like the 1600s decided to stay.",
        image: IMG.galle,
        highlights: ["Full rampart circuit at dusk", "Old Dutch Hospital & museums", "Lighthouse keeper's story hour"],
        entries: [
          { day: 1, title: "The fourteen bastions", story: "Check into a restored Dutch townhouse inside the walls. Evening rampart circuit — flag rock, the cricket ground, the moon bastion — as the whole city turns west for the show.", food: "Ice cream at The Pedlar's, a fort rite", lodging: "1707 townhouse, courtyard pool", elevation: "+30 m" },
          { day: 2, title: "Inside the walls", story: "Morning with the fort's unofficial historian through warehouses-turned-galleries and the 1775 clock tower. Afternoon at the maritime museum, then high tea where the governors took theirs.", food: "Breudher with banana & butter", lodging: "Same townhouse", elevation: "+20 m" },
        ],
      },
      {
        numeral: "II",
        title: "The Whale Road",
        place: "Mirissa & Weligama",
        daysLabel: "Days 3 – 4",
        narrative:
          "Six nautical miles off Mirissa, the continental shelf drops a kilometre in a single step — and blue whales use it as a highway every winter. The boats go out before breakfast; by ten you have seen the largest animal in the history of the planet, and lunch tastes different afterward.",
        image: IMG.balloon,
        highlights: ["Blue & sperm whale season", "Stilt fishermen of Koggala", "Surf hour at Weligama, optional"],
        entries: [
          { day: 3, title: "The blue highway", story: "05:30 launch, thermos and sea legs. Spouts first — then backs the length of small boats. Afternoon among the stilt fishermen, perched the way their grandfathers were photographed.", food: "Grilled tuna on the beach", lodging: "Coconut-grove villas, Mirissa", elevation: "sea level" },
          { day: 4, title: "Creeks & cinnamon", story: "The Madu River by flat-bottom boat — 64 islands, cinnamon islets, monitor lizards sunning like landlords. Sunset surf lesson at Weligama for the willing.", food: "Cinnamon-peat smoked prawns", lodging: "Villas, second night", elevation: "+10 m" },
        ],
      },
      {
        numeral: "III",
        title: "The Long Farewell",
        place: "Unawatuna to the Fort, once more",
        daysLabel: "Day 5",
        narrative:
          "The coast saves its softest morning for the last day. A final swim, a last pedlar street meander, and the ramparts one more time — because everyone does it twice, and everyone pretends the second time was by accident.",
        image: IMG.galle,
        highlights: ["Unawatuna crescent swim", "Pedlar Street closing stroll", "Farewell on the Triton bastion"],
        entries: [
          { day: 5, title: "One more circuit", story: "Morning crescent swim at Unawatuna. Afternoon at leisure — gems, lace, one more ice cream. The expedition closes where it began: Triton bastion, sunset, salt wind.", food: "Farewell seafood table, fort-side", lodging: "Journey's end — extendable", elevation: "+30 m" },
        ],
      },
    ],
    waypoints: [
      { id: "gallefort", name: "Galle Fort", x: 40.5, y: 79, elevation: "12 m", weather: { tempC: 29, condition: "Sea breeze", kind: "sun" }, photo: IMG.galle, culturalNote: "The fort walls have withstood every army and one tsunami; the Dutch built for 400 years.", profile: [4, 8, 12, 14, 10, 6] },
      { id: "unawatuna", name: "Unawatuna Bay", x: 43, y: 80.5, elevation: "3 m", weather: { tempC: 30, condition: "Calm swell", kind: "sun" }, photo: IMG.galle, culturalNote: "Marco Polo noted it in 1299; the reef kept his ships calm and his diary busy.", profile: [0, 2, 3, 5, 3, 1] },
      { id: "koggala", name: "Koggala Stilt Shore", x: 45.5, y: 80.8, elevation: "2 m", weather: { tempC: 30, condition: "Bright haze", kind: "sun" }, photo: IMG.galle, culturalNote: "The stilt tradition is younger than postcards claim — but no less photogenic for it.", profile: [0, 1, 2, 2, 1, 0] },
      { id: "weligama", name: "Weligama Bay", x: 47.5, y: 81.2, elevation: "2 m", weather: { tempC: 29, condition: "Clean 4 ft", kind: "wind" }, photo: IMG.ella, culturalNote: "'Village of sand' — the bay's long peelers have taught the island to surf since the 1960s.", profile: [0, 1, 3, 2, 1, 0] },
      { id: "mirissa", name: "Mirissa Harbour", x: 49.5, y: 81.6, elevation: "4 m", weather: { tempC: 29, condition: "Whale season", kind: "cloud" }, photo: IMG.balloon, culturalNote: "Blue whales pass within 6 nm — the closest reliable blue-whale viewing on earth.", profile: [0, 3, 4, 6, 4, 2] },
      { id: "madu", name: "Madu River Creeks", x: 43.5, y: 77.5, elevation: "1 m", weather: { tempC: 31, condition: "Mangrove still", kind: "mist" }, photo: IMG.highlands, culturalNote: "Cinnamon is still peeled on the river's islands, by families on their fourth generation.", profile: [1, 1, 2, 1, 2, 1] },
    ],
    culturalNotes: [
      { title: "The lighthouse bargain", text: "Galle's lighthouse has kept its light since 1939. Keepers were paid in rice and rum until 1972; the last keeper's grandson now runs the bakery beneath it.", source: "Harbour master's log" },
      { title: "Bastion etiquette", text: "Locals walk the ramparts clockwise at sunset — 'the way the Dutch patrol went, and they were usually right about the tide.'", source: "Fort residents' habit" },
    ],
    gear: [
      { name: "Reef shoes", kg: 0.8, essential: true },
      { name: "Swimwear ×2 (they never dry)", kg: 0.6, essential: true },
      { name: "Sun shirt / rash guard", kg: 0.3, essential: true },
      { name: "Dry bag 10 L", kg: 0.3, essential: true },
      { name: "Wide hat", kg: 0.2, essential: true },
      { name: "Motion tablets for whale trips", kg: 0.1, essential: true },
      { name: "Snorkel set (fit matters)", kg: 1.4, essential: false },
      { name: "Evening linen — the fort dresses up", kg: 0.5, essential: false },
    ],
    included: ["4 nights: fort townhouse & grove villas", "Whale-watching cruise, marine-licensed", "Madu River boat & entries", "Historian-led fort walk", "Breakfasts + meals as noted", "Transfers from Colombo (CMB)"],
  },
];

/* ---------------- helpers ---------------- */

export const usd = (n: number): string => "$" + Math.round(n).toLocaleString("en-US");

export const byId = (id: string): ExpeditionPackage | undefined => EXPEDITIONS.find((e) => e.id === id);

/** Approximate lunar phase, 0 = new moon → 0.5 = full moon → 1 */
export function moonPhase(d: Date): number {
  const synodic = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const days = (d.getTime() - ref) / 86400000;
  return ((((days % synodic) + synodic) % synodic) / synodic);
}

export function phaseName(p: number): string {
  if (p < 0.0625 || p >= 0.9375) return "New Moon";
  if (p < 0.1875) return "Waxing Crescent";
  if (p < 0.3125) return "First Quarter";
  if (p < 0.4375) return "Waxing Gibbous";
  if (p < 0.5625) return "Full Moon";
  if (p < 0.6875) return "Waning Gibbous";
  if (p < 0.8125) return "Last Quarter";
  return "Waning Crescent";
}

export interface Ledger {
  base: number;
  park: number;
  guide: number;
  addons: number;
  levy: number;
  total: number;
}

export function computeLedger(pkg: ExpeditionPackage, guests: number, guideId: string, addonIds: string[]): Ledger {
  const base = pkg.price * guests;
  const park = pkg.parkFee * guests;
  const guide = GUIDE_TIERS.find((g) => g.id === guideId)?.price ?? 0;
  const addons = ADDONS.filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price * guests, 0);
  const levy = Math.round((base + park + guide + addons) * 0.03);
  return { base, park, guide, addons, levy, total: base + park + guide + addons + levy };
}

export function makeRef(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `AE-VII-${n}`;
}
