'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, X, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { ProductDetail, Product } from '@/types/product';
import styles from './Order.module.css';

interface OrderItem extends ProductDetail {
  quantity: number;
  categoryName?: string;
  subCategoryName?: string;
}

interface EnrichedProduct extends Product {
  categoryName?: string;
  subCategoryName?: string;
}

interface OrderClientProps {
  initialProducts: OrderItem[];
  availableProducts?: EnrichedProduct[];
}

export default function OrderClient({ initialProducts, availableProducts = [] }: OrderClientProps) {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialProducts);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryArea: 'inside' as 'inside' | 'outside',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^01[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid mobile number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (orderItems.length === 0) {
      setErrors({ general: 'Please add at least one product to your order.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';
      
      // Prepare products data
      const products = orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // Prepare order data
      const orderData = {
        shipping_name: formData.name,
        phone: formData.phone,
        shipping_address: formData.address,
        delivery_area: formData.deliveryArea,
        products: products,
      };

      const response = await fetch(`${apiBaseUrl}/api/orders/direct/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to place order. Please try again.');
      }

      // Redirect to success page
      router.push('/order/success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      setErrors({ general: errorMessage });
      setIsSubmitting(false);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setOrderItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          // Check stock limit if stock is available
          if (typeof item.stock === 'number' && item.stock > 0) {
            // Don't allow quantity to exceed available stock
            const maxQuantity = item.stock;
            return { ...item, quantity: Math.min(newQuantity, maxQuantity) };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeProduct = (itemId: string) => {
    setOrderItems(items => items.filter(item => item.id !== itemId));
  };

  const addProductToOrder = async (product: EnrichedProduct) => {
    // Check if product already exists in order
    const existingItem = orderItems.find(item => item.id === product.id);
    if (existingItem) {
      // Increase quantity if already in order (updateQuantity will enforce stock limit)
      updateQuantity(product.id, existingItem.quantity + 1);
      setShowProductPicker(false);
      return;
    }

    // Set loading state
    setLoadingProductId(product.id);

    // Use enriched product data if available, otherwise fetch full details
    if (product.categoryName || product.subCategoryName) {
      // Product already has category/subcategory info from server
      const newItem: OrderItem = {
        ...product,
        quantity: 1,
        categoryName: product.categoryName,
        subCategoryName: product.subCategoryName,
      };
      setOrderItems(prev => [...prev, newItem]);
      setLoadingProductId(null);
    } else {
      // Fetch full product details including category/subcategory names
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';
        const productResponse = await fetch(`${apiBaseUrl}/api/products/${product.id}/`);
        
        if (productResponse.ok) {
          const productDetail: ProductDetail = await productResponse.json();
          
          // Fetch category and subcategory names
          let categoryName: string | undefined;
          let subCategoryName: string | undefined;
          
          if (productDetail.category) {
            try {
              const categoryResponse = await fetch(`${apiBaseUrl}/api/categories/${productDetail.category}/`);
              if (categoryResponse.ok) {
                const category = await categoryResponse.json();
                categoryName = category.name;
                
                // Get subcategory name if exists
                if (productDetail.subCategory && category.subcategories) {
                  const subcat = category.subcategories.find((s: any) => s.slug === productDetail.subCategory);
                  if (subcat) {
                    subCategoryName = subcat.name;
                  }
                }
              }
            } catch (error) {
              console.error('Failed to fetch category:', error);
            }
          }

          // Add new product to order with full details
          const newItem: OrderItem = {
            ...productDetail,
            quantity: 1,
            categoryName,
            subCategoryName,
          };
          setOrderItems(prev => [...prev, newItem]);
        } else {
          // If fetch fails, add product without category/subcategory names
          const newItem: OrderItem = {
            ...product,
            quantity: 1,
          };
          setOrderItems(prev => [...prev, newItem]);
        }
      } catch (error) {
        console.error('Failed to add product:', error);
        // If fetch fails, add product without category/subcategory names
        const newItem: OrderItem = {
          ...product,
          quantity: 1,
        };
        setOrderItems(prev => [...prev, newItem]);
      } finally {
        setLoadingProductId(null);
      }
    }
    
    setShowProductPicker(false);
  };

  // Filter out products already in order
  const productsToShow = availableProducts.filter(
    p => !orderItems.some(item => item.id === p.id)
  );

  const subtotal = orderItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? Number(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const shipping = formData.deliveryArea === 'inside' ? 40 : 150;
  const total = subtotal + shipping;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSep}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>Place Order</span>
        </nav>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.orderLayout}>
            {/* Left Column - Selected Items */}
            <div className={styles.itemsColumn}>
              <div className={styles.itemsCard}>
                <h2 className={styles.itemsTitle}>Order Summary</h2>
                
                <div className={styles.orderItems}>
                  {orderItems.map((item) => {
                    const price = typeof item.price === 'string' ? Number(item.price) : item.price;
                    const imageSrc = item.image || item.images?.[0] || '/assets/logo/gadzilla-logo512.svg';
                    
                    return (
                      <div key={item.id} className={styles.orderItem}>
                        {/* Product Image and Details */}
                        <div className={styles.itemContent}>
                          <div className={styles.itemImageWrapper}>
                            <Image
                              src={imageSrc}
                              alt={item.name}
                              fill
                              className={styles.itemImage}
                              sizes="110px"
                            />
                          </div>
                          <div className={styles.itemDetails}>
                            <div className={styles.itemHeader}>
                              <Link 
                                href={`/${item.category || 'gadgets'}/${item.subCategory || 'all'}/${item.slug || item.id}`}
                                className={styles.itemNameLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <h3 className={styles.itemName}>{item.name}</h3>
                              </Link>
                              {orderItems.length > 1 && (
                                <button
                                  type="button"
                                  className={styles.deleteButton}
                                  onClick={() => removeProduct(item.id)}
                                  aria-label="Remove product"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                            {item.brand && (
                              <p className={styles.itemCategory}>Brand: {item.brand}</p>
                            )}
                            {(item.categoryName || item.subCategoryName) && (
                              <p className={styles.itemCategory}>
                                {item.categoryName?.toLowerCase() || ''}
                                {item.categoryName && item.subCategoryName && ' > '}
                                {item.subCategoryName?.toLowerCase() || ''}
                              </p>
                            )}
                            <p className={styles.itemPrice}>৳{price.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className={styles.quantitySection}>
                          <label className={styles.quantityLabel}>
                            Quantity <span className={styles.required}>*</span>
                          </label>
                          <div className={styles.quantityControls}>
                            <button
                              type="button"
                              className={styles.quantityBtn}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={typeof item.stock === 'number' && item.stock > 0 ? item.stock : undefined}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                updateQuantity(item.id, val);
                              }}
                              className={styles.quantityInput}
                            />
                            <button
                              type="button"
                              className={styles.quantityBtn}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                typeof item.stock === 'number' && item.stock > 0
                                  ? item.quantity >= item.stock
                                  : false
                              }
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {typeof item.stock === 'number' && (
                            <p className={styles.stockInfo}>
                              {item.stock === 0 
                                ? 'Out of Stock' 
                                : item.stock < 10 
                                  ? `Only ${item.stock} left` 
                                  : `${item.stock} in stock`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Another Product Button */}
                <button 
                  type="button"
                  className={styles.addProductLink}
                  onClick={() => setShowProductPicker(!showProductPicker)}
                >
                  <Plus size={18} />
                  <span>Add Another Product</span>
                </button>

                {/* Product Selection Panel */}
                {showProductPicker && (
                  <div className={styles.productPicker}>
                    <div className={styles.productPickerHeader}>
                      <h3 className={styles.productPickerTitle}>Select Product</h3>
                      <button 
                        type="button"
                        className={styles.productPickerClose}
                        onClick={() => setShowProductPicker(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.productPickerGrid}>
                      {productsToShow.length > 0 ? (
                        productsToShow.slice(0, 6).map((product) => {
                          const productImage = product.image || '/assets/logo/gadzilla-logo512.svg';
                          const productPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
                          const isLoading = loadingProductId === product.id;
                          
                          return (
                            <button
                              key={product.id}
                              type="button"
                              className={styles.productPickerItem}
                              onClick={() => addProductToOrder(product)}
                              disabled={isLoading || !!loadingProductId}
                            >
                              {isLoading ? (
                                <div className={styles.productPickerLoading}>
                                  <Loader2 size={24} className={styles.spinner} />
                                </div>
                              ) : (
                                <>
                                  <div className={styles.productPickerImageWrapper}>
                                    <Image
                                      src={productImage}
                                      alt={product.name}
                                      fill
                                      className={styles.productPickerImage}
                                      sizes="120px"
                                    />
                                  </div>
                                  <p className={styles.productPickerName}>{product.name}</p>
                                  <p className={styles.productPickerPrice}>৳{productPrice.toFixed(2)}</p>
                                </>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <p className={styles.noProducts}>No more products available</p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotals}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Delivery Charge:</span>
                    <span>৳{shipping.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryDivider} />
                  <div className={styles.summaryRowTotal}>
                    <span>Total:</span>
                    <span>৳{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer Information */}
            <div className={styles.formColumn}>
              {/* Customer Information */}
              <section className={styles.customerForm}>
                <h2 className={styles.formTitle}>Customer Information</h2>
                
                {/* Name Field */}
                <div className={styles.fieldWrapper}>
                  <label htmlFor="name" className={styles.fieldLabel}>
                    Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    required
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                {/* Mobile Number Field */}
                <div className={styles.fieldWrapper}>
                  <label htmlFor="phone" className={styles.fieldLabel}>
                    Mobile Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    required
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

                {/* Address Field */}
                <div className={styles.fieldWrapper}>
                  <label htmlFor="address" className={styles.fieldLabel}>
                    Address <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your Address"
                    rows={4}
                    className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                    required
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                {/* Delivery Area Selection */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>
                    Delivery Area <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.deliveryOptions}>
                    <label className={styles.deliveryOption}>
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="inside"
                        checked={formData.deliveryArea === 'inside'}
                        onChange={handleChange}
                        className={styles.radio}
                      />
                      <span className={styles.deliveryLabel}>Inside Dhaka City</span>
                      <span className={styles.deliveryPrice}>৳40</span>
                    </label>
                    <label className={styles.deliveryOption}>
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="outside"
                        checked={formData.deliveryArea === 'outside'}
                        onChange={handleChange}
                        className={styles.radio}
                      />
                      <span className={styles.deliveryLabel}>Outside Dhaka City</span>
                      <span className={styles.deliveryPrice}>৳150</span>
                    </label>
                  </div>
                </div>

                {/* Order Confirmation Message */}
                <p className={styles.orderConfirmationMessage}>
                  You will be contacted after placing the order to confirm it.
                </p>

                {/* General Error Message */}
                {errors.general && (
                  <div className={styles.errorText} style={{ marginBottom: 'var(--space-md)' }}>
                    {errors.general}
                  </div>
                )}

                {/* Order Button */}
                <button 
                  type="submit" 
                  className={styles.orderButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} style={{ marginRight: '8px', display: 'inline-block' }} />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
