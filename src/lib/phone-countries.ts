export interface PhoneCountry {
  code: string;
  name: string;
  flag: string;
  prefix: string;
  numberType: 'local' | 'mobile' | 'national';
  monthlyPriceEur: number;
  twilioCostEur: number;
  requiresBundle: boolean;
  available: boolean;
  areaCodeLabel: string;
  areaCodePlaceholder: string;
  areaCodeLength?: number;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    prefix: '+31',
    numberType: 'local',
    monthlyPriceEur: 8,
    twilioCostEur: 3,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'City Code',
    areaCodePlaceholder: '20 for Amsterdam, 10 for Rotterdam',
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    prefix: '+32',
    numberType: 'local',
    monthlyPriceEur: 8,
    twilioCostEur: 3,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '2 for Brussels, 3 for Antwerp',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    prefix: '+49',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'City Code',
    areaCodePlaceholder: '30 for Berlin, 89 for Munich',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    prefix: '+44',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '20 for London, 161 for Manchester',
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    prefix: '+33',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '1 for Paris',
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    prefix: '+34',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '91 for Madrid, 93 for Barcelona',
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    prefix: '+39',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '02 for Milan, 06 for Rome',
  },
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    prefix: '+43',
    numberType: 'local',
    monthlyPriceEur: 7,
    twilioCostEur: 2,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '1 for Vienna',
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    prefix: '+41',
    numberType: 'local',
    monthlyPriceEur: 10,
    twilioCostEur: 4,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '44 for Zurich',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    prefix: '+1',
    numberType: 'local',
    monthlyPriceEur: 5,
    twilioCostEur: 1,
    requiresBundle: false,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '212 for New York, 415 for San Francisco',
    areaCodeLength: 3,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    prefix: '+1',
    numberType: 'local',
    monthlyPriceEur: 5,
    twilioCostEur: 1,
    requiresBundle: false,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '416 for Toronto, 604 for Vancouver',
    areaCodeLength: 3,
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    prefix: '+61',
    numberType: 'local',
    monthlyPriceEur: 8,
    twilioCostEur: 3,
    requiresBundle: true,
    available: true,
    areaCodeLabel: 'Area Code',
    areaCodePlaceholder: '2 for Sydney, 3 for Melbourne',
  },
];

export function getCountryByCode(code: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find(c => c.code === code);
}

export function getAvailableCountries(): PhoneCountry[] {
  return PHONE_COUNTRIES.filter(c => c.available);
}
