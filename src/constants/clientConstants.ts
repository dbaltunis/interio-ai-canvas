// Centralized funnel stages - single source of truth
// Includes all stages from database to ensure all clients are displayed
export const FUNNEL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-700', description: 'New potential customer' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700', description: 'Initial contact made' },
  { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-700', description: 'Confirmed interest and budget' },
  { value: 'measuring_scheduled', label: 'Measuring', color: 'bg-indigo-100 text-indigo-700', description: 'Measurement scheduled' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-700', description: 'Quote sent to client' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-700', description: 'Proposal sent' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700', description: 'Discussing terms' },
  { value: 'approved', label: 'Approved', color: 'bg-teal-100 text-teal-700', description: 'Quote approved' },
  { value: 'in_production', label: 'In Production', color: 'bg-cyan-100 text-cyan-700', description: 'Order in production' },
  { value: 'closed', label: 'Closed', color: 'bg-emerald-100 text-emerald-700', description: 'Project completed' },
  { value: 'client', label: 'Client', color: 'bg-green-100 text-green-700', description: 'Active customer' },
  { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-700', description: 'Converted customer' },
  { value: 'trial', label: 'Trial', color: 'bg-sky-100 text-sky-700', description: 'On trial period' },
  { value: 'churned', label: 'Churned', color: 'bg-gray-200 text-gray-600', description: 'No longer active' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700', description: 'Did not convert' },
] as const;

export type FunnelStageValue = typeof FUNNEL_STAGES[number]['value'];

// Helper function to get stage by value
export const getStageByValue = (value: string) => {
  return FUNNEL_STAGES.find(stage => stage.value === value);
};

// All countries - comprehensive list
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
] as const;

export type Country = typeof COUNTRIES[number];
