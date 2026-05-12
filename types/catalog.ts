import { RenewalFrequency, RenewalType } from './renewal';
import { COLORS } from './renewal';

export interface CatalogOption {
  name: string;
  defaultCost: number;
  defaultFrequency: RenewalFrequency;
  defaultType: RenewalType;
  suggestedProvider?: string;
  defaultColor?: string;
  defaultCurrency?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  icon: string; // SF Symbols name
  color?: string;
  options: CatalogOption[];
}

export const CatalogCategories: CatalogCategory[] = [
  {
    id: 'streaming',
    name: 'Streaming y entretenimiento',
    icon: 'play.rectangle.fill',
    color: COLORS[4], // Purple
    options: [
      { name: 'Netflix', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Netflix', defaultCurrency: 'EUR' },
      { name: 'HBO Max', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'HBO', defaultCurrency: 'EUR' },
      { name: 'Disney+', defaultCost: 8.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Disney', defaultCurrency: 'EUR' },
      { name: 'Prime Video', defaultCost: 4.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon', defaultCurrency: 'EUR' },
      { name: 'Spotify', defaultCost: 10.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Spotify', defaultCurrency: 'EUR' },
      { name: 'Apple Music', defaultCost: 10.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Apple', defaultCurrency: 'EUR' },
      { name: 'YouTube Premium', defaultCost: 11.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Google', defaultCurrency: 'EUR' },
      { name: 'DAZN', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'DAZN', defaultCurrency: 'EUR' },
      { name: 'Filmin', defaultCost: 7.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Filmin', defaultCurrency: 'EUR' },
      { name: 'Twitch Turbo', defaultCost: 11.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Twitch', defaultCurrency: 'EUR' },
      { name: 'SkyShowtime', defaultCost: 5.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'SkyShowtime', defaultCurrency: 'EUR' },
      { name: 'Crunchyroll', defaultCost: 7.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Crunchyroll', defaultCurrency: 'EUR' },
      { name: 'Audible', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon', defaultCurrency: 'EUR' },
      { name: 'Plex Pass', defaultCost: 4.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Plex', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'software',
    name: 'Software y productividad',
    icon: 'laptopcomputer',
    color: COLORS[0], // Blue
    options: [
      { name: 'ChatGPT Plus', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OpenAI', defaultCurrency: 'EUR' },
      { name: 'Claude Pro', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Anthropic', defaultCurrency: 'EUR' },
      { name: 'GitHub Copilot', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'GitHub', defaultCurrency: 'EUR' },
      { name: 'Cursor', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Cursor', defaultCurrency: 'EUR' },
      { name: 'Figma', defaultCost: 12.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Figma', defaultCurrency: 'EUR' },
      { name: 'Adobe Creative Cloud', defaultCost: 59.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Adobe', defaultCurrency: 'EUR' },
      { name: 'Notion', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Notion', defaultCurrency: 'EUR' },
      { name: 'Canva', defaultCost: 12.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Canva', defaultCurrency: 'EUR' },
      { name: 'Microsoft 365', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Microsoft', defaultCurrency: 'EUR' },
      { name: 'Google One', defaultCost: 1.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Google', defaultCurrency: 'EUR' },
      { name: 'Dropbox', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Dropbox', defaultCurrency: 'EUR' },
      { name: 'iCloud+', defaultCost: 2.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Apple', defaultCurrency: 'EUR' },
      { name: 'JetBrains', defaultCost: 24.9, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'JetBrains', defaultCurrency: 'EUR' },
      { name: 'Vercel Pro', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Vercel', defaultCurrency: 'EUR' },
      { name: 'Supabase Pro', defaultCost: 25.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Supabase', defaultCurrency: 'EUR' },
      { name: 'Linear', defaultCost: 8.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Linear', defaultCurrency: 'EUR' },
      { name: 'Slack', defaultCost: 7.25, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Slack', defaultCurrency: 'EUR' },
      { name: 'Discord Nitro', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Discord', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'insurance',
    name: 'Seguros',
    icon: 'shield.fill',
    color: COLORS[1], // Green
    options: [
      { name: 'Seguro coche', defaultCost: 450.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mapfre', defaultCurrency: 'EUR' },
      { name: 'Seguro moto', defaultCost: 250.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mapfre', defaultCurrency: 'EUR' },
      { name: 'Seguro hogar', defaultCost: 180.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Mutua', defaultCurrency: 'EUR' },
      { name: 'Seguro salud', defaultCost: 60.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Sanitas', defaultCurrency: 'EUR' },
      { name: 'Seguro dental', defaultCost: 15.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Sanitas', defaultCurrency: 'EUR' },
      { name: 'Seguro vida', defaultCost: 30.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'AXA', defaultCurrency: 'EUR' },
      { name: 'Seguro mascotas', defaultCost: 25.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'PetPlan', defaultCurrency: 'EUR' },
      { name: 'Seguro viaje', defaultCost: 50.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Iati', defaultCurrency: 'EUR' },
      { name: 'Seguro móvil', defaultCost: 12.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Movistar', defaultCurrency: 'EUR' },
      { name: 'Seguro bicicleta', defaultCost: 8.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Caser', defaultCurrency: 'EUR' },
      { name: 'Seguro autónomo', defaultCost: 45.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'AXA', defaultCurrency: 'EUR' },
      { name: 'Seguro responsabilidad civil', defaultCost: 120.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'Hiscox', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'housing',
    name: 'Vivienda y suministros',
    icon: 'house.fill',
    color: COLORS[2], // Orange
    options: [
      { name: 'Electricidad', defaultCost: 75.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Iberdrola', defaultCurrency: 'EUR' },
      { name: 'Gas', defaultCost: 45.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Naturgy', defaultCurrency: 'EUR' },
      { name: 'Agua', defaultCost: 25.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'Canal Isabel II', defaultCurrency: 'EUR' },
      { name: 'Internet', defaultCost: 39.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Movistar', defaultCurrency: 'EUR' },
      { name: 'Línea móvil', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Vodafone', defaultCurrency: 'EUR' },
      { name: 'Alarma', defaultCost: 29.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Securitas', defaultCurrency: 'EUR' },
      { name: 'Comunidad', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other', defaultCurrency: 'EUR' },
      { name: 'IBI', defaultCost: 350.0, defaultFrequency: 'annual', defaultType: 'other', defaultCurrency: 'EUR' },
      { name: 'Hipoteca', defaultCost: 650.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Santander', defaultCurrency: 'EUR' },
      { name: 'Alquiler', defaultCost: 800.0, defaultFrequency: 'monthly', defaultType: 'other', defaultCurrency: 'EUR' },
      { name: 'Parking', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other', defaultCurrency: 'EUR' },
      { name: 'Trastero', defaultCost: 40.0, defaultFrequency: 'monthly', defaultType: 'other', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'finance',
    name: 'Finanzas',
    icon: 'creditcard.fill',
    color: COLORS[5], // Pink
    options: [
      { name: 'Tarjeta crédito', defaultCost: 30.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'BBVA', defaultCurrency: 'EUR' },
      { name: 'Cuota bancaria', defaultCost: 5.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'CaixaBank', defaultCurrency: 'EUR' },
      { name: 'Comisión cuenta', defaultCost: 3.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'Santander', defaultCurrency: 'EUR' },
      { name: 'Préstamo', defaultCost: 200.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'BBVA', defaultCurrency: 'EUR' },
      { name: 'Renting', defaultCost: 350.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Alphabet', defaultCurrency: 'EUR' },
      { name: 'Leasing', defaultCost: 450.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Santander', defaultCurrency: 'EUR' },
      { name: 'Broker', defaultCost: 2.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Interactive Brokers', defaultCurrency: 'EUR' },
      { name: 'Plataforma inversión', defaultCost: 1.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'MyInvestor', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'health',
    name: 'Salud y deporte',
    icon: 'heart.fill',
    color: COLORS[3], // Red
    options: [
      { name: 'Gimnasio', defaultCost: 39.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Basic-Fit', defaultCurrency: 'EUR' },
      { name: 'Rocódromo', defaultCost: 45.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Indoorwall', defaultCurrency: 'EUR' },
      { name: 'CrossFit', defaultCost: 65.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'CrossFit Box', defaultCurrency: 'EUR' },
      { name: 'Yoga', defaultCost: 50.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Yoga Studio', defaultCurrency: 'EUR' },
      { name: 'Fisioterapia', defaultCost: 40.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'FisioCenter', defaultCurrency: 'EUR' },
      { name: 'Nutricionista', defaultCost: 60.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Nutrición Plus', defaultCurrency: 'EUR' },
      { name: 'Entrenador personal', defaultCost: 150.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'FitPro', defaultCurrency: 'EUR' },
      { name: 'Mutua deportiva', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'insurance', suggestedProvider: 'Madrid Deportiva', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'transport',
    name: 'Transporte',
    icon: 'car.fill',
    color: COLORS[6], // Cyan
    options: [
      { name: 'Abono transporte', defaultCost: 54.6, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Metro', defaultCurrency: 'EUR' },
      { name: 'Carsharing', defaultCost: 9.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'ShareNow', defaultCurrency: 'EUR' },
      { name: 'Parking', defaultCost: 60.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Empark', defaultCurrency: 'EUR' },
      { name: 'Peajes', defaultCost: 20.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Vía-T', defaultCurrency: 'EUR' },
      { name: 'Carga vehículo eléctrico', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Endesa X', defaultCurrency: 'EUR' },
      { name: 'Suscripción coche', defaultCost: 299.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Bipi', defaultCurrency: 'EUR' },
      { name: 'Bicicleta pública', defaultCost: 25.0, defaultFrequency: 'annual', defaultType: 'subscription', suggestedProvider: 'BiciMAD', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'technology',
    name: 'Tecnología y hardware',
    icon: 'server.rack',
    color: COLORS[7], // Yellow
    options: [
      { name: 'Dominio web', defaultCost: 12.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Cloudflare', defaultCurrency: 'EUR' },
      { name: 'Hosting', defaultCost: 8.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OVHcloud', defaultCurrency: 'EUR' },
      { name: 'VPS', defaultCost: 5.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Hetzner', defaultCurrency: 'EUR' },
      { name: 'Cloud storage', defaultCost: 6.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Wasabi', defaultCurrency: 'EUR' },
      { name: 'VPN', defaultCost: 3.5, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Mullvad', defaultCurrency: 'EUR' },
      { name: 'NAS', defaultCost: 0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Synology', defaultCurrency: 'EUR' },
      { name: 'Antivirus', defaultCost: 29.99, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Bitdefender', defaultCurrency: 'EUR' },
      { name: 'AppleCare', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Apple', defaultCurrency: 'EUR' },
      { name: 'Garantía ampliada', defaultCost: 49.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'MediaMarkt', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'education',
    name: 'Educación',
    icon: 'book.fill',
    color: COLORS[0], // Blue
    options: [
      { name: 'Udemy', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Udemy', defaultCurrency: 'EUR' },
      { name: 'Platzi', defaultCost: 16.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Platzi', defaultCurrency: 'EUR' },
      { name: 'Coursera', defaultCost: 49.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Coursera', defaultCurrency: 'EUR' },
      { name: 'Domestika', defaultCost: 8.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Domestika', defaultCurrency: 'EUR' },
      { name: 'Duolingo', defaultCost: 6.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Duolingo', defaultCurrency: 'EUR' },
      { name: 'OpenAI Academy', defaultCost: 0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'OpenAI', defaultCurrency: 'EUR' },
      { name: 'Academia idiomas', defaultCost: 80.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Wall Street English', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'pets',
    name: 'Mascotas',
    icon: 'pawprint.fill',
    color: COLORS[5], // Pink
    options: [
      { name: 'Seguro mascota', defaultCost: 25.0, defaultFrequency: 'annual', defaultType: 'insurance', suggestedProvider: 'PetPlan', defaultCurrency: 'EUR' },
      { name: 'Veterinario', defaultCost: 30.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'VetCenter', defaultCurrency: 'EUR' },
      { name: 'Suscripción comida', defaultCost: 35.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Barkyn', defaultCurrency: 'EUR' },
      { name: 'Peluquería', defaultCost: 25.0, defaultFrequency: 'quarterly', defaultType: 'other', suggestedProvider: 'PeluCan', defaultCurrency: 'EUR' },
      { name: 'Guardería', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'DoggyDay', defaultCurrency: 'EUR' },
    ],
  },
  {
    id: 'others',
    name: 'Otros',
    icon: 'tag.fill',
    color: COLORS[4], // Purple
    options: [
      { name: 'Donaciones', defaultCost: 10.0, defaultFrequency: 'monthly', defaultType: 'other', suggestedProvider: 'Patreon', defaultCurrency: 'EUR' },
      { name: 'Patreon', defaultCost: 5.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Patreon', defaultCurrency: 'EUR' },
      { name: 'Cuota asociación', defaultCost: 30.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Asociación', defaultCurrency: 'EUR' },
      { name: 'Club deportivo', defaultCost: 50.0, defaultFrequency: 'annual', defaultType: 'other', suggestedProvider: 'Club', defaultCurrency: 'EUR' },
      { name: 'Amazon Subscribe', defaultCost: 15.0, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Amazon', defaultCurrency: 'EUR' },
      { name: 'Caja sorpresa', defaultCost: 24.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Birchbox', defaultCurrency: 'EUR' },
      { name: 'Revistas', defaultCost: 9.99, defaultFrequency: 'monthly', defaultType: 'subscription', suggestedProvider: 'Zinio', defaultCurrency: 'EUR' },
    ],
  },
];
