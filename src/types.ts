export type Tab = 'Explore' | 'Saved' | 'Sell' | 'Messages' | 'Profile';
export type Category = 'Electronics' | 'Books' | 'Furniture' | 'Stationery' | 'Fashion' | 'Other';
export type Condition = 'New' | 'Like new' | 'Used';
export type ItemStatus = 'active' | 'sold';
export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  location: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  createdAt: number;
  status: ItemStatus;
};
export type ListingDraft = Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'createdAt' | 'status'>;
export type Profile = { uid: string; email: string; displayName: string; campus?: string; faculty?: string; createdAt: number };
export type Conversation = {
  id: string; listingId: string; listingTitle: string; buyerId: string; sellerId: string;
  participants: string[]; updatedAt: number; lastMessage: string;
  buyerName?: string; sellerName?: string; lastSenderId?: string;
};
export type ChatMessage = { id: string; senderId: string; senderName?: string; text: string; createdAt: number };
