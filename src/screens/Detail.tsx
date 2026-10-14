import React from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '../types';
import { C, S, money, when } from '../theme';
import { Avatar, Button, IconButton, ListingPhoto } from '../components/UI';
import { reportListing, readableError } from '../services/market';

const notice = (title: string, msg: string) => Platform.OS === 'web' ? window.alert(`${title}: ${msg}`) : Alert.alert(title, msg);
export default function Detail({ item, back, saved, onSave, onContact, onEdit, canInteract, own }: { item: Listing; back: () => void; saved: boolean; onSave: () => void; onContact: () => void; onEdit: () => void; canInteract: boolean; own: boolean }) {
  const sendReport = async (reason: string) => {
    try { await reportListing(item.id, reason); notice('Report received', 'Your report has been recorded for review.'); }
    catch (error) { notice('Could not report', readableError(error)); }
  };
  const report = () => {
    if (Platform.OS === 'web') {
      const reason = window.prompt('Report this listing? Enter a reason (e.g. Spam or misleading information).');
      if (reason?.trim()) void sendReport(reason.trim());
      return;
    }
    Alert.alert('Report listing', 'Choose a reason', [
      { text: 'Spam', onPress: () => void sendReport('Spam or misleading') },
      { text: 'Unsafe listing', onPress: () => void sendReport('Unsafe or prohibited item') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  return <View style={S.page}>
    <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 1000, alignSelf: 'center', paddingBottom: 132 }}>
      <View style={{ position: 'absolute', zIndex: 2, top: 15, left: 16, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border }}><IconButton icon="arrow-back" onPress={back}/></View>
      <ListingPhoto item={item} height={280}/>
      <View style={{ paddingHorizontal: 19, paddingTop: 21 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 }}>
          <View style={{ backgroundColor: C.mint, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 30 }}><Text style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>{item.category}</Text></View>
          <Text style={{ color: C.muted, fontSize: 11 }}>Posted {when(item.createdAt)}</Text>
        </View>
        <Text style={{ color: C.green, fontSize: 30, fontWeight: '900', marginTop: 16, letterSpacing: -0.7 }}>{money(item.price)}</Text>
        <Text style={[S.h1, { marginTop: 5, fontSize: 26, lineHeight: 32 }]}>{item.title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15, marginBottom: 20 }}>
          {[item.condition, item.status === 'sold' ? 'Sold' : 'Available'].map(label => <View key={label} style={{ backgroundColor: label === 'Sold' ? '#FEEEF0' : C.white, borderColor: label === 'Sold' ? '#F3C8CF' : C.border, borderWidth: 1, borderRadius: 40, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: label === 'Sold' ? C.red : C.navy, fontWeight: '800', fontSize: 12 }}>{label}</Text>
          </View>)}
        </View>
        <View style={[S.card, { padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 19 }]}>
          <View style={{ backgroundColor: C.mint, borderRadius: 13, width: 43, height: 43, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="location-outline" color={C.green} size={24}/></View>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 11, color: C.muted }}>Pickup location</Text><Text style={{ color: C.navy, fontWeight: '900', marginTop: 3 }}>{item.location}</Text></View>
        </View>
        <View style={[S.card, { padding: 19, marginBottom: 19 }]}>
          <Text style={[S.h2, { marginBottom: 11 }]}>About this item</Text>
          <Text style={{ color: C.navy, lineHeight: 24, fontSize: 14 }}>{item.description}</Text>
        </View>
        <View style={[S.card, { padding: 18, marginBottom: 15 }]}>
          <Text style={[S.h2, { marginBottom: 15 }]}>Meet the seller</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Avatar name={item.sellerName} size={53}/>
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: C.navy, fontSize: 15, fontWeight: '900' }}>{item.sellerName}</Text><Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Campus Market member</Text></View>
            <Ionicons name="chatbubble-ellipses-outline" color={C.green} size={22}/>
          </View>
          <Text style={[S.sub, { marginTop: 13 }]}>Display names are chosen by users. Only Gmail ownership is verified.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={report} style={{ alignSelf: 'flex-start', padding: 10, marginBottom: 12, flexDirection: 'row', gap: 7, alignItems: 'center' }}>
          <Ionicons name="flag-outline" size={15} color={C.red}/><Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Report this listing</Text>
        </Pressable>
      </View>
    </ScrollView>
    <View style={{ backgroundColor: C.white, paddingVertical: 13, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save item'} onPress={onSave} style={{ width: 55, height: 53, borderColor: C.border, borderWidth: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={23} color={saved ? C.red : C.green}/>
      </Pressable>
      <View style={{ flex: 1 }}>
        {own ? <Button label="Edit my listing" icon="create-outline" onPress={onEdit}/> : <Button label={item.status === 'sold' ? 'This item is sold' : canInteract ? 'Chat with seller' : 'Sign in to chat'} icon="chatbubble-ellipses-outline" disabled={item.status === 'sold'} onPress={onContact}/>}
      </View>
    </View>
  </View>;
}
