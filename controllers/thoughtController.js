const { User, Thought } = require('../models');

module.exports = {
  getThoughts(req, res) {
    Thought.find({})
      .sort({ createdAt: -1 })
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(400).json(err));
  },

  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Thought ID does not exist.' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

  createThought({ body }, res) {
    Thought.create(body)
      .then(({ username, _id }) => {
        return User.findOneAndUpdate(
          { username: username },
          { $push: { thoughts: _id } },
          { runValidators: true, new: true }
        );
      })
      .then((user) =>
        !user
          ? res.status(404).json({
              message: 'User ID does not exist, but thought has been created.',
            })
          : res.json('Thought created.')
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Thought ID does not exist.' })
          : res.json(thought)
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  deleteThought(req, res) {
    Thought.findOneAndRemove({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Thought ID does not exist.' })
          : User.findOneAndUpdate(
              { thoughts: req.params.thoughtId },
              { $pull: { thoughts: req.params.thoughtId } },
              { new: true }
            )
      )
      .then((user) =>
        !user
          ? res
              .status(404)
              .json({ message: 'User ID does not exist, but thought has been created.' })
          : res.json({ message: 'Thought deleted.' })
      )
      .catch((err) => res.status(500).json(err));
  },

  addReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Thought ID does not exist.' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

  removeReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Thought ID does not exist.' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
};
