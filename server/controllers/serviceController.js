import Helper from '../models/Helper.js';
import Service from '../models/Service.js';
import Feedback from '../models/Feedback.js';

// GET /api/services
export const getServicesAPI = async (req, res) => {
    try {
        // FIX 1: Check for 'search' OR 'q' (handles mismatch)
        const rawSearch = req.query.search || req.query.q || "";
        // Clean the string to prevent Regex errors
        const search = rawSearch.trim();

        const { 
            type = "all", 
            gender = "all", 
            price = 5000,
            category = "all",
            location = "all"
        } = req.query;

        console.log(`Searching for: "${search}"`); // Debug log

        let query = { approved: true };

        if (category !== "all") query.category = category; 
        if (gender !== 'all') query.gender = new RegExp(`^${gender}$`, 'i');
        if (location !== 'all') query.address = new RegExp(`^${location}$`, 'i');

        const helpers = await Helper.find(query).populate('category');
        let results = [];

        // ... (Ratings logic remains same) ...
        const feedbacks = await Feedback.aggregate([
            { $group: { _id: "$helper", avgRating: { $avg: "$rating" } } }
        ]);
        const avgRatings = feedbacks.reduce((acc, f) => {
            acc[f._id.toString()] = f.avgRating.toFixed(1);
            return acc;
        }, {});

        helpers.forEach(helper => {
            if (!helper.services) return;

            helper.services.forEach(service => {
                // FIX 2: Stronger Search Logic
                // If search is empty, it matches. If not, Regex test.
                const matchesSearch = search === "" || new RegExp(search, 'i').test(service.name);
                
                const matchesType = type === "all" || service.name === type;
                const matchesPrice = service.price <= Number(price);

                if (matchesSearch && matchesType && matchesPrice) {
                    results.push({
                        id: helper._id,
                        name: helper.name,
                        availability: helper.availability,
                        gender: helper.gender,
                        address: helper.address,
                        rating: avgRatings[helper._id.toString()] || '4.5',
                        service: service.name,
                        price: service.price,
                        categoryName: helper.category?.name,
                        categoryId: helper.category?._id
                    });
                }
            });
        });

        // ... (Rest of function remains same) ...
        const availableServiceTypes = await Service.find(category !== "all" ? { category } : {}).select('name');
        
        res.status(200).json({ 
            success: true, 
            helpers: results, 
            serviceTypes: availableServiceTypes
        });

    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};