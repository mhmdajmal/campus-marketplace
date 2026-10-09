import { StyleSheet } from 'react-native';

// Shared design tokens. All interfaces share these colours and shapes.
export const C = {
  green: '#087968',
  darkGreen: '#07564D',
  mint: '#E5F5EF',
  navy: '#152A36',
  muted: '#72838D',
  bg: '#F4F7F8',
  white: '#FFFFFF',
  border: '#E5EAEE',
  yellow: '#FFC94D',
  red: '#DB5260',
  blue: '#3D7BBD',
  cream: '#FFF3D1',
  tealSoft: '#B9E8DA',
  dark: '#0E3839',
  lightText: '#D4EEE6',
};
export const S = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 124, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  h1: { fontSize: 27, color: C.navy, fontWeight: '900', letterSpacing: -0.8 },
  h2: { fontSize: 19, color: C.navy, fontWeight: '800', letterSpacing: -0.35 },
  sub: { fontSize: 13, color: C.muted, lineHeight: 20 },
  card: { backgroundColor: C.white, borderColor: C.border, borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: '800', color: C.navy, marginBottom: 8 },
  input: { backgroundColor: C.white, borderColor: '#DBE4E7', borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, color: C.navy, fontSize: 15, minHeight: 48 },
  pill: { borderColor: C.border, borderWidth: 1, backgroundColor: C.white, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25 },
});
export const money = (n: number) => `Rs. ${Number(n).toLocaleString('en-LK')}`;
export const when = (ms: number) => new Date(ms).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
