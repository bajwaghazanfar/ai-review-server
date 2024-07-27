const { client } = require("../client");

// Fetch all reviews for a product by product ID
const getAllReviewsByProductId = async (productId) => {
  try {
    const res = await client.query(
      "SELECT * FROM review WHERE product_id = $1",
      [productId]
    );
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Fetch a review by ID
const getReviewById = async (id) => {
  try {
    const res = await client.query("SELECT * FROM review WHERE id = $1", [id]);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Create a new review
const createReview = async (
  product_id,
  rating,
  author,
  review_title,
  review_description,
  review_image,
  review_date,
  author_location
) => {
  try {
    const res = await client.query(
      "INSERT INTO review (product_id, rating, author, review_title, review_description, review_image, review_date, author_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        product_id,
        rating,
        author,
        review_title,
        review_description,
        review_image,
        review_date,
        author_location,
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Update an existing review by ID
const updateReview = async (
  id,
  product_id,
  rating,
  author,
  review_title,
  review_description,
  review_image,
  review_date,
  author_location
) => {
  try {
    const res = await client.query(
      "UPDATE review SET product_id = $1, rating = $2, author = $3, review_title = $4, review_description = $5, review_image = $6, review_date = $7, author_location = $8 WHERE id = $9 RETURNING *",
      [
        product_id,
        rating,
        author,
        review_title,
        review_description,
        review_image,
        review_date,
        author_location,
        id,
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete a review by ID
const deleteReview = async (id) => {
  try {
    await client.query("DELETE FROM review WHERE id = $1", [id]);
    return { message: "Review deleted successfully" };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Create multiple reviews
const createMultipleReviews = async (reviews) => {
  try {
    // Construct the query
    const queryText = `
        INSERT INTO review (product_id, rating, author, review_title, review_description, review_image, review_date, author_location)
        VALUES ${reviews
          .map(
            (_, i) =>
              `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${
                i * 8 + 5
              }, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
          )
          .join(", ")}
        RETURNING *;
      `;

    // Flatten the review data into an array of values
    const values = reviews.flatMap((review) => [
      review.product_id,
      review.rating,
      review.author,
      review.review_title,
      review.review_description,
      review.review_image,
      review.review_date,
      review.author_location,
    ]);

    // Execute the query
    const res = await client.query(queryText, values);

    // Return the inserted reviews
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  getAllReviewsByProductId,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  createMultipleReviews,
};
