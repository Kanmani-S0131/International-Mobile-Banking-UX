import { RawLead } from '../types/crm';

export function generateBenchmarkLeads(): RawLead[] {
  const leads: RawLead[] = [];

  // Company and Industry pools
  const companies = [
    { name: 'Apex Tech Solutions', ind: 'Information Technology' },
    { name: 'Zenith Logistics', ind: 'Logistics & Supply' },
    { name: 'Bharat Health Informatics', ind: 'Healthcare' },
    { name: 'Vanguard Retail India', ind: 'Retail & E-commerce' },
    { name: 'Omni Financial Labs', ind: 'Fintech & Banking' },
    { name: 'Kavita Solar Dynamics', ind: 'Clean Energy' },
    { name: 'Orion Automations', ind: 'Manufacturing' },
    { name: 'Shakti Agrotech', ind: 'Agriculture' },
    { name: 'Pinnacle Edusystems', ind: 'Education' },
    { name: 'Tata Smart Infra', ind: 'Infrastructure' },
    { name: 'Indus Media Works', ind: 'Media & Advertising' },
    { name: 'Chola Capital Partners', ind: 'Financial Services' },
  ];

  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Pooja', 'Vikram', 'Sneha', 'Aditya', 'Divya', 'Siddharth', 'Neha', 'Karan', 'Kavya', 'Gaurav', 'Rhea', 'Manish', 'Meera'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Iyer', 'Gupta', 'Menon', 'Reddy', 'Deshmukh', 'Chakraborty', 'Kapoor', 'Bose', 'Nair'];

  // Distribution to match Table 7.2:
  // Referral: 19, Webinar: 24, Trade Show: 23, Website: 16, Social Media: 13, Cold Call: 13 (Total 108 unique)
  const sourceDist: { source: string; count: number; hotTarget: number; convertedTarget: number }[] = [
    { source: 'Referral', count: 19, hotTarget: 12, convertedTarget: 0 },
    { source: 'Webinar', count: 24, hotTarget: 11, convertedTarget: 2 },
    { source: 'Trade Show', count: 23, hotTarget: 8, convertedTarget: 1 },
    { source: 'Website', count: 16, hotTarget: 6, convertedTarget: 0 },
    { source: 'Social Media', count: 13, hotTarget: 1, convertedTarget: 0 },
    { source: 'Cold Call', count: 13, hotTarget: 1, convertedTarget: 0 },
  ];

  const regions = ['North', 'South', 'West', 'East'];
  let leadNum = 100;

  // We need exactly 45 leads with status 'New' across the 108 unique leads
  let newStatusRemaining = 45;

  sourceDist.forEach((sd) => {
    for (let i = 0; i < sd.count; i++) {
      leadNum++;
      const leadId = `L${leadNum.toString().padStart(4, '0')}`;
      const fn = firstNames[(leadNum * 7) % firstNames.length];
      const ln = lastNames[(leadNum * 5) % lastNames.length];
      const comp = companies[(leadNum * 3) % companies.length];
      const region = regions[leadNum % regions.length];

      const isHot = i < sd.hotTarget;
      const isConverted = i < sd.convertedTarget;

      // Assign Status: exactly 45 'New' leads total
      let status = 'Contacted';
      if (isConverted) {
        status = 'Converted';
      } else if (newStatusRemaining > 0 && (i % 2 === 0 || newStatusRemaining >= (108 - (leadNum - 100)))) {
        status = 'New';
        newStatusRemaining--;
      } else if (leadNum % 5 === 0) {
        status = 'Qualified';
      } else if (leadNum % 17 === 0) {
        status = 'Lost';
      }

      // Timeline & Budget
      let budget = 350000;
      let compSize = 40;
      let timeline = '1-3 Months';
      let webVisits = 3;
      let emailsOpened = 2;

      if (isHot) {
        // Hot leads: Score >= 70
        budget = 1200000 + (leadNum % 4) * 200000; // >= 10L (25 pts)
        compSize = 250 + (leadNum % 5) * 50; // 200+ (15 pts)
        timeline = '0-1 Months'; // (20 pts)
        webVisits = 6 + (leadNum % 3);
        emailsOpened = 4 + (leadNum % 2); // engagement >= 15 pts
      } else if (leadNum % 15 === 0) {
        // Cold leads: Score < 40 (we need 7 Cold leads total)
        budget = 50000 + (leadNum % 2) * 20000; // < 1L (5 pts)
        compSize = 5; // 1-10 (3 pts)
        timeline = '6+ Months'; // (2 pts)
        webVisits = 0;
        emailsOpened = 1; // engagement 1 pt
      } else {
        // Warm leads: Score 40 to 69
        budget = 550000 + (leadNum % 3) * 100000; // 5L+ (20 pts)
        compSize = 65 + (leadNum % 4) * 20; // 50-199 (10 pts)
        timeline = '1-3 Months'; // (12 pts)
        webVisits = 3;
        emailsOpened = 2; // engagement 8 pts
      }

      // Phone format: test +91 variation for some
      const basePhone = `98${Math.floor(10000000 + (leadNum * 64321) % 89999999)}`;
      const phoneStr = leadNum % 3 === 0 ? `+91 ${basePhone.slice(0, 5)} ${basePhone.slice(5)}` : basePhone;

      // Created dates between 2026-09-01 and 2026-10-20 (so all 'New' are past SLA at 2026-11-02)
      const dayOffset = 10 + (leadNum % 35);
      const createdDate = `2026-09-${dayOffset.toString().padStart(2, '0')}`;

      leads.push({
        lead_id: leadId,
        name: `${fn} ${ln}`,
        company: comp.name,
        industry: comp.ind,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}_${leadNum}@${comp.name.toLowerCase().replace(/[^a-z]/g, '')}.in`,
        phone: phoneStr,
        source: sd.source,
        region,
        created_date: createdDate,
        status,
        budget,
        company_size: compSize,
        timeline,
        website_visits: webVisits,
        emails_opened: emailsOpened,
      });
    }
  });

  // 2. Deliberate 6 Duplicate Records (same email, later created date)
  const dupTargets = [leads[0], leads[5], leads[12], leads[20], leads[32], leads[45]];
  dupTargets.forEach((orig, idx) => {
    leads.push({
      lead_id: `L009${idx + 1}`,
      name: orig.name,
      company: orig.company,
      industry: orig.industry,
      email: orig.email, // Exact same email
      phone: orig.phone,
      source: orig.source,
      region: orig.region,
      created_date: '2026-10-28', // Later date than original
      status: 'New',
      budget: orig.budget,
      company_size: orig.company_size,
      timeline: orig.timeline,
      website_visits: 1,
      emails_opened: 1,
    });
  });

  // 3. Deliberate 12 Rejected Records (matching Figure 3 and Section 4.1 exactly)
  const rejectedRecords: RawLead[] = [
    // 4 Invalid emails
    {
      lead_id: 'L0011',
      name: 'Rajesh Kanna',
      company: 'Kanna Logistics',
      industry: 'Logistics',
      email: 'rajesh.kanna_at_gmail.com', // invalid email
      phone: '9845123456',
      source: 'Referral',
      region: 'South',
      created_date: '2026-10-01',
      status: 'New',
      budget: 600000,
      company_size: 45,
      timeline: '1-3 Months',
      website_visits: 4,
      emails_opened: 2,
    },
    {
      lead_id: 'L0012',
      name: 'Sunita Rao',
      company: 'Rao Biotech',
      industry: 'Healthcare',
      email: 'sunita.rao@', // invalid email
      phone: '9845123457',
      source: 'Website',
      region: 'North',
      created_date: '2026-10-02',
      status: 'New',
      budget: 450000,
      company_size: 25,
      timeline: '3-6 Months',
      website_visits: 2,
      emails_opened: 1,
    },
    {
      lead_id: 'L0013',
      name: 'Prakash Jena',
      company: 'East Minerals',
      industry: 'Manufacturing',
      email: 'prakash_jena.com', // invalid email
      phone: '9845123458',
      source: 'Trade Show',
      region: 'East',
      created_date: '2026-10-03',
      status: 'New',
      budget: 800000,
      company_size: 150,
      timeline: '0-1 Months',
      website_visits: 5,
      emails_opened: 3,
    },
    {
      lead_id: 'L0014',
      name: 'Manoj Tiwari',
      company: 'Tiwari Infra',
      industry: 'Construction',
      email: 'manoj@@tiwari.co', // invalid email
      phone: '9845123459',
      source: 'Webinar',
      region: 'North',
      created_date: '2026-10-04',
      status: 'New',
      budget: 1500000,
      company_size: 220,
      timeline: '0-1 Months',
      website_visits: 8,
      emails_opened: 4,
    },
    // 3 Missing phones
    {
      lead_id: 'L0021',
      name: 'Farhan Akhtar',
      company: 'Akhtar Studios',
      industry: 'Media',
      email: 'farhan@akhtarstudios.in',
      phone: '', // missing phone
      source: 'Social Media',
      region: 'West',
      created_date: '2026-10-05',
      status: 'New',
      budget: 300000,
      company_size: 15,
      timeline: '1-3 Months',
      website_visits: 2,
      emails_opened: 1,
    },
    {
      lead_id: 'L0022',
      name: 'Swati Deshmukh',
      company: 'Deshmukh Agro',
      industry: 'Agriculture',
      email: 'swati@deshmukh.in',
      phone: '12345', // invalid short phone
      source: 'Cold Call',
      region: 'West',
      created_date: '2026-10-06',
      status: 'New',
      budget: 200000,
      company_size: 10,
      timeline: '6+ Months',
      website_visits: 0,
      emails_opened: 0,
    },
    {
      lead_id: 'L0023',
      name: 'Gautam Singhal',
      company: 'Singhal Exports',
      industry: 'Retail',
      email: 'gautam@singhalexports.in',
      phone: '', // missing phone
      source: 'Referral',
      region: 'North',
      created_date: '2026-10-07',
      status: 'New',
      budget: 1200000,
      company_size: 80,
      timeline: '0-1 Months',
      website_visits: 7,
      emails_opened: 4,
    },
    // 2 Invalid created dates
    {
      lead_id: 'L0031',
      name: 'Naveen Jindal',
      company: 'Jindal Steels',
      industry: 'Manufacturing',
      email: 'naveen@jindalsteels.in',
      phone: '9811223344',
      source: 'Trade Show',
      region: 'East',
      created_date: '2026-15-40', // invalid date
      status: 'New',
      budget: 2000000,
      company_size: 500,
      timeline: '0-1 Months',
      website_visits: 6,
      emails_opened: 5,
    },
    {
      lead_id: 'L0032',
      name: 'Kavita Pillai',
      company: 'Pillai Organics',
      industry: 'Healthcare',
      email: 'kavita@pillaiorganics.com',
      phone: '9811223345',
      source: 'Webinar',
      region: 'South',
      created_date: 'invalid_date_str', // invalid date
      status: 'New',
      budget: 500000,
      company_size: 35,
      timeline: '1-3 Months',
      website_visits: 3,
      emails_opened: 2,
    },
    // 2 Negative budgets
    {
      lead_id: 'L0041',
      name: 'Ashwin Kumar',
      company: 'Kumar Finserve',
      industry: 'Finance',
      email: 'ashwin@kumarfinserve.com',
      phone: '9811223346',
      source: 'Referral',
      region: 'South',
      created_date: '2026-10-08',
      status: 'New',
      budget: -50000, // negative budget
      company_size: 60,
      timeline: '1-3 Months',
      website_visits: 3,
      emails_opened: 2,
    },
    {
      lead_id: 'L0042',
      name: 'Deepak Joshi',
      company: 'Joshi Retailers',
      industry: 'Retail',
      email: 'deepak@joshiretail.in',
      phone: '9811223347',
      source: 'Website',
      region: 'West',
      created_date: '2026-10-09',
      status: 'New',
      budget: -100000, // negative budget
      company_size: 20,
      timeline: '3-6 Months',
      website_visits: 2,
      emails_opened: 1,
    },
    // 1 Unknown source
    {
      lead_id: 'L0051',
      name: 'Rameshwar Lal',
      company: 'Lal Textiles',
      industry: 'Manufacturing',
      email: 'rameshwar@laltextiles.in',
      phone: '9811223348',
      source: 'billboard', // unknown source
      region: 'North',
      created_date: '2026-10-10',
      status: 'New',
      budget: 700000,
      company_size: 90,
      timeline: '1-3 Months',
      website_visits: 4,
      emails_opened: 2,
    },
  ];

  leads.push(...rejectedRecords);

  // Total = 108 unique valid leads + 6 duplicate leads + 12 rejected leads = 126 records!
  return leads;
}
