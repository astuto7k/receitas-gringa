import fs from 'node:fs';
import path from 'node:path';

const [sourceDir, outputFile] = process.argv.slice(2);

if (!sourceDir || !outputFile) {
  throw new Error('Uso: node build-recipes.mjs <pasta-dos-lotes> <arquivo-de-saida>');
}

const categoryOrder = [
  'Sobremesas e Doces',
  'Panificação de Verdade',
  'Arepas e Tortilhas',
  'Pizzas e Empanadas',
  'Folhados e Croissants',
  'Refeições do Dia a Dia',
  'Bases e Preparações'
];

const categoryAliases = new Map([
  ['SOBREMESAS E DOCES', categoryOrder[0]],
  ['PANIFICAÇÃO DE VERDADE', categoryOrder[1]],
  ['AREPAS E TORTILLAS', categoryOrder[2]],
  ['PIZZAS E EMPANADAS', categoryOrder[3]],
  ['FOLHADOS E CROISSANTS', categoryOrder[4]],
  ['REFEIÇÕES DO DIA A DIA', categoryOrder[5]],
  ['BASES E PREPARAÇÕES', categoryOrder[6]]
]);

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

function parseMarkdown(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const recipes = [];
  let category = '';
  let current = null;
  let mode = '';

  const finish = () => {
    if (!current) return;
    if (!current.category || !current.ingredients.length || !current.steps.length) {
      throw new Error(`Receita incompleta em ${path.basename(filePath)}: ${current.name}`);
    }
    recipes.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      finish();
      category = categoryAliases.get(categoryMatch[1].trim()) || categoryMatch[1].trim();
      continue;
    }

    const recipeMatch = line.match(/^###\s+(\d+)\.\s+(.+)$/);
    if (recipeMatch) {
      finish();
      current = {
        id: Number(recipeMatch[1]),
        name: recipeMatch[2].trim(),
        category,
        ingredients: [],
        steps: [],
        source: 'Coleção original'
      };
      mode = '';
      continue;
    }

    if (!current) continue;
    if (line === '**Ingredientes**') {
      mode = 'ingredients';
      continue;
    }
    if (line === '**Modo de Preparo**') {
      mode = 'steps';
      continue;
    }
    if (mode === 'ingredients' && /^-\s+/.test(line)) {
      current.ingredients.push(line.replace(/^-\s+/, ''));
    }
    if (mode === 'steps' && /^\d+\.\s+/.test(line)) {
      current.steps.push(line.replace(/^\d+\.\s+/, ''));
    }
  }

  finish();
  return recipes;
}

const sourceFiles = fs.readdirSync(sourceDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => path.join(sourceDir, file));

const originalRecipes = sourceFiles.flatMap(parseMarkdown).sort((a, b) => a.id - b.id);

if (originalRecipes.length !== 330) {
  throw new Error(`Esperadas 330 receitas originais; encontradas ${originalRecipes.length}.`);
}

const ids = new Set(originalRecipes.map((recipe) => recipe.id));
if (ids.size !== originalRecipes.length || Math.min(...ids) !== 1 || Math.max(...ids) !== 330) {
  throw new Error('A numeração das receitas originais não é contínua de 1 a 330.');
}

const existingNames = new Set(originalRecipes.map((recipe) => normalize(recipe.name)));
const generated = [];
let nextId = 331;

const common = {
  salt: '1 pitada de sal',
  olive: '1 colher (sopa) de azeite de oliva',
  bakingPowder: '1 colher (chá) de fermento químico em pó'
};

function addRecipe(category, name, ingredients, steps, meta = {}) {
  if (existingNames.has(normalize(name))) return false;
  existingNames.add(normalize(name));
  generated.push({
    id: nextId++,
    name,
    category,
    ingredients,
    steps,
    source: 'Coleção complementar — revisar com nutricionista',
    ...meta
  });
  return true;
}

function fillCombinations({ category, quota, families, flavors, build }) {
  const before = generated.length;
  for (const family of families) {
    for (const flavor of flavors) {
      if (generated.length - before >= quota) return;
      const recipe = build(family, flavor);
      addRecipe(category, recipe.name, recipe.ingredients, recipe.steps, recipe.meta);
    }
  }
  if (generated.length - before !== quota) {
    throw new Error(`Não foi possível gerar ${quota} receitas para ${category}.`);
  }
}

const dessertFlavors = [
  ['Cacau e Avelã', '2 colheres (sopa) de cacau 100% e 1/3 xícara de avelãs picadas'],
  ['Limão e Coco', 'raspas de 1 limão e 1/3 xícara de coco sem açúcar'],
  ['Maçã e Canela', '1 maçã pequena em cubos e 1 colher (chá) de canela'],
  ['Maracujá', '1/3 xícara de polpa de maracujá sem açúcar'],
  ['Frutas Vermelhas', '1/2 xícara de frutas vermelhas frescas ou congeladas'],
  ['Café e Nozes', '1 colher (sopa) de café solúvel e 1/3 xícara de nozes picadas']
];

fillCombinations({
  category: categoryOrder[0],
  quota: 34,
  families: ['Mini Bolo', 'Muffin', 'Cookie', 'Brownie', 'Torta Rústica', 'Pudim Assado'],
  flavors: dessertFlavors,
  build: (family, [flavor, addition]) => ({
    name: `${family} de ${flavor} sem Açúcar Adicionado`,
    ingredients: [
      '1 xícara de farinha de amêndoas',
      '1/2 xícara de farinha de aveia',
      '2 ovos',
      '1/3 xícara de eritritol culinário',
      '1/3 xícara de iogurte natural sem açúcar',
      addition,
      common.bakingPowder,
      common.salt
    ],
    steps: [
      'Preaqueça o forno a 180°C e unte uma forma pequena ou forre-a com papel manteiga.',
      'Misture as farinhas, o eritritol, o fermento e o sal.',
      'Acrescente os ovos, o iogurte e os ingredientes do sabor; mexa até a massa ficar uniforme.',
      'Distribua na forma, sem compactar a massa.',
      'Asse por 18 a 28 minutos, conforme o formato, até o centro firmar. Espere amornar antes de servir.'
    ],
    meta: { prepMinutes: 15, cookMinutes: 25, servings: 8 }
  })
});

const breadFlavors = [
  ['Linhaça e Gergelim', '2 colheres (sopa) de linhaça e 2 colheres (sopa) de gergelim'],
  ['Ervas e Azeite', '1 colher (sopa) de ervas secas e 2 colheres (sopa) de azeite'],
  ['Cenoura e Chia', '1/2 xícara de cenoura ralada e 1 colher (sopa) de chia'],
  ['Cebola e Orégano', '1/3 xícara de cebola refogada e 1 colher (chá) de orégano'],
  ['Sementes de Abóbora', '1/3 xícara de sementes de abóbora sem sal'],
  ['Alecrim e Castanhas', '1 colher (chá) de alecrim e 1/3 xícara de castanhas picadas']
];

fillCombinations({
  category: categoryOrder[1],
  quota: 34,
  families: ['Pão de Forma', 'Pão Rústico', 'Pão de Frigideira', 'Pãezinhos', 'Focaccia', 'Pão de Hambúrguer'],
  flavors: breadFlavors,
  build: (family, [flavor, addition]) => ({
    name: `${family} de Aveia com ${flavor}`,
    ingredients: [
      '1 e 1/2 xícara de farinha de aveia',
      '1/2 xícara de farinha de amêndoas',
      '2 ovos',
      '3/4 xícara de água morna',
      addition,
      '1 colher (sopa) de psyllium',
      '1 colher (sopa) de fermento biológico seco',
      common.salt
    ],
    steps: [
      'Misture as farinhas, o psyllium, o fermento e o sal em uma tigela.',
      'Junte os ovos, a água e os ingredientes do sabor, mexendo até formar uma massa úmida.',
      'Cubra e deixe descansar por 30 minutos em local protegido.',
      'Modele no formato indicado pelo nome da receita e coloque em assadeira untada.',
      'Asse a 190°C por 25 a 35 minutos, até dourar e firmar. Espere esfriar para cortar.'
    ],
    meta: { prepMinutes: 20, cookMinutes: 30, servings: 10 }
  })
});

const arepaBases = [
  ['Couve-Flor e Queijo', '1 xícara de couve-flor cozida e espremida', '1/3 xícara de queijo minas ralado'],
  ['Abóbora e Chia', '3/4 xícara de abóbora cozida e amassada', '1 colher (sopa) de chia'],
  ['Grão-de-Bico e Ervas', '1 xícara de farinha de grão-de-bico', '1 colher (sopa) de ervas frescas'],
  ['Aveia e Linhaça', '1 xícara de farinha de aveia', '2 colheres (sopa) de linhaça moída'],
  ['Espinafre e Ricota', '1/2 xícara de espinafre refogado', '1/2 xícara de ricota amassada'],
  ['Milho e Sementes', '1 xícara de farinha de milho pré-cozida', '2 colheres (sopa) de sementes mistas']
];

fillCombinations({
  category: categoryOrder[2],
  quota: 17,
  families: ['Arepas', 'Tortilhas', 'Mini Arepas'],
  flavors: arepaBases,
  build: (family, [flavor, base, addition]) => ({
    name: `${family} de ${flavor}`,
    ingredients: [base, addition, '1 ovo', '1/3 a 1/2 xícara de água morna', common.olive, common.salt],
    steps: [
      'Misture a base, o complemento e o sal.',
      'Adicione o ovo, o azeite e a água aos poucos até obter massa modelável.',
      'Divida em porções e abra discos finos entre duas folhas de papel manteiga.',
      'Doure em frigideira antiaderente, em fogo médio, por 3 a 4 minutos de cada lado.',
      'Sirva em porção moderada com vegetais e uma fonte de proteína.'
    ],
    meta: { prepMinutes: 15, cookMinutes: 12, servings: 6 }
  })
});

const pizzaFlavors = [
  ['Abobrinha e Orégano', '1 xícara de abobrinha ralada e espremida'],
  ['Couve-Flor e Linhaça', '1 e 1/2 xícara de couve-flor triturada e espremida'],
  ['Grão-de-Bico e Páprica', '1 xícara de farinha de grão-de-bico'],
  ['Aveia e Sementes', '1 xícara de farinha de aveia e 2 colheres (sopa) de sementes'],
  ['Berinjela e Ervas', '1 xícara de berinjela assada e amassada'],
  ['Frango e Espinafre', '1 xícara de frango cozido desfiado e 1/2 xícara de espinafre']
];

fillCombinations({
  category: categoryOrder[3],
  quota: 17,
  families: ['Pizza de Massa', 'Mini Pizza', 'Empanada Assada'],
  flavors: pizzaFlavors,
  build: (family, [flavor, base]) => ({
    name: `${family} de ${flavor}`,
    ingredients: [base, '1 ovo', '1/2 xícara de farinha de amêndoas', '1 colher (sopa) de psyllium', common.olive, common.salt, '1/2 xícara de molho de tomate sem açúcar adicionado'],
    steps: [
      'Misture a base com o ovo, a farinha, o psyllium, o azeite e o sal.',
      'Abra a massa entre folhas de papel manteiga e modele conforme a receita.',
      'Pré-asse a 200°C por 10 minutos.',
      'Acrescente o molho e uma cobertura de vegetais e proteína a gosto.',
      'Volte ao forno por 10 a 15 minutos, até as bordas dourarem.'
    ],
    meta: { prepMinutes: 20, cookMinutes: 25, servings: 6 }
  })
});

const pastryFlavors = [
  ['Palmito e Ervas', '3/4 xícara de palmito picado e refogado'],
  ['Frango e Açafrão', '3/4 xícara de frango desfiado com açafrão'],
  ['Cogumelos e Tomilho', '3/4 xícara de cogumelos refogados com tomilho'],
  ['Ricota e Espinafre', '1/2 xícara de ricota e 1/2 xícara de espinafre'],
  ['Maçã e Canela', '1 maçã pequena em cubos com canela'],
  ['Abóbora e Sementes', '3/4 xícara de abóbora amassada e sementes']
];

fillCombinations({
  category: categoryOrder[4],
  quota: 17,
  families: ['Folhado Rápido', 'Croissant Integral', 'Trouxinha Folhada'],
  flavors: pastryFlavors,
  build: (family, [flavor, filling]) => ({
    name: `${family} de ${flavor}`,
    ingredients: ['6 folhas de massa filo', filling, '2 colheres (sopa) de azeite para pincelar', '1 colher (sopa) de sementes para finalizar', common.salt],
    steps: [
      'Preaqueça o forno a 200°C e prepare o recheio, mantendo-o com pouca umidade.',
      'Sobreponha as folhas de massa filo, pincelando uma camada fina de azeite entre elas.',
      'Corte, recheie e dobre no formato indicado, fechando bem as bordas.',
      'Finalize com sementes e coloque em assadeira forrada.',
      'Asse por 18 a 22 minutos, até ficar dourado e crocante.'
    ],
    meta: { prepMinutes: 25, cookMinutes: 20, servings: 6 }
  })
});

const mealProteins = [
  ['Frango', '120 g de peito de frango em cubos'],
  ['Peixe', '120 g de filé de peixe em cubos'],
  ['Ovos', '2 ovos'],
  ['Lentilha', '3/4 xícara de lentilha cozida'],
  ['Tofu', '120 g de tofu firme em cubos'],
  ['Carne Magra', '120 g de carne bovina magra em tiras'],
  ['Grão-de-Bico', '3/4 xícara de grão-de-bico cozido']
];

const mealVegetables = [
  ['Brócolis e Cenoura', '1 xícara de brócolis e 1/2 cenoura em tiras'],
  ['Abobrinha e Tomate', '1 abobrinha pequena e 1 tomate picados'],
  ['Couve-Flor e Espinafre', '1 xícara de couve-flor e 1/2 xícara de espinafre'],
  ['Berinjela e Pimentão', '1/2 berinjela e 1/2 pimentão em cubos']
];

fillCombinations({
  category: categoryOrder[5],
  quota: 28,
  families: mealProteins,
  flavors: mealVegetables,
  build: ([protein, proteinIngredient], [vegetables, vegetableIngredient]) => ({
    name: `Refeição Rápida de ${protein} com ${vegetables}`,
    ingredients: [proteinIngredient, vegetableIngredient, common.olive, '1 dente de alho picado', '1 colher (chá) de ervas ou especiarias', common.salt],
    steps: [
      'Aqueça uma frigideira grande com metade do azeite e doure a fonte de proteína.',
      'Acrescente o alho e os vegetais, começando pelos que levam mais tempo para cozinhar.',
      'Tempere e cozinhe até os vegetais ficarem macios, porém ainda firmes.',
      'Ajuste o sal e finalize com o restante do azeite.',
      'Monte o prato respeitando a porção orientada para seu plano alimentar.'
    ],
    meta: { prepMinutes: 12, cookMinutes: 18, servings: 2 }
  })
});

const baseKinds = [
  ['Molho Cremoso', '1 xícara de iogurte natural sem açúcar', 'Misture todos os ingredientes até obter um molho uniforme.'],
  ['Pasta para Lanches', '1 xícara de grão-de-bico cozido', 'Processe todos os ingredientes até formar uma pasta cremosa.'],
  ['Tempero Úmido', '1/2 xícara de ervas frescas', 'Bata rapidamente, mantendo pequenos pedaços das ervas.'],
  ['Mistura Seca', '1/2 xícara de farinha de amêndoas', 'Misture muito bem e armazene em pote seco e fechado.'],
  ['Creme para Recheio', '1 xícara de ricota amassada', 'Misture e amasse até chegar a uma textura cremosa.']
];

const baseFlavors = [
  ['Limão e Ervas', 'suco e raspas de 1/2 limão e 2 colheres (sopa) de ervas'],
  ['Páprica e Alho', '1 colher (chá) de páprica e 1 dente de alho'],
  ['Mostarda e Cúrcuma', '1 colher (sopa) de mostarda sem açúcar e 1/2 colher (chá) de cúrcuma'],
  ['Tomate e Manjericão', '1/2 xícara de tomate sem sementes e folhas de manjericão'],
  ['Gergelim e Cominho', '1 colher (sopa) de gergelim e 1/2 colher (chá) de cominho']
];

fillCombinations({
  category: categoryOrder[6],
  quota: 23,
  families: baseKinds,
  flavors: baseFlavors,
  build: ([kind, base, method], [flavor, addition]) => ({
    name: `${kind} de ${flavor}`,
    ingredients: [base, addition, common.olive, common.salt, 'água filtrada, se necessário, para ajustar a textura'],
    steps: [
      'Higienize os utensílios e separe todos os ingredientes.',
      method,
      'Ajuste a textura com pequenas quantidades de água, se necessário.',
      'Prove e ajuste os temperos sem exagerar no sal.',
      'Guarde em recipiente fechado na geladeira e consuma em até 3 dias.'
    ],
    meta: { prepMinutes: 12, cookMinutes: 0, servings: 8 }
  })
});

if (generated.length !== 170 || nextId !== 501) {
  throw new Error(`Esperadas 170 receitas complementares; geradas ${generated.length}.`);
}

function inferMeta(recipe) {
  const text = normalize(`${recipe.name} ${recipe.ingredients.join(' ')}`);
  const defaults = {
    [categoryOrder[0]]: { prepMinutes: 18, cookMinutes: 30, servings: 8 },
    [categoryOrder[1]]: { prepMinutes: 25, cookMinutes: 35, servings: 10 },
    [categoryOrder[2]]: { prepMinutes: 15, cookMinutes: 15, servings: 6 },
    [categoryOrder[3]]: { prepMinutes: 25, cookMinutes: 25, servings: 6 },
    [categoryOrder[4]]: { prepMinutes: 30, cookMinutes: 25, servings: 6 },
    [categoryOrder[5]]: { prepMinutes: 15, cookMinutes: 20, servings: 2 },
    [categoryOrder[6]]: { prepMinutes: 12, cookMinutes: 5, servings: 8 }
  };
  const meta = { ...defaults[recipe.category], ...recipe };
  const tags = [];
  if (!/trigo|espelta|centeio|cevada/.test(text)) tags.push('Sem trigo');
  if (!/leite|iogurte|queijo|ricota|manteiga|requeijao|creme de leite|laticinio/.test(text)) tags.push('Sem lactose');
  if (!/carne|frango|peixe|atum|bacalhau|camarao|presunto|linguica/.test(text)) tags.push('Vegetariana');
  if (/eritritol|xilitol|stevia|sem acucar/.test(text) && !/mel\b|acucar refinado/.test(text)) tags.push('Sem açúcar adicionado');
  if ((meta.prepMinutes + meta.cookMinutes) <= 30) tags.push('Até 30 min');
  return {
    ...recipe,
    slug: `${recipe.id}-${slugify(recipe.name)}`,
    prepMinutes: meta.prepMinutes,
    cookMinutes: meta.cookMinutes,
    servings: meta.servings,
    tags
  };
}

const recipes = [...originalRecipes, ...generated].map(inferMeta);
const totals = Object.fromEntries(categoryOrder.map((category) => [
  category,
  recipes.filter((recipe) => recipe.category === category).length
]));

const payload = `window.RECIPE_META = ${JSON.stringify({ total: recipes.length, categories: categoryOrder, totals }, null, 2)};\n\nwindow.RECIPES = ${JSON.stringify(recipes, null, 2)};\n`;
fs.writeFileSync(outputFile, payload);

console.log(JSON.stringify({ total: recipes.length, original: originalRecipes.length, generated: generated.length, totals }, null, 2));
