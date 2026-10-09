import React,{useEffect,useMemo,useState} from 'react';
import {ActivityIndicator,Alert,Platform,Pressable,SafeAreaView,Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {onAuthStateChanged,reload,User} from 'firebase/auth';
import {auth,db,firebaseReady} from './firebase';
import {C,S} from './theme';
import {demoListings} from './data';
import {Conversation,Listing,Profile,Tab} from './types';
import Explore from './screens/Explore';
import Saved from './screens/Saved';
import Sell from './screens/Sell';
import Detail from './screens/Detail';
import AuthScreen from './screens/Auth';
import {Chat,Inbox} from './screens/Messages';
import ProfilePage from './screens/Profile';
import {Button,Empty} from './components/UI';
import {readableError,setSaved,startConversation,syncProfile,watchConversations,watchListings,watchProfile,watchSaved} from './services/market';

const notice=(title:string,msg:string)=>Platform.OS==='web'?window.alert(`${title}: ${msg}`):Alert.alert(title,msg);

const tabs:{name:Tab;icon:React.ComponentProps<typeof Ionicons>['name'];active:React.ComponentProps<typeof Ionicons>['name']}[]=[
  {name:'Explore',icon:'compass-outline',active:'compass'},
  {name:'Saved',icon:'heart-outline',active:'heart'},
  {name:'Sell',icon:'add-circle-outline',active:'add-circle'},
  {name:'Messages',icon:'chatbubbles-outline',active:'chatbubbles'},
  {name:'Profile',icon:'person-outline',active:'person'},
];

export default function App(){
  const [tab,setTab]=useState<Tab>('Explore');
  const [items,setItems]=useState<Listing[]>(firebaseReady?[]:demoListings);
  const [user,setUser]=useState<User|null>(null);const [verified,setVerified]=useState(false);
  const [authReady,setAuthReady]=useState(!firebaseReady);
  const [savedIds,setSavedIds]=useState<string[]>([]);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [conversations,setConversations]=useState<Conversation[]>([]);
  const [authOpen,setAuthOpen]=useState(false);
  const [verifyOpen,setVerifyOpen]=useState(false);
  const [detail,setDetail]=useState<Listing|null>(null);
  const [editing,setEditing]=useState<Listing|null>(null);
  const [chatId,setChatId]=useState<string|null>(null);
  const [chatTitle,setChatTitle]=useState('Chat');
  const [busy,setBusy]=useState(false);
  const [feedError,setFeedError]=useState('');
  useEffect(()=>{
    if(!auth){
      AsyncStorage.getItem('campus-market-demo-saved').then(v=>{if(v)setSavedIds(JSON.parse(v) as string[]);}).catch(e=>console.warn('Local saves:',e));
      return;
    }
    return onAuthStateChanged(auth,u=>{
      setUser(u);setVerified(Boolean(u?.emailVerified));setAuthReady(true);
      if(u && !u.emailVerified) setVerifyOpen(true);
      if(!u){setProfile(null);setConversations([]);setSavedIds([]);}
    });
  },[]);
  useEffect(()=>{
    if(!db)return;
    return watchListings(setItems,e=>{console.warn('Listing sync:',e);setFeedError(readableError(e));});
  },[]);
  useEffect(()=>{
    if(!user||!verified||!db)return;
    syncProfile(user).catch(e=>{console.warn('Profile sync:',e);notice('Profile error',readableError(e));});
    const stopProfile=watchProfile(user.uid,setProfile,e=>console.warn('Profile listener:',e));
    const stopSaved=watchSaved(user.uid,setSavedIds,e=>console.warn('Saved listener:',e));
    const stopChats=watchConversations(user.uid,setConversations,e=>console.warn('Chat listener:',e));
    return ()=>{stopProfile();stopSaved();stopChats();};
  },[user?.uid,verified]);
  // Keep selected detail up to date after live edits or marking sold.
  const selectedDetail=useMemo(()=>detail?(items.find(item=>item.id===detail.id)??detail):null,[detail,items]);
  const verifiedUser=Boolean(user && verified);
  const requireVerified=()=>{
    if(!firebaseReady){notice('Demo preview','Add Firebase keys in .env to enable real accounts, posting and messages.');return false;}
    if(!user){setAuthOpen(true);return false;}
    if(!verified){setVerifyOpen(true);return false;}
    return true;
  };
  const openTab=(next:Tab)=>{
    if((next==='Sell'||next==='Messages')&&!requireVerified())return;
    setEditing(null);setDetail(null);setChatId(null);setTab(next);
  };
  const toggleSaved=async(id:string)=>{
    const save=!savedIds.includes(id);
    if(!firebaseReady||!user){
      const next=save?[...savedIds,id]:savedIds.filter(x=>x!==id);
      setSavedIds(next);AsyncStorage.setItem('campus-market-demo-saved',JSON.stringify(next)).catch(e=>console.warn(e));
      return;
    }
    if(!verified){setVerifyOpen(true);return;}
    try{await setSaved(id,save);}catch(e){notice('Save failed',readableError(e));}
  };
  const contact=async(item:Listing)=>{
    if(!requireVerified())return;
    setBusy(true);
    try{const id=await startConversation(item);setChatId(id);setChatTitle(item.title);setDetail(null);setTab('Messages');}
    catch(e){notice('Could not open chat',readableError(e));}finally{setBusy(false);}
  };
  const refreshVerification=async()=>{
    if(!user)return;
    setBusy(true);
    try{
      await reload(user);await user.getIdToken(true);
      const yes=user.emailVerified;
      setVerified(yes);
      if(yes){await syncProfile(user);setVerifyOpen(false);notice('Verified','Your account is ready!');}
      else notice('Not verified yet','Open the verification link in Gmail, then try again.');
    }catch(e){notice('Verification error',readableError(e));}finally{setBusy(false);}
  };
  const activeChat=conversations.find(c=>c.id===chatId);
  if(!authReady)return <SafeAreaView style={[S.page,{justifyContent:'center'}]}><ActivityIndicator size="large" color={C.green}/></SafeAreaView>;
  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar style="dark"/>
    {authOpen?<AuthScreen close={()=>setAuthOpen(false)}/>:
     verifyOpen&&user&&!verified?<View style={[S.page,{padding:25,justifyContent:'center'}]}>
       <View style={{backgroundColor:C.mint,width:85,height:85,borderRadius:30,alignItems:'center',justifyContent:'center',marginBottom:22}}><Ionicons name="mail-open-outline" size={42} color={C.green}/></View>
       <Text style={S.h1}>Verify your Gmail</Text><Text style={[S.sub,{marginTop:10,marginBottom:24,fontSize:14,lineHeight:23}]}>We sent a verification link to {user.email}. Open Gmail, click the link, return here and tap “I've verified”.</Text>
       <Button label={busy?'Checking...':"I've verified my email"} disabled={busy} icon="checkmark-circle-outline" onPress={refreshVerification}/>
       <View style={{height:11}}/><Button label="Continue browsing" secondary onPress={()=>setVerifyOpen(false)}/>
       <Pressable style={{marginTop:24}} onPress={async()=>{try{const {sendEmailVerification}=await import('firebase/auth');await sendEmailVerification(user);notice('Sent','Check your Gmail for the new verification email.');}catch(e){notice('Error',readableError(e));}}}><Text style={{textAlign:'center',color:C.green,fontWeight:'800'}}>Resend verification email</Text></Pressable>
       <Pressable style={{marginTop:30}} onPress={async()=>{try{await auth?.signOut();setVerifyOpen(false);}catch(e){notice('Error',readableError(e));}}}><Text style={{textAlign:'center',color:C.muted}}>Use another account</Text></Pressable>
     </View>:
     chatId&&user?<Chat id={chatId} uid={user.uid} title={activeChat?.listingTitle||chatTitle} conversation={activeChat} back={()=>setChatId(null)}/>:
     selectedDetail?<Detail item={selectedDetail} back={()=>setDetail(null)} saved={savedIds.includes(selectedDetail.id)} onSave={()=>toggleSaved(selectedDetail.id)}
       onContact={()=>contact(selectedDetail)} onEdit={()=>{if(requireVerified()){setEditing(selectedDetail);setDetail(null);setTab('Sell');}}}
       canInteract={verifiedUser} own={user?.uid===selectedDetail.sellerId}/>:
     tab==='Sell'&&verifiedUser?<Sell key={editing?.id??'new'} editing={editing} cancel={()=>{setEditing(null);setTab('Explore');}}
       done={()=>{setEditing(null);setTab('Profile');}}/>:
     tab==='Explore'?<Explore items={items} saved={savedIds} onOpen={setDetail} onSave={toggleSaved} onSell={()=>openTab('Sell')}/>:
     tab==='Saved'?<Saved items={items} saved={savedIds} onOpen={setDetail} onSave={toggleSaved}/>:
     tab==='Messages'?<Inbox conversations={conversations} uid={user?.uid??''} onChat={id=>{setChatId(id);setChatTitle(conversations.find(c=>c.id===id)?.listingTitle??'Chat');}}/>:
     <ProfilePage key={profile?.campus??'profile'} user={verifiedUser?user:null} profile={profile} items={items} open={setDetail}
       edit={item=>{if(requireVerified()){setEditing(item);setTab('Sell');}}} onLogin={()=>{if(user&&!verified)setVerifyOpen(true);else setAuthOpen(true);}}/>}
    {(!authOpen&&!verifyOpen&&!chatId&&!selectedDetail)&&<View style={{backgroundColor:C.white,borderTopColor:C.border,borderTopWidth:1,paddingTop:8,paddingBottom:7,flexDirection:'row',justifyContent:'center'}}>
      <View style={{flexDirection:'row',width:'100%',maxWidth:960}}>
        {tabs.map(t=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===t.name}} key={t.name} onPress={()=>openTab(t.name)} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:4,gap:5}}>
          {t.name==='Sell'?<View style={{backgroundColor:C.yellow,borderRadius:17,height:48,width:50,alignItems:'center',justifyContent:'center',marginTop:-8}}><Ionicons name="add" size={29} color={C.dark}/></View>:
            <View style={{backgroundColor:tab===t.name?C.mint:'transparent',borderRadius:15,width:47,height:43,alignItems:'center',justifyContent:'center'}}><Ionicons name={tab===t.name?t.active:t.icon} size={23} color={tab===t.name?C.green:C.muted}/></View>}
          <Text style={{fontSize:10,fontWeight:tab===t.name?'900':'700',color:tab===t.name?C.green:C.muted}}>{t.name}</Text>
        </Pressable>)}
      </View>
    </View>}
    {Boolean(feedError)&&!authOpen&&<Pressable onPress={()=>setFeedError('')} style={{backgroundColor:'#FDEFE9',paddingHorizontal:15,paddingVertical:6}}><Text style={{color:C.red,fontSize:11}}>{feedError} (tap to dismiss)</Text></Pressable>}
    {!firebaseReady&&!authOpen&&!selectedDetail&&<View style={{backgroundColor:'#FFEEB3',paddingHorizontal:14,paddingVertical:5}}><Text style={{fontSize:10,color:C.navy,textAlign:'center'}}>DEMO MODE · Connect Firebase to enable real listings and accounts</Text></View>}
  </SafeAreaView>;
}
