import React from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import { C, S } from '../theme';
import { Listing } from '../types';
import { Empty, ListingCard } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
export default function Saved({ items, saved, onOpen, onSave }: { items: Listing[]; saved: string[]; onOpen: (x: Listing) => void; onSave: (id: string) => void }) {
  const { width } = useWindowDimensions();
  const columns = width > 1100 ? 4 : width > 740 ? 3 : 2;
  const savedItems = items.filter(x => saved.includes(x.id));
  return <FlatList key={`saved-${columns}`} style={S.page} data={savedItems} keyExtractor={x => x.id} numColumns={columns} columnWrapperStyle={{ justifyContent: 'space-between' }} contentContainerStyle={S.content}
    ListHeaderComponent={<View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 }}>
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="heart" size={23} color={C.red}/></View>
        <Text style={S.h1}>My favourites</Text>
      </View>
      <Text style={S.sub}>Keep the good finds close. {savedItems.length} saved item{savedItems.length === 1 ? '' : 's'}.</Text>
    </View>}
    renderItem={({ item }) => <ListingCard item={item} opened={() => onOpen(item)} saved onSave={() => onSave(item.id)} columns={columns}/>}
    ListEmptyComponent={<View style={S.card}><Empty icon="heart-outline" title="Nothing saved yet" subtitle="Tap the heart on any listing to find it here later."/></View>}/>;
}
