import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Food } from '../food/schemas/food.schema';
import { foodSeeds } from '../food/seeds/food.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const foodModel = app.get<Model<Food>>(getModelToken(Food.name));

    console.log(`🌱 Starting food seed — ${foodSeeds.length} items to process...`);

    let upserted = 0;
    let existing = 0;

    for (const item of foodSeeds) {
      const result = await foodModel.updateOne(
        { name: item.name },
        item,
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        upserted++;
        console.log(`  ✅ Inserted: ${item.name}`);
      } else {
        existing++;
        console.log(`  ⏭️  Already exists: ${item.name}`);
      }
    }

    console.log(`\n✔ Seed complete — ${upserted} inserted, ${existing} already existing.`);
  } finally {
    await app.close();
  }
}

bootstrap();
