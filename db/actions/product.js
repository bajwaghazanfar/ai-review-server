const { client } = require("../client");

// Fetch all products
const getAllProducts = async () => {
  try {
    const res = await client.query("SELECT * FROM product");
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Fetch a product by ID
const getProductById = async (id) => {
  try {
    const res = await client.query(
      "SELECT * FROM product WHERE product_id = $1",
      [id]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};
// Fetch a product by ID along with its reviews in a single query
const getProductByIdWithReviews = async (id) => {
  try {
    // SQL query to fetch product details along with reviews
    const res = await client.query(
      `
          SELECT
            p.product_id,
            p.product_title,
            p.product_description,
            r.id AS review_id,
            r.rating,
            r.author,
            r.review_title,
            r.review_description,
            r.review_image,
            r.author_location,
            r.review_date
          FROM product p
          LEFT JOIN review r ON p.product_id = r.product_id
          WHERE p.product_id = $1
          `,
      [id]
    );

    // Check if no product was found
    if (res.rows.length === 0) {
      return null;
    }

    // Initialize product object
    const product = {
      product_id: res.rows[0].product_id,
      product_title: res.rows[0].product_title,
      product_description: res.rows[0].product_description,
      reviews: [],
    };

    // Iterate over the result rows to populate reviews
    res.rows.forEach((row) => {
      if (row.review_id) {
        product.reviews.push({
          id: row.review_id,
          rating: row.rating,
          author: row.author,
          review_title: row.review_title,
          review_description: row.review_description,
          review_image: row.review_image,
          author_location: row.author_location,
          review_date: row.review_date, // Add review_date to the review object
        });
      }
    });

    return product;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Create a new product
const createProduct = async (
  product_id,
  product_title,
  product_description
) => {
  try {
    const existingProduct = await getProductById(product_id);
    if (!existingProduct) {
      const res = await client.query(
        "INSERT INTO product (product_id, product_title, product_description) VALUES ($1, $2, $3) RETURNING *",
        [product_id, product_title, product_description]
      );

      return res.rows[0];
    } else {
      return {
        error: "Product already exists",
      };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Update an existing product by ID
const updateProduct = async (
  id,
  product_id,
  product_title,
  product_description
) => {
  try {
    const res = await client.query(
      "UPDATE product SET product_id = $1, product_title = $2, product_description = $3 WHERE id = $4 RETURNING *",
      [product_id, product_title, product_description, id]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete a product by ID
const deleteProduct = async (id) => {
  try {
    await client.query("DELETE FROM product WHERE id = $1", [id]);
    return { message: "Product deleted successfully" };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByIdWithReviews,
};
