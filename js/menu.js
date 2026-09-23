export const menuItems = [
  {
    id: 1,
    name: "Paneer Tikka",
    category: "starters",
    price: 280,
    description: "Char-grilled cottage cheese with aromatic spices",
    image: "assets/images/paneer-tikka.jpg",
    art: "tikka",
    shortLabel: "Paneer",
    vegetarian: true
  },
  {
    id: 2,
    name: "Dal Makhani",
    category: "main-course",
    price: 320,
    description: "Slow-cooked black lentils finished with cultured butter",
    image: "assets/images/dal-makhani.jpg",
    art: "dal",
    shortLabel: "Dal",
    vegetarian: true
  },
  {
    id: 3,
    name: "Tandoori Roti",
    category: "breads",
    price: 55,
    description: "Hand-stretched whole wheat bread from the clay oven",
    image: "assets/images/tandoori-roti.jpg",
    art: "roti",
    shortLabel: "Roti",
    vegetarian: true
  },
  {
    id: 4,
    name: "Saffron Basmati Rice",
    category: "rice",
    price: 180,
    description: "Fragrant long-grain rice with saffron and toasted cumin",
    image: "assets/images/saffron-rice.jpg",
    art: "rice",
    shortLabel: "Rice",
    vegetarian: true
  },
  {
    id: 5,
    name: "Nimbu Soda",
    category: "beverages",
    price: 110,
    description: "Fresh lime, sparkling water and a pinch of black salt",
    image: "assets/images/nimbu-soda.jpg",
    art: "soda",
    shortLabel: "Nimbu",
    vegetarian: true
  },
  {
    id: 6,
    name: "Gulab Jamun",
    category: "desserts",
    price: 160,
    description: "Warm milk dumplings with cardamom and rose syrup",
    image: "assets/images/gulab-jamun.jpg",
    art: "jamun",
    shortLabel: "Gulab",
    vegetarian: true
  }
];

export function getMenuCategories(items) {
  return ["all", ...new Set(items.map((item) => item.category))];
}
