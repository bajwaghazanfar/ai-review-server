// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser"); // Add this line
const cors = require("cors"); // Import cors

const {
  getProductById,
  createProduct,
  getProductByIdWithReviews,
} = require("./db/actions/product");
const { createMultipleReviews } = require("./db/actions/review");
const { generateReviews } = require("./gemini/generateReviews");
const { default: axios } = require("axios");

const app = express();
const port = 3001;
app.use(bodyParser.json()); // Add this line
app.use(bodyParser.urlencoded({ extended: true })); // Add this line

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(cors()); // This will allow all origins by default
console.log(process.env.SUPABASE_PASS);
app.post("/generate-review", async (req, res) => {
  // Change this line
  console.log(req.body);
  const payload = {
    id: req.body.id,
    title: req.body.title,
    description: req.body.description,
  };

  const product = await getProductById(payload.id);
  console.log(product);

  if (product === undefined || product === null) {
    const newProduct = await createProduct(
      payload.id,
      payload.title,
      payload.description
    );
    console.log(newProduct);
  }
  const review =
    "I have a table of reviews with column of review title, review stars, review description, review image, author name, and author location.";
  const returnAsJson = "Generate 10 reviews and give me response as JSON";

  // try {
  //   const prompt = `This is my product description: ${product.description}. ${review}. ${returnAsJson}`;
  //   const result = await geminiModel.generateContent(prompt);
  //   const response = result.response;
  //   console.log(response.text());
  //   res.json(response.text()); // Add this line to send the response
  // } catch (error) {
  //   console.log("response error", error);
  //   res.status(500).send("Error generating reviews"); // Add this line to handle errors
  // }
});

app.post("/get", async (req, res) => {
  const { product_id, title, description } = req.body;

  try {
    // Fetch the product with its reviews
    let product = await getProductByIdWithReviews(product_id);

    console.log(product_id, title, description);
    // If the product doesn't exist, create it
    if (!product) {
      product = await createProduct(product_id, title, description);
      // Re-fetch the product with reviews after creation
      product = await getProductByIdWithReviews(product_id);
    }

    res.status(200).json(product);

    // Check if the product has reviews
    if (product && product.reviews === undefined) {
      // No reviews exist; generate and create reviews
      const allGeneratedReviews = await generateReviews(product);
      console.log(allGeneratedReviews, "allGeneratedReviews");
      if (allGeneratedReviews) {
        await createMultipleReviews(allGeneratedReviews);
      }
    } else if (product.reviews.length === 0) {
      // If reviews array is empty, generate and create reviews
      const allGeneratedReviews = await generateReviews(product);
      console.log(allGeneratedReviews, "allGeneratedReviews");
      if (allGeneratedReviews) {
        await createMultipleReviews(allGeneratedReviews);
      }
    } else if (product.reviews.length < 20) {
      // If there are less than 20 reviews, generate additional reviews
      const additionalReviewsNeeded = 20 - product.reviews.length;
      const allGeneratedReviews = await generateReviews(
        product,
        additionalReviewsNeeded
      );
      console.log(allGeneratedReviews, "allGeneratedReviews");
      if (allGeneratedReviews) {
        await createMultipleReviews(allGeneratedReviews);
      }
    }
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
