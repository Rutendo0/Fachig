import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      throw new Error("DATABASE_URL not configured or is placeholder");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5, // Reduced for serverless environment
      idleTimeoutMillis: 10000, // Shorter idle timeout for serverless
      connectionTimeoutMillis: 5000, // Increased timeout for slower connections
      acquireTimeoutMillis: 5000, // Max time to wait for connection from pool
      statement_timeout: 10000, // Max query execution time
    });

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Pool error:", err);
      // Reset pool on error
      pool = null;
    });
  }
  return pool;
}

export async function getDbClient() {
  const pool = getDbPool();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      attempts++;
      console.error(`Database connection attempt ${attempts} failed:`, error);

      if (attempts >= maxAttempts) {
        throw new Error(`Failed to connect to database after ${maxAttempts} attempts: ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }

  throw new Error("Database connection failed");
}

export async function initializeDatabase() {
  let client;
  try {
    client = await getDbClient();

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'blog_posts'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("Creating blog_posts table...");

      // Create table
      await client.query(`
        CREATE TABLE blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          excerpt VARCHAR(500) NOT NULL,
          author VARCHAR(100) NOT NULL,
          published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          tags TEXT[],
          featured BOOLEAN DEFAULT FALSE,
          reading_time INTEGER DEFAULT 1,
          featured_image TEXT,
          image_alt VARCHAR(255)
        );
      `);

      // Create indexes
      await client.query(
        `CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);`,
      );
      await client.query(
        `CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);`,
      );

      // Insert sample FACHIG content
      await client.query(`
        INSERT INTO blog_posts (
          title, content, excerpt, author, tags, featured, reading_time,
          featured_image, image_alt
        ) VALUES (
          'Welcome to FACHIG: Cultivating Sustainable Futures',
          '# Welcome to FACHIG: Cultivating Sustainable Futures

Welcome to The Farmers Association of Community Self-Help Investment Groups (FACHIG) blog! We are a values-driven organization dedicated to creating a sustainable, equitable future through community empowerment and environmental stewardship.

## Our Mission

FACHIG focuses on four key pillars that guide our work:

- **Entrepreneurial Agriculture**: Supporting farmers in developing sustainable, profitable farming enterprises
- **Agroecology**: Promoting farming practices that work in harmony with natural ecosystems
- **Biodiversity Conservation**: Protecting and restoring the rich variety of life in our agricultural landscapes
- **Ecological Restoration**: Healing damaged ecosystems and returning them to health

## Community-Driven Change

We believe that lasting change comes from within communities. Our approach empowers local farmers and community groups to:

1. **Build Self-Reliance**: Develop skills and resources for long-term sustainability
2. **Share Knowledge**: Learn from each other''s successes and challenges
3. **Restore Ecosystems**: Work together to heal the land that sustains us
4. **Create Prosperity**: Build economic opportunities that benefit everyone

## Join Our Movement

Together, we''re restoring harmony between humanity and the environment. Every story shared here represents a step toward a more sustainable, equitable world.

Welcome to the FACHIG community! 🌱',
          'Welcome to FACHIG! Discover our mission of sustainable agriculture, community empowerment, and environmental restoration through entrepreneurial farming and agroecology.',
          'FACHIG Team',
          ARRAY['welcome', 'sustainability', 'agroecology', 'community'],
          true,
          3,
          'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&h=400&fit=crop&crop=center',
          'Diverse group of farmers working together in sustainable agricultural fields'
        );
      `);

      await client.query(`
        INSERT INTO blog_posts (
          title, content, excerpt, author, tags, featured, reading_time,
          featured_image, image_alt
        ) VALUES (
          'Building Biodiversity: Companion Planting for Resilient Farms',
          '# Building Biodiversity: Companion Planting for Resilient Farms

Biodiversity is the foundation of healthy, resilient agricultural systems. Through companion planting and agroecological practices, farmers can create thriving ecosystems that support both productivity and environmental health.

## What is Companion Planting?

Companion planting involves growing different crops together to create beneficial relationships. This traditional practice enhances:

- **Soil Health**: Different root systems improve soil structure
- **Pest Management**: Natural pest deterrents reduce need for chemicals
- **Nutrient Cycling**: Plants share and exchange nutrients
- **Water Conservation**: Strategic planting reduces water needs

## Successful Companion Combinations

### The Three Sisters (Corn, Beans, Squash)
- **Corn** provides support for beans to climb
- **Beans** fix nitrogen in the soil for corn and squash
- **Squash** leaves shade the soil, retaining moisture and preventing weeds

### Tomatoes and Basil
- **Basil** improves tomato flavor and repels harmful insects
- **Tomatoes** provide shade for basil during hot weather

### Marigolds and Vegetables
- **Marigolds** deter nematodes and other soil pests
- Attract beneficial insects that pollinate vegetables

## Community Impact

When farmers in our network adopt companion planting:

1. **Reduced Input Costs**: Less need for fertilizers and pesticides
2. **Increased Yields**: Healthier plants produce more food
3. **Environmental Benefits**: Improved soil and water quality
4. **Knowledge Sharing**: Farmers teach each other successful techniques

## Getting Started

Start small with one companion planting combination. Observe the results and gradually expand. Remember, every farm is unique – what works for one may need adaptation for another.

Together, we''re proving that biodiversity and productivity can go hand in hand! 🌿',
          'Discover how companion planting builds biodiversity, improves soil health, and creates resilient farms. Learn proven techniques from FACHIG''s network of sustainable farmers.',
          'Maria Santos',
          ARRAY['biodiversity', 'companion-planting', 'agroecology', 'farming-tips'],
          false,
          4,
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop&crop=center',
          'Diverse vegetable garden showing companion planting with various crops growing together'
        );
      `);

      console.log("Database initialized with FACHIG content!");
    }
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
}

// Graceful shutdown function to close the pool
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
