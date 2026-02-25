'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Search, CircleUser, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import styles from './Header.module.css';
import type { NavigationItem, Product } from '@/types/product';
import { getCategories, categoriesToNavigation, searchProducts } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// Fallback navigation in case API fails
const fallbackNavigation: NavigationItem[] = [
  { 
    name: 'GADGETS', 
    href: '/gadgets',
    path: '/gadgets',
    subcategories: [
      { name: 'New In', href: '/gadgets?type=new' },
      { name: 'Audio', href: '/gadgets?type=audio' },
      { name: 'Wearables', href: '/gadgets?type=wearables' },
      { name: 'Smart Home', href: '/gadgets?type=smart-home' },
      { name: 'Gaming', href: '/gadgets?type=gaming' },
      { name: 'Cameras', href: '/gadgets?type=cameras' },
      { name: 'Drones', href: '/gadgets?type=drones' },
    ]
  },
  { 
    name: 'ACCESSORIES', 
    href: '/accessories',
    path: '/accessories',
    subcategories: [
      { name: 'New In', href: '/accessories?type=accessories-new' },
      { name: 'Chargers', href: '/accessories?type=chargers' },
      { name: 'Cables', href: '/accessories?type=cables' },
      { name: 'Stands & Mounts', href: '/accessories?type=stands' },
      { name: 'Power Bank', href: '/accessories?type=power-bank' },
    ]
  },
];


function HeaderContent() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(fallbackNavigation[0]?.name ?? '');
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navigation, setNavigation] = useState<NavigationItem[]>(fallbackNavigation);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [mobileSearchResults, setMobileSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  
  // Debounce search queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedMobileSearchQuery = useDebounce(mobileSearchQuery, 300);

  // Fetch categories from API on mount
  useEffect(() => {
    let mounted = true;
    
    async function fetchNavigation() {
      try {
        const categories = await getCategories();
        if (mounted && categories.length > 0) {
          const nav = categoriesToNavigation(categories);
          setNavigation(nav);
          setActiveTab((prev) => prev || (nav[0]?.name ?? ''));
        }
      } catch (error) {
        // Keep fallback navigation on error
        console.error('Failed to fetch categories:', error);
      }
    }
    
    fetchNavigation();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Desktop search effect
  useEffect(() => {
    async function performSearch() {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchProducts(debouncedSearchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
    
    performSearch();
  }, [debouncedSearchQuery]);

  // Mobile search effect
  useEffect(() => {
    async function performMobileSearch() {
      if (debouncedMobileSearchQuery.length < 2) {
        setMobileSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchProducts(debouncedMobileSearchQuery);
        setMobileSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setMobileSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
    
    performMobileSearch();
  }, [debouncedMobileSearchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build current URL for comparison
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // Find active navigation item based on current path
  const activeNavItem = navigation.find((item) => pathname?.startsWith(item.path));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Lock body scroll when search popup or mobile menu is open
  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
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
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleSearchResultClick = (product: Product) => {
    const navCategory = product.category || 'gadgets';
    const identifier = product.slug || product.id;
    const subCategory = product.subCategory;
    const path = subCategory
      ? `/${navCategory}/${subCategory}/${identifier}`
      : `/${navCategory}/${identifier}`;
    router.push(path);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleMobileSearchResultClick = (product: Product) => {
    const navCategory = product.category || 'gadgets';
    const identifier = product.slug || product.id;
    const subCategory = product.subCategory;
    const path = subCategory
      ? `/${navCategory}/${subCategory}/${identifier}`
      : `/${navCategory}/${identifier}`;
    router.push(path);
    setIsSearchOpen(false);
    setMobileSearchQuery('');
    setMobileSearchResults([]);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setMobileSearchQuery('');
    setMobileSearchResults([]);
  };

  return (
    <>
      {/* Main Header */}
      <header className={`${styles.header} ${isHidden ? styles.hidden : ''} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.container}>
          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>GADZILLA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {navigation.map((item) => (
              <div 
                key={item.name} 
                className={styles.navItem}
              >
                <Link 
                  href={item.href} 
                  className={`${styles.navLink} ${pathname?.startsWith(item.path) ? styles.navLinkActive : ''}`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop Only */}
          <div className={styles.searchWrapper} ref={searchWrapperRef}>
            <input
              type="text"
              placeholder="Search for items and brands"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            />
            <button className={styles.searchBtn} aria-label="Search">
              <Search size={18} />
            </button>
            
            {/* Search Results Dropdown */}
            {showResults && (searchResults.length > 0 || isSearching || (debouncedSearchQuery.length >= 2 && !isSearching)) && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className={styles.searchLoading}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      className={styles.searchResultItem}
                      onClick={() => handleSearchResultClick(product)}
                    >
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className={styles.searchResultImage}
                        />
                      )}
                      <div className={styles.searchResultInfo}>
                        <span className={styles.searchResultName}>{product.name}</span>
                        <span className={styles.searchResultBrand}>{product.brand}</span>
                      </div>
                      <span className={styles.searchResultPrice}>
                      ৳{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className={styles.searchNoResults}>No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search Icon - Mobile Only */}
            <button
              className={`${styles.actionBtn} ${styles.searchToggle}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <Link href="/account" className={styles.actionBtn} aria-label="Account">
              <CircleUser size={22} />
            </Link>
            <Link href="/wishlist" className={styles.actionBtn} aria-label="Wishlist">
              <Heart size={22} />
            </Link>
            <Link href="/cart" className={styles.actionBtn} aria-label="Cart">
              <ShoppingBag size={22} />
              <span className={styles.cartBadge}>*</span>
            </Link>
          </div>
        </div>

        {/* Submenu - Shows based on current page */}
        {activeNavItem && (
          <div className={styles.submenuBar}>
            <div className={styles.submenuContainer}>
              {activeNavItem.subcategories.map((sub) => (
                <Link 
                  key={sub.name} 
                  href={sub.href} 
                  className={`${styles.submenuLink} ${currentUrl === sub.href ? styles.submenuLinkActive : ''}`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Search Popup */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchPopup} ref={mobileSearchRef}>
            <button
              className={styles.searchCloseBtn}
              onClick={closeSearch}
              aria-label="Close search"
            >
              <X size={24} />
            </button>
            <div className={styles.searchPopupInput}>
              <input
                type="text"
                placeholder="Search for items and brands"
                autoFocus
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
              />
              <button className={styles.searchPopupBtn} aria-label="Search">
                <Search size={20} />
              </button>
            </div>
            
            {/* Mobile Search Results */}
            {(mobileSearchResults.length > 0 || (isSearching && mobileSearchQuery.length >= 2) || (debouncedMobileSearchQuery.length >= 2 && !isSearching)) && (
              <div className={styles.mobileSearchResults}>
                {isSearching ? (
                  <div className={styles.searchLoading}>Searching...</div>
                ) : mobileSearchResults.length > 0 ? (
                  mobileSearchResults.map((product) => (
                    <button
                      key={product.id}
                      className={styles.mobileSearchResultItem}
                      onClick={() => handleMobileSearchResultClick(product)}
                    >
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className={styles.searchResultImage}
                        />
                      )}
                      <div className={styles.searchResultInfo}>
                        <span className={styles.searchResultName}>{product.name}</span>
                        <span className={styles.searchResultBrand}>{product.brand}</span>
                      </div>
                      <span className={styles.searchResultPrice}>
                        ৳{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className={styles.searchNoResults}>No results found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
        onClick={closeMenu}
      >
        {/* Menu Panel */}
        <div className={styles.mobileMenuPanel} onClick={(e) => e.stopPropagation()}>
          {/* Tab Bar */}
          <div className={styles.mobileMenuTabs}>
            {navigation.map((section) => (
              <button
                key={section.name}
                className={`${styles.mobileMenuTab} ${activeTab === section.name ? styles.mobileMenuTabActive : ''}`}
                onClick={() => setActiveTab(section.name)}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Menu Items for active tab */}
          <div className={styles.mobileMenuItems}>
            {navigation
              .filter((section) => section.name === activeTab)
              .map((section) => (
                <div key={section.name}>
                  {/* HOME card */}
                  <Link
                    href={section.href}
                    className={styles.mobileMenuItem}
                    onClick={closeMenu}
                  >
                    <span className={styles.mobileMenuItemText}>HOME</span>
                    <div className={styles.mobileMenuItemImageWrap}>
                      {section.image ? (
                        <Image
                          src={section.image}
                          alt={section.name}
                          fill
                          sizes="90px"
                          className={styles.mobileMenuItemImage}
                        />
                      ) : (
                        <div className={styles.mobileMenuItemImagePlaceholder} />
                      )}
                    </div>
                  </Link>

                  {/* Subcategory cards */}
                  {section.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={styles.mobileMenuItem}
                      onClick={closeMenu}
                    >
                      <span className={styles.mobileMenuItemText}>{sub.name.toUpperCase()}</span>
                      <div className={styles.mobileMenuItemImageWrap}>
                        {sub.image ? (
                          <Image
                            src={sub.image}
                            alt={sub.name}
                            fill
                            sizes="90px"
                            className={styles.mobileMenuItemImage}
                          />
                        ) : (
                          <div className={styles.mobileMenuItemImagePlaceholder} />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
          </div>
        </div>

      </div>
    </>
  );
}

// Suspense boundary lives inside the Client Component tree, not in the Server
// Component layout. This prevents SSR/client hydration mismatches while still
// satisfying Next.js's requirement that useSearchParams be wrapped in Suspense.
export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
