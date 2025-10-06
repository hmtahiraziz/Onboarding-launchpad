export interface ParamountProduct {
  id: string;
  sku: string;
  name: string;
  product_web_description: string;
  image: string | null;
  supplier: string;
  supplier_id: string;
  visibility: string;
  product_rank: string;
  wholesale_units_per_case: string;
  loyalty_points: string;
  points_excluded_from_retail: string | null;
  supplier_points: string;
  bonus_points: string;
  brand: string;
  item_container_type: string;
  country: string;
  region: string | null;
  sell_by_type: string;
  category_level_1: string | null;
  category_level_2: string | null;
  category_level_3: string | null;
  category_level_4: string | null;
  mirakl_product: string;
  sold_at_cairns: string;
  sold_at_brisbane: string;
  sold_at_adelaide: string;
  sold_at_melbourne: string;
  sold_at_sydney: string;
  is3_pl_only: string;
  varietal: string | null;
  liquor_style: string | null;
  consumable_units_per_case: string;
  en_created: string;
  redeemable: string;
  marketing_tags: string | null;
  wet_tax: string;
  long_term_oos_locations: string | null;
  core_range_locations: string | null;
  hide_on_public: string;
  abv: string;
  split_pack_size: string;
}

export interface ProductAttributes {
  brands: string[];
  item_container_types: string[];
  countries: string[];
  regions: string[];
  category_level_1: string[];
  category_level_2: string[];
  category_level_3: string[];
  category_level_4: string[];
  varietals: string[];
  liquor_styles: string[];
}



