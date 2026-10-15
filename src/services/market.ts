import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy,
  query, setDoc, updateDoc, where, Unsubscribe
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut, updateProfile, User
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth,db} from '../firebase';
import {ChatMessage,Conversation,Listing,ListingDraft,Profile} from '../types';
import {validateListing} from '../utils/marketplace';
import {getConversationId} from '../utils/chat';

const requireDb=()=>{ if (!db) throw Error('Set up Firebase in .env first.'); return db; };
const requireAuth=()=>{ if (!auth) throw Error('Firebase not configured.'); return auth; };
export const readableError=(error:unknown)=>{
  const code = (error as {code?:string})?.code ?? '';
  const message:Record<string,string>={
    'auth/email-already-in-use':'This email already has an account.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/invalid-credential':'Incorrect email or password.',
    'auth/weak-password':'Use a stronger password (at least 8 characters).',
    'auth/too-many-requests':'Too many attempts. Try again later.',
    'permission-denied':'Action blocked by database security rules. Verify your email and check Firebase setup.',
  };
  return message[code] ?? (error instanceof Error?error.message:'Something went wrong.');
};
export const isVerified=(user:User|null)=>Boolean(user?.emailVerified);
export const secureUser=()=>{
  const u=requireAuth().currentUser;
  if(!u || !u.emailVerified) throw Error('Verify your Gmail address before using this feature.');
  if(!u.email?.toLowerCase().endsWith('@gmail.com')) throw Error('Use a verified @gmail.com address.');
  return u;
};
// Extra registration fields are kept locally until the Gmail link is verified.
// They are never uploaded to Firestore before verification.
const pendingKey = (uid: string) => `campus-market-registration-${uid}`;
export async function register(email:string,password:string,name:string,campus='',faculty=''){
  const a=requireAuth();
  if(!/^[-\w.+]+@gmail\.com$/i.test(email.trim())) throw Error('Use your Gmail address (example@gmail.com).');
  if(name.trim().length<2 || name.trim().length>80) throw Error('Enter a display name (2–80 characters).');
  if(campus.trim().length>60 || faculty.trim().length>60) throw Error('Campus and faculty must be at most 60 characters.');
  if(password.length<8) throw Error('Password must have at least 8 characters.');
  const result=await createUserWithEmailAndPassword(a,email.trim().toLowerCase(),password);
  await updateProfile(result.user,{displayName:name.trim()});
  try {
    await AsyncStorage.setItem(pendingKey(result.user.uid),JSON.stringify({campus:campus.trim(),faculty:faculty.trim()}));
  } catch (e) { console.warn('Could not remember optional registration details:',e); }
  await sendEmailVerification(result.user);
}
export async function login(email:string,password:string){
  if(!email.toLowerCase().endsWith('@gmail.com')) throw Error('Use a Gmail address.');
  return signInWithEmailAndPassword(requireAuth(),email.trim().toLowerCase(),password);
}
export async function sendReset(email:string){
  if(!email.trim()) throw Error('Enter your Gmail address first.');
  return sendPasswordResetEmail(requireAuth(),email.trim());
}
export async function logOut(){return signOut(requireAuth());}
export async function syncProfile(user:User){
  if(!user.emailVerified) return;
  const database=requireDb();
  const path=doc(database,'users',user.uid);
  const existing=await getDoc(path);
  const data:Partial<Profile>={uid:user.uid,email:user.email??'',displayName:user.displayName??'Student'};
  if(!existing.exists())data.createdAt=Date.now();
  let pending:{campus?:string;faculty?:string}|null=null;
  try {
    const raw=await AsyncStorage.getItem(pendingKey(user.uid));
    if(raw) pending=JSON.parse(raw) as {campus?:string;faculty?:string};
  } catch (e) { console.warn('Optional registration details unavailable:',e); }
  if(pending){
    data.campus=(pending.campus??'').slice(0,60);
    data.faculty=(pending.faculty??'').slice(0,60);
  }
  await setDoc(path,data,{merge:true});
  if(pending)await AsyncStorage.removeItem(pendingKey(user.uid)).catch(()=>{});
}
export async function updatePublicProfile(name:string,campus:string,faculty:string){
  const user=secureUser();
  const cleanName=name.trim();
  if(cleanName.length<2||cleanName.length>80)throw Error('Name must be 2–80 characters.');
  if(campus.trim().length>60||faculty.trim().length>60)throw Error('Campus and faculty must be at most 60 characters.');
  await updateProfile(user,{displayName:cleanName});
  await setDoc(doc(requireDb(),'users',user.uid),{
    displayName:cleanName,campus:campus.trim(),faculty:faculty.trim()
  },{merge:true});
  // Update this member's displayed name in existing chats right away.
  // Only their own field is modified (the Firestore rules enforce this).
  const chats=await getDocs(query(collection(requireDb(),'conversations'),where('participants','array-contains',user.uid),limit(100)));
  await Promise.all(chats.docs.map(async d=>{
    const c={...(d.data() as Conversation),id:d.id};
    const field=c.buyerId===user.uid?'buyerName':c.sellerId===user.uid?'sellerName':null;
    if(field && c[field]!==cleanName) await updateDoc(d.ref,{[field]:cleanName});
  }));
}
export function watchProfile(uid:string,cb:(p:Profile|null)=>void,onError:(error:Error)=>void):Unsubscribe{
  return onSnapshot(doc(requireDb(),'users',uid),s=>cb(s.exists()?s.data() as Profile:null),onError);
}
export async function updateCampus(campus:string){
  const user=secureUser();
  await setDoc(doc(requireDb(),'users',user.uid),{campus:campus.trim().slice(0,60)},{merge:true});
}
export function watchListings(cb:(items:Listing[])=>void,onError:(e:Error)=>void):Unsubscribe{
  return onSnapshot(query(collection(requireDb(),'listings'),orderBy('createdAt','desc'),limit(150)),
    snap=>cb(snap.docs.map(d=>({...(d.data() as Omit<Listing,'id'>),id:d.id}))),onError);
}
export async function saveListing(draft:ListingDraft,id?:string){
  const user=secureUser();
  const database=requireDb();
  const validationError=validateListing(draft);
  if(validationError)throw Error(validationError);
  const payload={...draft,title:draft.title.trim(),description:draft.description.trim(),location:draft.location.trim()};
  if(id){
    const existing=await getDoc(doc(database,'listings',id));
    if(!existing.exists()||existing.data().sellerId!==user.uid)throw Error('You can only edit your own item.');
    await updateDoc(existing.ref,payload);
    return id;
  }
  const refDoc=await addDoc(collection(database,'listings'),{...payload,createdAt:Date.now(),sellerId:user.uid,sellerName:user.displayName||'Student',status:'active'});
  return refDoc.id;
}
export async function deleteListing(id:string){const u=secureUser();const refDoc=doc(requireDb(),'listings',id);const s=await getDoc(refDoc);if(!s.exists()||s.data().sellerId!==u.uid)throw Error('Not your item.');return deleteDoc(refDoc);}
export async function setSold(id:string,sold:boolean){const u=secureUser();const refDoc=doc(requireDb(),'listings',id);const s=await getDoc(refDoc);if(!s.exists()||s.data().sellerId!==u.uid)throw Error('Not your item.');return updateDoc(refDoc,{status:sold?'sold':'active'});}
export function watchSaved(uid:string,cb:(ids:string[])=>void,onError:(e:Error)=>void):Unsubscribe{
  return onSnapshot(collection(requireDb(),'users',uid,'saved'),s=>cb(s.docs.map(d=>d.id)),onError);
}
export async function setSaved(id:string,save:boolean){
  const u=secureUser();const path=doc(requireDb(),'users',u.uid,'saved',id);
  if(save)await setDoc(path,{listingId:id,savedAt:Date.now()});else await deleteDoc(path);
}
const chatId=getConversationId;
const ownDisplayName=(u:User)=>((u.displayName||'Campus student').trim().slice(0,80));

// Keep the current member's public chat name in each of their existing conversations.
// It never changes the other participant's name or their private profile.
async function refreshMyChatName(chat:Conversation,u:User){
  const field=u.uid===chat.buyerId?'buyerName':u.uid===chat.sellerId?'sellerName':null;
  if(!field)return;
  const name=ownDisplayName(u);
  if(chat[field]!==name){
    await updateDoc(doc(requireDb(),'conversations',chat.id),{[field]:name});
  }
}

export async function startConversation(item:Listing):Promise<string>{
  const user=secureUser();
  if(user.uid===item.sellerId)throw Error('This is your own listing.');
  if(item.status!=='active')throw Error('This item is already sold.');
  const id=chatId(item.id,user.uid);
  const path=doc(requireDb(),'conversations',id);
  try {
    const existing=await getDoc(path);
    if(existing.exists()){
      await refreshMyChatName({...(existing.data() as Conversation),id},user);
      return id;
    }
  } catch (error) {
    // An absent document can fail our participant-based read rule.
    if((error as {code?:string})?.code!=='permission-denied') throw error;
  }
  const data:Conversation={
    id,listingId:item.id,listingTitle:item.title,
    buyerId:user.uid,buyerName:ownDisplayName(user),
    sellerId:item.sellerId,sellerName:item.sellerName||'Campus seller',
    participants:[user.uid,item.sellerId],lastMessage:'',updatedAt:Date.now()
  };
  await setDoc(path,data);
  return id;
}
export function watchConversations(uid:string,cb:(c:Conversation[])=>void,onError:(e:Error)=>void):Unsubscribe{
  return onSnapshot(query(collection(requireDb(),'conversations'),where('participants','array-contains',uid),limit(100)),
    snap=>{
      const chats=snap.docs.map(d=>({...(d.data() as Conversation),id:d.id})).sort((a,b)=>b.updatedAt-a.updatedAt);
      cb(chats);
      const u=auth?.currentUser;
      if(u && u.uid===uid && u.emailVerified){
        chats.forEach(c=>{void refreshMyChatName(c,u).catch(e=>console.warn('Name sync:',e));});
      }
    },onError);
}
export function watchMessages(chatId:string,cb:(messages:ChatMessage[])=>void,onError:(e:Error)=>void):Unsubscribe{
  return onSnapshot(query(collection(requireDb(),'conversations',chatId,'messages'),orderBy('createdAt','asc'),limit(150)),
    s=>cb(s.docs.map(d=>({...(d.data() as Omit<ChatMessage,'id'>),id:d.id}))),onError);
}
export async function sendMessage(chatId:string,body:string){
  const u=secureUser();
  const text=body.trim();
  if(!text||text.length>1000)throw Error('Message must be 1–1000 characters.');
  const path=doc(requireDb(),'conversations',chatId);
  const current=await getDoc(path);
  if(!current.exists()||!(current.data().participants as string[]).includes(u.uid))throw Error('Conversation not found.');
  const now=Date.now();
  const name=ownDisplayName(u);
  await addDoc(collection(path,'messages'),{senderId:u.uid,senderName:name,text,createdAt:now});
  await updateDoc(path,{lastMessage:text.slice(0,120),lastSenderId:u.uid,updatedAt:now});
}
export async function reportListing(itemId:string,reason:string){
  const u=secureUser();if(!reason.trim())throw Error('Choose a reason.');
  const d=doc(requireDb(),'reports',`${itemId}_${u.uid}`);
  await setDoc(d,{listingId:itemId,reporterId:u.uid,reason:reason.slice(0,200),createdAt:Date.now()});
}
