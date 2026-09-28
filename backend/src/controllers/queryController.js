import { Query } from '../models/Query.js';

// Create a new employee query or blocker
export const createQuery = async (req, res) => {
  try {
    const { title, description, category, priority, relatedTask } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title and description for the query.' });
    }

    const query = await Query.create({
      title,
      description,
      category: category || 'task_blocker',
      priority: priority || 'medium',
      raisedBy: req.user._id,
      companyDomain: req.user.companyDomain,
      relatedTask: relatedTask || null,
      status: 'open',
      responses: [
        {
          sender: req.user._id,
          message: `Query opened: ${description}`,
          createdAt: new Date(),
        },
      ],
    });

    const populated = await Query.findById(query._id)
      .populate('raisedBy', 'name email department designation avatar')
      .populate('relatedTask', 'title priority status');

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully. Your manager/admin has been notified.',
      query: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get queries with role scoping & filtering (strictly within user's company domain)
export const getQueries = async (req, res) => {
  try {
    const { status, category, priority, myOnly } = req.query;
    const filter = { companyDomain: req.user.companyDomain };

    if (req.user.role === 'employee' || myOnly === 'true') {
      filter.raisedBy = req.user._id;
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const queries = await Query.find(filter)
      .populate('raisedBy', 'name email department designation avatar')
      .populate('assignedTo', 'name email')
      .populate('relatedTask', 'title priority status')
      .populate('responses.sender', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to a query thread & update status (strictly within company)
export const replyToQuery = async (req, res) => {
  try {
    const { message, status } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const query = await Query.findOne({ _id: req.params.id, companyDomain: req.user.companyDomain });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found or belongs to another company' });
    }

    query.responses.push({
      sender: req.user._id,
      message,
      createdAt: new Date(),
    });

    if (status) {
      query.status = status;
      if (status === 'resolved') {
        query.resolvedAt = new Date();
      }
    } else if (req.user.role !== 'employee' && query.status === 'open') {
      // If manager or admin replies, mark as in_review
      query.status = 'in_review';
    }

    await query.save();

    const updated = await Query.findById(query._id)
      .populate('raisedBy', 'name email department designation avatar')
      .populate('assignedTo', 'name email')
      .populate('relatedTask', 'title priority status')
      .populate('responses.sender', 'name role avatar');

    res.json({
      success: true,
      message: 'Reply posted successfully',
      query: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update query status (e.g. resolve or reopen)
export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const query = await Query.findOne({ _id: req.params.id, companyDomain: req.user.companyDomain });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found or belongs to another company' });
    }

    query.status = status;
    if (status === 'resolved') {
      query.resolvedAt = new Date();
    } else {
      query.resolvedAt = null;
    }

    await query.save();

    const updated = await Query.findById(query._id)
      .populate('raisedBy', 'name email department designation avatar')
      .populate('responses.sender', 'name role avatar');

    res.json({
      success: true,
      message: `Query marked as ${status}`,
      query: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
