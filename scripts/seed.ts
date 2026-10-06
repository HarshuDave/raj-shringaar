import { PrismaClient } from "@prisma/client";
import { initialCategories, initialCollections, initialProducts } from "../lib/data/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Starting Raj Shringaar Database Seed...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
      },
    });
  }

  // 2. Seed Collections
  console.log("Seeding collections...");
  for (const col of initialCollections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {
        name: col.name,
        image: col.image,
        description: col.description,
        displayOrder: col.displayOrder,
        isActive: col.isActive,
      },
      create: {
        id: col.id,
        name: col.name,
        slug: col.slug,
        image: col.image,
        description: col.description,
        displayOrder: col.displayOrder,
        isActive: col.isActive,
      },
    });
  }

  // 3. Seed Products & Variants
  console.log("Seeding products & variants...");
  for (const prod of initialProducts) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        categoryId: prod.categoryId,
        description: prod.description,
        material: prod.material,
        featured: prod.featured,
        isActive: prod.isActive,
        badge: prod.badge,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        categoryId: prod.categoryId,
        description: prod.description,
        material: prod.material,
        featured: prod.featured,
        isActive: prod.isActive,
        badge: prod.badge,
      },
    });

    // Seed Images
    for (let i = 0; i < prod.images.length; i++) {
      const img = prod.images[i];
      if (img) {
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            imageUrl: img,
            displayOrder: i,
          },
        });
      }
    }

    // Seed Variants
    for (const variant of prod.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {
          size: variant.size,
          colour: variant.colour,
          price: variant.price,
          discountPrice: variant.discountPrice,
          stock: variant.stock,
        },
        create: {
          id: variant.id,
          productId: createdProduct.id,
          size: variant.size,
          colour: variant.colour,
          price: variant.price,
          discountPrice: variant.discountPrice,
          stock: variant.stock,
        },
      });
    }

    // Connect Collections
    for (const colSlug of prod.collectionSlugs) {
      const col = initialCollections.find((c) => c.slug === colSlug);
      if (col) {
        await prisma.productCollection.upsert({
          where: {
            productId_collectionId: {
              productId: createdProduct.id,
              collectionId: col.id,
            },
          },
          update: {},
          create: {
            productId: createdProduct.id,
            collectionId: col.id,
          },
        });
      }
    }
  }

  console.log("✅ Seed completed successfully! All categories, collections, and products are populated.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
