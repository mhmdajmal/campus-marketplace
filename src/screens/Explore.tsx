import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing, Category } from '../types';
import { categories } from '../data';
import { C, S } from '../theme';
import { Empty, ListingCard, SectionHeader } from '../components/UI';
import { filterListings, parsePrice, ListingSort } from '../utils/marketplace';

const icons: Record<Category | 'All', React.ComponentProps<typeof Ionicons>['name']> = {
  All: 'apps-outline', Electronics: 'laptop-outline', Books: 'book-outline',
  Furniture: 'bed-outline', Stationery: 'pencil-outline', Fashion: 'shirt-outline', Other: 'cube-outline',
};
const greetings = ['Your campus, your market.', 'Find something great today.'];
export default function Explore({ items, saved, onOpen, onSave, onSell }: { items: Listing[]; saved: string[]; onOpen: (l: Listing) => void; onSave: (id: string) => void; onSell: () => void }) {
  const { width } = useWindowDimensions();
  const columns = width > 1100 ? 4 : width > 740 ? 3 : 2;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<ListingSort>('Recent');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPrice, setShowPrice] = useState(false);
  const priceInvalid = (minPrice.trim() !== '' && parsePrice(minPrice) === null) ||
    (maxPrice.trim() !== '' && parsePrice(maxPrice) === null) ||
    (minPrice.trim() !== '' && maxPrice.trim() !== '' && (parsePrice(minPrice) ?? 0) > (parsePrice(maxPrice) ?? 0));
  const filtered = useMemo(() => filterListings(items, { search, category, sort, minPrice, maxPrice }), [items, search, category, sort, minPrice, maxPrice]);
  const clear = () => { setSearch(''); setCategory('All'); setSort('Recent'); setMinPrice(''); setMaxPrice(''); };
  return <FlatList key={`explore-${columns}`} style={S.page} data={filtered} keyExtractor={item => item.id} numColumns={columns}
    keyboardShouldPersistTaps="handled" columnWrapperStyle={{ justifyContent: 'space-between' }} contentContainerStyle={S.content}
    ListHeaderComponent={<>
      <View style={{ backgroundColor: C.darkGreen, marginHorizontal: -18, marginTop: -20, paddingHorizontal: 21, paddingTop: 29, paddingBottom: 27, borderBottomLeftRadius: 29, borderBottomRightRadius: 29, overflow: 'hidden' }}>
        <View style={{ width: 185, height: 185, borderRadius: 100, position: 'absolute', right: -60, top: -70, backgroundColor: '#146C61' }}/>
        <View style={{ width: 115, height: 115, borderRadius: 60, position: 'absolute', right: 110, bottom: -90, backgroundColor: '#0E665D' }}/>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <Ionicons name="sparkles" color={C.yellow} size={15}/>
              <Text style={{ color: C.tealSoft, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 }}>CAMPUS MARKET</Text>
            </View>
            <Text style={{ color: C.white, fontSize: width > 600 ? 34 : 28, fontWeight: '900', letterSpacing: -1.25, lineHeight: width > 600 ? 41 : 36 }}>{greetings[0]}</Text>
            <Text style={{ color: C.lightText, fontSize: 13, marginTop: 7, lineHeight: 19 }}>Buy and sell pre-loved finds with students nearby.</Text>
          </View>
          <View style={{ height: 66, width: 66, borderRadius: 22, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF30' }}>
            <Ionicons name="storefront-outline" size={31} color={C.white}/>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, paddingHorizontal: 15, marginTop: 24, minHeight: 55 }}>
          <Ionicons name="search-outline" size={21} color={C.green}/>
          <TextInput accessibilityLabel="Search listings" value={search} onChangeText={setSearch} placeholder="Search books, laptops, furniture..." placeholderTextColor={C.muted}
            style={{ flex: 1, marginLeft: 10, fontSize: 14, color: C.navy, paddingVertical: 15 }}/>
          {search.length > 0 && <Pressable onPress={() => setSearch('')} accessibilityLabel="Clear search"><Ionicons name="close-circle" size={21} color={C.muted}/></Pressable>}
        </View>
        <View style={{ flexDirection: 'row', gap: 18, marginTop: 17, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}><Ionicons name="shield-checkmark-outline" size={15} color={C.tealSoft}/><Text style={{ color: C.lightText, fontSize: 11 }}>Verified Gmail</Text></View>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}><Ionicons name="chatbubble-ellipses-outline" size={15} color={C.tealSoft}/><Text style={{ color: C.lightText, fontSize: 11 }}>In-app chat</Text></View>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={onSell} style={{ backgroundColor: C.cream, borderRadius: 20, padding: 17, marginTop: 18, marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: '#F7E5B1' }}>
        <View style={{ width: 53, height: 53, borderRadius: 16, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="pricetag" size={27} color={C.navy}/></View>
        <View style={{ flex: 1 }}><Text style={{ color: C.navy, fontSize: 15, fontWeight: '900' }}>Something to sell?</Text><Text style={{ color: '#776743', fontSize: 12, marginTop: 3 }}>Post an item in a few easy steps</Text></View>
        <Ionicons name="arrow-forward-circle" size={28} color={C.darkGreen}/>
      </Pressable>
      <SectionHeader title="Explore categories"/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginBottom: 24 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}>
        {(['All', ...categories] as (Category | 'All')[]).map(cat => <Pressable key={cat} accessibilityRole="button" onPress={() => setCategory(cat)}
          style={{ minWidth: 89, backgroundColor: category === cat ? C.mint : C.white, borderWidth: 1.3, borderColor: category === cat ? C.green : C.border, borderRadius: 17, paddingVertical: 15, paddingHorizontal: 9, alignItems: 'center', gap: 10 }}>
          <View style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: category === cat ? '#CDEADF' : C.bg, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name={icons[cat]} size={23} color={C.green}/>
          </View>
          <Text style={{ color: category === cat ? C.darkGreen : C.navy, fontSize: 12, fontWeight: '800' }}>{cat}</Text>
        </Pressable>)}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 5 }}>
        <Pressable accessibilityRole="button" onPress={() => setShowPrice(!showPrice)} style={{ flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border }}>
          <Ionicons name="options-outline" size={17} color={C.green}/>
          <Text style={{ color: C.navy, fontWeight: '800', fontSize: 12 }}>Price filter</Text>
          <Ionicons name={showPrice ? 'chevron-up' : 'chevron-down'} size={14} color={C.green}/>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={clear} style={{ padding: 10 }}><Text style={{ color: C.green, fontSize: 12, fontWeight: '800' }}>Clear all</Text></Pressable>
      </View>
      {showPrice && <View style={[S.card, { padding: 14, marginBottom: 17 }] }>
        <Text style={[S.sub, { marginBottom: 9 }]}>Your budget (LKR)</Text>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <TextInput accessibilityLabel="Minimum price" keyboardType="numeric" placeholder="Minimum" placeholderTextColor={C.muted} value={minPrice} onChangeText={setMinPrice} style={[S.input, { flex: 1 }]}/>
          <TextInput accessibilityLabel="Maximum price" keyboardType="numeric" placeholder="Maximum" placeholderTextColor={C.muted} value={maxPrice} onChangeText={setMaxPrice} style={[S.input, { flex: 1 }]}/>
        </View>
        {priceInvalid && <Text style={{ fontSize: 12, color: C.red, marginTop: 8 }}>Enter valid prices; minimum must not exceed maximum.</Text>}
      </View>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 17, gap: 7 }}>
        <View><Text style={S.h2}>Fresh on campus</Text><Text style={[S.sub, { marginTop: 3 }]}>{filtered.length} listing{filtered.length === 1 ? '' : 's'} found</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Change sorting" onPress={() => setSort(sort === 'Recent' ? 'Low price' : sort === 'Low price' ? 'High price' : 'Recent')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.white, borderColor: C.border, borderWidth: 1, padding: 10, borderRadius: 13 }}>
          <Ionicons name="swap-vertical-outline" size={16} color={C.green}/><Text style={{ fontSize: 11, color: C.navy, fontWeight: '800' }}>{sort}</Text>
        </Pressable>
      </View>
    </>}
    renderItem={({ item }) => <ListingCard item={item} opened={() => onOpen(item)} saved={saved.includes(item.id)} onSave={() => onSave(item.id)} columns={columns}/>}
    ListEmptyComponent={<Empty icon="search-outline" title="No matching listings" subtitle="Try a different keyword, category or price range."/>}
  />;
}
