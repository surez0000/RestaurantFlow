// src/contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';

// Mock menu items data to look up prices, names, images for cart items
// In a real app, this might come from a MenuContext or be fetched.
const mockFullMenu = [
  { id: 1, category: 'Appetizers', name: 'Spring Rolls (VG)', description: 'Crispy vegetarian spring rolls served with sweet chili sauce.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=100&auto=format&fit=crop', is_veg: true, tags: ['popular', 'vegetarian'], availability: true },
  { id: 2, category: 'Appetizers', name: 'Chicken Wings (6pcs)', description: 'Spicy buffalo chicken wings with a side of blue cheese dip.', price: 12.50, image_url: 'https://images.unsplash.com/photo-1582640140098-a02f10350E53?q=80&w=100&auto=format&fit=crop', is_veg: false, tags: ['spicy', 'non-veg'], availability: true },
  { id: 3, category: 'Main Course', name: 'Margherita Pizza (VG)', description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil on a thin crust.', price: 15.00, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=100&auto=format&fit=crop', is_veg: true, tags: ['vegetarian', 'bestseller'], availability: true },
  { id: 4, category: 'Main Course', name: 'Angus Beef Burger', description: 'Juicy Angus beef patty, cheddar cheese, lettuce, tomato, and our secret sauce in a brioche bun. Served with fries.', price: 14.00, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=100&auto=format&fit=crop', is_veg: false, tags: ['non-veg'], availability: false },
  { id: 5, category: 'Desserts', name: 'Chocolate Lava Cake (VG)', description: 'Warm dark chocolate cake with a gooey molten center, served with vanilla ice cream.', price: 9.50, image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b82?q=80&w=100&auto=format&fit=crop', is_veg: true, tags: ['sweet', 'vegetarian'], availability: true },
  { id: 6, category: 'Drinks', name: 'Fresh Lemonade', description: 'Refreshing house-made lemonade with a hint of mint.', price: 4.50, image_url: 'https://images.unsplash.com/photo-1598838073192-05906813520b?q=80&w=100&auto=format&fit=crop', is_veg: true, tags: [], availability: true },
  { id: 7, category: 'Drinks', name: 'Coca-Cola Classic', description: 'Chilled 330ml can of Coca-Cola.', price: 2.50, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=100&auto=format&fit=crop', is_veg: true, tags: [], availability: true },
  { id: 8, category: 'Main Course', name: 'Grilled Salmon', description: 'Perfectly grilled salmon fillet served with roasted vegetables and a lemon-dill sauce.', price: 22.00, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=100&auto=format&fit=crop', is_veg: false, tags: ['healthy', 'bestseller', 'non-veg'], availability: true },
];


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('restauflow-cart');
    return localData ? JSON.parse(localData) : []; // Cart stores full item objects for easier display
  });

  useEffect(() => {
    localStorage.setItem('restauflow-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      // If not in cart, add it with quantity 1, pulling details from mockFullMenu
      const menuItemDetails = mockFullMenu.find(menuItem => menuItem.id === item.id);
      if (!menuItemDetails) {
          message.error("Could not find item details to add to cart.");
          return prevItems;
      }
      return [...prevItems, { ...menuItemDetails, quantity: 1 }];
    });
    message.success(`${item.name} added to cart!`, 1.5);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 0) return; // Should not happen with UI

    setCartItems(prevItems => {
      if (newQuantity === 0) {
        message.info(`Item removed from cart.`, 1.5);
        return prevItems.filter(item => item.id !== itemId);
      }
      message.info(`Cart updated.`, 1.5);
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    message.info('Item removed from cart.', 1);
  };

  const clearCart = () => {
    setCartItems([]);
    message.success('Cart cleared!', 1);
  };

  const getCartTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotalItems,
        getCartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);