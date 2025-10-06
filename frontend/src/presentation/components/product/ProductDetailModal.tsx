import React from 'react';
import { Product, SupplierTier } from '@/domain/entities/Product';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) => {
  if (!isOpen || !product) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">
                {getCategoryIcon(product.category)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSupplierTierColor(product.supplier.tier)}`}>
                    <span className="mr-2">{getSupplierTierIcon(product.supplier.tier)}</span>
                    {product.supplier.tier.toUpperCase()} SUPPLIER
                  </span>
                  {product.inventory.isInStock ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ In Stock ({product.inventory.currentStock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Image and Basic Info */}
            <div>
              {/* Product Image Placeholder */}
              <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg overflow-hidden mb-6">
                <div className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <div className="text-8xl mb-4">
                      {getCategoryIcon(product.category)}
                    </div>
                    <p className="text-lg text-primary-600 font-medium capitalize">
                      {product.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Volume Information */}
              <Card className="p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Volume:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {product.specifications.volume}ml
                    </span>
                  </div>
                  {product.specifications.alcoholContent && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Alcohol Content:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {product.specifications.alcoholContent}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </Card>

              {/* Specifications */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Volume:</span>
                    <p className="font-medium">{product.specifications.volume}ml</p>
                  </div>
                  {product.specifications.alcoholContent && (
                    <div>
                      <span className="text-sm text-gray-500">Alcohol Content:</span>
                      <p className="font-medium">{product.specifications.alcoholContent}%</p>
                    </div>
                  )}
                  {product.specifications.origin && (
                    <div>
                      <span className="text-sm text-gray-500">Origin:</span>
                      <p className="font-medium">{product.specifications.origin}</p>
                    </div>
                  )}
                  {product.specifications.vintage && (
                    <div>
                      <span className="text-sm text-gray-500">Vintage:</span>
                      <p className="font-medium">{product.specifications.vintage}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Packaging:</span>
                    <p className="font-medium">{product.specifications.packaging}</p>
                  </div>
                  {product.specifications.shelfLife && (
                    <div>
                      <span className="text-sm text-gray-500">Shelf Life:</span>
                      <p className="font-medium">{product.specifications.shelfLife} days</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Supplier Information */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Supplier Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Supplier:</span>
                    <p className="font-medium">{product.supplier.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tier:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getSupplierTierColor(product.supplier.tier)}`}>
                      <span className="mr-1">{getSupplierTierIcon(product.supplier.tier)}</span>
                      {product.supplier.tier.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{product.supplier.contactInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{product.supplier.contactInfo.phone}</p>
                  </div>
                </div>
              </Card>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
