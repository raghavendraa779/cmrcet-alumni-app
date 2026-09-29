const Mentorship = require('../models/Mentorship');

exports.requestMentorship = async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    const menteeId = req.user.id;

    const existingRequest = await Mentorship.findOne({ mentor: mentorId, mentee: menteeId });
    if (existingRequest) {
      return res.status(400).json({ message: 'Mentorship request already exists.' });
    }

    const mentorship = new Mentorship({
      mentor: mentorId,
      mentee: menteeId,
      message,
    });

    await mentorship.save();
    res.status(201).json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMentorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const mentorships = await Mentorship.find({ $or: [{ mentor: userId }, { mentee: userId }] })
      .populate('mentor', 'name email role avatar')
      .populate('mentee', 'name email role avatar');
    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMentorshipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const mentorship = await Mentorship.findById(id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    if (mentorship.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this mentorship' });
    }

    mentorship.status = status;
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
