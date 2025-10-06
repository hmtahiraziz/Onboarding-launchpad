"""
Product catalog loader for the curation service.
"""
import json
import os
from typing import List, Dict, Any, Union
from app.models import Product


def load_products(file_path: str) -> List[Product]:
    """
    Load products from JSON file.
    
    Supports both formats:
    1. Direct array: [product1, product2, ...]
    2. Object with products key: {"products": [product1, product2, ...]}
    
    Args:
        file_path: Path to the products JSON file
        
    Returns:
        List of Product objects
        
    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file format is invalid
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Products file not found: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in products file: {e}")
    except Exception as e:
        raise ValueError(f"Error reading products file: {e}")
    
    # Handle different data formats
    if isinstance(data, list):
        products_data = data
    elif isinstance(data, dict) and 'products' in data:
        products_data = data['products']
    else:
        raise ValueError("Products file must contain either an array of products or an object with 'products' key")
    
    if not isinstance(products_data, list):
        raise ValueError("Products data must be a list")
    
    # Convert to Product objects, handling missing fields gracefully
    products = []
    for i, product_data in enumerate(products_data):
        try:
            # Ensure required fields exist
            if 'id' not in product_data:
                product_data['id'] = str(i)
            if 'name' not in product_data:
                product_data['name'] = f"Product {i}"
            
            # Detect bundle products
            product_data['is_bundle'] = _detect_bundle(product_data)
            
            product = Product(**product_data)
            products.append(product)
        except Exception as e:
            print(f"Warning: Skipping invalid product at index {i}: {e}")
            continue
    
    return products


def _detect_bundle(product_data: Dict[str, Any]) -> bool:
    """
    Detect if a product is a bundle based on name and description.
    
    Args:
        product_data: Raw product data dictionary
        
    Returns:
        True if product appears to be a bundle
    """
    bundle_keywords = [
        "pack", "bundle", "combo", "set", "collection", 
        "starter", "sampler", "mixed", "variety"
    ]
    
    # Check name
    name = product_data.get('name', '').lower()
    if any(keyword in name for keyword in bundle_keywords):
        return True
    
    # Check description
    description = product_data.get('product_web_description', '').lower()
    if any(keyword in description for keyword in bundle_keywords):
        return True
    
    return False


def get_products_summary(products: List[Product]) -> Dict[str, Any]:
    """
    Get summary statistics for loaded products.
    
    Args:
        products: List of loaded products
        
    Returns:
        Dictionary with summary statistics
    """
    if not products:
        return {"total": 0, "visible": 0, "bundles": 0}
    
    visible_count = sum(1 for p in products if p.visibility == "4")
    bundle_count = sum(1 for p in products if p.is_bundle)
    
    # Category distribution
    categories = {}
    for product in products:
        if product.category_level_1:
            cat = product.category_level_1
            categories[cat] = categories.get(cat, 0) + 1
    
    # Supplier distribution
    suppliers = {}
    for product in products:
        if product.supplier:
            supplier = product.supplier
            suppliers[supplier] = suppliers.get(supplier, 0) + 1
    
    return {
        "total": len(products),
        "visible": visible_count,
        "bundles": bundle_count,
        "top_categories": dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:10]),
        "top_suppliers": dict(sorted(suppliers.items(), key=lambda x: x[1], reverse=True)[:10])
    }
