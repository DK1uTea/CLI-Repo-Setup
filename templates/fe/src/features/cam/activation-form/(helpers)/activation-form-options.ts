export const getHighTrafficZones = () => [
  { value: 'TRAIN_STATION', label: 'Train station' },
  { value: 'AIRPORT', label: 'Airport' },
  { value: 'SHOPPING_STREET', label: 'Shopping street' },
  { value: 'SHOPPING_MALL', label: 'Shopping mall' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'TRENDY_DISTRICT', label: 'Trendy district' },
  { value: 'TOURIST_DESTINATION', label: 'Tourist destination / excursion spot' },
  { value: 'EVENT', label: 'Event (e.g. fairground)' },
  { value: 'STADIUM', label: 'Stadium' },
  { value: 'VENUE', label: 'Venue / Prestige account' },
  { value: 'LEISURE_ENTERTAINMENT', label: 'Leisure & Entertainment' },
  { value: 'OTHER', label: 'Other' },
] as { value: string; label: string }[]

export const getProfitabilityOptions = () => [
  { value: 'WITHIN_FRAMEWORK', label: 'Below the dashboard framework (< 100%)' },
  { value: 'CLOSE_TO_FRAMEWORK', label: 'Close to the dashboard framework (≤ 130%)' },
  { value: 'ABOVE_FRAMEWORK', label: 'Above the dashboard framework (> 130%)' },
] as { value: string; label: string }[]

export const getBrandFitOptions = () => [
  { value: 'SCENE_PREMIUM', label: 'Scene / Premium' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'LOW', label: 'Low' },
] as { value: string; label: string }[]

export const getAhMarktLocations = () => [
  { value: 'OUTDOOR_AREA', label: 'Outdoor area' },
  { value: 'ENTRANCE_AREA', label: 'Entrance area' },
  { value: 'SALAD_AND_SNACK_BAR', label: 'Salad / snack counter' },
  { value: 'BEVERAGE_SHELF', label: 'Beverage shelf' },
  { value: 'BEVERAGE_ENDCAP', label: 'Beverage endcap' },
  { value: 'PILLAR', label: 'Pillar' },
  { value: 'HOT_FOOD_COUNTER', label: 'Hot food counter' },
  { value: 'COOLING_DISPLAY', label: 'Cooling display' },
  { value: 'CHECKOUT_ZONE', label: 'Checkout zone' },
  { value: 'YOUR_IDEA', label: 'Your idea' },
] as { value: string; label: string }[]

export const getHMarktLocations = () => [
  { value: 'OUTDOOR_AREA', label: 'Outdoor area' },
  { value: 'REFRIGERATOR', label: 'Refrigerator' },
  { value: 'COUNTER_AREA', label: 'Counter area' },
  { value: 'MENU_BOARD', label: 'Menu board' },
  { value: 'SEATING_AREA', label: 'Seating area' },
] as { value: string; label: string }[]

export const getRevenuePotentials = () => [
  { value: 'NEW_CUSTOMER_ACQUISITION', label: 'New customer acquisition' },
  { value: 'DISRUPTION_POINT', label: 'Disruption point' },
  { value: 'SOCVI', label: 'SOCVI' },
  { value: 'SOVI', label: 'SOVI' },
  { value: 'SECONDARY_PLACEMENT', label: 'Secondary placement' },
  { value: 'MEAL_DEAL', label: 'Meal deal' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'OTHER', label: 'Other' },
] as { value: string; label: string }[]

export const getContractSituations = () => [
  { value: 'ACTIVE_CC', label: 'Active CC sales or marketing contract' },
  { value: 'NEGOTIATIONS', label: 'In contract negotiations with CC' },
  { value: 'COMPETITOR', label: 'Active contract with a competitor' },
  { value: 'NO_CONTRACT', label: 'No contract' },
  { value: 'OTHER', label: 'Other' },
] as { value: string; label: string }[]

export const getSalesConcepts = () => [
  { value: 'TAKE_AWAY', label: 'Take-away (to go)' },
  { value: 'SELF_SERVICE', label: 'Self-service' },
  { value: 'TABLE_SERVICE', label: 'Table service' },
  { value: 'DELIVERY_SERVICE', label: 'Delivery service' },
  { value: 'OTHER', label: 'Other' },
] as { value: string; label: string }[]

export const getTargetGroups = () => [
  { value: 'TEENAGERS', label: 'Teenagers' },
  { value: 'YOUNG_ADULTS', label: 'Young adults (18-30)' },
  { value: 'ADULTS', label: 'Adults (30-60)' },
  { value: 'PRICE_CONSCIOUS', label: 'Price-conscious guests' },
  { value: 'HEALTH_CONSCIOUS', label: 'Health-conscious guests' },
  { value: 'REGIONAL', label: 'Regional guests' },
  { value: 'TOURISTS', label: 'Tourists' },
  { value: 'OTHER', label: 'Other' },
] as { value: string; label: string }[]

export const getActivationResponsible = () => {
  return [
    { value: 'EIFERT_KIRSTIN', label: 'Kirstin Eifert' },
    { value: 'LOW_MAXIMILIAN', label: 'Maximilian Löw' },
    { value: 'HAAK_VOLKER', label: 'Volker Haak' },
    { value: 'TOMASCHEWSKI_MATHIAS', label: 'Mathias Tomaschewski' },
    { value: 'HUBER_VALENTIN', label: 'Valentin Huber' },
    { value: 'WEIDNER_MALTE', label: 'Malte Weidner' },
    { value: 'KNAPP_SASCHA', label: 'Sascha Knapp' },
    { value: 'WEIHER_ANNE', label: 'Anne Weiher' },
  ] as { value: string; label: string }[]
}
