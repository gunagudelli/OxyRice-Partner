import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Linking,
} from "react-native";
import axios from "axios";

const CITY_CLASSIFICATIONS = {
  "ANDAMAN & NICOBAR ISLANDS": { A: [], B: [], C: ["All cities"] },
  "ANDHRA PRADESH": { A: [], B: ["Vijayawada", "Greater Visakhapatnam", "Guntur", "Nellore"], C: ["Other Cities"] },
  "ARUNACHAL PRADESH": { A: [], B: [], C: ["All cities"] },
  "ASSAM": { A: [], B: ["Guwahati"], C: ["Other Cities"] },
  "BIHAR": { A: [], B: ["Patna"], C: ["Other Cities"] },
  "CHANDIGARH": { A: [], B: ["Chandigarh"], C: [] },
  "CHHATTISGARH": { A: [], B: ["Durg-Bhilai Nagar", "Raipur"], C: ["Other Cities"] },
  "DADRA & NAGAR HAVELI": { A: [], B: [], C: ["All cities"] },
  "DAMAN & DIU": { A: [], B: [], C: ["All cities"] },
  "DELHI": { A: ["Delhi"], B: [], C: [] },
  "GOA": { A: [], B: [], C: ["All cities"] },
  "GUJARAT": { A: ["Ahmedabad"], B: ["Rajkot", "Jamnagar", "Bhavnagar", "Vadodara", "Surat"], C: ["Other Cities"] },
  "HARYANA": { A: [], B: ["Faridabad", "Gurgaon"], C: ["Other Cities"] },
  "HIMACHAL PRADESH": { A: [], B: [], C: ["All cities"] },
  "JAMMU & KASHMIR": { A: [], B: ["Srinagar", "Jammu"], C: ["Other Cities"] },
  "JHARKHAND": { A: [], B: ["Jamshedpur", "Dhanbad", "Ranchi", "Bokro Stell City"], C: ["Other Cities"] },
  "KARNATAKA": { A: ["Bengaluru"], B: ["Belgaum", "Hubli-Dharwad", "Mangalore", "Mysore", "Gulbarga"], C: ["Other Cities"] },
  "KERALA": { A: [], B: ["Kozhikode", "Kochi", "Thiruvanathapuram", "Thrissur", "Malappuram", "Kannur", "Kollam"], C: ["Other Cities"] },
  "LAKSHADWEEP": { A: [], B: [], C: ["All cities"] },
  "MADHYA PRADESH": { A: [], B: ["Gwalior", "Indore", "Bhopal", "Jabalpur", "Ujjain"], C: ["Other Cities"] },
  "MAHARASHTRA": { A: ["Greater Mumbai", "Pune"], B: ["Amravati", "Nagpur", "Aurangabad", "Nashik", "Bhiwandi", "Solapur", "Kolhapur", "Vasai-Virar City", "Malegaon", "Nansws-Waghala", "Sangli"], C: ["Other Cities"] },
  "MANIPUR": { A: [], B: [], C: ["All cities"] },
  "MEGHALAYA": { A: [], B: [], C: ["All cities"] },
  "MIZORAM": { A: [], B: [], C: ["All cities"] },
  "NAGALAND": { A: [], B: [], C: ["All cities"] },
  "ODISHA": { A: [], B: ["Cuttack", "Bhubaneswar", "Rourkela"], C: ["Other Cities"] },
  "PUDUCHERRY": { A: [], B: ["Puducherry/ Pondicherry"], C: [] },
  "PUNJAB": { A: [], B: ["Amritsar", "Jalandhar", "Ludhiana"], C: ["Other Cities"] },
  "RAJASTHAN": { A: [], B: ["Bikaner", "Jaipur", "Jodhpur", "Kota", "Ajmer"], C: ["Other Cities"] },
  "SIKKIM": { A: [], B: [], C: ["All cities"] },
  "TAMIL NADU": { A: ["Chennai"], B: [], C: ["Salem", "Tiruppur", "Coimbatore", "Tiruchirappalli", "Madurai", "Erode", "Other Cities"] },
  "TELANGANA": { A: ["Hyderabad"], B: [], C: ["Warangal", "Other Cities"] },
  "TRIPURA": { A: [], B: [], C: ["All cities"] },
  "UTTAR PRADESH": { A: [], B: ["Moradabad", "Meerut", "Ghaziabad", "Aligarh", "Agra", "Bareilly", "Lucknow", "Kanpur", "Allahabad", "Gorakhpur", "Varanasi", "Saharanpur", "Noida", "Firozabad", "Jhansi"], C: ["Other Cities"] },
  "UTTARAKHAND": { A: [], B: ["Dehradun"], C: ["Other Cities"] },
  "WEST BENGAL": { A: ["Kolkata"], B: ["Asansol", "Siliguri", "Durgapur"], C: ["Other Cities"] }
};

export default function AgreementListScreen() {
  // Core state
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityClass, setSelectedCityClass] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Navigation states
  const [currentView, setCurrentView] = useState("CATEGORIES");

  // Fetch all data initially
  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter agreements when filters change
  useEffect(() => {
    filterAgreements();
  }, [agreements, selectedCityClass]);

  const fetchAllData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(
        "http://182.18.139.138:9027/api/product-service/getAllAgreements"
      );

      // Filter data to only include CA SERVICE items
      const caServiceData = response.data.filter(
        (item) => item.cacsType?.toLowerCase() === "ca service"
      );

      setAllData(caServiceData);

      // Extract unique categories from filtered data
      const uniqueCategories = new Map();
      caServiceData.forEach((item) => {
        if (!uniqueCategories.has(item.cacsName)) {
          uniqueCategories.set(item.cacsName, {
            name: item.cacsName,
            entityId: item.caCsEntityId,
            hasSubCategories: false,
          });
        }
      });

      // Check if categories have subcategories
      const categoriesArray = Array.from(uniqueCategories.values()).map(
        (category) => {
          const categoryItems = caServiceData.filter(
            (item) => item.cacsName === category.name
          );
          const hasNonEmptySubTypes = categoryItems.some(
            (item) =>
              item.categorySubType &&
              item.categorySubType.trim() !== "" &&
              item.categorySubType.trim() !== " "
          );

          return {
            ...category,
            hasSubCategories: hasNonEmptySubTypes,
          };
        }
      );

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);

    // Get items for this category
    const categoryItems = allData.filter(
      (item) => item.cacsName === category.name
    );

    if (category.hasSubCategories) {
      // Extract unique subcategories
      const uniqueSubCategories = [
        ...new Set(
          categoryItems
            .filter(
              (item) =>
                item.categorySubType &&
                item.categorySubType.trim() !== "" &&
                item.categorySubType.trim() !== " "
            )
            .map((item) => item.categorySubType.trim())
        ),
      ];

      setSubCategories(uniqueSubCategories);
      setCurrentView("SUBCATEGORIES");
    } else {
      // Show agreements directly
      setAgreements(categoryItems);
      setCurrentView("AGREEMENTS");
    }

    // Reset filters
    resetFilters();
  };

  const handleSubCategoryPress = (subCategory) => {
    setSelectedSubCategory(subCategory);

    // Get agreements for this subcategory
    const subCategoryItems = allData.filter(
      (item) =>
        item.cacsName === selectedCategory.name &&
        item.categorySubType &&
        item.categorySubType.trim() === subCategory
    );

    setAgreements(subCategoryItems);
    setCurrentView("AGREEMENTS");

    // Reset filters
    resetFilters();
  };

  const filterAgreements = () => {
    setFilteredAgreements(agreements);
  };

  const resetFilters = () => {
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedCityClass(null);
  };

  const handleBackNavigation = () => {
    if (currentView === "AGREEMENTS") {
      if (selectedCategory.hasSubCategories) {
        setCurrentView("SUBCATEGORIES");
        setSelectedSubCategory(null);
      } else {
        setCurrentView("CATEGORIES");
        setSelectedCategory(null);
      }
    } else if (currentView === "SUBCATEGORIES") {
      setCurrentView("CATEGORIES");
      setSelectedCategory(null);
      setSubCategories([]);
    }

    setAgreements([]);
    setFilteredAgreements([]);
    resetFilters();
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedCityClass(null);
    setShowStateModal(false);
    setShowCityModal(true); // Auto-open city modal
  };

  const handleCitySelect = (city, cityClass) => {
    setSelectedCity(city);
    setSelectedCityClass(cityClass);
    setShowCityModal(false);
  };

  const getAvailableCities = () => {
    if (!selectedState || !CITY_CLASSIFICATIONS[selectedState]) return [];

    const stateData = CITY_CLASSIFICATIONS[selectedState];
    const cities = [];

    Object.keys(stateData).forEach((cityClass) => {
      stateData[cityClass].forEach((city) => {
        cities.push({ name: city, class: cityClass });
      });
    });

    return cities;
  };

  const clearFilters = () => {
    resetFilters();
  };

  const getCurrentTitle = () => {
    if (currentView === "CATEGORIES") {
      return "OUR CHARTERED ACCOUNTANT SERVICES";
    } else if (currentView === "SUBCATEGORIES") {
      return selectedCategory.name;
    } else if (currentView === "AGREEMENTS") {
      if (selectedSubCategory) {
        return selectedSubCategory;
      } else {
        return selectedCategory.name;
      }
    }
    return "Services";
  };

  // Function to get price based on city tier
  const getPriceForCityTier = (agreement) => {
    if (!selectedCityClass) return null;

    // Get price based on city tier
    switch (selectedCityClass) {
      case "A":
        return agreement.priceA || agreement.price;
      case "B":
        return agreement.priceB || agreement.price;
      case "C":
        return agreement.priceC || agreement.price;
      default:
        return agreement.price;
    }
  };

  // Function to format price
  const formatPrice = (price) => {
    if (!price) return "Contact for pricing";
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Function to handle WhatsApp message generation
  const handleServiceSelection = (agreement) => {
    const serviceName = agreement.agreementName;
    const categoryName = selectedCategory.name;
    const subCategoryName = selectedSubCategory || "";
    const price = getPriceForCityTier(agreement);

    // Create WhatsApp message
    let message = `Hello, I'm interested in your CA services.\n\nService: ${serviceName}`;

    if (categoryName) {
      message += `\nCategory: ${categoryName}`;
    }

    if (subCategoryName) {
      message += `\nSubcategory: ${subCategoryName}`;
    }

    if (selectedCity && selectedState) {
      message += `\nLocation: ${selectedCity}, ${selectedState}`;
    }

    if (price) {
      message += `\nPrice: ${formatPrice(price)}`;
    }

    message += `\n\nPlease provide more details about this service and confirm the pricing.`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp URL
    const whatsappUrl = `https://wa.me/918978455447?text=${encodedMessage}`;

    // Open WhatsApp
    Linking.openURL(whatsappUrl).catch((err) => {
      console.error("Error opening WhatsApp:", err);
      Alert.alert(
        "Error",
        "Could not open WhatsApp. Please make sure WhatsApp is installed on your device."
      );
    });
  };

  // Show initial loading
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {currentView !== "CATEGORIES" && (
            <TouchableOpacity
              onPress={handleBackNavigation}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{getCurrentTitle()}</Text>
            {currentView !== "CATEGORIES" && (
              <Text style={styles.breadcrumb}>
                {selectedCategory.name}
                {selectedSubCategory && ` > ${selectedSubCategory}`}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Location Selection Bar - Show only in agreements view */}
      {currentView === "AGREEMENTS" && (
        <View style={styles.locationBar}>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>
              Select Location for Pricing:
            </Text>
            <View style={styles.locationSelectors}>
              <TouchableOpacity
                style={[
                  styles.locationSelector,
                  selectedState && styles.locationSelectorActive,
                ]}
                onPress={() => setShowStateModal(true)}
              >
                <Text
                  style={[
                    styles.locationSelectorText,
                    selectedState && styles.locationSelectorTextActive,
                  ]}
                >
                  {selectedState || "Select State"}
                </Text>
                <Text style={styles.locationArrow}>▼</Text>
              </TouchableOpacity>

              {selectedState && (
                <TouchableOpacity
                  style={[
                    styles.locationSelector,
                    selectedCity && styles.locationSelectorActive,
                  ]}
                  onPress={() => setShowCityModal(true)}
                >
                  <Text
                    style={[
                      styles.locationSelectorText,
                      selectedCity && styles.locationSelectorTextActive,
                    ]}
                  >
                    {selectedCity || "Select City"}
                  </Text>
                  <Text style={styles.locationArrow}>▼</Text>
                </TouchableOpacity>
              )}
            </View>

            {(selectedState || selectedCity) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Categories View */}
      {currentView === "CATEGORIES" && (
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Choose a service category to get started
            </Text>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryCardContent}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  {category.hasSubCategories && (
                    <View style={styles.subCategoryBadge}>
                      <Text style={styles.subCategoryBadgeText}>
                        Multiple Services
                      </Text>
                    </View>
                  )}
                  <View style={styles.categoryArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Subcategories View */}
      {currentView === "SUBCATEGORIES" && (
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Select a specific service type
            </Text>
          </View>

          <View style={styles.subCategoriesGrid}>
            {subCategories.map((subCategory, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subCategoryCard}
                onPress={() => handleSubCategoryPress(subCategory)}
                activeOpacity={0.7}
              >
                <View style={styles.subCategoryCardContent}>
                  <Text style={styles.subCategoryTitle}>{subCategory}</Text>
                  <View style={styles.subCategoryArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Agreements View */}
      {currentView === "AGREEMENTS" && (
        <View style={styles.content}>
          {/* Service Selection Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Available Services</Text>
            <Text style={styles.infoText}>
              {selectedCity
                ? `Showing prices for ${selectedCity}, ${selectedState}. Tap on any service to contact via WhatsApp.`
                : "Select your location above to view pricing. Tap on any service to get in touch via WhatsApp."}
            </Text>
          </View>

          {/* Agreements List */}
          <View style={styles.agreementsList}>
            {filteredAgreements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No services found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Please try again later
                </Text>
              </View>
            ) : (
              filteredAgreements.map((agreement, index) => (
                <TouchableOpacity
                  key={agreement.id || index}
                  style={styles.agreementCard}
                  onPress={() => handleServiceSelection(agreement)}
                  activeOpacity={0.8}
                >
                  <View style={styles.agreementHeader}>
                    <View style={styles.agreementTitleRow}>
                      <Text style={styles.agreementTitle}>
                        {agreement.agreementName}
                      </Text>
                      {selectedCity && (
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceText}>
                            {formatPrice(getPriceForCityTier(agreement))}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {agreement.agreementDescription && (
                    <View style={styles.agreementDescription}>
                      <Text style={styles.agreementDescriptionText}>
                        {agreement.agreementDescription}
                      </Text>
                    </View>
                  )}

                  <View style={styles.contactSection}>
                    <View style={styles.whatsappButton}>
                      <Text style={styles.whatsappButtonText}>
                        💬 Contact via WhatsApp
                      </Text>
                      <Text style={styles.whatsappButtonSubtext}>
                        {selectedCity
                          ? "Get details with pricing"
                          : "Get pricing and details"}
                      </Text>
                    </View>
                    <View style={styles.contactArrow}>
                      <Text style={styles.arrowText}>💬</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      )}

      {/* State Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStateModal}
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State/UT</Text>
              <TouchableOpacity
                onPress={() => setShowStateModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.keys(CITY_CLASSIFICATIONS).sort()}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedState === item && styles.modalItemActive,
                  ]}
                  onPress={() => handleStateSelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedState === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* City Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCityModal}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select City in {selectedState}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCityModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getAvailableCities()}
              keyExtractor={(item) => `${item.name}-${item.class}`}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedCity === item.name && styles.modalItemActive,
                  ]}
                  onPress={() => handleCitySelect(item.name, item.class)}
                >
                  <View style={styles.cityItemContent}>
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedCity === item.name &&
                          styles.modalItemTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.tierBadge,
                        styles[`tierBadge${item.class}`],
                      ]}
                    >
                      <Text style={styles.tierBadgeText}>
                        Tier {item.class}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Loading - CLEAN & MODERN
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },

  // Header - PROFESSIONAL & CLEAN
  header: {
    backgroundColor: "#ffdab9",
    paddingTop: 25,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 50,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  backButtonText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "500",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b249c",
    marginBottom: 2,
    alignSelf: "center",
    textAlign: "center",
  },

  breadcrumb: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "400",
    textAlign: "left",
    alignSelf: "center",
    opacity: 0.9,
  },

  // Location Bar - REFINED & ELEGANT
  locationBar: {
    backgroundColor: "#fafbfc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  locationContent: {
    gap: 12,
  },

  locationLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 10,
  },

  locationSelectors: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },

  locationSelector: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  locationSelectorActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.1,
  },

  locationSelectorText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  locationSelectorTextActive: {
    color: "#d97706",
    fontWeight: "600",
  },

  locationArrow: {
    fontSize: 12,
    color: "#9ca3af",
  },

  clearFiltersButton: {
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
    alignSelf: "flex-start",
  },

  clearFiltersText: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "600",
  },

  // Content - SPACIOUS & ORGANIZED
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  welcomeSection: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },

  welcomeText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },

  // Info Section - CLEAR & INFORMATIVE
  infoSection: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,

    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#b2beb5",
    borderLeftWidth: 4,
    borderLeftColor: "#696969",
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
    fontWeight: "400",
  },

  // Categories - MODERN CARD DESIGN
  categoriesGrid: {
    gap: 16,
  },

  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  categoryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 16,
    lineHeight: 24,
  },

  subCategoryBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },

  subCategoryBadgeText: {
    fontSize: 11,
    color: "#d97706",
    fontWeight: "600",
  },

  categoryArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e1a95f",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  arrowText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },

  // Subcategories - REFINED DESIGN
  subCategoriesGrid: {
    gap: 14,
  },

  subCategoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },

  subCategoryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    lineHeight: 22,
  },

  subCategoryArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#998c71",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#998c71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Agreements - PROFESSIONAL LAYOUT
  agreementsList: {
    gap: 20,
    paddingBottom: 30,
  },

  agreementCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  // Agreement Header - CLEAR HIERARCHY
  agreementHeader: {
    backgroundColor: "#ffffff",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  agreementTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  agreementTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 24,
    flex: 1,
    marginRight: 16,
  },

  // Price Section - ELEGANT DISPLAY
  priceContainer: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0ea5e9",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369a1",
    textAlign: "center",
  },

  // Description Section - READABLE & CLEAN
  agreementDescription: {
    backgroundColor: "#f8fafc",
    margin: 20,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#64748b",
  },

  agreementDescriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "400",
  },

  // Contact Section - INVITING & CLEAR
  contactSection: {
    backgroundColor: "#f0fdf4",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  whatsappButton: {
    flex: 1,
  },

  whatsappButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 4,
  },

  whatsappButtonSubtext: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "400",
  },

  contactArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffae42",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    shadowColor: "#ffae42",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Empty State - FRIENDLY & CLEAR
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },

  // Modals - MODERN & ACCESSIBLE
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCloseText: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },

  modalList: {
    maxHeight: 400,
  },

  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  modalItemActive: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  modalItemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },

  modalItemTextActive: {
    color: "#1d4ed8",
    fontWeight: "600",
  },

  cityItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },

  tierBadgeA: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },

  tierBadgeB: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },

  tierBadgeC: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
  },

  tierBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
});
