class UserSerialize {
  user({ id, name, email }) {
    return { id, name, email };
  }

  signInResponce({ user, token }) {
    return {
      user: this.user(user),
      token,
    };
  }
}

exports.serialize = new UserSerialize();
