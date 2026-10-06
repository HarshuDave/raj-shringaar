import { saveCategory, deleteCategory, getAllCategories, saveCollection, deleteCollection, getAllCollections } from "../lib/data/repository";

async function runTest() {
  console.log("=== Testing Dynamic Categories ===");
  const testCat = {
    id: "cat-test-singhasan",
    name: "Singhasan Test",
    slug: "singhasan-test",
    image: "/categories/poshak.png",
    displayOrder: 99,
    isActive: true,
  };

  await saveCategory(testCat);
  console.log("✓ Successfully saved test category");

  let allCats = await getAllCategories();
  const foundCat = allCats.find((c) => c.slug === "singhasan-test");
  if (!foundCat) throw new Error("Created category not found in DB!");
  console.log("✓ Verified category in database:", foundCat.name);

  const delCatRes = await deleteCategory(testCat.id);
  if (!delCatRes.success) throw new Error("Failed to delete category: " + delCatRes.error);
  console.log("✓ Successfully deleted test category");

  allCats = await getAllCategories();
  if (allCats.some((c) => c.slug === "singhasan-test")) throw new Error("Category still exists after delete!");
  console.log("✓ Verified category was deleted from database");

  console.log("\n=== Testing Dynamic Collections ===");
  const testCol = {
    id: "col-test-diwali",
    name: "Diwali Mahotsav Test",
    slug: "diwali-mahotsav-test",
    image: "/janmashtami-special.png",
    description: "Test collection for Diwali",
    displayOrder: 99,
    isActive: true,
  };

  await saveCollection(testCol);
  console.log("✓ Successfully saved test collection");

  let allCols = await getAllCollections();
  const foundCol = allCols.find((c) => c.slug === "diwali-mahotsav-test");
  if (!foundCol) throw new Error("Created collection not found in DB!");
  console.log("✓ Verified collection in database:", foundCol.name);

  const delColRes = await deleteCollection(testCol.id);
  if (!delColRes.success) throw new Error("Failed to delete collection: " + delColRes.error);
  console.log("✓ Successfully deleted test collection");

  allCols = await getAllCollections();
  if (allCols.some((c) => c.slug === "diwali-mahotsav-test")) throw new Error("Collection still exists after delete!");
  console.log("✓ Verified collection was deleted from database");

  console.log("\n🎉 ALL DYNAMIC TAXONOMY TESTS PASSED WITH LIVE NEON DB!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
