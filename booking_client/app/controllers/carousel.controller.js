import Category from "../models/category.model.js";
import Evento from "../models/evento.model.js";
import asyncHandler from 'express-async-handler';

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


//EVENTOS
const get_carousel_evento = asyncHandler(async (req, res) => {
    const evento = await Evento.findOne(req.params)
    if (!evento) {
        return res.status(401).json({
            message: "Evento Not Found"
        });
    }
    return res.status(200).json({
        evento: await evento.toEventoCarouselResponse()
    })
});

export {
    get_carousel_evento,
    get_carousel_category
}