const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Event.countDocuments();
    const events = await Event.find()
      .populate('organizer', 'name role profilePicture')
      .populate('attendees', 'name profilePicture')
      .sort({ date: 1 }) // Sort by closest date first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Admin or Alumni)
const createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Alumni' && req.user.role !== 'Faculty') {
      return res.status(401).json({ message: 'Not authorized to create events' });
    }

    const { title, type, date, location, description, imageUrl } = req.body;

    if (!title || !type || !date || !location || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const event = await Event.create({
      title,
      type,
      date,
      location,
      description,
      imageUrl: imageUrl || '',
      organizer: req.user.id,
      attendees: [req.user.id], // Organizer is automatically attending
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name role profilePicture')
      .populate('attendees', 'name profilePicture');
      
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await event.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle RSVP for an event
// @route   PUT /api/events/:id/rsvp
// @access  Private
const toggleRSVP = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isAttending = event.attendees.includes(req.user.id);

    if (isAttending) {
      event.attendees = event.attendees.filter((id) => id.toString() !== req.user.id);
    } else {
      event.attendees.push(req.user.id);
    }

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name role profilePicture')
      .populate('attendees', 'name profilePicture');

    res.status(200).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, type, date, location, description, imageUrl } = req.body;
    if (title !== undefined) event.title = title;
    if (type !== undefined) event.type = type;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    
    await event.save();
    const populated = await Event.findById(event._id)
      .populate('organizer', 'name role profilePicture')
      .populate('attendees', 'name profilePicture');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRSVP
};
