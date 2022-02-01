const { AuthenticationError } = require('apollo-server-express');
// const { User, Thought } = require('../models');
// const { signToken } = require('../utils/auth');

// const resolvers = {
//   Query: {
//     me: async (parent, args, context) => {
//       if (context.user) {
//         const userData = await User.findOne({ _id: context.user._id })
//           .select('-__v -password')
//           .populate('thoughts')
//           .populate('friends');

//         return userData;
//       }

//       throw new AuthenticationError('Not logged in');
//     },
//     users: async () => {
//       return User.find()
//         .select('-__v -password')
//         .populate('thoughts')
//         .populate('friends');
//     },
//     user: async (parent, { username }) => {
//       return User.findOne({ username })
//         .select('-__v -password')
//         .populate('friends')
//         .populate('thoughts');
//     },
//     thoughts: async (parent, { username }) => {
//       const params = username ? { username } : {};
//       return Thought.find(params).sort({ createdAt: -1 });
//     },
//     thought: async (parent, { _id }) => {
//       return Thought.findOne({ _id });
//     }
//   },

//   Mutation: {
//     addUser: async (parent, args) => {
//       const user = await User.create(args);
//       const token = signToken(user);

//       return { token, user };
//     },
//     login: async (parent, { email, password }) => {
//       const user = await User.findOne({ email });

//       if (!user) {
//         throw new AuthenticationError('Incorrect credentials');
//       }

//       const correctPw = await user.isCorrectPassword(password);

//       if (!correctPw) {
//         throw new AuthenticationError('Incorrect credentials');
//       }

//       const token = signToken(user);
//       return { token, user };
//     },
//     addThought: async (parent, args, context) => {
//       if (context.user) {
//         const thought = await Thought.create({ ...args, username: context.user.username });

//         await User.findByIdAndUpdate(
//           { _id: context.user._id },
//           { $push: { thoughts: thought._id } },
//           { new: true }
//         );

//         return thought;
//       }

//       throw new AuthenticationError('You need to be logged in!');
//     },
//     addReaction: async (parent, { thoughtId, reactionBody }, context) => {
//       if (context.user) {
//         const updatedThought = await Thought.findOneAndUpdate(
//           { _id: thoughtId },
//           { $push: { reactions: { reactionBody, username: context.user.username } } },
//           { new: true, runValidators: true }
//         );

//         return updatedThought;
//       }

//       throw new AuthenticationError('You need to be logged in!');
//     },
//     addFriend: async (parent, { friendId }, context) => {
//       if (context.user) {
//         const updatedUser = await User.findOneAndUpdate(
//           { _id: context.user._id },
//           { $addToSet: { friends: friendId } },
//           { new: true }
//         ).populate('friends');

//         return updatedUser;
//       }

//       throw new AuthenticationError('You need to be logged in!');
//     }
//   }
// };

// module.exports = resolvers;


// import user model
const { User, Book } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
  // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  Query: {
    async me(parent, body, context) {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },
  },
  Mutation: {
    async addUser(parent, body, context) {
      try {
        console.log(body)
        const user = await User.create(body);

        if (!user) {
          throw new AuthenticationError('You need to be logged in!');
        }
        const token = signToken(user);
        console.log(token,user);
        return { token, user };
      } catch (err) {
        console.log(err);
        throw new AuthenticationError('Failed to add user');
      }
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    // {body} is destructured req.body
    // var_ _ to hide but keep the space/position
    async login(_, body) {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
      if (!user) {
        throw new AuthenticationError("Can't find user");
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password');

      }
      const token = signToken(user);
      return { token, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
    async saveBook(_, body, { user }) {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new AuthenticationError('Wrong password');
      }
    },
    // remove a book from `savedBooks`
    async removeBook(_, body, { user }) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: body.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find this book");
      }
      return updatedUser;
    },
  }
};

module.exports = resolvers