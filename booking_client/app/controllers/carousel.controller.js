const Category = require("../models/category.model.js");
const Product = require("../models/product.model.js");
const CategoryCarouselSerializer = require("../serializers/categoryCarousel.serializer.js");
const asyncHandler = require('express-async-handler');

//CATEGORIAS
const get_carousel_category = asyncHandler( async (req, res) => {

    const categories = await Category.find();

    if (!categories) {
        return res.status(401).json({
        message: "Categories not found"
        })
    }
    return res.status(200).json({
        categories: await Promise.all(categories.map( async categories => {
            return await categories.toCategoryCarouselResponse()
        }))
});
});


//PRODUCTOS
const get_carousel_product = asyncHandler(async (req, res) => {
    const products = await Product.findOne(req.params)
    if (!products) {
        return res.status(401).json({
            message: "Product Not Found"
        });
    }
    return res.status(200).json({
        products: await products.toProductCarouselResponse()
    })
});

// Alternative method using the serializer class directly
const get_carousel_category_minimal = asyncHandler(async (req, res) => {
    const categories = await Category.find().select('name image slug _id');
    
    if (!categories || categories.length === 0) {
        return res.status(404).json({
            message: "Categories not found"
        });
    }
    
    return res.status(200).json({
        categories: CategoryCarouselSerializer.serializeMany(categories)
    });
});

// Method to get categories with event count for carousel
const get_carousel_category_with_count = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    
    if (!categories || categories.length === 0) {
        return res.status(404).json({
            message: "Categories not found"
        });
    }

    // This would require aggregation with events collection
    // For now, using basic serialization
    return res.status(200).json({
        categories: categories.map(category => 
            CategoryCarouselSerializer.serializeWithEventCount(category, 0)
        )
    });
});

module.exports = {
    get_carousel_product,
    get_carousel_category,
    get_carousel_category_minimal,
    get_carousel_category_with_count
}