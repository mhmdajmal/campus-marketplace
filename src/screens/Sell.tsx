import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../data';
import { C, S } from '../theme';
import { Category, Condition, Listing, ListingDraft } from '../types';
import { Button, Field, IconButton } from '../components/UI';
import { readableError, saveListing } from '../services/market';
import { parsePrice, validateListing } from '../utils/marketplace';

const conditions: Condition[] = ['New', 'Like new', 'Used'];
const notify = (title: string, msg: string) => Platform.OS === 'web' ? window.alert(`${title}: ${msg}`) : Alert.alert(title, msg);
export default function Sell({ editing, done, cancel }: { editing: Listing | null; done: () => void; cancel: () => void }) {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [location, setLocation] = useState(editing?.location ?? '');
  const [category, setCategory] = useState<Category>(editing?.category ?? 'Electronics');
  const [condition, setCondition] = useState<Condition>(editing?.condition ?? 'Used');
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? '');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const number = parsePrice(price);
      if (number === null) throw Error('Enter a valid price in LKR.');
      const draft: ListingDraft = { title, price: number, description, location, category, condition, imageUrl: imageUrl.trim() };
      const error = validateListing(draft);
      if (error) throw Error(error);
      await saveListing(draft, editing?.id);
      notify('Saved', editing ? 'Your listing was updated.' : 'Your item is now listed on Campus Market.');
      done();
    } catch (error) { console.error('Publish failed:', error); notify('Could not publish', readableError(error)); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={S.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[S.content, { maxWidth: 760, paddingTop: 17 }]} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <View style={{ backgroundColor: C.white, borderColor: C.border, borderWidth: 1, borderRadius: 14 }}><IconButton icon="arrow-back" onPress={cancel}/></View>
        <View style={{ flex: 1 }}><Text style={S.h1}>{editing ? 'Edit your listing' : 'Sell something'}</Text><Text style={[S.sub, { marginTop: 3 }]}>Make it easy for students to discover your item.</Text></View>
      </View>
      <View style={{ backgroundColor: C.darkGreen, borderRadius: 21, padding: 19, marginBottom: 19, flexDirection: 'row', gap: 15, alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="sparkles" size={27} color={C.dark}/></View>
        <View style={{ flex: 1 }}><Text style={{ color: C.white, fontSize: 17, fontWeight: '900' }}>A good listing sells faster</Text><Text style={{ color: C.lightText, fontSize: 12, lineHeight: 19, marginTop: 4 }}>Use a clear title, fair price and a public campus pickup spot.</Text></View>
      </View>
      <View style={[S.card, { padding: 19, marginBottom: 19 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}><Ionicons name="document-text-outline" size={21} color={C.green}/><Text style={S.h2}>Item details</Text></View>
        <Field label="Item title *" value={title} onChangeText={setTitle} placeholder="e.g. Scientific calculator" maxLength={90}/>
        <Field label="Price (LKR) *" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 3500"/>
        <Text style={S.label}>Category *</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 }}>
          {categories.map(cat => <Pressable accessibilityRole="button" key={cat} onPress={() => setCategory(cat)} style={[S.pill, { backgroundColor: category === cat ? C.mint : C.white, borderColor: category === cat ? C.green : C.border, paddingHorizontal: 12 }] }>
            <Text style={{ color: category === cat ? C.darkGreen : C.navy, fontSize: 12, fontWeight: '800' }}>{cat}</Text>
          </Pressable>)}
        </View>
        <Text style={S.label}>Condition *</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 20 }}>
          {conditions.map(cond => <Pressable accessibilityRole="button" key={cond} onPress={() => setCondition(cond)} style={[S.pill, { flex: 1, alignItems: 'center', paddingHorizontal: 5, backgroundColor: condition === cond ? C.mint : C.white, borderColor: condition === cond ? C.green : C.border }] }>
            <Text style={{ color: condition === cond ? C.darkGreen : C.navy, fontWeight: '800', fontSize: 12 }}>{cond}</Text>
          </Pressable>)}
        </View>
        <Field label="Description *" value={description} onChangeText={setDescription} placeholder="Condition, included accessories, any faults..." multiline maxLength={1500}/>
        <Field label="Campus pickup spot *" value={location} onChangeText={setLocation} placeholder="e.g. Science Library" maxLength={70}/>
      </View>
      <View style={[S.card, { padding: 19, marginBottom: 20 }]}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}><Ionicons name="images-outline" size={20} color={C.green}/><Text style={S.h2}>Product image</Text></View>
        <Text style={[S.sub, { marginBottom: 15 }]}>Optional. Gallery uploads are not enabled in this free-only assignment version. You may paste an existing public HTTPS image URL.</Text>
        {imageUrl.startsWith('https://') && <Image source={{ uri: imageUrl }} resizeMode="cover" style={{ height: 180, borderRadius: 15, marginBottom: 14, backgroundColor: C.bg }}/>} 
        <Field label="HTTPS image URL (optional)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" autoCorrect={false} placeholder="https://example.com/photo.jpg"/>
        <View style={{ backgroundColor: C.mint, padding: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="checkmark-circle" color={C.green} size={18}/><Text style={{ color: C.darkGreen, fontSize: 12, flex: 1, lineHeight: 18 }}>No image? Your listing will still look good with a category illustration.</Text></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginBottom: 18 }}><Ionicons name="information-circle-outline" color={C.muted} size={20}/><Text style={[S.sub, { flex: 1 }]}>For safety, don't include your phone number, private address, student ID or passwords. Use in-app messaging to coordinate a public meeting spot.</Text></View>
      <Button label={busy ? 'Saving item...' : editing ? 'Save changes' : 'Publish listing'} disabled={busy} icon="checkmark-circle-outline" onPress={submit}/>
      {busy && <ActivityIndicator color={C.green} style={{ marginTop: 14 }}/>} 
    </ScrollView>
  </KeyboardAvoidingView>;
}
