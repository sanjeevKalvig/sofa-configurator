import { useState, useEffect, createContext, useContext } from 'react';
import { fetchProductData } from '../lib/magento';

// Create Context
const ProductPricingContext = createContext();

// Provider Component
export function ProductPricingProvider({ children }) {
  const [productData, setProductData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({
    cushion_type: 18,  // Default: Comfort Foam
    fabric_material: 15, // Default: Premium Leather
    sofa_leg_type: 21   // Default: Modern Steel
  });
  const [selectedOptionLabels, setSelectedOptionLabels] = useState({
    cushion_type: 'Comfort Foam',
    fabric_material: 'Premium Leather',
    sofa_leg_type: 'Modern Steel'
  });
  const [loading, setLoading] = useState(true);

  // Fetch product data on component mount
  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const data = await fetchProductData();
      setProductData(data);
      calculatePrice(selectedOptions, data);
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find the EXACT variant that matches all three selected options
  const findVariantBySelections = (selections, data = productData) => {
    if (!data) return null;

    return data.variants.find(variant => 
      variant.option_ids.cushion_type === selections.cushion_type?.toString() &&
      variant.option_ids.fabric_material === selections.fabric_material?.toString() &&
      variant.option_ids.sofa_leg_type === selections.sofa_leg_type?.toString()
    );
  };

  // Calculate price based on EXACT variant match
  const calculatePrice = (selections, data = productData) => {
    if (!data) return 0;

    // Find the exact variant that matches all three selections
    const exactVariant = findVariantBySelections(selections, data);
    
    if (exactVariant) {
      // Use the computed_total_price from the exact variant match
      const price = exactVariant.computed_total_price;
      setCurrentPrice(price);
      return price;
    } else {
      // Fallback
      let totalPrice = data.parent.base_price;
      data.attributes.forEach(attr => {
        const selectedOptionId = selections[attr.attribute_code];
        if (selectedOptionId) {
          const option = attr.options.find(opt => opt.id === selectedOptionId);
          if (option) {
            totalPrice += option.price_addon;
          }
        }
      });
      setCurrentPrice(totalPrice);
      return totalPrice;
    }
  };

  // Get option label by ID
  const getOptionLabel = (attributeCode, optionId) => {
    const attribute = productData?.attributes.find(attr => attr.attribute_code === attributeCode);
    const option = attribute?.options.find(opt => opt.id === optionId);
    return option?.label || '';
  };

  // Update selected option and recalculate price
  const updateSelectedOption = (attributeCode, optionId) => {
    const newSelections = {
      ...selectedOptions,
      [attributeCode]: optionId
    };
    
    const newLabels = {
      ...selectedOptionLabels,
      [attributeCode]: getOptionLabel(attributeCode, optionId)
    };
    
    setSelectedOptions(newSelections);
    setSelectedOptionLabels(newLabels);
    calculatePrice(newSelections);

    console.log('Price updated:', {
      attribute: attributeCode,
      optionId: optionId,
      newPrice: currentPrice,
      selections: newSelections,
      labels: newLabels
    });
  };

  // Get current variant for add to cart
  const findCurrentVariant = () => {
    return findVariantBySelections(selectedOptions);
  };

  // Check if current selection is valid (all three options selected)
  const isSelectionComplete = () => {
    return selectedOptions.cushion_type && 
           selectedOptions.fabric_material && 
           selectedOptions.sofa_leg_type;
  };

  // Get selected combination text for display
  const getSelectedCombinationText = () => {
    if (!isSelectionComplete()) return 'Select Cushion + Fabric + Legs';
    
    return `${selectedOptionLabels.cushion_type} + ${selectedOptionLabels.fabric_material} + ${selectedOptionLabels.sofa_leg_type}`;
  };

  const value = {
    productData,
    currentPrice,
    selectedOptions,
    selectedOptionLabels,
    loading,
    updateSelectedOption,
    findCurrentVariant,
    isSelectionComplete,
    getSelectedCombinationText,
    refreshData: loadProductData
  };

  return (
    <ProductPricingContext.Provider value={value}>
      {children}
    </ProductPricingContext.Provider>
  );
}

// Custom Hook
export function useProductPricing() {
  const context = useContext(ProductPricingContext);
  if (!context) {
    throw new Error('useProductPricing must be used within a ProductPricingProvider');
  }
  return context;
}