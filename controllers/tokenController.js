import { findById } from '../models/User';
import Service, { findById as _findById } from '../models/Gig';

export async function allocateTokens(userId, amount) {
  const user = await findById(userId);
  user.tokens += amount;
  await user.save();
}

export async function useToken(userId, amount) {
  const user = await findById(userId);
  if (user.tokens < amount) {
    throw new Error('Insufficient tokens');
  }
  user.tokens -= amount;
  await user.save();
}

export async function postJob(req, res) {
  try {
    const { title, description, budget, deadline } = req.body;
    await useToken(req.user.id, 1); // Use 1 token to post a job

    const newJob = new Service({
      title,
      description,
      price: budget,
      deliveryTime: deadline,
      user: req.user.id,
      type: 'job'
    });

    await newJob.save();
    res.json(newJob);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

export async function commentOnPost(req, res) {
  try {
    const { serviceId, comment } = req.body;
    await useToken(req.user.id, 1); // Use 1 token to comment

    const service = await _findById(serviceId);
    service.comments.push({ user: req.user.id, text: comment });
    await service.save();

    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

export async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    await useToken(req.user.id, 1); // Use 1 token to send a message

    // Implement message sending logic here
    // You might want to create a separate Message model for this

    res.json({ msg: 'Message sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}