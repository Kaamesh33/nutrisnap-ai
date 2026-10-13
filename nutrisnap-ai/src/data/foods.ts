import type { FoodGroup, FoodReference } from '../models/types';

/**
 * STARTER FOOD REFERENCE LIST (per 100 g, as eaten / cooked)
 * -----------------------------------------------------------------------
 * READ THIS BEFORE RELYING ON THE NUMBERS
 * These values are APPROXIMATE. They were compiled from general knowledge
 * of USDA FoodData Central and the Indian Food Composition Tables
 * (IFCT 2017, National Institute of Nutrition), plus typical home-recipe
 * assumptions for mixed dishes. They were NOT copied line-by-line from an
 * official database and have NOT been independently verified.
 *
 * Cooked dishes (curries, dal, sambar, biryani, dosa ...) vary a lot with
 * the recipe and especially with the amount of oil or ghee. Add oil or ghee
 * as a separate item when you know you used more than usual.
 *
 * To improve accuracy, check each value against IFCT 2017 or
 * https://fdc.nal.usda.gov and edit it here. See README "Food data".
 * -----------------------------------------------------------------------
 */

const USDA = 'Approx. USDA FoodData Central value';
const IFCT = 'Approx. IFCT 2017 / USDA value';
const RECIPE = 'Typical home-recipe estimate; varies with oil and ingredients';

/** [kcal, protein, carbs, fat, fibre] per 100 g */
type Row = [number, number, number, number, number | null];

function food(
  id: string,
  name: string,
  aliases: string[],
  group: FoodGroup,
  [kcal, protein, carbs, fat, fibre]: Row,
  servingG: number,
  servingLabel: string,
  basis: string,
): FoodReference {
  return { id, name, aliases, group, per100g: { kcal, protein, carbs, fat, fibre }, servingG, servingLabel, basis };
}

export const FOODS: FoodReference[] = [
  // Staples
  food('rice-white', 'White rice, cooked', ['rice', 'chawal', 'steamed rice', 'sadam'], 'staples', [130, 2.7, 28.2, 0.3, 0.4], 150, '1 cup cooked', USDA),
  food('rice-brown', 'Brown rice, cooked', ['brown rice'], 'staples', [123, 2.7, 25.6, 1.0, 1.6], 150, '1 cup cooked', USDA),
  food('chapati', 'Chapati / roti (no ghee)', ['roti', 'phulka', 'chapathi', 'wheat roti'], 'staples', [250, 8.5, 46, 3.7, 5.5], 40, '1 medium chapati', IFCT),
  food('paratha', 'Plain paratha', ['parotta', 'paratha'], 'staples', [325, 7, 45, 13, 4], 80, '1 paratha', RECIPE),
  food('poori', 'Poori', ['puri'], 'staples', [345, 6, 42, 17, 2.5], 30, '1 poori', RECIPE),
  food('bread-white', 'White bread', ['bread', 'toast'], 'staples', [265, 9, 49, 3.2, 2.7], 25, '1 slice', USDA),
  food('bread-brown', 'Whole wheat bread', ['brown bread', 'atta bread'], 'staples', [250, 12.5, 43, 3.5, 6], 28, '1 slice', USDA),
  food('oats-dry', 'Oats, dry', ['oatmeal', 'rolled oats'], 'staples', [389, 16.9, 66.3, 6.9, 10.6], 40, '1/2 cup dry', USDA),
  food('khichdi', 'Khichdi', ['kichdi', 'dal khichdi'], 'staples', [120, 4.5, 20, 2.5, 2], 250, '1 bowl', RECIPE),
  food('curd-rice', 'Curd rice', ['thayir sadam', 'dahi chawal', 'mosaranna'], 'staples', [115, 3, 19, 3, 0.5], 200, '1 bowl', RECIPE),
  food('lemon-rice', 'Lemon rice', ['chitranna', 'elumichai sadam'], 'staples', [165, 3, 27, 5, 1], 200, '1 bowl', RECIPE),
  food('chicken-biryani', 'Chicken biryani', ['biryani', 'biriyani'], 'staples', [182, 9, 22, 6.5, 1], 300, '1 plate', RECIPE),
  food('veg-biryani', 'Vegetable biryani', ['veg biryani', 'veg pulao', 'pulao'], 'staples', [163, 3.5, 25, 5.5, 2], 250, '1 plate', RECIPE),

  // Breakfast
  food('idli', 'Idli', ['idly'], 'breakfast', [135, 4.5, 28, 0.5, 1], 40, '1 medium idli', IFCT),
  food('dosa-plain', 'Plain dosa', ['dosai', 'dosa'], 'breakfast', [186, 4, 29, 6, 1.2], 80, '1 medium dosa', RECIPE),
  food('dosa-masala', 'Masala dosa', ['masala dosai'], 'breakfast', [168, 3.5, 24, 6.5, 2], 180, '1 masala dosa', RECIPE),
  food('medu-vada', 'Medu vada', ['vada', 'uzhunnu vada', 'vadai'], 'breakfast', [271, 8, 25, 15.5, 4], 50, '1 vada', RECIPE),
  food('upma', 'Upma', ['rava upma', 'uppittu'], 'breakfast', [147, 3.5, 22, 5, 1.5], 200, '1 bowl', RECIPE),
  food('poha', 'Poha', ['aval', 'avalakki', 'flattened rice'], 'breakfast', [161, 3, 26, 5, 1.5], 150, '1 plate', RECIPE),
  food('pongal', 'Ven pongal', ['pongal', 'khara pongal'], 'breakfast', [141, 4, 20, 5, 1.5], 200, '1 bowl', RECIPE),
  food('dhokla', 'Dhokla', ['khaman'], 'breakfast', [156, 6, 24, 4, 1.5], 100, '3 pieces', RECIPE),

  // Dal and curries
  food('dal-toor', 'Toor dal, cooked', ['dal', 'arhar dal', 'paruppu', 'tadka dal'], 'dal-and-curry', [117, 6.5, 16, 3, 3.5], 150, '1 bowl', RECIPE),
  food('dal-moong', 'Moong dal, cooked', ['moong', 'yellow dal'], 'dal-and-curry', [106, 7, 15, 2, 3], 150, '1 bowl', RECIPE),
  food('sambar', 'Sambar', ['sambhar', 'saaru'], 'dal-and-curry', [70, 3, 9, 2.5, 2.5], 150, '1 bowl', RECIPE),
  food('rasam', 'Rasam', ['chaaru'], 'dal-and-curry', [31, 1, 4, 1.2, 0.8], 150, '1 bowl', RECIPE),
  food('rajma', 'Rajma curry', ['kidney beans', 'rajma masala'], 'dal-and-curry', [137, 6, 17, 5, 5], 150, '1 bowl', RECIPE),
  food('chana-masala', 'Chana masala', ['chole', 'chickpea curry', 'channa'], 'dal-and-curry', [162, 7, 20, 6, 6], 150, '1 bowl', RECIPE),
  food('chicken-curry', 'Chicken curry', ['chicken gravy', 'kozhi curry', 'chicken masala'], 'dal-and-curry', [153, 14, 4, 9, 0.8], 150, '1 bowl', RECIPE),
  food('mutton-curry', 'Mutton curry', ['goat curry', 'lamb curry'], 'dal-and-curry', [193, 15, 4, 13, 0.6], 150, '1 bowl', RECIPE),
  food('fish-curry', 'Fish curry', ['meen curry', 'machli'], 'dal-and-curry', [131, 13, 4, 7, 0.5], 150, '1 bowl', RECIPE),
  food('paneer-butter-masala', 'Paneer butter masala', ['paneer makhani', 'paneer curry'], 'dal-and-curry', [208, 8, 8, 16, 1], 150, '1 bowl', RECIPE),
  food('palak-paneer', 'Palak paneer', ['saag paneer'], 'dal-and-curry', [151, 7, 5, 11.5, 2], 150, '1 bowl', RECIPE),

  // Protein foods
  food('egg-boiled', 'Egg, boiled', ['egg', 'boiled egg', 'anda', 'muttai'], 'protein', [155, 12.6, 1.1, 10.6, 0], 50, '1 large egg', USDA),
  food('egg-omelette', 'Omelette', ['omelet', 'egg omelette'], 'protein', [185, 11, 1.5, 15, 0], 70, '1 egg omelette', RECIPE),
  food('egg-bhurji', 'Egg bhurji', ['scrambled egg', 'anda bhurji'], 'protein', [180, 11, 3, 13.5, 0.5], 100, '2 eggs', RECIPE),
  food('chicken-breast', 'Chicken breast, grilled', ['chicken', 'grilled chicken'], 'protein', [165, 31, 0, 3.6, 0], 100, '1 small breast', USDA),
  food('tandoori-chicken', 'Tandoori chicken', ['chicken tikka'], 'protein', [157, 25, 3, 5, 0.5], 150, '2 pieces', RECIPE),
  food('fish-fry', 'Fish fry', ['fried fish', 'meen varuval'], 'protein', [221, 20, 6, 13, 0.3], 100, '1 piece', RECIPE),
  food('paneer', 'Paneer', ['cottage cheese'], 'protein', [266, 18, 3.5, 20, 0], 50, '50 g cubes', IFCT),
  food('soya-chunks', 'Soya chunks, dry', ['soya', 'meal maker', 'nutrela'], 'protein', [345, 52, 33, 0.5, 13], 30, '30 g dry', IFCT),
  food('sprouts-moong', 'Moong sprouts', ['sprouts', 'sprouted moong'], 'protein', [30, 3, 5.9, 0.2, 1.8], 100, '1 cup', USDA),
  food('whey', 'Whey protein powder (generic)', ['protein powder', 'whey'], 'protein', [400, 78, 8, 6, 0], 30, '1 scoop; check your label', 'Generic estimate; brands differ, use your label'),

  // Vegetables
  food('mixed-veg', 'Mixed vegetable curry', ['sabzi', 'veg curry', 'mixed veg'], 'vegetables', [91, 2.5, 9, 5, 3], 150, '1 bowl', RECIPE),
  food('aloo-sabzi', 'Aloo sabzi', ['potato curry', 'aloo', 'urulai'], 'vegetables', [113, 2, 14, 5.5, 2], 150, '1 bowl', RECIPE),
  food('bhindi-fry', 'Bhindi fry', ['okra', 'vendakkai', 'lady finger'], 'vegetables', [112, 2, 8, 8, 3.5], 100, '1 small bowl', RECIPE),
  food('cabbage-poriyal', 'Cabbage poriyal', ['poriyal', 'thoran', 'cabbage sabzi'], 'vegetables', [71, 1.8, 7, 4, 2.5], 100, '1 small bowl', RECIPE),
  food('salad', 'Cucumber tomato salad', ['salad', 'kachumber'], 'vegetables', [18, 0.8, 3.7, 0.2, 1.1], 100, '1 small bowl', USDA),

  // Dairy
  food('curd', 'Curd (whole milk)', ['dahi', 'yogurt', 'thayir', 'mosaru'], 'dairy', [61, 3.5, 4.7, 3.3, 0], 100, '1 small bowl', USDA),
  food('milk-toned', 'Milk, toned (3% fat)', ['milk', 'doodh', 'paal'], 'dairy', [58, 3.1, 4.7, 3, 0], 200, '1 glass (200 ml)', IFCT),
  food('milk-full', 'Milk, full cream', ['whole milk'], 'dairy', [61, 3.2, 4.8, 3.3, 0], 200, '1 glass (200 ml)', USDA),
  food('buttermilk', 'Buttermilk (chaas)', ['chaas', 'majjige', 'mor'], 'dairy', [20, 1.2, 2, 0.8, 0], 200, '1 glass', RECIPE),
  food('lassi-sweet', 'Sweet lassi', ['lassi'], 'dairy', [75, 2.8, 11, 2.2, 0], 200, '1 glass', RECIPE),

  // Fruit
  food('banana', 'Banana', ['kela', 'vazhai'], 'fruit', [89, 1.1, 22.8, 0.3, 2.6], 100, '1 medium (peeled)', USDA),
  food('apple', 'Apple', ['seb'], 'fruit', [52, 0.3, 13.8, 0.2, 2.4], 150, '1 medium', USDA),
  food('mango', 'Mango', ['aam', 'maambazham'], 'fruit', [60, 0.8, 15, 0.4, 1.6], 150, '1 cup pieces', USDA),
  food('papaya', 'Papaya', ['papita'], 'fruit', [43, 0.5, 10.8, 0.3, 1.7], 150, '1 cup pieces', USDA),
  food('orange', 'Orange', ['santra', 'mosambi'], 'fruit', [47, 0.9, 11.8, 0.1, 2.4], 130, '1 medium', USDA),
  food('guava', 'Guava', ['amrood', 'koyya'], 'fruit', [68, 2.6, 14.3, 1, 5.4], 100, '1 medium', USDA),
  food('grapes', 'Grapes', ['angoor'], 'fruit', [69, 0.7, 18.1, 0.2, 0.9], 100, '1 cup', USDA),

  // Snacks
  food('samosa', 'Samosa', ['samosa'], 'snacks', [266, 5, 30, 14, 3], 60, '1 samosa', RECIPE),
  food('pakora', 'Pakora / bajji', ['bhaji', 'bajji', 'pakoda', 'bonda'], 'snacks', [302, 7, 28, 18, 3.5], 50, '4 small pieces', RECIPE),
  food('peanuts', 'Peanuts, roasted', ['groundnut', 'moongphali', 'kadalai'], 'snacks', [585, 24.4, 21.3, 49.7, 8], 30, 'small handful', USDA),
  food('almonds', 'Almonds', ['badam'], 'snacks', [579, 21, 21.6, 49.9, 12.5], 20, 'about 15 almonds', USDA),
  food('chakli', 'Murukku / chakli', ['murukku', 'chakli'], 'snacks', [510, 8, 58, 27, 3.5], 30, '2 pieces', RECIPE),

  // Sweets
  food('gulab-jamun', 'Gulab jamun', ['jamun'], 'sweets', [382, 5, 50, 18, 0.5], 40, '1 piece with syrup', RECIPE),
  food('kheer', 'Kheer / payasam', ['payasam', 'payasa', 'rice pudding'], 'sweets', [140, 3.8, 21, 4.5, 0.3], 150, '1 bowl', RECIPE),

  // Drinks
  food('tea-milk', 'Tea with milk and sugar', ['chai', 'tea'], 'drinks', [40, 1, 6.5, 1.1, 0], 120, '1 cup', RECIPE),
  food('coffee-milk', 'Filter coffee with milk and sugar', ['coffee', 'kaapi'], 'drinks', [45, 1.3, 7, 1.3, 0], 120, '1 tumbler', RECIPE),

  // Fats and extras
  food('ghee', 'Ghee', ['clarified butter', 'neyyi'], 'fats-and-extras', [896, 0, 0, 99.5, 0], 5, '1 teaspoon', USDA),
  food('oil', 'Cooking oil', ['oil', 'refined oil', 'coconut oil', 'groundnut oil'], 'fats-and-extras', [884, 0, 0, 100, 0], 5, '1 teaspoon', USDA),
  food('sugar', 'Sugar', ['cheeni', 'sakkarai'], 'fats-and-extras', [387, 0, 100, 0, 0], 5, '1 teaspoon', USDA),
  food('coconut-chutney', 'Coconut chutney', ['chutney', 'thengai chutney'], 'fats-and-extras', [210, 3, 8, 19, 5], 40, '2 tablespoons', RECIPE),
];

export const FOOD_GROUP_LABELS: Record<FoodGroup, string> = {
  staples: 'Rice, rotis and grains',
  breakfast: 'Breakfast dishes',
  'dal-and-curry': 'Dal and curries',
  protein: 'Eggs, meat and protein',
  vegetables: 'Vegetables',
  dairy: 'Milk and curd',
  fruit: 'Fruit',
  snacks: 'Snacks and nuts',
  sweets: 'Sweets',
  drinks: 'Tea and coffee',
  'fats-and-extras': 'Oil, ghee and extras',
};
