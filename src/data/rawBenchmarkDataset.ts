import { RawRecord } from '../types/pipeline';

interface BankMeta {
  bank: string;
  country: string;
  app: string;
  screensCount: number;
  targetAvgRating: number;
  targetAvgScore: number;
  accessPct: number;
  avgFeatures: number;
}

const BANK_SPECS: BankMeta[] = [
  { bank: 'Lion City Bank', country: 'Singapore', app: 'LionPay', screensCount: 15, targetAvgRating: 4.53, targetAvgScore: 79.9, accessPct: 60.0, avgFeatures: 2.87 },
  { bank: 'Aurora Bank', country: 'United States', app: 'Aurora Mobile', screensCount: 15, targetAvgRating: 4.33, targetAvgScore: 74.9, accessPct: 53.33, avgFeatures: 3.40 },
  { bank: 'Sakura Financial', country: 'Japan', app: 'Sakura Pay', screensCount: 14, targetAvgRating: 4.36, targetAvgScore: 73.6, accessPct: 64.29, avgFeatures: 2.71 },
  { bank: 'Ganga Bank', country: 'India', app: 'Ganga Mobile', screensCount: 16, targetAvgRating: 3.81, targetAvgScore: 73.0, accessPct: 75.0, avgFeatures: 2.44 },
  { bank: 'Maple Leaf Bank', country: 'Canada', app: 'Maple Bank', screensCount: 15, targetAvgRating: 3.67, targetAvgScore: 70.5, accessPct: 86.67, avgFeatures: 3.47 },
  { bank: 'Han River Bank', country: 'South Korea', app: 'HanRiver Direct', screensCount: 15, targetAvgRating: 4.20, targetAvgScore: 70.1, accessPct: 60.0, avgFeatures: 1.93 },
  { bank: 'Britannia Trust', country: 'United Kingdom', app: 'Britannia OnLine', screensCount: 16, targetAvgRating: 4.00, targetAvgScore: 68.5, accessPct: 37.5, avgFeatures: 2.69 },
  { bank: 'Savanna Bank', country: 'South Africa', app: 'Savanna Connect', screensCount: 15, targetAvgRating: 3.33, targetAvgScore: 67.1, accessPct: 80.0, avgFeatures: 3.27 },
  { bank: 'Emirates Crown Bank', country: 'United Arab Emirates', app: 'Crown Mobile', screensCount: 16, targetAvgRating: 3.56, targetAvgScore: 66.3, accessPct: 50.0, avgFeatures: 3.12 },
  { bank: 'Rhein Bank', country: 'Germany', app: 'Rhein Mobil', screensCount: 16, targetAvgRating: 3.19, targetAvgScore: 66.0, accessPct: 87.5, avgFeatures: 2.75 },
  { bank: 'Kangaroo Savings', country: 'Australia', app: 'Roo Bank', screensCount: 15, targetAvgRating: 3.33, targetAvgScore: 61.3, accessPct: 73.33, avgFeatures: 3.00 },
  { bank: 'Verde Brasil Bank', country: 'Brazil', app: 'Verde App', screensCount: 16, targetAvgRating: 3.12, targetAvgScore: 59.1, accessPct: 56.25, avgFeatures: 3.00 },
];

const CATEGORIES = [
  'Login',
  'Investments',
  'Loans',
  'Statements',
  'Transfers',
  'Settings',
  'Payments',
  'Notifications',
  'Support',
  'Onboarding',
  'Cards',
  'Accounts',
  'Dashboard',
];

const SCREEN_NAME_MAP: Record<string, string[]> = {
  Login: ['Biometric Login', 'Passkey Authentication', 'Two-Factor Challenge', 'Quick PIN Unlock'],
  Investments: ['Portfolio Overview', 'Stock & ETF Holdings', 'Wealth Advisory', 'Yield Analytics'],
  Loans: ['Instant Loan Approval', 'Mortgage Repayment Tracker', 'Personal Credit Line', 'Rate Calculator'],
  Statements: ['Monthly E-Statements', 'Tax Certificate Export', 'Audit Trail', 'Transaction Statement'],
  Transfers: ['Instant Wire Transfer', 'P2P Contact Pay', 'Scheduled Recurring Wire', 'Global Remittance'],
  Settings: ['Security Preferences', 'Card PIN Reset', 'Push Alert Triggers', 'Language & Region'],
  Payments: ['Utility Bill Pay', 'Merchant QR Pay', 'NFC Tap & Settle', 'Direct Debit Setup'],
  Notifications: ['Fraud Alert Inbox', 'Deposit Confirmation', 'Spending Warning', 'Account Bulletins'],
  Support: ['24/7 AI Concierge', 'Secure Banker Chat', 'Branch Appointment', 'Dispute Resolution'],
  Onboarding: ['Identity Verification', 'KYC Document Scan', 'Terms Acceptance', 'Card Activation'],
  Cards: ['Virtual Card Manager', 'Instant Freeze & Limits', 'Rewards & Points', 'Travel Notice'],
  Accounts: ['Chequing Summary', 'High-Yield Savings Vault', 'Fixed Deposit Vault', 'Overdraft Overview'],
  Dashboard: ['Primary Account Widget', 'Daily Spending Summary', 'Cashflow Snapshot', 'Quick Action Hub'],
};

const FEATURES_POOL = [
  'Biometrics',
  'Card Controls',
  'Bill Pay',
  'Quick Transfer',
  'Spending Analytics',
  'Investment Tracking',
  'Multi-Currency',
  'QR Pay',
  'Savings Goal',
  'Dark Mode',
  'Help & Support',
  'Budget Alerts',
  'Instant Pay',
  'Statements Download',
  'Card Freeze',
  'Virtual Card',
];

const AUTH_METHODS = ['Biometric', 'Password', 'Multi-Factor', 'PIN', 'SMS OTP', 'Face ID', 'Card Pin', 'Passkey'];

export function generateBenchmarkDataset(): RawRecord[] {
  const records: RawRecord[] = [];
  let recordCounter = 10001;
  const contributors = ['contributor_A.csv', 'contributor_B.csv', 'contributor_C.xlsx'];

  // 1. Generate 184 valid records matching the 12 banks
  BANK_SPECS.forEach((spec, bankIdx) => {
    // Generate screens for this bank
    for (let s = 1; s <= spec.screensCount; s++) {
      const recId = `R${recordCounter++}`;
      const cat = CATEGORIES[(s - 1) % CATEGORIES.length];
      const screenNames = SCREEN_NAME_MAP[cat] || ['Screen View'];
      const screenName = screenNames[(s - 1) % screenNames.length];

      // File source rotation
      const sourceFile = contributors[(bankIdx + s) % contributors.length];
      const collectedBy = sourceFile.includes('A') ? 'Kanmani S.' : sourceFile.includes('B') ? 'Salman K.' : 'DIT Intern Lead';

      // Pick features according to spec.avgFeatures
      const featCount = Math.max(1, Math.min(4, Math.round(spec.avgFeatures + (s % 2 === 0 ? 0.3 : -0.3))));
      const shuffledFeats = [...FEATURES_POOL].sort((a, b) => (a.charCodeAt(0) * (s + 3)) % 7 - (b.charCodeAt(0) * (s + 3)) % 7);
      const chosenFeats = shuffledFeats.slice(0, featCount).join('; ');

      // Pick accessibility according to spec.accessPct
      const hasAccessibility = (s / spec.screensCount) <= (spec.accessPct / 100);
      let accessFlag = hasAccessibility ? 'Yes' : 'No';

      // Generate realistic rating centered on spec.targetAvgRating
      const delta = ((s % 5) - 2) * 0.25;
      const rawRating = Math.max(1, Math.min(5, Math.round((spec.targetAvgRating + delta) * 10) / 10));

      // Multi-language
      const langs = s % 3 === 0 ? 'English; French' : s % 4 === 0 ? 'English; Spanish; German' : 'English';

      let countryValue = spec.country;
      let dateValue = `2026-09-${String(10 + (s % 18)).padStart(2, '0')}`;

      // Infiltrate some messy-but-fixable values (BR6) into 12 records
      if (recId === 'R10002') countryValue = 'USA'; // Contributor A alias
      if (recId === 'R10008') countryValue = 'UK'; // Contributor B alias
      if (recId === 'R10015') countryValue = 'UAE'; // Contributor C alias
      if (recId === 'R10022') countryValue = 'RSA'; // South Africa alias
      if (recId === 'R10031') accessFlag = 'y'; // Contributor A lowercase
      if (recId === 'R10045') accessFlag = 'N'; // Contributor B single uppercase
      if (recId === 'R10060') accessFlag = 'yes'; // Contributor C word
      if (recId === 'R10072') dateValue = '2026/09/15'; // slash format
      if (recId === 'R10088') dateValue = '18-09-2026'; // DD-MM-YYYY format
      if (recId === 'R10103') dateValue = '2026.09.22'; // dot format
      if (recId === 'R10125') chosenFeats.concat('  '); // extra trailing space

      records.push({
        record_id: recId,
        bank_name: spec.bank,
        country: countryValue,
        app_name: spec.app,
        screen_no: s,
        screen_name: screenName,
        screen_category: cat,
        features_present: chosenFeats,
        auth_method: AUTH_METHODS[(s + bankIdx) % AUTH_METHODS.length],
        languages_supported: langs,
        accessibility_flag: accessFlag,
        ux_rating: rawRating,
        collected_by: collectedBy,
        collected_date: dateValue,
        source_file: sourceFile,
      });
    }
  });

  // 2. Inject the 10 Rejected Records (8 invalid + 2 duplicates) as documented in Section 8.1 / Figure 4
  const rejectedSamples: RawRecord[] = [
    {
      record_id: 'R10201',
      bank_name: '', // Reason 1: bank name is missing or invalid
      country: 'United States',
      app_name: 'Aurora Mobile',
      screen_no: 25,
      screen_name: 'Settings Security',
      screen_category: 'Settings',
      features_present: 'Biometrics; Card Controls',
      auth_method: 'Face ID',
      languages_supported: 'English',
      accessibility_flag: 'Yes',
      ux_rating: 4.0,
      collected_by: 'Kanmani S.',
      collected_date: '2026-09-12',
      source_file: 'contributor_A.csv',
    },
    {
      record_id: 'R10202',
      bank_name: 'Sakura Financial',
      country: 'Japan',
      app_name: 'Sakura Pay',
      screen_no: 21,
      screen_name: 'Arcade Rewards',
      screen_category: 'Gaming', // Reason 2: invalid screen_category "Gaming"
      features_present: 'Biometrics',
      auth_method: 'Password',
      languages_supported: 'English; Japanese',
      accessibility_flag: 'No',
      ux_rating: 3.5,
      collected_by: 'Salman K.',
      collected_date: '2026-09-14',
      source_file: 'contributor_B.csv',
    },
    {
      record_id: 'R10203',
      bank_name: 'Britannia Trust',
      country: 'United Kingdom',
      app_name: 'Britannia OnLine',
      screen_no: 19,
      screen_name: 'Profile Settings',
      screen_category: 'Settings',
      features_present: 'Biometrics',
      auth_method: 'Password',
      languages_supported: 'English',
      accessibility_flag: 'Yes',
      ux_rating: 7, // Reason 3: UX rating out of range 1-5 (7)
      collected_by: 'Kanmani S.',
      collected_date: '2026-09-18',
      source_file: 'contributor_A.csv',
    },
    {
      record_id: 'R10204',
      bank_name: 'Han River Bank',
      country: 'South Korea',
      app_name: 'HanRiver Direct',
      screen_no: 22,
      screen_name: 'Chat Support Help',
      screen_category: 'Support',
      features_present: 'Help & Support',
      auth_method: 'PIN',
      languages_supported: 'Korean; English',
      accessibility_flag: 'Yes',
      ux_rating: 'abc', // Reason 4: UX rating is missing or invalid ("abc")
      collected_by: 'Salman K.',
      collected_date: '2026-09-20',
      source_file: 'contributor_B.csv',
    },
    {
      record_id: 'R10205',
      bank_name: 'Aurora Bank', // Reason 5: duplicate of (Aurora Bank, Aurora Mobile, 1)
      country: 'United States',
      app_name: 'Aurora Mobile',
      screen_no: 1,
      screen_name: 'Welcome Onboarding Recheck',
      screen_category: 'Onboarding',
      features_present: 'Quick Transfer',
      auth_method: 'Password',
      languages_supported: 'English',
      accessibility_flag: 'No',
      ux_rating: 4.2,
      collected_by: 'DIT Intern Lead',
      collected_date: '2026-09-25',
      source_file: 'contributor_C.xlsx',
    },
    {
      record_id: 'R10206',
      bank_name: 'Maple Leaf Canada',
      country: 'Canada',
      app_name: 'Maple Bank',
      screen_no: 24,
      screen_name: 'Loan Calc Preview',
      screen_category: 'Loans',
      features_present: 'Savings Goal; Biometrics',
      auth_method: 'Multi-Factor',
      languages_supported: 'English; French',
      accessibility_flag: 'Yes',
      ux_rating: 4.0,
      collected_by: 'Kanmani S.',
      collected_date: '2027-01-15', // Reason 6: collected_date is in the future
      source_file: 'contributor_A.csv',
    },
    {
      record_id: 'R10207',
      bank_name: 'Kangaroo Savings',
      country: 'Atlantis', // Reason 7: unsupported country "Atlantis"
      app_name: 'Roo Bank',
      screen_no: 28,
      screen_name: 'Blackbeard Vault',
      screen_category: 'Accounts',
      features_present: 'Biometrics; Instant Pay',
      auth_method: 'Biometric',
      languages_supported: 'English',
      accessibility_flag: 'No',
      ux_rating: 3.0,
      collected_by: 'Salman K.',
      collected_date: '2026-09-28',
      source_file: 'contributor_B.csv',
    },
    {
      record_id: 'R10208',
      bank_name: 'Savanna Bank',
      country: 'South Africa',
      app_name: 'Savanna Connect',
      screen_no: 26,
      screen_name: 'Bill Pay Wire',
      screen_category: 'Payments',
      features_present: 'Bill Pay; Quick Transfer',
      auth_method: 'Telepathy', // Reason 8: invalid auth_method "Telepathy"
      languages_supported: 'English',
      accessibility_flag: 'Yes',
      ux_rating: 3.5,
      collected_by: 'DIT Intern Lead',
      collected_date: '2026-10-02',
      source_file: 'contributor_C.xlsx',
    },
    {
      record_id: 'R10209',
      bank_name: 'Verde Brasil Bank',
      country: 'Brazil',
      app_name: 'Verde App',
      screen_no: 29,
      screen_name: 'Bill Pay Settlement',
      screen_category: 'Payments',
      features_present: 'Teleport; Biometrics', // Reason 9: unknown feature "Teleport"
      auth_method: 'PIN',
      languages_supported: 'Portuguese; English',
      accessibility_flag: 'No',
      ux_rating: 3.1,
      collected_by: 'Salman K.',
      collected_date: '2026-10-04',
      source_file: 'contributor_B.csv',
    },
    {
      record_id: 'R10210',
      bank_name: 'Lion City Bank', // Reason 10: duplicate of (Lion City Bank, LionPay, 1)
      country: 'Singapore',
      app_name: 'LionPay',
      screen_no: 1,
      screen_name: 'Duplicate Login Screen',
      screen_category: 'Login',
      features_present: 'Biometrics; Face ID',
      auth_method: 'Biometric',
      languages_supported: 'English; Mandarin',
      accessibility_flag: 'Yes',
      ux_rating: 4.8,
      collected_by: 'DIT Intern Lead',
      collected_date: '2026-10-05',
      source_file: 'contributor_C.xlsx',
    },
  ];

  records.push(...rejectedSamples);
  return records;
}
