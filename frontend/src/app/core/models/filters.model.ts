export class Filters {
    limit?: number;
    offset?: number;
    price_min?: number;
    price_max?: number;
    category?: string;
    name?: string;

    constructor(
        limit?: number,
        offset?: number,
        price_min?: number,
        price_max?: number,
        category?: string,
        name?: string,
    ) {
        this.limit = limit || 3;
        this.offset = offset || 0;
        this.price_min = price_min;
        this.price_max = price_max;
        this.category = category;
        this.name = name;
    }
}