import { foodSeeds } from './food.seed';
import { FOOD_RESTRICTIONS } from '../schemas/food.schema';

const VALID_TAGS = new Set(FOOD_RESTRICTIONS);

describe('foodSeeds', () => {
  // Req 1.1
  it('should contain exactly 50 items', () => {
    expect(foodSeeds).toHaveLength(50);
  });

  // Req 7.2
  it('every item should have all required numeric fields', () => {
    foodSeeds.forEach((item) => {
      expect(typeof item.caloriesPer100g).toBe('number');
      expect(typeof item.protein).toBe('number');
      expect(typeof item.carbs).toBe('number');
      expect(typeof item.fat).toBe('number');
    });
  });

  // Req 2.1, 7.1
  it('every item should have a non-empty foodRestrictions array with only valid enum values', () => {
    foodSeeds.forEach((item) => {
      expect(Array.isArray(item.foodRestrictions)).toBe(true);
      expect(item.foodRestrictions.length).toBeGreaterThan(0);
      item.foodRestrictions.forEach((tag) => {
        expect(VALID_TAGS.has(tag)).toBe(true);
      });
    });
  });

  // Req 4.3
  it('no item should have duplicate tags', () => {
    foodSeeds.forEach((item) => {
      const unique = new Set(item.foodRestrictions);
      expect(unique.size).toBe(item.foodRestrictions.length);
    });
  });

  // Req 3.6
  it('every Vegano item should also carry Vegetariano', () => {
    foodSeeds
      .filter((item) => item.foodRestrictions.includes('Vegano'))
      .forEach((item) => {
        expect(item.foodRestrictions).toContain('Vegetariano');
      });
  });

  // Req 3.5 — "Sem restrições" items must carry all five tags
  it('"Sem restrições" items should carry all five tags', () => {
    foodSeeds
      .filter((item) => item.foodRestrictions.includes('Sem restrições'))
      .forEach((item) => {
        FOOD_RESTRICTIONS.forEach((tag) => {
          expect(item.foodRestrictions).toContain(tag);
        });
      });
  });

  // Req 5.1–5.10 — exact tags for the 10 original items
  describe('original 10 items have exact tags (Requirements 5.1–5.10)', () => {
    const cases: [string, string[]][] = [
      ['Frango Grelhado', ['Celíaco', 'Colesterol alto']],
      ['Arroz Branco Cozido', ['Vegano', 'Vegetariano', 'Celíaco', 'Sem restrições']],
      ['Banana', ['Vegano', 'Vegetariano', 'Celíaco', 'Sem restrições']],
      ['Ovo (inteiro cozido)', ['Vegetariano', 'Celíaco']],
      ['Leite Integral', ['Vegetariano']],
      ['Pão Integral', ['Vegetariano']],
      ['Abóbora Cozida', ['Vegano', 'Vegetariano', 'Celíaco', 'Colesterol alto', 'Sem restrições']],
      ['Salmão Grelhado', ['Celíaco', 'Colesterol alto']],
      ['Maçã', ['Vegano', 'Vegetariano', 'Celíaco', 'Sem restrições']],
      ['Batata Doce Cozida', ['Vegano', 'Vegetariano', 'Celíaco', 'Colesterol alto', 'Sem restrições']],
    ];

    cases.forEach(([name, expectedTags]) => {
      it(`${name} should have exactly ${JSON.stringify(expectedTags)}`, () => {
        const item = foodSeeds.find((f) => f.name === name);
        expect(item).toBeDefined();
        expect(item!.foodRestrictions.slice().sort()).toEqual(expectedTags.slice().sort());
      });
    });
  });
});
