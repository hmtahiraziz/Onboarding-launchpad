import React, { useState } from 'react';
import { Product, SupplierTier } from '@/domain/entities/Product';
import { Card } from '../ui/Card';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductRecommendationsProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  products, 
  loading = false, 
  error = null 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    // TODO: Implement cart functionality
    alert(`Added ${product.name} to cart!`);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      const searchLower = query.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.supplier.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.subcategory.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    setFilteredProducts(filtered);
  };

  // Update filtered products when products prop changes
  React.useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      setFilteredProducts(products);
    }
  }, [products]);


  if (loading) {
    return (
      <div className="w-full mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-full mb-8 animate-pulse shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Curating your recommendations...</h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Please wait while our AI selects the best products for your business.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full mb-8 shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-red-900 mb-4">Unable to Load Recommendations</h3>
          <p className="text-xl text-red-600 max-w-2xl mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
          <p className="text-gray-600">We couldn't find any products matching your preferences at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-full mb-8 animate-pulse shadow-lg">
          <span className="text-3xl">🎯</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent mb-6 animate-slide-up">
          Your Personalized Product Recommendations
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto animate-slide-up-delay leading-relaxed">
          Based on your business profile, we've curated <span className="font-bold text-primary-600 text-2xl">{products.length}</span> products that are perfect for your venue. 
        </p>
        <div className="mt-6 animate-slide-up-delay-2">
          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-semibold shadow-md">
            💎 Platinum suppliers are highlighted for your convenience
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products, suppliers, or descriptions..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg placeholder-gray-400 transition-all duration-300 hover:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-8 text-center">
        <p className="text-lg text-gray-600">
          Showing <span className="font-bold text-primary-600 text-xl">{filteredProducts.length}</span> of <span className="font-bold text-xl">{products.length}</span> products
        </p>
      </div>

      {/* Products Grid - 4 Cards Per Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard
              product={product}
              onViewDetails={handleViewDetails}
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchQuery.trim() 
              ? `No products match "${searchQuery}". Try a different search term.`
              : 'No products available at the moment.'
            }
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need More Products?
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Showing {filteredProducts.length} of {products.length} personalized recommendations
          </p>
          <div className="flex justify-center space-x-6">
            <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              View All Products
            </button>
            <button className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
