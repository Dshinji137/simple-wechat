class Users {
  constructor() {
    this.users = [];
  }

  addUser(id, name, room) {
    var user = {id:id,name:name,room:room};
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    var removeUsers = this.users.filter((user) => {
      return user.id === id;
    });

    this.users = this.users.filter((user) => {
      return user.id != id;
    });

    return removeUsers;
  }

  getUser(id) {
    var users = this.users.filter((user) => {
      return user.id === id;
    });

    return users;
  }

  getUserList(room) {
    var users = this.users.filter((user) => {
      return user.room === room;
    });

    var namesArray = users.map((user) => {
      return user.name;
    });

    return namesArray;
  }
}

module.exports = {Users};
