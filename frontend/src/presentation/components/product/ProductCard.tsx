import React from 'react';
import { Product, SupplierTier } from '@/domain/entities/Product';
import { Card } from '../ui/Card';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails, 
  onAddToCart 
}) => {
  const getSupplierTierColor = (tier: SupplierTier) => {
    switch (tier) {
      case SupplierTier.PLATINUM:
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case SupplierTier.GOLD:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case SupplierTier.SILVER:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case SupplierTier.BRONZE:
        return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getSupplierTierIcon = (tier: SupplierTier) => {
    switch (tier) {
      case SupplierTier.PLATINUM:
        return '💎';
      case SupplierTier.GOLD:
        return '🥇';
      case SupplierTier.SILVER:
        return '🥈';
      case SupplierTier.BRONZE:
        return '🥉';
      default:
        return '🏢';
    }
  };

  const formatPrice = (price: number, currency: string = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spirits': return '🥃';
      case 'wine': return '🍷';
      case 'beer': return '🍺';
      case 'champagne': return '🍾';
      case 'cocktail_ingredients': return '🍸';
      case 'non_alcoholic': return '🥤';
      case 'bar_equipment': return '🍽️';
      default: return '🍸';
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary-200">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-secondary-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-primary-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-secondary-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Product Image Placeholder */}
      <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-t-lg overflow-hidden relative group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-500">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
        
        <div className="flex items-center justify-center h-28 relative z-10">
          <div className="text-center transform group-hover:scale-125 group-hover:rotate-3 transition-all duration-500">
            <div className="text-4xl mb-2 group-hover:animate-bounce group-hover:drop-shadow-lg">
              {getCategoryIcon(product.category)}
            </div>
            <p className="text-sm text-primary-600 font-medium capitalize group-hover:text-primary-700 group-hover:font-bold transition-all duration-300">
              {product.category.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        {/* Interactive Corner Elements */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
          <div className="w-4 h-4 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
          <div className="w-3 h-3 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full animate-ping shadow-md"></div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
      </div>

      {/* Product Info */}
      <div className="p-2 flex-1 flex flex-col relative z-10">
        {/* Supplier Tier Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${getSupplierTierColor(product.supplier.tier)}`}>
            <span className="mr-1 group-hover:animate-spin group-hover:scale-125 transition-transform duration-300">{getSupplierTierIcon(product.supplier.tier)}</span>
            {product.supplier.tier.toUpperCase()}
          </span>
          {product.inventory.isInStock ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-md">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse group-hover:animate-bounce"></span>
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-md">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1 group-hover:animate-pulse"></span>
              Out of Stock
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 group-hover:font-bold transition-all duration-300 transform group-hover:scale-105">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2 flex-1 group-hover:text-gray-700 transition-colors duration-300">
          {product.description}
        </p>

        {/* Supplier */}
        <div className="flex items-center mb-2 group-hover:bg-gray-50 rounded-lg p-1 transition-all duration-300">
          <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Supplier:</span>
          <span className="ml-2 text-sm font-medium text-gray-900 group-hover:text-primary-600 group-hover:font-semibold transition-all duration-300">{product.supplier.name}</span>
        </div>

        {/* Specifications */}
        {product.specifications.volume && (
          <div className="flex items-center justify-center mb-2">
            <div className="bg-primary-50 px-3 py-1 rounded-full group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
              <span className="text-xs text-primary-700 font-medium group-hover:text-primary-800 group-hover:font-bold transition-all duration-300">
                {product.specifications.volume}ml
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-primary-100 group-hover:text-primary-700 transition-all duration-300 cursor-pointer transform group-hover:scale-110 group-hover:shadow-sm"
                style={{ animationDelay: `${tagIndex * 0.1}s` }}
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300 cursor-pointer transform group-hover:shadow-sm">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <button 
            onClick={() => onViewDetails(product)}
            className="w-full border-2 border-primary-600 text-primary-600 py-2 px-4 rounded-lg font-medium hover:bg-primary-600 hover:text-white hover:border-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 group-hover:animate-bounce group-hover:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="group-hover:font-bold transition-all duration-300">View Details</span>
            </span>
            {/* Animated background fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          </button>
        </div>
      </div>
    </Card>
  );
};
