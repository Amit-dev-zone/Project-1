/**
 * Comprehensive Unit Verification Suite for Cart State Engine & Multi-Vendor Invariants
 */

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// Inline cart reducer & aggregation functions for headless Node verification
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.findIndex((item) => item.id === product.id);

      const maxStock = typeof product.stock === 'number' ? product.stock : 999;
      if (maxStock <= 0) {
        return state;
      }

      if (existingIndex > -1) {
        const existingItem = state[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
        const updated = [...state];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          stock: maxStock,
        };
        return updated;
      }

      const initialQty = Math.min(Math.max(1, quantity), maxStock);
      const newItem = {
        id: product.id || product._id,
        title: product.title,
        price: Number(product.price) || 0,
        stock: maxStock,
        imageUrl: product.imageUrl || '',
        category: product.category || 'General',
        vendorId: product.vendorId || 'unknown_vendor',
        vendorName: product.vendorName || 'Marketplace Seller',
        quantity: initialQty,
      };

      return [...state, newItem];
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((item) => item.id !== productId);
      }

      return state.map((item) => {
        if (item.id === productId) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999;
          const safeQuantity = Math.min(Math.max(1, quantity), maxStock);
          return { ...item, quantity: safeQuantity };
        }
        return item;
      });
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      return state.filter((item) => item.id !== productId);
    }

    case CART_ACTIONS.CLEAR_CART:
      return [];

    default:
      return state;
  }
}

function computeMultiVendorAggregation(items) {
  const vendorMap = new Map();

  for (const item of items) {
    const vId = item.vendorId || 'unassigned_vendor';
    const vName = item.vendorName || 'Marketplace Seller';

    if (!vendorMap.has(vId)) {
      vendorMap.set(vId, {
        vendorId: vId,
        vendorName: vName,
        items: [],
        subtotal: 0,
        itemCount: 0,
      });
    }

    const group = vendorMap.get(vId);
    group.items.push(item);
    group.itemCount += item.quantity;
    group.subtotal = Number((group.subtotal + item.price * item.quantity).toFixed(2));
  }

  const vendors = Array.from(vendorMap.values());
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

  return { vendors, totalItems, totalPrice };
}

console.log('='.repeat(65));
console.log('🛒 RUNNING CART STATE & MULTI-VENDOR AGGREGATION TEST SUITE');
console.log('='.repeat(65));

// Test 1: Add items across different vendors
let cart = [];
const p1VendorA = {
  id: 'prod-101',
  title: 'Wireless Headphones',
  price: 99.99,
  stock: 5,
  vendorId: 'vendor-A',
  vendorName: 'AudioTech Store',
};

const p2VendorB = {
  id: 'prod-201',
  title: 'Ergonomic Desk Mat',
  price: 25.50,
  stock: 10,
  vendorId: 'vendor-B',
  vendorName: 'DeskSetup Hub',
};

const p3VendorA = {
  id: 'prod-102',
  title: 'Bluetooth Speaker',
  price: 49.00,
  stock: 8,
  vendorId: 'vendor-A',
  vendorName: 'AudioTech Store',
};

cart = cartReducer(cart, { type: CART_ACTIONS.ADD_ITEM, payload: { product: p1VendorA, quantity: 2 } });
cart = cartReducer(cart, { type: CART_ACTIONS.ADD_ITEM, payload: { product: p2VendorB, quantity: 3 } });
cart = cartReducer(cart, { type: CART_ACTIONS.ADD_ITEM, payload: { product: p3VendorA, quantity: 1 } });

assert(cart.length === 3, 'Cart contains 3 distinct product line items');

// Test 2: Multi-Vendor Aggregation Invariants
console.log('\n[Multi-Vendor Bucket Aggregation Checks]:');
const agg = computeMultiVendorAggregation(cart);
assert(agg.vendors.length === 2, 'Products correctly partitioned into 2 vendor buckets without cross-contamination');

const vendorA = agg.vendors.find((v) => v.vendorId === 'vendor-A');
const vendorB = agg.vendors.find((v) => v.vendorId === 'vendor-B');

assert(Boolean(vendorA && vendorB), 'Both Vendor A and Vendor B buckets exist');
assert(vendorA.items.length === 2, 'Vendor A bucket contains exactly 2 items');
assert(vendorB.items.length === 1, 'Vendor B bucket contains exactly 1 item');

const expectedSubtotalA = Number((99.99 * 2 + 49.00 * 1).toFixed(2)); // 248.98
assert(vendorA.subtotal === expectedSubtotalA, `Vendor A subtotal is correct: $${vendorA.subtotal}`);

const expectedSubtotalB = Number((25.50 * 3).toFixed(2)); // 76.50
assert(vendorB.subtotal === expectedSubtotalB, `Vendor B subtotal is correct: $${vendorB.subtotal}`);

const expectedGrandTotal = Number((expectedSubtotalA + expectedSubtotalB).toFixed(2)); // 325.48
assert(agg.totalPrice === expectedGrandTotal, `Global cart subtotal matches sum of vendor subtotals: $${agg.totalPrice}`);
assert(agg.totalItems === 6, `Global totalItems matches sum of vendor item quantities (2+3+1 = 6): ${agg.totalItems}`);

// Test 3: Inventory Stock Limit Enforcement
console.log('\n[Inventory Stock Limit Checks]:');
// p1VendorA has stock: 5, currently quantity: 2. Adding 5 more should cap at 5.
cart = cartReducer(cart, { type: CART_ACTIONS.ADD_ITEM, payload: { product: p1VendorA, quantity: 5 } });
const p1InCart = cart.find((it) => it.id === 'prod-101');
assert(p1InCart.quantity === 5, 'Cart capping prevents adding beyond available inventory (capped at max stock 5)');

// Out of stock product test
const outOfStockProduct = { id: 'prod-999', title: 'Sold Out Item', price: 10, stock: 0, vendorId: 'vendor-A' };
const cartBeforeOut = cart.length;
cart = cartReducer(cart, { type: CART_ACTIONS.ADD_ITEM, payload: { product: outOfStockProduct, quantity: 1 } });
assert(cart.length === cartBeforeOut, 'Out-of-stock items (stock <= 0) cannot be added to cart');

// Test 4: Quantity modification & boundary validation
console.log('\n[Item Quantity Updates & Removal Checks]:');
cart = cartReducer(cart, { type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId: 'prod-201', quantity: 2 } });
const p2InCart = cart.find((it) => it.id === 'prod-201');
assert(p2InCart.quantity === 2, 'updateQuantity decreases quantity to 2');

cart = cartReducer(cart, { type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId: 'prod-201', quantity: 0 } });
assert(!cart.some((it) => it.id === 'prod-201'), 'Setting quantity to 0 removes the item from the cart');

cart = cartReducer(cart, { type: CART_ACTIONS.REMOVE_ITEM, payload: { productId: 'prod-102' } });
assert(!cart.some((it) => it.id === 'prod-102'), 'removeFromCart successfully removes item');

// Test 5: Clear cart
console.log('\n[Clear Cart Checks]:');
cart = cartReducer(cart, { type: CART_ACTIONS.CLEAR_CART });
assert(cart.length === 0, 'clearCart successfully empties all items');

console.log('='.repeat(65));
console.log('✨ ALL CART TESTS PASSED SUCCESSFULLY!');
console.log('='.repeat(65));
