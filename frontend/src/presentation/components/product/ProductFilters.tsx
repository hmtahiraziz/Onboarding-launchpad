import React, { useState } from 'react';
import { Product, ProductCategory, SupplierTier } from '@/domain/entities/Product';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

interface FilterState {
  category: string;
  supplierTier: string;
  stockStatus: string;
  searchQuery: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  products, 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    supplierTier: 'all',
    stockStatus: 'all',
    searchQuery: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique values for filter options
  const categories = Array.from(new Set(products.map(p => p.category)));
  const supplierTiers = Array.from(new Set(products.map(p => p.supplier.tier)));

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...products];

    // Search filter
    if (newFilters.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        product.supplier.name.toLowerCase().includes(newFilters.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (newFilters.category !== 'all') {
      filtered = filtered.filter(product => product.category === newFilters.category);
    }

    // Supplier tier filter
    if (newFilters.supplierTier !== 'all') {
      filtered = filtered.filter(product => product.supplier.tier === newFilters.supplierTier);
    }

    // Stock status filter
    if (newFilters.stockStatus !== 'all') {
      filtered = filtered.filter(product => {
        if (newFilters.stockStatus === 'in-stock') return product.inventory.isInStock;
        if (newFilters.stockStatus === 'out-of-stock') return !product.inventory.isInStock;
        return true;
      });
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      supplierTier: 'all',
      stockStatus: 'all',
      searchQuery: ''
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
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

  const getSupplierTierIcon = (tier: SupplierTier) => {
    switch (tier) {
      case SupplierTier.PLATINUM: return '💎';
      case SupplierTier.GOLD: return '🥇';
      case SupplierTier.SILVER: return '🥈';
      case SupplierTier.BRONZE: return '🥉';
      default: return '🏢';
    }
  };

  const getSupplierTierColor = (tier: SupplierTier) => {
    switch (tier) {
      case SupplierTier.PLATINUM: return 'text-purple-600';
      case SupplierTier.GOLD: return 'text-yellow-600';
      case SupplierTier.SILVER: return 'text-gray-600';
      case SupplierTier.BRONZE: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="mb-8">
      <div className="p-6">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Products</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Collapse' : 'Expand'} Filters
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products, suppliers, or descriptions..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Filter Options */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(category => ({
                    value: category,
                    label: `${getCategoryIcon(category)} ${category.replace('_', ' ').toUpperCase()}`
                  }))
                ]}
              />
            </div>

            {/* Supplier Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Tier
              </label>
              <Select
                value={filters.supplierTier}
                onChange={(value) => handleFilterChange('supplierTier', value)}
                options={[
                  { value: 'all', label: 'All Tiers' },
                  ...supplierTiers.map(tier => ({
                    value: tier,
                    label: `${getSupplierTierIcon(tier as SupplierTier)} ${tier.toUpperCase()}`
                  }))
                ]}
              />
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <Select
                value={filters.stockStatus}
                onChange={(value) => handleFilterChange('stockStatus', value)}
                options={[
                  { value: 'all', label: 'All Products' },
                  { value: 'in-stock', label: '✓ In Stock' },
                  { value: 'out-of-stock', label: '✗ Out of Stock' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Quick Filter Chips */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
            
            {/* Category Chips */}
            {categories.slice(0, 4).map(category => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  filters.category === category
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{getCategoryIcon(category)}</span>
                {category.replace('_', ' ')}
              </button>
            ))}

            {/* Supplier Tier Chips */}
            {supplierTiers.map(tier => (
              <button
                key={tier}
                onClick={() => handleFilterChange('supplierTier', tier)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  filters.supplierTier === tier
                    ? `bg-${tier === 'platinum' ? 'purple' : tier === 'gold' ? 'yellow' : tier === 'silver' ? 'gray' : 'orange'}-100 text-${tier === 'platinum' ? 'purple' : tier === 'gold' ? 'yellow' : tier === 'silver' ? 'gray' : 'orange'}-800 border border-${tier === 'platinum' ? 'purple' : tier === 'gold' ? 'yellow' : tier === 'silver' ? 'gray' : 'orange'}-200`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{getSupplierTierIcon(tier as SupplierTier)}</span>
                {tier.toUpperCase()}
              </button>
            ))}

            {/* Clear Filters */}
            {(filters.category !== 'all' || filters.supplierTier !== 'all' || filters.stockStatus !== 'all' || filters.searchQuery) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
