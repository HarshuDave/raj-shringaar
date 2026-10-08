import fs from "fs";
import path from "path";
import {
  Category,
  Collection,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
} from "@/lib/types";
import {
  initialCategories,
  initialCollections,
  initialProducts,
} from "./catalog";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/lib/config/shipping";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Helper to enforce strict latency limits on serverless database queries
export async function withTimeout<T>(promise: Promise<T>, ms = 3500): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const SLUG_ALIASES: Record<string, string> = {
  "premium-poshak": "kamal-poshak",
  "designer-mukut": "mor-pankh-zari-mukut",
  "krishna-mala": "navratna-motimala-haar",
  "laddu-gopal-jhula": "rajwadi-meenakari-jhula",
  "shringaar-set": "sampoorna-shringaar-deluxe-set",
};

export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  shringar: "shringaar",
};

type StoreData = {
  categories: Category[];
  collections: Collection[];
  products: Product[];
  orders: Order[];
};

function ensureStoreFile(): StoreData {
  // In serverless environments (Vercel / AWS Lambda), the filesystem is read-only
  if (process.env.VERCEL) {
    return {
      categories: initialCategories,
      collections: initialCollections,
      products: initialProducts,
      orders: [],
    };
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      const initialData: StoreData = {
        categories: initialCategories,
        collections: initialCollections,
        products: initialProducts,
        orders: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }

    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading store.json, falling back to in-memory catalog:", error);
    return {
      categories: initialCategories,
      collections: initialCollections,
      products: initialProducts,
      orders: [],
    };
  }
}

function writeStoreFile(data: StoreData) {
  if (process.env.VERCEL) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write store.json:", error);
  }
}

const hasDb = Boolean(process.env.DATABASE_URL);

// ----------------- Categories -----------------

export async function getCategories(): Promise<Category[]> {
  if (hasDb) {
    try {
      const cats = await withTimeout(
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        }),
        3000
      );
      return cats;
    } catch (e) {
      console.warn("DB getCategories failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.categories.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getAllCategories(): Promise<Category[]> {
  if (hasDb) {
    try {
      const cats = await withTimeout(
        prisma.category.findMany({
          orderBy: { displayOrder: "asc" },
        }),
        3000
      );
      return cats;
    } catch (e) {
      console.warn("DB getAllCategories failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.categories.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const canonicalSlug = CATEGORY_SLUG_ALIASES[normalizedSlug] || normalizedSlug;

  if (hasDb) {
    try {
      const cat = await withTimeout(
        prisma.category.findUnique({ where: { slug: canonicalSlug } }),
        3000
      );
      if (cat) return cat;
    } catch (e) {
      console.warn("DB getCategoryBySlug failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.categories.find((c) => c.slug === canonicalSlug) || null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (hasDb) {
    try {
      const cat = await withTimeout(
        prisma.category.findUnique({ where: { id } }),
        3000
      );
      if (cat) return cat;
    } catch (e) {
      console.warn("DB getCategoryById failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.categories.find((c) => c.id === id) || null;
}

export async function saveCategory(category: Category): Promise<Category> {
  if (!hasDb) {
    throw new Error("Live database connection required to save categories.");
  }

  const catId = category.id || `cat-${category.slug || Date.now()}`;
  const prepared: Category = {
    ...category,
    id: catId,
  };

  await prisma.category.upsert({
    where: { slug: prepared.slug },
    update: {
      name: prepared.name,
      image: prepared.image,
      displayOrder: prepared.displayOrder,
      isActive: prepared.isActive,
    },
    create: {
      id: prepared.id,
      name: prepared.name,
      slug: prepared.slug,
      image: prepared.image,
      displayOrder: prepared.displayOrder,
      isActive: prepared.isActive,
    },
  });

  return prepared;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  if (!hasDb) {
    throw new Error("Live database connection required to delete categories.");
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      success: false,
      error: `Cannot delete: ${productCount} product(s) are assigned to this category. Please reassign or delete the products first.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  return { success: true };
}

export async function toggleCategoryStatus(id: string, isActive: boolean): Promise<boolean> {
  if (!hasDb) {
    throw new Error("Live database connection required to update category status.");
  }

  await prisma.category.update({
    where: { id },
    data: { isActive },
  });

  return true;
}

export async function getCategoryProductCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (hasDb) {
    try {
      const groups = await prisma.product.groupBy({
        by: ["categoryId"],
        _count: { id: true },
      });
      for (const g of groups) {
        counts[g.categoryId] = g._count.id;
      }
      return counts;
    } catch (e) {
      console.warn("DB getCategoryProductCounts failed, using local store:", e);
    }
  }
  const store = ensureStoreFile();
  for (const p of store.products) {
    counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
  }
  return counts;
}

// ----------------- Collections -----------------

export async function getCollections(): Promise<Collection[]> {
  if (hasDb) {
    try {
      const cols = await withTimeout(
        prisma.collection.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        }),
        3000
      );
      return cols.map((c) => ({
        ...c,
        image: c.image ?? undefined,
        description: c.description ?? undefined,
      }));
    } catch (e) {
      console.warn("DB getCollections failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.collections.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getAllCollections(): Promise<Collection[]> {
  if (hasDb) {
    try {
      const cols = await withTimeout(
        prisma.collection.findMany({
          orderBy: { displayOrder: "asc" },
        }),
        3000
      );
      return cols.map((c) => ({
        ...c,
        image: c.image ?? undefined,
        description: c.description ?? undefined,
      }));
    } catch (e) {
      console.warn("DB getAllCollections failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.collections.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  if (hasDb) {
    try {
      const col = await withTimeout(
        prisma.collection.findUnique({ where: { slug } }),
        3000
      );
      if (col) {
        return {
          ...col,
          image: col.image ?? undefined,
          description: col.description ?? undefined,
        };
      }
    } catch (e) {
      console.warn("DB getCollectionBySlug failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.collections.find((c) => c.slug === slug) || null;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  if (hasDb) {
    try {
      const col = await prisma.collection.findUnique({ where: { id } });
      if (col) {
        return {
          ...col,
          image: col.image ?? undefined,
          description: col.description ?? undefined,
        };
      }
    } catch (e) {
      console.warn("DB getCollectionById failed, using local store:", e);
    }
  }
  const store = ensureStoreFile();
  return store.collections.find((c) => c.id === id) || null;
}

export async function saveCollection(collection: Collection): Promise<Collection> {
  if (!hasDb) {
    throw new Error("Live database connection required to save collections.");
  }

  const colId = collection.id || `col-${collection.slug || Date.now()}`;
  const prepared: Collection = {
    ...collection,
    id: colId,
  };

  await prisma.collection.upsert({
    where: { slug: prepared.slug },
    update: {
      name: prepared.name,
      image: prepared.image ?? null,
      description: prepared.description ?? null,
      displayOrder: prepared.displayOrder,
      isActive: prepared.isActive,
    },
    create: {
      id: prepared.id,
      name: prepared.name,
      slug: prepared.slug,
      image: prepared.image ?? null,
      description: prepared.description ?? null,
      displayOrder: prepared.displayOrder,
      isActive: prepared.isActive,
    },
  });

  return prepared;
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  if (!hasDb) {
    throw new Error("Live database connection required to delete collections.");
  }

  // Prisma schema has onDelete: Cascade on ProductCollection for collectionId
  await prisma.collection.delete({ where: { id } });
  return { success: true };
}

export async function toggleCollectionStatus(id: string, isActive: boolean): Promise<boolean> {
  if (!hasDb) {
    throw new Error("Live database connection required to update collection status.");
  }

  await prisma.collection.update({
    where: { id },
    data: { isActive },
  });

  return true;
}

export async function getCollectionProductCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (hasDb) {
    try {
      const groups = await prisma.productCollection.groupBy({
        by: ["collectionId"],
        _count: { productId: true },
      });
      for (const g of groups) {
        counts[g.collectionId] = g._count.productId;
      }
      return counts;
    } catch (e) {
      console.warn("DB getCollectionProductCounts failed:", e);
    }
  }
  return counts;
}

// ----------------- Products -----------------

export type ProductFilterOptions = {
  category?: string;
  collection?: string;
  search?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
};

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  if (hasDb) {
    try {
      const rawCatSlug = options.category?.toLowerCase().trim();
      const catSlug = rawCatSlug ? (CATEGORY_SLUG_ALIASES[rawCatSlug] || rawCatSlug) : undefined;
      const colSlug = options.collection?.toLowerCase().trim();

      const dbProducts = await withTimeout(
        prisma.product.findMany({
          where: {
            isActive: true,
            ...(catSlug
              ? {
                  OR: [
                    { category: { slug: { equals: catSlug, mode: "insensitive" } } },
                    { category: { name: { equals: options.category, mode: "insensitive" } } },
                    { categoryId: { equals: catSlug, mode: "insensitive" } },
                  ],
                }
              : {}),
            ...(colSlug
              ? {
                  collections: {
                    some: {
                      collection: {
                        slug: { equals: colSlug, mode: "insensitive" },
                      },
                    },
                  },
                }
              : {}),
            ...(options.search
              ? {
                  OR: [
                    { name: { contains: options.search, mode: "insensitive" } },
                    { description: { contains: options.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          include: {
            category: true,
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            collections: { include: { collection: true } },
          },
          orderBy:
            options.sort === "newest"
              ? { createdAt: "desc" }
              : { createdAt: "desc" },
        }),
        3500
      );

      let mapped: Product[] = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        description: p.description || "",
        material: p.material || undefined,
        featured: p.featured,
        isActive: p.isActive,
        badge: p.badge || undefined,
        rating: 4.9,
        reviewsCount: 50,
        images: p.images.map((img) => img.imageUrl),
        variants: p.variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          size: v.size || undefined,
          colour: v.colour || undefined,
          price: v.price,
          discountPrice: v.discountPrice || undefined,
          stock: v.stock,
        })),
        collectionSlugs: p.collections.map((c) => c.collection.slug),
        createdAt: p.createdAt.toISOString(),
      }));

      if (options.size) {
        mapped = mapped.filter((p) =>
          p.variants.some((v) => v.size === options.size && v.stock > 0)
        );
      }

      if (options.sort === "price-asc") {
        mapped.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
      } else if (options.sort === "price-desc") {
        mapped.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
      }

      return mapped;
    } catch (e) {
      console.warn("DB getProducts failed or timed out, using local fallback:", e);
    }
  }

  // Fallback to local store
  const store = ensureStoreFile();
  let list = store.products.filter((p) => p.isActive);

  if (options.category) {
    const rawCat = options.category.toLowerCase().trim();
    const resolvedCat = CATEGORY_SLUG_ALIASES[rawCat] || rawCat;
    list = list.filter(
      (p) =>
        p.categoryName.toLowerCase() === rawCat ||
        p.categoryName.toLowerCase() === resolvedCat ||
        p.categoryId.toLowerCase().includes(rawCat) ||
        p.categoryId.toLowerCase().includes(resolvedCat)
    );
  }

  if (options.collection) {
    list = list.filter((p) =>
      p.collectionSlugs.some(
        (slug) => slug.toLowerCase() === options.collection?.toLowerCase()
      )
    );
  }

  if (options.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }

  if (options.size) {
    list = list.filter((p) =>
      p.variants.some((v) => v.size === options.size && v.stock > 0)
    );
  }

  if (options.sort === "price-asc") {
    list.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
  } else if (options.sort === "price-desc") {
    list.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
  } else if (options.sort === "newest") {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (hasDb) {
    try {
      const dbProducts = await withTimeout(
        prisma.product.findMany({
          include: {
            category: true,
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            collections: { include: { collection: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        3000
      );
      if (dbProducts.length > 0) {
        return dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          categoryName: p.category.name,
          description: p.description || "",
          material: p.material || undefined,
          featured: p.featured,
          isActive: p.isActive,
          badge: p.badge || undefined,
          rating: 4.9,
          reviewsCount: 50,
          images: p.images.map((img) => img.imageUrl),
          variants: p.variants.map((v) => ({
            id: v.id,
            productId: v.productId,
            size: v.size || undefined,
            colour: v.colour || undefined,
            price: v.price,
            discountPrice: v.discountPrice || undefined,
            stock: v.stock,
          })),
          collectionSlugs: p.collections.map((c) => c.collection.slug),
          createdAt: p.createdAt.toISOString(),
        }));
      }
    } catch (e) {
      console.warn("DB getAllProductsAdmin failed, using local store:", e);
    }
  }
  const store = ensureStoreFile();
  return store.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const canonicalSlug = SLUG_ALIASES[normalizedSlug] || normalizedSlug;

  if (hasDb) {
    try {
      const p = await withTimeout(
        prisma.product.findFirst({
          where: {
            OR: [
              { slug: normalizedSlug },
              { slug: canonicalSlug },
            ],
          },
          include: {
            category: true,
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            collections: { include: { collection: true } },
          },
        }),
        3000
      );
      if (p) {
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          categoryName: p.category.name,
          description: p.description || "",
          material: p.material || undefined,
          featured: p.featured,
          isActive: p.isActive,
          badge: p.badge || undefined,
          rating: 4.9,
          reviewsCount: 50,
          images: p.images.map((img) => img.imageUrl),
          variants: p.variants.map((v) => ({
            id: v.id,
            productId: v.productId,
            size: v.size || undefined,
            colour: v.colour || undefined,
            price: v.price,
            discountPrice: v.discountPrice || undefined,
            stock: v.stock,
          })),
          collectionSlugs: p.collections.map((c) => c.collection.slug),
          createdAt: p.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB getProductBySlug failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return (
    store.products.find((p) => p.slug === normalizedSlug) ||
    store.products.find((p) => p.slug === canonicalSlug) ||
    null
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  if (hasDb) {
    try {
      const p = await withTimeout(
        prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            collections: { include: { collection: true } },
          },
        }),
        3000
      );
      if (p) {
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          categoryName: p.category.name,
          description: p.description || "",
          material: p.material || undefined,
          featured: p.featured,
          isActive: p.isActive,
          badge: p.badge || undefined,
          rating: 4.9,
          reviewsCount: 50,
          images: p.images.map((img) => img.imageUrl),
          variants: p.variants.map((v) => ({
            id: v.id,
            productId: v.productId,
            size: v.size || undefined,
            colour: v.colour || undefined,
            price: v.price,
            discountPrice: v.discountPrice || undefined,
            stock: v.stock,
          })),
          collectionSlugs: p.collections.map((c) => c.collection.slug),
          createdAt: p.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB getProductById failed, using local store:", e);
    }
  }
  const store = ensureStoreFile();
  return store.products.find((p) => p.id === id) || null;
}

export async function saveProduct(product: Product): Promise<Product> {
  if (!hasDb) {
    throw new Error("Live database connection required to save products.");
  }

  // Atomically upsert product and its variants
  await prisma.$transaction(async (tx) => {
    await tx.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description,
        material: product.material,
        featured: product.featured,
        isActive: product.isActive,
        badge: product.badge,
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description,
        material: product.material,
        featured: product.featured,
        isActive: product.isActive,
        badge: product.badge,
      },
    });

    // Update variants
    for (const v of product.variants) {
      await tx.productVariant.upsert({
        where: { id: v.id },
        update: {
          size: v.size,
          colour: v.colour,
          price: v.price,
          discountPrice: v.discountPrice,
          stock: v.stock,
        },
        create: {
          id: v.id,
          productId: product.id,
          size: v.size,
          colour: v.colour,
          price: v.price,
          discountPrice: v.discountPrice,
          stock: v.stock,
        },
      });
    }

    // Upsert primary image if present
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images[0];
      const existingImg = await tx.productImage.findFirst({
        where: { productId: product.id },
      });
      if (existingImg) {
        await tx.productImage.update({
          where: { id: existingImg.id },
          data: { imageUrl: primaryImage },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: product.id,
            imageUrl: primaryImage,
            displayOrder: 0,
          },
        });
      }
    }
  });

  return product;
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  if (!hasDb) {
    throw new Error("Live database connection required to delete products.");
  }

  // Check if any order references this product to prevent corrupting order history
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return {
      success: true,
      error: `Product has ${orderCount} existing order(s). It has been deactivated to preserve order history.`,
    };
  }

  // If no orders exist, delete variants and product safely
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productCollection.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return { success: true };
}

// ----------------- Orders & Inventory -----------------

export async function getOrders(): Promise<Order[]> {
  if (hasDb) {
    try {
      const dbOrders = await withTimeout(
        prisma.order.findMany({
          include: { items: true },
          orderBy: { createdAt: "desc" },
        }),
        3000
      );
      if (dbOrders.length > 0) {
        return dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress as any,
          items: o.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            size: i.size || undefined,
            colour: i.colour || undefined,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus as OrderStatus,
          paymentStatus: o.paymentStatus as any,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
        }));
      }
    } catch (e) {
      console.warn("DB getOrders failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (hasDb) {
    try {
      const o = await withTimeout(
        prisma.order.findFirst({
          where: {
            OR: [{ id }, { orderNumber: id }],
          },
          include: { items: true },
        }),
        3000
      );
      if (o) {
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress as any,
          items: o.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            size: i.size || undefined,
            colour: i.colour || undefined,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus as OrderStatus,
          paymentStatus: o.paymentStatus as any,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB getOrderById failed, using local store:", e);
    }
  }
  const store = ensureStoreFile();
  return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
}

export async function createOrder(
  orderData: Omit<Order, "id" | "orderNumber" | "createdAt">
): Promise<Order> {
  // STRICT TRANSACTIONAL BOUNDARY:
  // Fallback data is strictly restricted to read-only storefront browsing.
  // Checkout, payment amount calculation, stock validation, order creation,
  // and inventory updates REQUIRE an active, verified PostgreSQL connection.
  if (!hasDb) {
    throw new Error(
      "Live database connection unavailable. Order processing and payment validation require an active database."
    );
  }

  const orderId = `ord_${Date.now()}`;
  const orderNumber = `RS-${Math.floor(100000 + Math.random() * 900000)}`;

  // Execute inside an ACID transaction to guarantee stock deduction, verified prices, and order creation occur atomically
  return await prisma.$transaction(async (tx) => {
    let verifiedSubtotal = 0;
    const verifiedItems: Array<{
      productId: string;
      variantId: string;
      productName: string;
      size?: string;
      colour?: string;
      price: number;
      quantity: number;
      image?: string;
    }> = [];

    // 1. Strict Stock Validation & Price Verification against live PostgreSQL
    for (const item of orderData.items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error("Item quantity must be greater than 0.");
      }

      const dbVariant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!dbVariant) {
        throw new Error(
          `Product variant "${item.productName}" (ID: ${item.variantId}) was not found in the live database.`
        );
      }

      if (dbVariant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${dbVariant.product?.name || item.productName}". Available: ${dbVariant.stock}, Requested: ${item.quantity}.`
        );
      }

      // Authoritative price directly from PostgreSQL row
      const authoritativePrice = dbVariant.price;
      verifiedSubtotal += authoritativePrice * item.quantity;

      // Atomic stock decrement
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });

      verifiedItems.push({
        productId: dbVariant.productId,
        variantId: dbVariant.id,
        productName: dbVariant.product?.name || item.productName,
        size: dbVariant.size || item.size,
        colour: dbVariant.colour || item.colour,
        price: authoritativePrice,
        quantity: item.quantity,
        image: item.image || "",
      });
    }

    // 2. Authoritative Shipping Fee Calculation based on verified subtotal
    const verifiedShippingFee = calculateShippingFee(verifiedSubtotal);
    const verifiedTotalAmount = verifiedSubtotal + verifiedShippingFee;

    // 3. Insert confirmed Order into PostgreSQL
    const dbOrder = await tx.order.create({
      data: {
        id: orderId,
        orderNumber,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        totalAmount: verifiedTotalAmount,
        orderStatus: "Confirmed",
        paymentStatus: "Paid",
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress as any,
        items: {
          create: verifiedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            size: i.size,
            colour: i.colour,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        },
      },
      include: { items: true },
    });

    return {
      id: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
      customerName: dbOrder.customerName,
      customerEmail: dbOrder.customerEmail,
      customerPhone: dbOrder.customerPhone,
      shippingAddress: dbOrder.shippingAddress as any,
      items: dbOrder.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        size: i.size || undefined,
        colour: i.colour || undefined,
        price: i.price,
        quantity: i.quantity,
        image: i.image || "",
      })),
      totalAmount: dbOrder.totalAmount,
      orderStatus: dbOrder.orderStatus as OrderStatus,
      paymentStatus: dbOrder.paymentStatus as any,
      paymentMethod: dbOrder.paymentMethod,
      createdAt: dbOrder.createdAt.toISOString(),
    };
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  if (!hasDb) {
    throw new Error("Live database connection required for order status updates.");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status as any },
    include: { items: true },
  });

  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    customerName: updated.customerName,
    customerEmail: updated.customerEmail,
    customerPhone: updated.customerPhone,
    shippingAddress: updated.shippingAddress as any,
    items: updated.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.productName,
      size: i.size || undefined,
      colour: i.colour || undefined,
      price: i.price,
      quantity: i.quantity,
      image: i.image || "",
    })),
    totalAmount: updated.totalAmount,
    orderStatus: updated.orderStatus as OrderStatus,
    paymentStatus: updated.paymentStatus as any,
    paymentMethod: updated.paymentMethod,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function updateStock(variantId: string, newStock: number): Promise<boolean> {
  if (!hasDb) {
    throw new Error("Live database connection required for stock updates.");
  }
  if (newStock < 0) {
    throw new Error("Stock cannot be negative.");
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });

  return true;
}

