import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import axios from 'axios';
import * as Buffer from 'buffer';

config();

const HF_API_KEY = process.env['HUGGING_FACE_API_KEY'] || '';
const VI_MODEL = 'google/vit-base-patch16-224';
const HF_FEATURE_EXTRACTION_URL = 'https://router.huggingface.co/feature-extraction';

async function getImageEmbedding(imageUrl: string): Promise<number[]> {
  try {
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
    const base64Image = Buffer.Buffer.from(imageResponse.data, 'binary').toString('base64');

    const response = await axios.post(
      `${HF_FEATURE_EXTRACTION_URL}/${VI_MODEL}`,
      { inputs: base64Image },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0])) {
        return data[0];
      }
      return data;
    }

    throw new Error('Invalid embedding response');
  } catch (error: any) {
    console.error('Error getting embedding for image:', error.response?.data || error.message);
    return [];
  }
}

async function generateEmbeddings() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    database: process.env['DB_NAME'] || 'fashion_store',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  try {
    const products = await dataSource.query(`
      SELECT id, name, images FROM products
      WHERE "isActive" = true AND images IS NOT NULL AND images != ''
    `);

    console.log(`Found ${products.length} products with images`);

    let updatedCount = 0;

    for (const product of products) {
      try {
        const imagesStr = product.images;
        if (!imagesStr) continue;

        const images = imagesStr.split(',').map((s: string) => s.trim());
        if (images.length === 0) continue;

        const firstImage = images[0];

        if (!firstImage || !firstImage.startsWith('http')) {
          console.log(`Skipping product ${product.id} - image is not a URL: ${firstImage}`);
          continue;
        }

        console.log(`Processing product: ${product.name}`);
        const embedding = await getImageEmbedding(firstImage);

        if (embedding.length > 0) {
          const embeddingStr = embedding.join(',');

          await dataSource.query(`
            UPDATE products
            SET embedding = $1
            WHERE id = $2
          `, [embeddingStr, product.id]);

          updatedCount++;
          console.log(`Updated embedding for product: ${product.name}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`Error processing product ${product.id}:`, error.message);
      }
    }

    console.log(`\nCompleted! Updated ${updatedCount} products with embeddings`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

generateEmbeddings().catch(console.error);
