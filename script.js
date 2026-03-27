// Airport names for dynamic content
const AIRPORT_NAMES = {
  LHR: "Heathrow", LGW: "Gatwick", MAN: "Manchester", STN: "Stansted",
  LTN: "Luton", BHX: "Birmingham", EDI: "Edinburgh", BRS: "Bristol",
  NCL: "Newcastle", LBA: "Leeds Bradford", EMA: "East Midlands",
  LPL: "Liverpool", GLA: "Glasgow", EXT: "Exeter", LCY: "London City",
};
const DEFAULT_AIRPORT = "Airport";

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeAirportName();
  initializeDates();
  initializeForm();
});

// Set dynamic airport name from URL
function initializeAirportName() {
  const urlParams = new URLSearchParams(window.location.search);
  const depart = (urlParams.get("Location") || urlParams.get("location") || "").toUpperCase();
  const airportName = AIRPORT_NAMES[depart] || DEFAULT_AIRPORT;

  // Update page title
  document.title = `${airportName} Parking`;

  // Update hero title
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    heroTitle.textContent = `Save up to 60% on ${airportName} Parking`;
  }

  // Update search heading
  const searchHeading = document.getElementById('searchHeading');
  if (searchHeading) {
    searchHeading.textContent = `Search ${airportName} Parking`;
  }

  // Pre-select airport if provided
  if (depart && AIRPORT_NAMES[depart]) {
    const airportSelect = document.getElementById('airport');
    if (airportSelect) {
      airportSelect.value = depart;
    }
  }
}

// Date helper functions
function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dateStrPlus(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Initialize dates with defaults
function initializeDates() {
  const outDate = document.getElementById('outDate');
  const inDate = document.getElementById('inDate');

  // Set drop-off to tomorrow
  outDate.value = datePlus(1);

  // Set collection to drop-off + 8 days
  inDate.value = datePlus(1 + 8);

  // Auto-recalculate collection date when drop-off changes
  let inDateManuallyChanged = false;

  inDate.addEventListener('change', () => {
    inDateManuallyChanged = true;
  });

  outDate.addEventListener('change', () => {
    if (!inDateManuallyChanged) {
      inDate.value = dateStrPlus(outDate.value, 8);
    }
  });
}

// Form submission
function initializeForm() {
  const form = document.getElementById('parkingForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const airport = document.getElementById('airport').value;
    const outDate = document.getElementById('outDate').value;
    const outTime = document.getElementById('outTime').value;
    const inDate = document.getElementById('inDate').value;
    const inTime = document.getElementById('inTime').value;

    if (!airport || !outDate || !inDate) {
      alert('Please complete all fields');
      return;
    }

    // Build search URL
    const searchUrl = buildParkingUrl(airport, outDate, outTime, inDate, inTime);

    // Redirect to search
    window.location.href = searchUrl;
  });
}

// Domain resolution (LGP swaps www → app on live)
function getBaseDomain() {
  const host = window.location.host;
  const isLocal = host.startsWith("127") || host.includes("github.io");
  return isLocal ? "www.holidayextras.com" : host.replace("www", "app");
}

// Get URL params
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    agent: urlParams.get('agent') || 'WY992',
    adcode: urlParams.get('adcode') || '',
    promotionCode: urlParams.get('promotionCode') || '',
    flight: urlParams.get('flight') || 'default'
  };
}

// Build parking search URL
function buildParkingUrl(depart, outDate, outTime, inDate, inTime) {
  const basedomain = getBaseDomain();
  const params = getUrlParams();
  const outTimeEncoded = outTime.replace(':', '%3A');
  const inTimeEncoded = inTime.replace(':', '%3A');

  return `https://${basedomain}/static/?selectProduct=cp&#/categories?agent=${params.agent}&ppts=&customer_ref=&lang=en&adults=2&depart=${depart}&terminal=&arrive=&flight=${params.flight}&in=${inDate}&out=${outDate}&park_from=${outTimeEncoded}&park_to=${inTimeEncoded}&filter_meetandgreet=&filter_parkandride=&children=0&infants=0&redirectReferal=carpark&from_categories=true&adcode=${params.adcode}&promotionCode=${params.promotionCode}`;
}
