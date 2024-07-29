import User from '../models/User.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, profile },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const uploadPastWork = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const fileUrl = req.file.path; // Assuming file upload middleware is used
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.pastWork.push({ title, description, fileUrl });
    await user.save();
    
    res.status(200).json({ message: "Past work uploaded successfully", pastWork: user.pastWork });
  } catch (error) {
    next(error);
  }
};