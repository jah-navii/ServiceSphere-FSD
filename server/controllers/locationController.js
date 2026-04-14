import Location from '../models/Location.js';

// GET /api/locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

// POST /api/locations
export const addLocation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Location name required' });

    const newLocation = await Location.create({ name });
    res.status(201).json({ message: 'Location added', location: newLocation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Location already exists' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// DELETE /api/locations/:id
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: 'Location removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
