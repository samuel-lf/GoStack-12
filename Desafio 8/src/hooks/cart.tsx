import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@GoMarketplace:products');

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);
      let updatedProducts;

      if (productExists) {
        increment(productExists.id)
      } else {
        updatedProducts = [...products, { ...product, quantity: 1 }];
        setProducts(updatedProducts);
      }

      await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(updatedProducts));
    },
    [products],
  );

  const increment = useCallback(async id => {
    const itemFound = products.findIndex((item) => item.id === id);

    let productsCopy = products;

    productsCopy[itemFound].quantity = productsCopy[itemFound].quantity + 1;

    setProducts([...productsCopy]);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify([...productsCopy]));
  }, [products]);

  const decrement = useCallback(async id => {
    const itemFound = products.findIndex((item) => item.id === id);

    let productsCopy = products;

    productsCopy[itemFound].quantity = productsCopy[itemFound].quantity - 1;

    let itemQuantityZero = productsCopy.findIndex((item) => item.quantity === 0);

    if(itemQuantityZero > -1){
      productsCopy.splice(itemQuantityZero, 1);
    }

    setProducts([...productsCopy]);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify([...productsCopy]));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
