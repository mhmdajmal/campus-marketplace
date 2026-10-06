import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, S } from '../theme';
import { Button, Field, IconButton } from '../components/UI';
import { login, readableError, register, sendReset } from '../services/market';

const notice = (title: string, message: string) => Platform.OS === 'web' ? window.alert(`${title}\n\n${message}`) : Alert.alert(title, message);
export default function AuthScreen({ close }: { close: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState('');
  const [faculty, setFaculty] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(email, password, name, campus, faculty);
        notice('Check your Gmail', 'Open the verification link sent to your Gmail address, then return to the app.');
      } else {
        await login(email, password);
      }
      close();
    } catch (error) { console.error('Authentication:', error); notice('Could not continue', readableError(error)); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    try { await sendReset(email); notice('Password reset', 'If this account exists, check Gmail for a reset link.'); }
    catch (error) { notice('Reset failed', readableError(error)); }
  };
  return <KeyboardAvoidingView style={S.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[S.content, { maxWidth: 590, paddingTop: 14, paddingBottom: 60 }]} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 }}><IconButton icon="close" onPress={close}/></View>
      <View style={{ backgroundColor: C.darkGreen, borderRadius: 27, padding: 25, marginBottom: 21, overflow: 'hidden' }}>
        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#FFFFFF15', position: 'absolute', right: -39, top: -36 }}/>
        <View style={{ height: 61, width: 61, borderRadius: 19, backgroundColor: C.yellow, justifyContent: 'center', alignItems: 'center', marginBottom: 17 }}>
          <Ionicons name="school-outline" size={28} color={C.dark}/>
        </View>
        <Text style={{ color: C.white, fontWeight: '900', fontSize: 27, letterSpacing: -1 }}>{mode === 'register' ? 'Join your campus' : 'Welcome back!'}</Text>
        <Text style={{ color: C.lightText, fontSize: 13, lineHeight: 20, marginTop: 7 }}>{mode === 'register' ? 'Create your profile so people know who they are chatting with.' : 'Sign in to save deals, post listings and talk to sellers.'}</Text>
      </View>
      <View style={[S.card, { padding: 19, borderRadius: 23 }]}>
        <View style={{ flexDirection: 'row', padding: 5, backgroundColor: C.bg, borderRadius: 14, marginBottom: 24 }}>
          {(['login', 'register'] as const).map(option => <Pressable key={option} accessibilityRole="button" onPress={() => setMode(option)} style={{ flex: 1, borderRadius: 11, backgroundColor: mode === option ? C.white : 'transparent', padding: 12, alignItems: 'center', borderWidth: mode === option ? 1 : 0, borderColor: C.border }}>
            <Text style={{ color: mode === option ? C.darkGreen : C.muted, fontSize: 13, fontWeight: '900' }}>{option === 'login' ? 'Sign in' : 'Create account'}</Text>
          </Pressable>)}
        </View>
        {mode === 'register' && <>
          <Field label="Your full name *" value={name} onChangeText={setName} placeholder="Name shown in messages" autoCapitalize="words" maxLength={80}/>
          <Field label="Campus / University (optional)" value={campus} onChangeText={setCampus} placeholder="e.g. University of Jaffna" maxLength={60}/>
          <Field label="Faculty / Department (optional)" value={faculty} onChangeText={setFaculty} placeholder="e.g. Faculty of Science" maxLength={60}/>
        </>}
        <Field label="Gmail address *" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} placeholder="you@gmail.com"/>
        <Field label="Password *" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters"/>
        {mode === 'login' && <Pressable accessibilityRole="button" style={{ alignSelf: 'flex-end', paddingBottom: 17, paddingTop: 3 }} onPress={reset}><Text style={{ color: C.green, fontWeight: '900', fontSize: 12 }}>Forgot password?</Text></Pressable>}
        <Button label={busy ? 'Please wait...' : mode === 'register' ? 'Create my account' : 'Sign in'} disabled={busy} icon={mode === 'register' ? 'person-add-outline' : 'log-in-outline'} onPress={submit}/>
        {busy && <ActivityIndicator color={C.green} style={{ marginTop: 14 }}/>} 
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: C.mint, marginTop: 17, padding: 15, borderRadius: 16, gap: 10 }}>
        <Ionicons name="shield-checkmark-outline" size={21} color={C.green}/>
        <Text style={{ flex: 1, color: C.darkGreen, fontSize: 12, lineHeight: 19 }}>Gmail verification is required to post and message. Display names are entered by users; Gmail verification does not prove campus enrolment.</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
