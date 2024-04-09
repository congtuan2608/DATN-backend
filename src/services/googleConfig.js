import storage from "@google-cloud/vision";

async function authenticateImplicitWithAdc() {
  const storage = new storage({
    projectId: "go-green-418806",
  });
  const [buckets] = await storage.getBuckets();
  console.log("Buckets:");

  for (const bucket of buckets) {
    console.log(`- ${bucket.name}`);
  }

  console.log("Listed all storage buckets.");
}

authenticateImplicitWithAdc();
