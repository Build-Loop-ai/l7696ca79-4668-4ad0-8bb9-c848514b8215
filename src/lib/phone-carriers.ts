export interface PhoneCarrier {
  id: string;
  name: string;
  countries: string[];
  instructions: {
    enable: string[];
    disable: string;
    notes?: string;
  };
}

export const PHONE_CARRIERS: PhoneCarrier[] = [
  // US Carriers
  {
    id: 'att',
    name: 'AT&T',
    countries: ['US'],
    instructions: {
      enable: [
        'From your office phone, dial *72',
        'Enter the AI number: {phoneNumber}',
        'Wait for two confirmation beeps',
        'Hang up - forwarding is now active!'
      ],
      disable: 'Dial *73 from your office phone',
    },
  },
  {
    id: 'verizon',
    name: 'Verizon',
    countries: ['US'],
    instructions: {
      enable: [
        'From your office phone, dial *72',
        'Dial the AI number: {phoneNumber}',
        'Wait for confirmation tone',
        'Hang up - calls will now forward!'
      ],
      disable: 'Dial *73 from your office phone',
    },
  },
  {
    id: 'tmobile',
    name: 'T-Mobile',
    countries: ['US'],
    instructions: {
      enable: [
        'Open your Phone app',
        'Dial **21*{phoneNumber}#',
        'Press Call',
        'Wait for confirmation message'
      ],
      disable: 'Dial ##21# and press Call',
    },
  },
  {
    id: 'spectrum',
    name: 'Spectrum Business',
    countries: ['US'],
    instructions: {
      enable: [
        'Log in to your Spectrum Business account at business.spectrum.com',
        'Go to Voice → Call Forwarding',
        'Enable "Forward All Calls"',
        'Enter the AI number: {phoneNumber}',
        'Click Save'
      ],
      disable: 'Return to Voice settings and toggle off Call Forwarding',
    },
  },
  // VoIP Providers (International)
  {
    id: 'ringcentral',
    name: 'RingCentral',
    countries: ['US', 'GB', 'NL', 'DE', 'FR', 'AU', 'CA'],
    instructions: {
      enable: [
        'Log in to RingCentral Admin Portal',
        'Go to Phone System → Auto-Receptionist or Call Handling',
        'Under Call Handling, select "Forward calls"',
        'Add the AI number: {phoneNumber}',
        'Save changes'
      ],
      disable: 'Return to Call Handling and remove the forwarding rule',
    },
  },
  {
    id: 'vonage',
    name: 'Vonage Business',
    countries: ['US', 'GB', 'NL', 'DE', 'AU', 'CA'],
    instructions: {
      enable: [
        'Log in to Vonage Admin Dashboard',
        'Navigate to Phone Numbers → Your Number',
        'Click Call Forwarding',
        'Enter the AI number: {phoneNumber}',
        'Enable and Save'
      ],
      disable: 'Toggle off Call Forwarding in the dashboard',
    },
  },
  {
    id: 'teams',
    name: 'Microsoft Teams Phone',
    countries: ['US', 'GB', 'NL', 'DE', 'FR', 'BE', 'AU', 'CA'],
    instructions: {
      enable: [
        'Open Microsoft Teams',
        'Click Settings (⚙️) → Calls',
        'Under "Call forwarding", select "Forward my calls"',
        'Choose "Voice mail or another number"',
        'Enter the AI number: {phoneNumber}',
        'Save'
      ],
      disable: 'Return to Calls settings and disable forwarding',
      notes: 'Admin may need to enable call forwarding for your account',
    },
  },
  {
    id: 'zoom',
    name: 'Zoom Phone',
    countries: ['US', 'GB', 'NL', 'DE', 'AU', 'CA'],
    instructions: {
      enable: [
        'Open Zoom desktop app',
        'Go to Settings → Phone',
        'Under Call Handling, find "When a call is not answered"',
        'Select "Forward to external number"',
        'Enter: {phoneNumber}',
        'Save'
      ],
      disable: 'Disable the forwarding rule in Zoom Phone settings',
    },
  },
  // Netherlands
  {
    id: 'kpn',
    name: 'KPN',
    countries: ['NL'],
    instructions: {
      enable: [
        'Log in to MijnKPN Zakelijk at mijn.kpn.com',
        'Go to Telefonie → Doorschakelen',
        'Enable "Alle gesprekken doorschakelen"',
        'Enter the AI number: {phoneNumber}',
        'Click Opslaan'
      ],
      disable: 'Return to Doorschakelen and disable',
    },
  },
  {
    id: 'vodafone_nl',
    name: 'Vodafone Zakelijk',
    countries: ['NL'],
    instructions: {
      enable: [
        'Log in to My Vodafone Business',
        'Go to Mijn Producten → Vaste telefonie',
        'Select Doorschakelen',
        'Enter AI number: {phoneNumber}',
        'Activate'
      ],
      disable: 'Disable doorschakelen in My Vodafone',
    },
  },
  // Belgium
  {
    id: 'proximus',
    name: 'Proximus',
    countries: ['BE'],
    instructions: {
      enable: [
        'Log in to MyProximus Business',
        'Go to Mijn producten → Vaste lijn',
        'Select Doorschakeling',
        'Enter AI number: {phoneNumber}',
        'Activate'
      ],
      disable: 'Disable doorschakeling in MyProximus',
    },
  },
  // Germany
  {
    id: 'telekom_de',
    name: 'Deutsche Telekom',
    countries: ['DE'],
    instructions: {
      enable: [
        'Dial *21*{phoneNumber}# from your phone',
        'Press Call',
        'Wait for confirmation'
      ],
      disable: 'Dial #21# to disable',
    },
  },
  // UK
  {
    id: 'bt',
    name: 'BT Business',
    countries: ['GB'],
    instructions: {
      enable: [
        'Dial *21*{phoneNumber}# from your phone',
        'Wait for confirmation tone',
        'Hang up'
      ],
      disable: 'Dial #21# to cancel',
    },
  },
  // France
  {
    id: 'orange_fr',
    name: 'Orange Business',
    countries: ['FR'],
    instructions: {
      enable: [
        'Dial *21*{phoneNumber}# from your phone',
        'Wait for confirmation',
        'Hang up'
      ],
      disable: 'Dial #21# to cancel',
    },
  },
  // Generic/Other
  {
    id: 'other',
    name: 'Other / Not Listed',
    countries: ['US', 'CA', 'GB', 'NL', 'DE', 'FR', 'BE', 'ES', 'IT', 'AT', 'CH', 'AU'],
    instructions: {
      enable: [
        'Contact your phone provider and request call forwarding',
        'Ask them to forward all calls to: {phoneNumber}',
        'Most providers support *21*{phoneNumber}# or *72{phoneNumber}',
        'Alternatively, check your online account portal for call forwarding settings'
      ],
      disable: 'Contact your provider or try #21# or *73',
      notes: 'Search "[your provider name] call forwarding" for specific instructions',
    },
  },
];

export function getCarriersForCountry(countryCode: string): PhoneCarrier[] {
  return PHONE_CARRIERS.filter(c => c.countries.includes(countryCode));
}

export function getCarrierById(id: string): PhoneCarrier | undefined {
  return PHONE_CARRIERS.find(c => c.id === id);
}

export function getForwardingInstructions(carrierId: string, aiPhoneNumber: string): string[] {
  const carrier = getCarrierById(carrierId);
  if (!carrier) return [];
  
  const formattedNumber = aiPhoneNumber.replace(/\D/g, '');
  
  return carrier.instructions.enable.map(step => 
    step.replace('{phoneNumber}', formattedNumber)
  );
}

export function getDisableInstructions(carrierId: string): string {
  const carrier = getCarrierById(carrierId);
  return carrier?.instructions.disable || 'Contact your phone provider to disable forwarding';
}
