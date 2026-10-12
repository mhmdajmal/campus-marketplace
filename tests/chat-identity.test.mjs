import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getConversationId, getOtherParty, getMessageAuthor } from '../src/utils/chat.ts';

const chat = {
  id: 'listingA_buyer1', listingId: 'listingA', listingTitle: 'Laptop',
  buyerId: 'buyer1', sellerId: 'seller1', participants: ['buyer1', 'seller1'],
  buyerName: '  Nimal Perera ', sellerName: 'Kamal Silva', lastMessage: 'Hello', updatedAt: 1,
};

test('same listing creates distinct conversation IDs for different buyers', () => {
  assert.notEqual(getConversationId('listingA', 'buyer1'), getConversationId('listingA', 'buyer2'));
  assert.equal(getConversationId('listingA', 'buyer1'), 'listingA_buyer1');
});
test('seller sees the buyer name and role', () => {
  assert.deepEqual(getOtherParty(chat, 'seller1'), {name:'Nimal Perera',role:'Buyer',uid:'buyer1'});
});
test('buyer sees the seller name and role', () => {
  assert.deepEqual(getOtherParty(chat, 'buyer1'), {name:'Kamal Silva',role:'Seller',uid:'seller1'});
});
test('messages show You for own messages, sender name for others', () => {
  assert.equal(getMessageAuthor({id:'m1',senderId:'buyer1',text:'Hello',createdAt:1},'buyer1',chat),'You');
  assert.equal(getMessageAuthor({id:'m2',senderId:'seller1',senderName:'Kamal Silva',text:'Yes',createdAt:2},'buyer1',chat),'Kamal Silva');
});
test('legacy messages without senderName show participant name and legacy chat name fallback', () => {
  assert.equal(getMessageAuthor({id:'m3',senderId:'buyer1',text:'Hi',createdAt:1},'seller1',chat),'Nimal Perera');
  const oldChat={...chat,buyerName:undefined};
  assert.equal(getMessageAuthor({id:'m4',senderId:'buyer1',text:'Hi',createdAt:1},'seller1',oldChat),'Buyer');
});
