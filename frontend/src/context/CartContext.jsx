import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'axlero_cart_items';

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

/**
 * Initializer function to safely load cart from localStorage
 */
function loadInitialCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Validate that items have essential fields
      return parsed.filter(
        (item) => item && item.id && typeof item.price === 'number' && typeof item.quantity === 'number'
      );
    }
    return [];
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error);
    return [];
  }
}

/**
 * Cart Reducer enforcing state immutability & stock invariants
 */
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.findIndex((item) => item.id === product.id);

      const maxStock = typeof product.stock === 'number' ? product.stock : 999;
      if (maxStock <= 0) {
        return state; // Out of stock items cannot be added
      }

      if (existingIndex > -1) {
        const existingItem = state[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);

        const updated = [...state];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          stock: maxStock, // ensure latest stock is captured
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
        vendorId: product.vendorId || (product.vendor?._id ? product.vendor._id : 'unknown_vendor'),
        vendorName: product.vendorName || product.vendor?.name || 'Verified Marketplace Seller',
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

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadInitialCart);

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync cart state to localStorage:', err);
    }
  }, [items]);

  /**
   * Action: Add item with stock boundary verification
   * Returns: { success: boolean, message?: string }
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || (!product.id && !product._id)) {
      return { success: false, message: 'Invalid product data' };
    }

    const maxStock = typeof product.stock === 'number' ? product.stock : 999;
    if (maxStock <= 0) {
      return { success: false, message: 'Item is currently out of stock' };
    }

    const productId = product.id || product._id;
    const existing = items.find((item) => item.id === productId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantity > maxStock) {
      const remainingAddable = maxStock - currentQty;
      if (remainingAddable <= 0) {
        return {
          success: false,
          message: `Maximum stock limit reached (${maxStock} in stock)`,
        };
      }
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: { product, quantity: remainingAddable },
      });
      return {
        success: true,
        message: `Added ${remainingAddable} item(s) (reached maximum stock)`,
      };
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity },
    });
    return { success: true };
  };

  /**
   * Action: Update item quantity
   */
  const updateQuantity = (productId, quantity) => {
    const item = items.find((it) => it.id === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    const maxStock = typeof item.stock === 'number' ? item.stock : 999;
    if (quantity > maxStock) {
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { productId, quantity: maxStock },
      });
      return {
        success: false,
        message: `Only ${maxStock} items available in stock`,
      };
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity },
    });
    return { success: true };
  };

  /**
   * Action: Remove item from cart
   */
  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId },
    });
  };

  /**
   * Action: Clear all items
   */
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  /**
   * Helpers
   */
  const isInCart = (productId) => items.some((item) => item.id === productId);

  const getItemQuantity = (productId) => {
    const item = items.find((it) => it.id === productId);
    return item ? item.quantity : 0;
  };

  /**
   * Data Integrity Invariant: Multi-Vendor Aggregation
   * Groups items into discrete vendor buckets to support split orders
   * and isolated vendor commission/fulfillment calculation.
   */
  const cartByVendor = useMemo(() => {
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

    return Array.from(vendorMap.values());
  }, [items]);

  /**
   * Global Derived Aggregates
   */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
    [items]
  );

  const value = {
    items,
    cartByVendor,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
