import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePrice,validateListing,filterListings} from '../src/utils/marketplace.ts';

const draft={
  title:'Scientific calculator',description:'Fully functional calculator for exams',price:3500,
  category:'Electronics',condition:'Used',location:'Faculty of Science',imageUrl:''
};
const items=[
  {id:'1',...draft,createdAt:5,status:'active',sellerId:'seller1',sellerName:'A'},
  {id:'2',...draft,title:'Algorithm textbook',category:'Books',price:1500,createdAt:7,status:'active',sellerId:'seller2',sellerName:'B'},
  {id:'3',...draft,title:'Old backpack',category:'Fashion',price:500,createdAt:9,status:'sold',sellerId:'seller3',sellerName:'C'},
  {id:'4',...draft,title:'Modern wireless headphones',price:4500,createdAt:11,status:'active',sellerId:'seller4',sellerName:'D'}
];
const filters={search:'',category:'All',minPrice:'',maxPrice:'',sort:'Recent'};

test('validates item price and rejects negative, invalid or excessive values',()=>{
  assert.equal(parsePrice('3500'),3500);
  assert.equal(parsePrice(' 120.50 '),120.5);
  for(const price of ['-20','abc','','1e7','100000001','120.555']) assert.equal(parsePrice(price),null);
});
test('accepts a valid listing draft and rejects incomplete forms',()=>{
  assert.equal(validateListing(draft),null);
  assert.match(validateListing({...draft,title:'ab'}),/Title/);
  assert.match(validateListing({...draft,description:'short'}),/Description/);
  assert.match(validateListing({...draft,price:-5}),/price/);
  assert.match(validateListing({...draft,location:'x'}),/location/);
  assert.match(validateListing({...draft,imageUrl:'http://example.com/a.jpg'}),/HTTPS/);
});
test('excludes sold items and sorts by newest without mutating inventory',()=>{
  const filtered=filterListings(items,filters);
  assert.deepEqual(filtered.map(x=>x.id),['4','2','1']);
  assert.deepEqual(items.map(x=>x.id),['1','2','3','4']);
});
test('search is case insensitive and also matches description and pickup location',()=>{
  assert.deepEqual(filterListings(items,{...filters,search:'ALGORITHM'}).map(x=>x.id),['2']);
  assert.equal(filterListings(items,{...filters,search:'faculty'}).length,3);
});
test('category and price range filters are combined',()=>{
  assert.deepEqual(filterListings(items,{...filters,category:'Electronics',minPrice:'3000',maxPrice:'4000'}).map(x=>x.id),['1']);
});
test('price ascending and descending sorts work',()=>{
  assert.deepEqual(filterListings(items,{...filters,sort:'Low price'}).map(x=>x.id),['2','1','4']);
  assert.deepEqual(filterListings(items,{...filters,sort:'High price'}).map(x=>x.id),['4','1','2']);
});
test('invalid or reversed price ranges show no matches rather than unexpected matches',()=>{
  assert.deepEqual(filterListings(items,{...filters,minPrice:'abc'}),[]);
  assert.deepEqual(filterListings(items,{...filters,minPrice:'5000',maxPrice:'1000'}),[]);
});
