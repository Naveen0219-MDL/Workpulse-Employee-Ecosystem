import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

// Create and allocate task (Manager / Admin)
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      estimatedHours,
      deadline,
    } = req.body;

    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title, assigned employee, and deadline date.',
      });
    }

    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Assigned employee does not exist.' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user._id,
      companyDomain: req.user.companyDomain,
      priority: priority || 'medium',
      estimatedHours: Number(estimatedHours) || 8,
      deadline: new Date(deadline),
      status: 'todo',
      progressPercentage: 0,
      progressLogs: [
        {
          updatedBy: req.user._id,
          percent: 0,
          note: `Task created and assigned by ${req.user.name}`,
          loggedHoursAdded: 0,
          timestamp: new Date(),
        },
      ],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department designation avatar')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created and allocated successfully.',
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tasks with filtering & role scoping (Strictly scoped to user's company domain)
export const getTasks = async (req, res) => {
  try {
    const { status, priority, employeeId, search } = req.query;
    const filter = { companyDomain: req.user.companyDomain };

    // Role scoping: Employees default to seeing their own tasks unless specifically requested
    if (req.user.role === 'employee') {
      filter.assignedTo = req.user._id;
    } else if (employeeId) {
      filter.assignedTo = employeeId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email department designation avatar')
      .populate('assignedBy', 'name email')
      .populate('progressLogs.updatedBy', 'name role')
      .sort({ deadline: 1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyDomain: req.user.companyDomain,
    })
      .populate('assignedTo', 'name email department designation avatar')
      .populate('assignedBy', 'name email')
      .populate('progressLogs.updatedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task progress (Employee or Manager)
export const updateTaskProgress = async (req, res) => {
  try {
    const { percent, note, loggedHoursAdded, status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, companyDomain: req.user.companyDomain });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check authorization: must be assigned employee, admin, or manager
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'manager'].includes(req.user.role);

    if (!isAssigned && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to update progress on this task' });
    }

    const newPercent = percent !== undefined ? Math.min(100, Math.max(0, Number(percent))) : task.progressPercentage;

    task.progressPercentage = newPercent;

    if (loggedHoursAdded) {
      task.loggedHours = (task.loggedHours || 0) + Number(loggedHoursAdded);
    }

    // Auto-transition status based on progress
    if (status) {
      task.status = status;
    } else if (newPercent === 100) {
      task.status = 'completed';
      task.completedAt = new Date();
    } else if (newPercent > 0 && task.status === 'todo') {
      task.status = 'in_progress';
    }

    task.progressLogs.push({
      updatedBy: req.user._id,
      percent: newPercent,
      note: note || `Progress updated to ${newPercent}%`,
      loggedHoursAdded: Number(loggedHoursAdded) || 0,
      timestamp: new Date(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department designation avatar')
      .populate('assignedBy', 'name email')
      .populate('progressLogs.updatedBy', 'name role');

    res.json({
      success: true,
      message: 'Task progress updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task details (Manager / Admin)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, companyDomain: req.user.companyDomain });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, assignedTo, priority, status, deadline, estimatedHours } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (status) {
      task.status = status;
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
        task.progressPercentage = 100;
      }
    }
    if (deadline) task.deadline = new Date(deadline);
    if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours);

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department designation avatar')
      .populate('assignedBy', 'name email');

    res.json({ success: true, message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task (Manager / Admin)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, companyDomain: req.user.companyDomain });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
