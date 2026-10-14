import { Category, Listing } from './types';
export const categories: Category[] = ['Electronics','Books','Furniture','Stationery','Fashion','Other'];
export const categoryIcons: Record<Category,string> = {
  Electronics:'💻', Books:'📚', Furniture:'🪑', Stationery:'✏️', Fashion:'👕', Other:'📦'
};
const now = Date.now();
export const demoListings: Listing[] = [
  {id:'demo-1',title:'Casio scientific calculator',description:'Good working condition. Ideal for university studies.',price:3200,category:'Electronics',condition:'Like new',location:'Science Faculty',imageUrl:'',sellerId:'demo-s1',sellerName:'Demo Student',createdAt:now-200000,status:'active'},
  {id:'demo-2',title:'Database Systems textbook',description:'Second-hand textbook with neat notes.',price:1500,category:'Books',condition:'Used',location:'Main Library',imageUrl:'',sellerId:'demo-s2',sellerName:'Demo Seller',createdAt:now-400000,status:'active'},
  {id:'demo-3',title:'Wireless headphones',description:'Clean and working, comes with case.',price:4500,category:'Electronics',condition:'Like new',location:'Jaffna Campus',imageUrl:'',sellerId:'demo-s3',sellerName:'Demo Seller',createdAt:now-650000,status:'active'},
  {id:'demo-4',title:'Study table',description:'Compact desk, pickup near campus.',price:7000,category:'Furniture',condition:'Used',location:'Hostel Area',imageUrl:'',sellerId:'demo-s4',sellerName:'Demo Student',createdAt:now-800000,status:'active'},
  {id:'demo-5',title:'Notebook bundle',description:'Set of new notebooks and pens.',price:850,category:'Stationery',condition:'New',location:'Engineering Faculty',imageUrl:'',sellerId:'demo-s5',sellerName:'Demo Seller',createdAt:now-1100000,status:'active'},
  {id:'demo-6',title:'Backpack for campus',description:'Durable bag with laptop compartment.',price:2500,category:'Fashion',condition:'Used',location:'Faculty Canteen',imageUrl:'',sellerId:'demo-s6',sellerName:'Demo Student',createdAt:now-1500000,status:'active'}
];
