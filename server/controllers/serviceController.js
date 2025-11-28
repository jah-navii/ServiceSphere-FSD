import Helper from '../models/Helper.js';
import Service from '../models/Service.js';
import Feedback from '../models/Feedback.js';

// GET /api/services
// Handles Search, Filtering, and Defaults all in one.
export const getServicesAPI = async (req, res) => {
    try {
        const { 
            search = "", 
            type = "all", 
            gender = "all", 
            price = 1500 
        } = req.query;

        // 1. Base Query: Only approved helpers
        let query = { approved: true };

        // 2. Gender Filter
        if (gender !== 'all') {
            query.gender = new RegExp(`^${gender}$`, 'i');
        }

        // 3. Search & Type Logic (Applied inside the loop for nested array filtering)
        // Note: MongoDB $elemMatch is efficient, but your existing loop logic works fine for transformation.
        
        const helpers = await Helper.find(query);
        let results = [];

        // 4. Fetch Feedbacks for Ratings (Optimized aggregation)
        const feedbacks = await Feedback.aggregate([
            { $group: { _id: "$helper", avgRating: { $avg: "$rating" } } }
        ]);
        const avgRatings = feedbacks.reduce((acc, f) => {
            acc[f._id.toString()] = f.avgRating.toFixed(1);
            return acc;
        }, {});

        // 5. Transform & Filter Services
        helpers.forEach(helper => {
            if (!helper.services) return;

            helper.services.forEach(service => {
                // Filter Logic
                const matchesSearch = search === "" || new RegExp(search, 'i').test(service.name);
                const matchesType = type === "all" || service.name === type;
                const matchesPrice = service.price <= Number(price);

                if (matchesSearch && matchesType && matchesPrice) {
                    results.push({
                        id: helper._id,
                        name: helper.name,
                        availability: helper.availability,
                        gender: helper.gender,
                        rating: avgRatings[helper._id.toString()] || '4.5', // Default rating if none
                        service: service.name,
                        price: service.price,
                        image: helper.image || "/pics/profile-picture.png" // Fallback image
                    });
                }
            });
        });

        // 6. Get List of Unique Service Types for the Dropdown
        const allServices = await Service.find().select('name');

        res.status(200).json({ 
            success: true, 
            helpers: results, 
            serviceTypes: allServices 
        });

    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};