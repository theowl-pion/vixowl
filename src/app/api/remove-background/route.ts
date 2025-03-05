import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return Response.json({ error: "No image URL provided" }, { status: 400 });
    }

    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: imageUrl,
          return_mask: true,
        },
      }
    );

    return Response.json({ result: output });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to process image" }, { status: 500 });
  }
}
