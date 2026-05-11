import { RenewalFrequency, RenewalType } from './renewal';

export interface CatalogOption {
  name: string;
  defaultCost: number;
  defaultFrequency: RenewalFrequency;
  defaultType: RenewalType;
  suggestedProvider?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  icon: string; // SF Symbols name
  options: CatalogOption[];
}

export const CatalogCategories: CatalogCategory[] = [
  {
    id: 'streaming',
    name: 'Streaming y entretenimiento',
    icon: 'play.rectangle.fill',
    options: [
      { name: 'Netflix', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Netflix' },
      { name: 'HBO Max', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'HBO' },
      { name: 'Disney+', defaultCost: 8.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Disney' },
      { name: 'Prime Video', defaultCost: 4.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon' },
      { name: 'Spotify', defaultCost: 10.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Spotify' },
      { name: 'Apple Music', defaultCost: 10.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Apple' },
      { name: 'YouTube Premium', defaultCost: 11.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Google' },
      { name: 'DAZN', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'DAZN' },
      { name: 'Filmin', defaultCost: 7.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Filmin' },
      { name: 'Twitch Turbo', defaultCost: 11.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Twitch' },
      { name: 'SkyShowtime', defaultCost: 5.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'SkyShowtime' },
      { name: 'Crunchyroll', defaultCost: 7.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Crunchyroll' },
      { name: 'Audible', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon' },
      { name: 'Plex Pass', defaultCost: 4.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Plex' },
    ],
  },
  {
    id: 'software',
    name: 'Software y productividad',
    icon: 'laptopcomputer',
    options: [
      { name: 'ChatGPT Plus', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OpenAI' },
      { name: 'Claude Pro', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Anthropic' },
      { name: 'GitHub Copilot', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'GitHub' },
      { name: 'Cursor', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Cursor' },
      { name: 'Figma', defaultCost: 12.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Figma' },
      { name: 'Adobe Creative Cloud', defaultCost: 59.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Adobe' },
      { name: 'Notion', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Notion' },
      { name: 'Canva', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Canva' },
      { name: 'Microsoft 365', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Microsoft' },
      { name: 'Google One', defaultCost: 1.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Google' },
      { name: 'Dropbox', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Dropbox' },
      { name: 'iCloud+', defaultCost: 2.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Apple' },
      { name: 'JetBrains', defaultCost: 24.9, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'JetBrains' },
      { name: 'Vercel Pro', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Vercel' },
      { name: 'Supabase Pro', defaultCost: 25.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Supabase' },
      { name: 'Linear', defaultCost: 8.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Linear' },
      { name: 'Slack', defaultCost: 7.25, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Slack' },
      { name: 'Discord Nitro', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Discord' },
    ],
  },
  {
    id: 'insurance',
    name: 'Seguros',
    icon: 'shield.fill',
    options: [
      { name: 'Seguro coche', defaultCost: 450.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mapfre' },
      { name: 'Seguro moto', defaultCost: 250.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mapfre' },
      { name: 'Seguro hogar', defaultCost: 180.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mutua' },
      { name: 'Seguro salud', defaultCost: 60.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Sanitas' },
      { name: 'Seguro dental', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Sanitas' },
      { name: 'Seguro vida', defaultCost: 30.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'AXA' },
      { name: 'Seguro mascotas', defaultCost: 25.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'PetPlan' },
      { name: 'Seguro viaje', defaultCost: 50.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Iati' },
      { name: 'Seguro móvil', defaultCost: 12.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Movistar' },
      { name: 'Seguro bicicleta', defaultCost: 8.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Caser' },
      { name: 'Seguro autónomo', defaultCost: 45.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'AXA' },
      { name: 'Seguro responsabilidad civil', defaultCost: 120.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Hiscox' },
    ],
  },
  {
    id: 'housing',
    name: 'Vivienda y suministros',
    icon: 'house.fill',
    options: [
      { name: 'Electricidad', defaultCost: 75.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Iberdrola' },
      { name: 'Gas', defaultCost: 45.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Naturgy' },
      { name: 'Agua', defaultCost: 25.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'Canal Isabel II' },
      { name: 'Internet', defaultCost: 39.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Movistar' },
      { name: 'Línea móvil', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Vodafone' },
      { name: 'Alarma', defaultCost: 29.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Securitas' },
      { name: 'Comunidad', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other' },
      { name: 'IBI', defaultCost: 350.0, defaultFrequency: 'annual', defaultType: 'other' },
      { name: 'Hipoteca', defaultCost: 650.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Santander' },
      { name: 'Alquiler', defaultCost: 800.0, defaultFrequency: 'monthly', defaultType: 'other' },
      { name: 'Parking', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other' },
      { name: 'Trastero', defaultCost: 40.0, defaultFrequency: 'monthly', defaultType: 'other' },
    ],
  },
  {
    id: 'finance',
    name: 'Finanzas',
    icon: 'creditcard.fill',
    options: [
      { name: 'Tarjeta crédito', defaultCost: 30.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'BBVA' },
      { name: 'Cuota bancaria', defaultCost: 5.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'CaixaBank' },
      { name: 'Comisión cuenta', defaultCost: 3.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'Santander' },
      { name: 'Préstamo', defaultCost: 200.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'BBVA' },
      { name: 'Renting', defaultCost: 350.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Alphabet' },
      { name: 'Leasing', defaultCost: 450.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Santander' },
      { name: 'Broker', defaultCost: 2.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Interactive Brokers' },
      { name: 'Plataforma inversión', defaultCost: 1.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'MyInvestor' },
    ],
  },
  {
    id: 'health',
    name: 'Salud y deporte',
    icon: 'heart.fill',
    options: [
      { name: 'Gimnasio', defaultCost: 39.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Basic-Fit' },
      { name: 'Rocódromo', defaultCost: 45.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Indoorwall' },
      { name: 'CrossFit', defaultCost: 65.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'CrossFit Box' },
      { name: 'Yoga', defaultCost: 50.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Yoga Studio' },
      { name: 'Fisioterapia', defaultCost: 40.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'FisioCenter' },
      { name: 'Nutricionista', defaultCost: 60.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Nutrición Plus' },
      { name: 'Entrenador personal', defaultCost: 150.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'FitPro' },
      { name: 'Mutua deportiva', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Madrid Deportiva' },
    ],
  },
  {
    id: 'transport',
    name: 'Transporte',
    icon: 'car.fill',
    options: [
      { name: 'Abono transporte', defaultCost: 54.6, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Metro' },
      { name: 'Carsharing', defaultCost: 9.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'ShareNow' },
      { name: 'Parking', defaultCost: 60.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Empark' },
      { name: 'Peajes', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Vía-T' },
      { name: 'Carga vehículo eléctrico', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Endesa X' },
      { name: 'Suscripción coche', defaultCost: 299.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Bipi' },
      { name: 'Bicicleta pública', defaultCost: 25.0, defaultFrequency: 'annual', defaultType: 'subscription', suggestedProvider: 'BiciMAD' },
    ],
  },
  {
    id: 'technology',
    name: 'Tecnología y hardware',
    icon: 'server.rack',
    options: [
      { name: 'Dominio web', defaultCost: 12.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Cloudflare' },
      { name: 'Hosting', defaultCost: 8.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OVHcloud' },
      { name: 'VPS', defaultCost: 5.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Hetzner' },
      { name: 'Cloud storage', defaultCost: 6.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Wasabi' },
      { name: 'VPN', defaultCost: 3.5, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Mullvad' },
      { name: 'NAS', defaultCost: 0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Synology' },
      { name: 'Antivirus', defaultCost: 29.99, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Bitdefender' },
      { name: 'AppleCare', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Apple' },
      { name: 'Garantía ampliada', defaultCost: 49.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'MediaMarkt' },
    ],
  },
  {
    id: 'education',
    name: 'Educación',
    icon: 'book.fill',
    options: [
      { name: 'Udemy', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Udemy' },
      { name: 'Platzi', defaultCost: 16.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Platzi' },
      { name: 'Coursera', defaultCost: 49.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Coursera' },
      { name: 'Domestika', defaultCost: 8.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Domestika' },
      { name: 'Duolingo', defaultCost: 6.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Duolingo' },
      { name: 'OpenAI Academy', defaultCost: 0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OpenAI' },
      { name: 'Academia idiomas', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Wall Street English' },
    ],
  },
  {
    id: 'pets',
    name: 'Mascotas',
    icon: 'pawprint.fill',
    options: [
      { name: 'Seguro mascota', defaultCost: 25.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'PetPlan' },
      { name: 'Veterinario', defaultCost: 30.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'VetCenter' },
      { name: 'Suscripción comida', defaultCost: 35.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Barkyn' },
      { name: 'Peluquería', defaultCost: 25.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'PeluCan' },
      { name: 'Guardería', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'DoggyDay' },
    ],
  },
  {
    id: 'others',
    name: 'Otros',
    icon: 'tag.fill',
    options: [
      { name: 'Donaciones', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Patreon' },
      { name: 'Patreon', defaultCost: 5.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Patreon' },
      { name: 'Cuota asociación', defaultCost: 30.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Asociación' },
      { name: 'Club deportivo', defaultCost: 50.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Club' },
      { name: 'Amazon Subscribe', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon' },
      { name: 'Caja sorpresa', defaultCost: 24.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Birchbox' },
      { name: 'Revistas', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Zinio' },
    ],
  },
];
