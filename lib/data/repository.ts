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
  if (hasDb) {
    try {
      const cat = await withTimeout(
        prisma.category.findUnique({ where: { slug } }),
        3000
      );
      if (cat) return cat;
    } catch (e) {
      console.warn("DB getCategoryBySlug failed or timed out, using local fallback:", e);
    }
  }
  const store = ensureStoreFile();
  return store.categories.find((c) => c.slug === slug) || null;
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
  const catId = category.id || `cat-${category.slug || Date.now()}`;
  const prepared: Category = {
    ...category,
    id: catId,
  };

  if (hasDb) {
    try {
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
    } catch (e) {
      console.warn("DB saveCategory failed:", e);
    }
  }
  const store = ensureStoreFile();
  const existingIdx = store.categories.findIndex((c) => c.id === prepared.id || c.slug === prepared.slug);
  if (existingIdx >= 0) {
    store.categories[existingIdx] = prepared;
  } else {
    store.categories.push(prepared);
  }
  writeStoreFile(store);
  return prepared;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  if (hasDb) {
    try {
      const productCount = await prisma.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        return {
          success: false,
          error: `Cannot delete: ${productCount} product(s) are assigned to this category. Please reassign or delete the products first.`,
        };
      }
      await prisma.category.delete({ where: { id } });
    } catch (e: any) {
      console.warn("DB deleteCategory failed:", e);
      return { success: false, error: e.message || "Failed to delete category from database" };
    }
  }
  const store = ensureStoreFile();
  const productCount = store.products.filter((p) => p.categoryId === id).length;
  if (productCount > 0) {
    return {
      success: false,
      error: `Cannot delete: ${productCount} product(s) are assigned to this category.`,
    };
  }
  store.categories = store.categories.filter((c) => c.id !== id);
  writeStoreFile(store);
  return { success: true };
}

export async function toggleCategoryStatus(id: string, isActive: boolean): Promise<boolean> {
  if (hasDb) {
    try {
      await prisma.category.update({
        where: { id },
        data: { isActive },
      });
    } catch (e) {
      console.warn("DB toggleCategoryStatus failed:", e);
    }
  }
  const store = ensureStoreFile();
  const cat = store.categories.find((c) => c.id === id);
  if (cat) {
    cat.isActive = isActive;
    writeStoreFile(store);
  }
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
  const colId = collection.id || `col-${collection.slug || Date.now()}`;
  const prepared: Collection = {
    ...collection,
    id: colId,
  };

  if (hasDb) {
    try {
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
    } catch (e) {
      console.warn("DB saveCollection failed:", e);
    }
  }
  const store = ensureStoreFile();
  const existingIdx = store.collections.findIndex((c) => c.id === prepared.id || c.slug === prepared.slug);
  if (existingIdx >= 0) {
    store.collections[existingIdx] = prepared;
  } else {
    store.collections.push(prepared);
  }
  writeStoreFile(store);
  return prepared;
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  if (hasDb) {
    try {
      // Prisma schema has onDelete: Cascade on ProductCollection for collectionId
      await prisma.collection.delete({ where: { id } });
    } catch (e: any) {
      console.warn("DB deleteCollection failed:", e);
      return { success: false, error: e.message || "Failed to delete collection from database" };
    }
  }
  const store = ensureStoreFile();
  store.collections = store.collections.filter((c) => c.id !== id);
  writeStoreFile(store);
  return { success: true };
}

export async function toggleCollectionStatus(id: string, isActive: boolean): Promise<boolean> {
  if (hasDb) {
    try {
      await prisma.collection.update({
        where: { id },
        data: { isActive },
      });
    } catch (e) {
      console.warn("DB toggleCollectionStatus failed:", e);
    }
  }
  const store = ensureStoreFile();
  const col = store.collections.find((c) => c.id === id);
  if (col) {
    col.isActive = isActive;
    writeStoreFile(store);
  }
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
      const catSlug = options.category?.toLowerCase().trim();
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
    list = list.filter(
      (p) =>
        p.categoryName.toLowerCase() === options.category?.toLowerCase() ||
        p.categoryId.toLowerCase().includes(options.category?.toLowerCase() || "")
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
  if (hasDb) {
    try {
      await prisma.product.upsert({
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
        await prisma.productVariant.upsert({
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
    } catch (e) {
      console.warn("DB saveProduct failed:", e);
    }
  }

  const store = ensureStoreFile();
  const existingIdx = store.products.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    store.products[existingIdx] = product;
  } else {
    store.products.push(product);
  }
  writeStoreFile(store);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (hasDb) {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (e) {
      console.warn("DB deleteProduct failed:", e);
    }
  }
  const store = ensureStoreFile();
  store.products = store.products.filter((p) => p.id !== id);
  writeStoreFile(store);
  return true;
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
  const store = ensureStoreFile();

  // Inventory validation and stock deduction
  for (const item of orderData.items) {
    if (hasDb) {
      try {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant) {
          if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.productName}". Available: ${variant.stock}`);
          }
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      } catch (e: any) {
        console.warn("DB stock decrement failed:", e);
      }
    }

    const product = store.products.find((p) => p.id === item.productId);
    if (product) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
    }
  }

  const orderId = `ord_${Date.now()}`;
  const orderNumber = `RS-${Math.floor(100000 + Math.random() * 900000)}`;

  if (hasDb) {
    try {
      await prisma.order.create({
        data: {
          id: orderId,
          orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          totalAmount: orderData.totalAmount,
          orderStatus: "Confirmed",
          paymentStatus: "Paid",
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress as any,
          items: {
            create: orderData.items.map((i) => ({
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
      });
    } catch (e) {
      console.warn("DB order creation failed:", e);
    }
  }

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
  };

  store.orders.unshift(newOrder);
  writeStoreFile(store);
  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  if (hasDb) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: status as any },
      });
    } catch (e) {
      console.warn("DB updateOrderStatus failed:", e);
    }
  }

  const store = ensureStoreFile();
  const order = store.orders.find((o) => o.id === orderId);
  if (order) {
    order.orderStatus = status;
    writeStoreFile(store);
    return order;
  }
  return null;
}

export async function updateStock(variantId: string, newStock: number): Promise<boolean> {
  if (hasDb) {
    try {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      });
      return true;
    } catch (e) {
      console.warn("DB updateStock failed:", e);
    }
  }
  const store = ensureStoreFile();
  for (const product of store.products) {
    const v = product.variants.find((v) => v.id === variantId);
    if (v) {
      v.stock = newStock;
      writeStoreFile(store);
      return true;
    }
  }
  return false;
}

