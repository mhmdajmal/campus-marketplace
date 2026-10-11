import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, S, when } from '../theme';
import { ChatMessage, Conversation } from '../types';
import { Avatar, Empty, IconButton } from '../components/UI';
import { readableError, sendMessage, watchMessages } from '../services/market';
import { getOtherParty, getMessageAuthor } from '../utils/chat';

const otherName = (c: Conversation, uid: string) => getOtherParty(c, uid).name;
const otherRole = (c: Conversation, uid: string) => getOtherParty(c, uid).role;
const clock = (ms: number) => ms ? new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const notify = (title: string, msg: string) => Platform.OS === 'web' ? window.alert(`${title}: ${msg}`) : Alert.alert(title, msg);

export function Inbox({ conversations, uid, onChat }: { conversations: Conversation[]; uid: string; onChat: (id: string) => void }) {
  return <FlatList style={S.page} contentContainerStyle={S.content} data={conversations} keyExtractor={x => x.id}
    ListHeaderComponent={<View style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <View style={{ width: 50, height: 50, borderRadius: 17, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="chatbubbles" color={C.green} size={25}/></View>
        <View><Text style={S.h1}>Messages</Text><Text style={S.sub}>Your campus conversations</Text></View>
      </View>
      <View style={{ backgroundColor: C.cream, borderRadius: 15, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'center' }}>
        <Ionicons name="shield-checkmark-outline" size={19} color={C.darkGreen}/>
        <Text style={{ color: '#6C603C', fontSize: 12, flex: 1, lineHeight: 18 }}>Each buyer gets a separate chat. Names shown here are the names users entered when signing up.</Text>
      </View>
    </View>}
    renderItem={({ item }) => {
      const name = otherName(item, uid);
      const preview = item.lastMessage ? `${item.lastSenderId === uid ? 'You' : item.lastSenderId ? name : 'Message'}: ${item.lastMessage}` : 'Start a conversation';
      return <Pressable accessibilityRole="button" onPress={() => onChat(item.id)} style={[S.card, { padding: 15, marginBottom: 12, flexDirection: 'row', gap: 13, alignItems: 'center' }]}>
        <Avatar name={name} size={55}/>
        <View style={{ flex: 1, gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: C.navy, flex: 1 }} numberOfLines={1}>{name}</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>{item.updatedAt ? when(item.updatedAt) : ''}</Text>
          </View>
          <Text numberOfLines={1} style={{ color: C.green, fontSize: 11, fontWeight: '800' }}><Ionicons name="pricetag-outline" size={11}/>  {otherRole(item, uid)} · {item.listingTitle}</Text>
          <Text style={S.sub} numberOfLines={1}>{preview}</Text>
        </View>
        <Ionicons name="chevron-forward" size={19} color={C.muted}/>
      </Pressable>;
    }}
    ListEmptyComponent={<View style={S.card}><Empty icon="chatbubble-ellipses-outline" title="Your inbox is quiet" subtitle="Open an item and tap Chat with seller to start a conversation."/></View>}/>;
}

export function Chat({ id, uid, title, conversation, back }: { id: string; uid: string; title: string; conversation?: Conversation | null; back: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  useEffect(() => watchMessages(id, setMessages, e => { console.error('Chat listener:', e); notify('Chat error', readableError(e)); }), [id]);
  const other = conversation ? otherName(conversation, uid) : 'Campus member';
  const send = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try { await sendMessage(id, text); setText(''); }
    catch (error) { console.error('Chat send:', error); notify('Could not send', readableError(error)); }
    finally { setLoading(false); }
  };
  return <KeyboardAvoidingView style={S.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 55 : 0}>
    <View style={{ backgroundColor: C.white, borderBottomColor: C.border, borderBottomWidth: 1, paddingVertical: 11, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <IconButton icon="arrow-back" onPress={back}/><Avatar name={other} size={43}/>
      <View style={{ flex: 1, marginLeft: 7, gap: 2 }}>
        <Text style={{ color: C.navy, fontWeight: '900', fontSize: 16 }} numberOfLines={1}>{other}</Text>
        <Text style={{ color: C.muted, fontSize: 11 }} numberOfLines={1}>{conversation ? otherRole(conversation, uid) : 'Member'}  ·  {title}</Text>
      </View>
      <View style={{ backgroundColor: C.mint, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 22, marginRight: 6 }}><Ionicons name="lock-closed-outline" size={15} color={C.green}/></View>
    </View>
    <FlatList ref={listRef} data={messages} keyExtractor={m => m.id} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 27, gap: 13, width: '100%', maxWidth: 920, alignSelf: 'center' }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      ListHeaderComponent={<View style={{ alignItems: 'center', marginBottom: 13 }}>
        <View style={{ backgroundColor: C.mint, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 7 }}><Text style={{ color: C.darkGreen, fontWeight: '800', fontSize: 11 }}>Chat about {title}</Text></View>
        <Text style={[S.sub, { fontSize: 11, textAlign: 'center', marginTop: 10 }]}>Keep your conversations respectful. Arrange meetups in public campus spaces.</Text>
      </View>}
      renderItem={({ item }) => {
        const mine = item.senderId === uid;
        const from = getMessageAuthor(item, uid, conversation);
        return <View style={{ width: '100%', alignItems: mine ? 'flex-end' : 'flex-start' }}>
          <View style={{ maxWidth: '84%', borderRadius: 18, borderBottomRightRadius: mine ? 5 : 18, borderBottomLeftRadius: mine ? 18 : 5, paddingHorizontal: 15, paddingVertical: 11, backgroundColor: mine ? C.darkGreen : C.white, borderColor: mine ? C.darkGreen : C.border, borderWidth: 1 }}>
            <Text style={{ color: mine ? '#A8E7D0' : C.green, fontWeight: '900', fontSize: 11, marginBottom: 5 }}>{from}</Text>
            <Text style={{ color: mine ? C.white : C.navy, lineHeight: 21, fontSize: 14 }}>{item.text}</Text>
            <Text style={{ color: mine ? '#C7E5DF' : C.muted, fontSize: 10, alignSelf: 'flex-end', marginTop: 7 }}>{clock(item.createdAt)}</Text>
          </View>
        </View>;
      }}
      ListEmptyComponent={<Empty icon="chatbubble-outline" title="Say hello" subtitle="Ask about the item, condition or a campus pickup location."/>}/>
    <View style={{ backgroundColor: C.white, borderTopColor: C.border, borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <TextInput accessibilityLabel="Message" value={text} onChangeText={setText} placeholder="Write a message..." placeholderTextColor={C.muted} multiline maxLength={1000} style={[S.input, { flex: 1, maxHeight: 105, borderRadius: 20, backgroundColor: C.bg }]}/>
      <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} disabled={loading || !text.trim()} style={{ height: 49, width: 49, borderRadius: 17, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center', opacity: loading || !text.trim() ? 0.55 : 1 }}>
        {loading ? <ActivityIndicator color={C.white}/> : <Ionicons name="send" size={20} color={C.white}/>}
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}
