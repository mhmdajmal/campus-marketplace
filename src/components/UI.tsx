import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing, Category } from '../types';
import { C, S, money } from '../theme';

type Icon = React.ComponentProps<typeof Ionicons>['name'];
const categoryIcons: Record<Category, Icon> = {
  Electronics: 'laptop-outline', Books: 'book-outline', Furniture: 'bed-outline',
  Stationery: 'pencil-outline', Fashion: 'shirt-outline', Other: 'cube-outline',
};
const categoryTints: Record<Category, string> = {
  Electronics: '#E2F3F3', Books: '#F2EAFE', Furniture: '#FFF0DD',
  Stationery: '#E6EEFC', Fashion: '#FDECF0', Other: '#E9F1E8',
};

export function IconButton({ icon, onPress, color = C.navy, size = 22 }: { icon: Icon; onPress: () => void; color?: string; size?: number }) {
  return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={{ padding: 11, borderRadius: 14 }}>
    <Ionicons name={icon} size={size} color={color}/>
  </Pressable>;
}
export function Button({ label, onPress, secondary = false, disabled = false, icon }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: Icon }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[styles.button, secondary && styles.secondary, disabled && { opacity: 0.55 }] }>
    {icon && <Ionicons name={icon} size={19} color={secondary ? C.green : C.white}/>}
    <Text style={[styles.buttonText, secondary && { color: C.darkGreen }]}>{label}</Text>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ marginBottom: 16 }}>
    <Text style={S.label}>{label}</Text>
    <TextInput placeholderTextColor="#90A0A8" style={[S.input, props.multiline && { height: 110, textAlignVertical: 'top', paddingTop: 13 }]} {...props}/>
  </View>;
}
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
    <Text style={S.h2}>{title}</Text>
    {action && onAction && <Pressable accessibilityRole="button" onPress={onAction}>
      <Text style={{ color: C.green, fontWeight: '800', fontSize: 12 }}>{action}  →</Text>
    </Pressable>}
  </View>;
}
export function Empty({ icon = 'cube-outline', title, subtitle }: { icon?: Icon; title: string; subtitle: string }) {
  return <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 58, paddingHorizontal: 25 }}>
    <View style={{ width: 90, height: 90, borderRadius: 30, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
      <Ionicons name={icon} size={40} color={C.green}/>
    </View>
    <Text style={[S.h2, { textAlign: 'center', marginBottom: 7 }]}>{title}</Text>
    <Text style={[S.sub, { textAlign: 'center', maxWidth: 280 }]}>{subtitle}</Text>
  </View>;
}
export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return <View style={{ width: size, height: size, borderRadius: size * 0.35, backgroundColor: C.mint, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D1EBE1' }}>
    <Text style={{ fontSize: size * 0.42, color: C.darkGreen, fontWeight: '900' }}>{initial}</Text>
  </View>;
}
export function ListingPhoto({ item, height = 142 }: { item: Listing; height?: number }) {
  if (item.imageUrl) return <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={{ height, width: '100%', backgroundColor: '#F0F3F4' }}/>;
  return <View style={{ height, backgroundColor: categoryTints[item.category], alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <View style={{ width: 155, height: 155, borderRadius: 78, backgroundColor: '#FFFFFF70', position: 'absolute', right: -34, top: -64 }}/>
    <View style={{ width: 125, height: 125, borderRadius: 63, backgroundColor: '#FFFFFF60', position: 'absolute', left: -37, bottom: -65 }}/>
    <View style={{ width: 75, height: 75, borderRadius: 24, backgroundColor: '#FFFFFFC4', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={categoryIcons[item.category]} size={37} color={C.green}/>
    </View>
  </View>;
}
export function ListingCard({ item, opened, saved, onSave, columns = 2 }: { item: Listing; opened: () => void; saved: boolean; onSave: () => void; columns?: number }) {
  const width: '24%' | '32.2%' | '48.6%' = columns >= 4 ? '24%' : columns === 3 ? '32.2%' : '48.6%';
  return <Pressable accessibilityRole="button" onPress={opened} style={[styles.listingCard, { width }]}>
    <ListingPhoto item={item} height={columns >= 3 ? 155 : 149}/>
    <View style={{ position: 'absolute', left: 9, top: 9, backgroundColor: item.status === 'sold' ? C.navy : '#FFFFFFED', borderRadius: 100, paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color: item.status === 'sold' ? C.white : C.green, fontSize: 10, fontWeight: '900' }}>{item.status === 'sold' ? 'SOLD' : item.condition}</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save item'} onPress={onSave} hitSlop={6} style={styles.heart}>
      <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? C.red : C.navy}/>
    </Pressable>
    <View style={{ padding: 13, gap: 7 }}>
      <Text style={{ fontSize: 18, color: C.green, fontWeight: '900', letterSpacing: -0.5 }}>{money(item.price)}</Text>
      <Text numberOfLines={2} style={{ color: C.navy, fontWeight: '800', fontSize: 14, minHeight: 38, lineHeight: 19 }}>{item.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Ionicons name="location-outline" size={14} color={C.muted}/>
        <Text numberOfLines={1} style={{ fontSize: 11, color: C.muted, flex: 1 }}>{item.location}</Text>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: '#EEF1F3', paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <Text numberOfLines={1} style={{ color: C.muted, fontSize: 10, flex: 1 }}>{item.category}</Text>
        <Ionicons name="arrow-forward-circle-outline" color={C.green} size={17}/>
      </View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { flexDirection: 'row', gap: 9, backgroundColor: C.green, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 15, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  buttonText: { color: C.white, fontWeight: '900', fontSize: 15 },
  secondary: { backgroundColor: C.mint, borderColor: '#C5E9DC', borderWidth: 1 },
  listingCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  heart: { position: 'absolute', right: 9, top: 9, backgroundColor: '#FFFFFFF4', width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
