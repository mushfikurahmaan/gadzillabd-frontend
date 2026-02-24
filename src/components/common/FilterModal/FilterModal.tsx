'use client';

import { useEffect, useState } from 'react';
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './FilterModal.module.css';
import type { Subcategory } from '@/types/product';

type FilterTab = 'main' | 'category' | 'brand';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  subcategories?: Subcategory[];
  brands?: string[];
  activeSubcategory?: string | null;
  activeBrand?: string | null;
  onFilterChange?: (filters: { subcategory: string | null; brand: string | null }) => void;
  categoryPath?: string;
}

export default function FilterModal({ 
  isOpen, 
  onClose, 
  itemCount,
  subcategories = [],
  brands = [],
  activeSubcategory = null,
  activeBrand = null,
  onFilterChange,
  categoryPath = '',
}: FilterModalProps) {
  // Track which tab/section is active
  const [activeTab, setActiveTab] = useState<FilterTab>('main');
  
  // Track pending selections (not yet applied)
  const [pendingSubcategory, setPendingSubcategory] = useState<string | null>(activeSubcategory);
  const [pendingBrand, setPendingBrand] = useState<string | null>(activeBrand);

  // Reset pending selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingSubcategory(activeSubcategory);
      setPendingBrand(activeBrand);
      setActiveTab('main');
    }
  }, [isOpen, activeSubcategory, activeBrand]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    setPendingSubcategory(null);
    setPendingBrand(null);
  };

  const handleViewItems = () => {
    if (onFilterChange) {
      onFilterChange({
        subcategory: pendingSubcategory,
        brand: pendingBrand,
      });
    }
    onClose();
  };

  // Check if there are pending changes
  const hasChanges = pendingSubcategory !== activeSubcategory || pendingBrand !== activeBrand;
  
  // Count active filters
  const activeFilterCount = (pendingSubcategory ? 1 : 0) + (pendingBrand ? 1 : 0);

  // Get display text for current selections
  const getCategoryDisplay = () => {
    if (!pendingSubcategory) return 'All';
    const found = subcategories.find(s => s.slug === pendingSubcategory);
    return found?.name || pendingSubcategory;
  };

  const getBrandDisplay = () => {
    return pendingBrand || 'All';
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          {activeTab !== 'main' ? (
            <button className={styles.backBtn} onClick={() => setActiveTab('main')}>
              <ChevronLeft size={24} />
            </button>
          ) : null}
          <h2 className={styles.title}>
            {activeTab === 'main' && 'FILTER'}
            {activeTab === 'category' && 'CATEGORY'}
            {activeTab === 'brand' && 'BRAND'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close filter">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Main Menu */}
          {activeTab === 'main' && (
            <>
              <button 
                className={styles.filterMenuItem}
                onClick={() => setActiveTab('category')}
              >
                <span>Category</span>
                <div className={styles.filterMenuRight}>
                  <span className={styles.filterValue}>{getCategoryDisplay()}</span>
                  <ChevronRight size={20} />
                </div>
              </button>
              <button 
                className={styles.filterMenuItem}
                onClick={() => setActiveTab('brand')}
              >
                <span>Brand</span>
                <div className={styles.filterMenuRight}>
                  <span className={styles.filterValue}>{getBrandDisplay()}</span>
                  <ChevronRight size={20} />
                </div>
              </button>
            </>
          )}

          {/* Category Selection */}
          {activeTab === 'category' && (
            <>
              <button 
                className={`${styles.filterItem} ${!pendingSubcategory ? styles.filterItemActive : ''}`}
                onClick={() => setPendingSubcategory(null)}
              >
                <span>All Categories</span>
                {!pendingSubcategory && <Check size={20} />}
              </button>
              {subcategories.map((subcat) => (
                <button 
                  key={subcat.id} 
                  className={`${styles.filterItem} ${pendingSubcategory === subcat.slug ? styles.filterItemActive : ''}`}
                  onClick={() => setPendingSubcategory(subcat.slug)}
                >
                  <span>{subcat.name}</span>
                  {pendingSubcategory === subcat.slug && <Check size={20} />}
                </button>
              ))}
            </>
          )}

          {/* Brand Selection */}
          {activeTab === 'brand' && (
            <>
              <button 
                className={`${styles.filterItem} ${!pendingBrand ? styles.filterItemActive : ''}`}
                onClick={() => setPendingBrand(null)}
              >
                <span>All Brands</span>
                {!pendingBrand && <Check size={20} />}
              </button>
              {brands.map((brand) => (
                <button 
                  key={brand} 
                  className={`${styles.filterItem} ${pendingBrand === brand ? styles.filterItemActive : ''}`}
                  onClick={() => setPendingBrand(brand)}
                >
                  <span>{brand}</span>
                  {pendingBrand === brand && <Check size={20} />}
                </button>
              ))}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.clearBtn} onClick={handleClearAll}>
            CLEAR ALL{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          <button className={styles.viewBtn} onClick={handleViewItems}>
            VIEW ITEMS
          </button>
        </div>
      </div>
    </>
  );
}
