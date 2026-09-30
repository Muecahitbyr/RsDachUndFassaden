// Zentrale Firmendaten – hier ändern, der Rest der Seite liest daraus.
export const company = {
  name: 'RS Dach- und Fassadenreinigung',
  shortName: 'RS',
  street: 'Blütenring 21',
  zip: '87665',
  city: 'Mauerstetten',
  region: 'Mauerstetten und Umgebung',
  phoneDisplay: '01515 0881008',
  phoneHref: 'tel:+4915150881008',
  instagram: {
    handle: 'rs.dach.fassadenreinigung',
    url: 'https://www.instagram.com/rs.dach.fassadenreinigung/',
    // Optional: URLs einzelner Beiträge eintragen, sie werden dann als Embeds angezeigt,
    // z. B. 'https://www.instagram.com/p/XXXXXXXXXXX/'
    posts: [],
  },
  rating: { value: 5.0, count: 4, source: 'Google' },
  // 0 = Sonntag … 6 = Samstag; null = geschlossen
  hours: {
    0: null,
    1: ['08:00', '18:00'],
    2: ['08:00', '18:00'],
    3: ['08:00', '18:00'],
    4: ['08:00', '18:00'],
    5: ['08:00', '18:00'],
    6: null,
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Bl%C3%BCtenring+21%2C+87665+Mauerstetten',
};

export const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
