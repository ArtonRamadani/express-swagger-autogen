/**
 * Users Controllers
 */

// Mock users database
let users = [
  { id: 1, username: 'demo', email: 'demo@example.com', role: 'admin' },
  { id: 2, username: 'john', email: 'john@example.com', role: 'user' },
  { id: 3, username: 'jane', email: 'jane@example.com', role: 'user' }
];

/**
 * Get all users
 */
const getAllUsersHandler = (req, res) => {
  try {
    return res.status(200).json({
      status: 'Success',
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get user by ID
 */
const getUserByIdHandler = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

/**
 * Create new user
 */
const createUserHandler = (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({
        status: 'Error',
        message: 'User already exists'
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      role: role || 'user'
    };

    users.push(newUser);

    return res.status(201).json({
      status: 'Success',
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

/**
 * Update user
 */
const updateUserHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role })
    };

    return res.status(200).json({
      status: 'Success',
      message: 'User updated successfully',
      data: users[userIndex]
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

/**
 * Delete user
 */
const deleteUserHandler = (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    users.splice(userIndex, 1);

    return res.status(200).json({
      status: 'Success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler
};
