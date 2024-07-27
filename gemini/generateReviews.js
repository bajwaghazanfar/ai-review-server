const { geminiModel } = require("./init");
const generateReviews = async (product) => {
  const reviewColumns =
    "rating (int), author, review_title, review_description, review_image, author_location,review_date.Generate the reviews based off of the product description I have provided and make them seem authentic. Make the rating between 1 - 5";
  const returnAsJson =
    "Generate exactly 10 reviews with these columns and return them as a JSON array. Ensure the JSON is correctly formatted and does not contain trailing commas or periods so I can parse it using JSON.parse() in JavaScript. Make sure all the objects are in an array so I can parse them as an array of objects.";

  const prompt = `
    This is my product description: ${product.product_description}. 
    I have a table of reviews with columns: ${reviewColumns}
    ${returnAsJson}
  `;
  console.log(prompt);
  const aiResult = await geminiModel.generateContent(prompt);
  const responseText = await aiResult.response.text(); // Correctly await the text method

  console.log(responseText);
  // Extract content between brackets
  const match = responseText.match(/\[(.*?)\]/s);
  if (match && match[1]) {
    const jsonString = `[${match[1]}]`; // Add brackets to the extracted content
    try {
      const generatedReviews = JSON.parse(jsonString);
      generatedReviews.forEach((review) => {
        review.product_id = product.product_id;
      });
      console.log("Generated Reviews:", generatedReviews);
      return generatedReviews;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
    }
  } else {
    console.error("No JSON array found in AI response");
  }
};
module.exports = { generateReviews };
