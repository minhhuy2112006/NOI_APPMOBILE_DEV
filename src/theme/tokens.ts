// NOI web palette, enriched pink/blue for mobile at user request.
export const theme = {
  colors: {
    primary: '#BB3195', primarySoft: '#F9D5ED', primaryInk: '#8F2F78', background: '#E5F1FF',
    surface: '#FFFFFF', text: '#22304A', muted: '#5C6A80', border: '#CCDCF2',
    accent: '#DF328F', onPrimary: '#FFFFFF', blue: '#2475C2',
    demoBackground: '#F8D5EB', selectedBorder: '#EFA8D6',
  },
  gradients: { page: ['#FBDCEC', '#EEE5FA', '#DAEBFF'], brand: ['#BB3195', '#6F63B5', '#2475C2'], soft: ['#F9D6EE', '#E5E8FC', '#CCE6FF'], profile: ['#F4BFE3', '#E7D8F8', '#BEDFFF'] },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 12, md: 20, pill: 999 },
} as const;


