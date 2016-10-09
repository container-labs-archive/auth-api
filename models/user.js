const mongoose = require('mongoose');
const acl = require('mongoose-acl');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  username: { type: String },
  password: { type: String },
  admin: { type: Boolean },
  email: { type: String },
  emailVerified: { type: Boolean, default: false },
  // TODO: http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
});

UserSchema.plugin(acl.subject);

UserSchema.pre('save', (next) => {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  return bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password along with our new salt
    return bcrypt.hash(user.password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePassword = (candidatePassword, cb) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);

    return cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
