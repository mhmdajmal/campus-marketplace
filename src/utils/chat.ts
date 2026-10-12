import type { Conversation, ChatMessage } from '../types';

export const getConversationId = (listingId: string, buyerUid: string) => `${listingId}_${buyerUid}`;
export function getOtherParty(chat: Conversation, myUid: string) {
  const amBuyer = chat.buyerId === myUid;
  return {
    name: amBuyer ? chat.sellerName?.trim() || 'Seller' : chat.buyerName?.trim() || 'Buyer',
    role: amBuyer ? 'Seller' : 'Buyer',
    uid: amBuyer ? chat.sellerId : chat.buyerId,
  };
}
export function getMessageAuthor(message: ChatMessage, myUid: string, chat: Conversation | null | undefined) {
  if (message.senderId === myUid) return 'You';
  if (message.senderName?.trim()) return message.senderName.trim();
  return chat ? getOtherParty(chat, myUid).name : 'Campus member';
}
