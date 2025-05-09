import Helper from '../models/Helper.js';
import Service from '../models/Service.js';
import Feedback from '../models/Feedback.js';

// GET /search — all helpers with services
export const showAllServices = async (req, res) => {
  try {
    const helpers = await Helper.find({ 'services.0': { $exists: true }, approved: true });
    const services = await Service.find();

    // Fetch all feedbacks at once to avoid multiple DB calls
    const feedbacks = await Feedback.aggregate([
      {
        $group: {
          _id: "$helper",
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    // Map feedbacks to a quick lookup table for average ratings
    const avgRatings = feedbacks.reduce((acc, feedback) => {
      acc[feedback._id.toString()] = feedback.avgRating.toFixed(1);
      return acc;
    }, {});

    console.log(avgRatings);

    let newhelpers = [];

    helpers.forEach((helper) => {
      helper.services.forEach((service) => {
        newhelpers.push({
          id: helper._id,
          name: helper.name,
          availability: helper.availability,
          gender: helper.gender,
          rating: avgRatings[helper._id.toString()] || '4.5',
          service: service.name,
          price: service.price
        });
      });
    });

    res.render('search', {
      helpers: newhelpers, // Pass it as `helpers` to match your EJS variable
      services: services,
      availabilityFilter: 'all',
      typeFilter: 'all',
      genderFilter: 'all',
      maxPrice: 1500
    });

  } catch (err) {
    console.error("Error fetching helpers:", err);
    res.status(500).send("Internal Server Error");
  }
};

// GET /search/filter — filter by availability, gender, service type, price
export const filterServices = async (req, res) => {
  const { maxPrice = 1500, availability = 'all', type = 'all', gender = 'all' } = req.query;

  const query = {
    'services.price': { $lte: Number(maxPrice) },
    approved: true
  };

  if (availability !== 'all') query.availability = availability;
  if (genderFilter !== 'all') query.gender = new RegExp(`^${genderFilter}$`, 'i');
  if (type !== 'all') query['services.name'] = type;

  try {
    const [helpers, services] = await Promise.all([
      Helper.find(query),
      Service.find()
    ]);

    res.render('search', {
      helpers,
      services,
      availabilityFilter: availability,
      typeFilter: type,
      genderFilter: gender,
      maxPrice
    });
  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).send("Error retrieving helpers.");
  }
};

// GET /search/search — keyword search for service name
export const searchByName = async (req, res) => {
  const { term } = req.query;

  try {
    const [helpers, services] = await Promise.all([
      Helper.find({
        'services.name': { $regex: term, $options: 'i' },
        approved: true
      }),
      Service.find()
    ]);

    res.render('search', {
      helpers,
      services,
      availabilityFilter: 'all',
      typeFilter: 'all',
      genderFilter: 'all',
      maxPrice: 1500
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Search failed.");
  }
};

// POST /search — combined filter + search
export const postSearch = async (req, res) => {
  const {
    priceRange = 1500,
    availabilityFilter = 'all',
    serviceTypeFilter = 'all',
    genderFilter = 'all',
    searchQuery = ''
  } = req.body;

  const query = {
    approved: true
  };

  if (availabilityFilter !== 'all') query.availability = availabilityFilter;
  if (genderFilter !== 'all') query.gender = new RegExp(`^${genderFilter}$`, 'i');

  try {
    const [helpers, services] = await Promise.all([
      Helper.find(query),
      Service.find()
    ]);

    let newhelpers = [];

    helpers.forEach((helper) => {
      helper.services.forEach((service) => {
        const serviceMatchesSearch =
          searchQuery.trim() === '' ||
          new RegExp(searchQuery.trim(), 'i').test(service.name);

        const serviceMatchesType =
          serviceTypeFilter === 'all' || service.name === serviceTypeFilter;

        const serviceMatchesPrice =
          !priceRange || service.price <= Number(priceRange);

        if (serviceMatchesSearch && serviceMatchesType && serviceMatchesPrice) {
          newhelpers.push({
            id: helper._id,
            name: helper.name,
            availability: helper.availability,
            gender: helper.gender,
            rating: helper.rating || '4.5',
            service: service.name,
            price: service.price
          });
        }
      });
    });

    res.render('search', {
      helpers: newhelpers,
      services,
      availabilityFilter,
      typeFilter: serviceTypeFilter,
      genderFilter,
      priceRange,
      searchQuery
    });
  } catch (err) {
    console.error("POST search error:", err);
    res.status(500).send("Error retrieving helpers.");
  }
};

// changes after making the search page dynamic - api end points

// GET /api/services/filter
export const filterServicesAPI = async (req, res) => {
    const { maxPrice = 1500, availability = 'all', type = 'all', gender = 'all' } = req.query;
    const query = { 'services.price': { $lte: Number(maxPrice) }, approved: true };

    if (availability !== 'all') query.availability = availability;
    if (gender !== 'all') query.gender = new RegExp(`^${gender}$`, 'i');
    if (type !== 'all') query['services.name'] = type;

    try {
        const helpers = await Helper.find(query);
        let newhelpers = [];

        helpers.forEach(helper => {
            helper.services.forEach(service => {
                if (service.price <= Number(maxPrice) && (type === 'all' || service.name === type)) {
                    newhelpers.push({
                        id: helper._id,
                        name: helper.name,
                        availability: helper.availability,
                        gender: helper.gender,
                        rating: helper.rating || '4.5',
                        service: service.name,
                        price: service.price
                    });
                }
            });
        });

        res.json({ helpers: newhelpers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch filtered services" });
    }
};

// GET /api/services/search
export const searchByNameAPI = async (req, res) => {
    const { term = "" } = req.query;

    try {
        const helpers = await Helper.find({ 'services.name': { $regex: term, $options: 'i' }, approved: true });
        let newhelpers = [];

        helpers.forEach(helper => {
            helper.services.forEach(service => {
                if (new RegExp(term, 'i').test(service.name)) {
                    newhelpers.push({
                        id: helper._id,
                        name: helper.name,
                        availability: helper.availability,
                        gender: helper.gender,
                        rating: helper.rating || '4.5',
                        service: service.name,
                        price: service.price
                    });
                }
            });
        });

        res.json({ helpers: newhelpers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
};
