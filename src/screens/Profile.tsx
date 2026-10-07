import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from 'firebase/auth';
import { C, S, money } from '../theme';
import { Listing, Profile as UserProfile } from '../types';
import { Avatar, Button, Field, ListingPhoto, Empty } from '../components/UI';
import { deleteListing, logOut, readableError, setSold, updatePublicProfile } from '../services/market';

const notice = (title: string, msg: string) => Platform.OS === 'web' ? window.alert(`${title}: ${msg}`) : Alert.alert(title, msg);
export default function Profile({ user, profile, items, open, edit, onLogin }: { user: User | null; profile: UserProfile | null; items: Listing[]; open: (item: Listing) => void; edit: (item: Listing) => void; onLogin: () => void }) {
  const [name, setName] = useState(profile?.displayName ?? user?.displayName ?? '');
  const [campus, setCampus] = useState(profile?.campus ?? '');
  const [faculty, setFaculty] = useState(profile?.faculty ?? '');
  const [editingProfile, setEditingProfile] = useState(false);
  useEffect(() => {
    if (!editingProfile) { setName(profile?.displayName ?? user?.displayName ?? ''); setCampus(profile?.campus ?? ''); setFaculty(profile?.faculty ?? ''); }
  }, [profile?.displayName, profile?.campus, profile?.faculty, user?.displayName, editingProfile]);
  if (!user) return <ScrollView style={S.page} contentContainerStyle={S.content}>
    <Text style={S.h1}>My account</Text>
    <View style={[S.card, { marginTop: 20, paddingHorizontal: 12 }]}><Empty icon="person-circle-outline" title="Make it yours" subtitle="Sign in with a verified Gmail account to buy, sell and chat with other students."/><View style={{ marginHorizontal: 18, marginBottom: 19 }}><Button label="Sign in / Create account" onPress={onLogin}/></View></View>
  </ScrollView>;
  const mine = items.filter(item => item.sellerId === user.uid);
  const soldCount = mine.filter(item => item.status === 'sold').length;
  const confirmDelete = (item: Listing) => {
    const remove = async () => { try { await deleteListing(item.id); } catch (error) { console.error('Delete failed:', error); notice('Delete failed', readableError(error)); } };
    if (Platform.OS === 'web') { if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) void remove(); return; }
    Alert.alert('Delete item?', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void remove(); } },
    ]);
  };
  const toggleSold = async (item: Listing) => { try { await setSold(item.id, item.status !== 'sold'); } catch (error) { notice('Could not update item', readableError(error)); } };
  const saveProfile = async () => { try { await updatePublicProfile(name, campus, faculty); setEditingProfile(false); notice('Saved', 'Your profile is up to date.'); } catch (error) { notice('Profile error', readableError(error)); } };
  const displayName = profile?.displayName || user.displayName || 'Campus Student';
  return <ScrollView style={S.page} contentContainerStyle={S.content}>
    <Text style={[S.h1, { marginBottom: 16 }]}>My account</Text>
    <View style={{ backgroundColor: C.darkGreen, borderRadius: 26, padding: 22, marginBottom: 18, overflow: 'hidden' }}>
      <View style={{ width: 140, height: 140, position: 'absolute', right: -50, top: -50, borderRadius: 70, backgroundColor: '#FFFFFF12' }}/>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ borderColor: '#FFFFFF40', borderWidth: 2, borderRadius: 22 }}><Avatar name={displayName} size={67}/></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.white, fontSize: 21, fontWeight: '900' }} numberOfLines={1}>{displayName}</Text>
          <Text style={{ color: C.lightText, fontSize: 12, marginTop: 3 }} numberOfLines={1}>{user.email}</Text>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#FFFFFF22', padding: 8, borderRadius: 30, alignSelf: 'flex-start', marginTop: 11 }}>
            <Ionicons name="checkmark-circle" size={14} color="#B1EBCD"/><Text style={{ color: C.white, fontWeight: '800', fontSize: 10 }}>Gmail verified</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 11, marginTop: 21 }}>
        <View style={{ flex: 1, backgroundColor: '#FFFFFF15', padding: 14, borderRadius: 16 }}><Text style={{ color: C.white, fontSize: 25, fontWeight: '900' }}>{mine.length}</Text><Text style={{ color: C.lightText, fontSize: 11 }}>Listings</Text></View>
        <View style={{ flex: 1, backgroundColor: '#FFFFFF15', padding: 14, borderRadius: 16 }}><Text style={{ color: C.white, fontSize: 25, fontWeight: '900' }}>{soldCount}</Text><Text style={{ color: C.lightText, fontSize: 11 }}>Sold</Text></View>
      </View>
    </View>
    <View style={[S.card, { padding: 18, marginBottom: 23 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <Text style={S.h2}>Profile details</Text>
        {!editingProfile && <Pressable accessibilityRole="button" onPress={() => setEditingProfile(true)} style={{ flexDirection: 'row', gap: 5, alignItems: 'center', padding: 7 }}><Ionicons name="create-outline" size={16} color={C.green}/><Text style={{ color: C.green, fontWeight: '900', fontSize: 12 }}>Edit</Text></Pressable>}
      </View>
      {editingProfile ? <>
        <Field label="Full display name *" value={name} onChangeText={setName} maxLength={80}/>
        <Field label="Campus / University" value={campus} onChangeText={setCampus} maxLength={60}/>
        <Field label="Faculty / Department" value={faculty} onChangeText={setFaculty} maxLength={60}/>
        <Button label="Save profile" icon="checkmark-outline" onPress={saveProfile}/>
        <Pressable accessibilityRole="button" onPress={() => setEditingProfile(false)} style={{ alignItems: 'center', padding: 12 }}><Text style={{ color: C.muted, fontWeight: '800' }}>Cancel</Text></Pressable>
      </> : <>
        <Text style={[S.sub, { marginBottom: 15 }]}>Your name is visible to chat participants. Other details are optional.</Text>
        <View style={{ gap: 15 }}>
          <View style={{ flexDirection: 'row', gap: 11, alignItems: 'center' }}><Ionicons name="school-outline" size={20} color={C.green}/><View style={{ flex: 1 }}><Text style={{ color: C.muted, fontSize: 11 }}>University / Campus</Text><Text style={{ color: C.navy, fontWeight: '800', marginTop: 3 }}>{profile?.campus || 'Not added'}</Text></View></View>
          <View style={{ flexDirection: 'row', gap: 11, alignItems: 'center' }}><Ionicons name="business-outline" size={20} color={C.green}/><View style={{ flex: 1 }}><Text style={{ color: C.muted, fontSize: 11 }}>Faculty / Department</Text><Text style={{ color: C.navy, fontWeight: '800', marginTop: 3 }}>{profile?.faculty || 'Not added'}</Text></View></View>
        </View>
      </>}
    </View>
    <Text style={[S.h2, { marginBottom: 14 }]}>My listings <Text style={{ color: C.green }}>({mine.length})</Text></Text>
    {mine.length === 0 ? <View style={S.card}><Empty icon="pricetag-outline" title="Nothing for sale yet" subtitle="Your published listings will appear here."/></View> : mine.map(item => <View key={item.id} style={[S.card, { padding: 12, marginBottom: 12, flexDirection: 'row', gap: 13 }]}>
      <Pressable accessibilityRole="button" onPress={() => open(item)} style={{ width: 102, height: 104, borderRadius: 15, overflow: 'hidden' }}><ListingPhoto item={item} height={104}/></Pressable>
      <View style={{ flex: 1, justifyContent: 'space-between', gap: 5 }}>
        <Pressable accessibilityRole="button" onPress={() => open(item)}>
          <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '900', color: C.navy }}>{item.title}</Text>
          <Text style={{ color: C.green, fontWeight: '900', marginTop: 5 }}>{money(item.price)} <Text style={{ color: item.status === 'sold' ? C.red : C.muted, fontSize: 11 }}>{item.status}</Text></Text>
        </Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 5 }}>
          <Pressable accessibilityRole="button" onPress={() => edit(item)} style={{ padding: 7, backgroundColor: C.mint, borderRadius: 9 }}><Text style={{ color: C.green, fontWeight: '900', fontSize: 11 }}>Edit</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => toggleSold(item)} style={{ padding: 7, backgroundColor: C.bg, borderRadius: 9 }}><Text style={{ color: C.navy, fontWeight: '900', fontSize: 11 }}>{item.status === 'sold' ? 'Mark active' : 'Mark sold'}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => confirmDelete(item)} style={{ padding: 7, backgroundColor: '#FFF1F1', borderRadius: 9 }}><Text style={{ color: C.red, fontWeight: '900', fontSize: 11 }}>Delete</Text></Pressable>
        </View>
      </View>
    </View>)}
    <View style={{ marginTop: 17, marginBottom: 15 }}><Button label="Sign out" secondary icon="log-out-outline" onPress={() => { void logOut().catch(error => notice('Sign out failed', readableError(error))); }}/></View>
  </ScrollView>;
}
