const expect = require('expect');

const { Users } = require('./users');

describe('Users', () => {
  var users;

  beforeEach(() => {
    users = new Users();
    users.users = [{
      id:'1',
      name:'AB',
      room:'node'
    },{
      id:'2',
      name:'DB',
      room:'node'
    },{
      id:'3',
      name:'QEB',
      room:'react'
    }];
  })

  it('should add new users', () => {
    var users = new Users();
    var user = {
      id: 'asdfghjkl',
      name:'AAA',
      room:'AAA'
    };

    var resUser = users.addUser(user.id,user.name,user.room);

    expect(users.users).toEqual([user]);

  });

  it('should remove a user', () => {
    var user = users.removeUser('1');

    expect(user[0]).toInclude({
      id:'1',
      name:'AB',
      room:'node'
    });
    expect(users.users.length).toBe(2);
  });

  it('should not remove a user', () => {
    var user = users.removeUser('33');
    expect(user.length).toBe(0);
    expect(users.users.length).toBe(3);
  });

  it('should find user', () => {
    var user = users.getUser('1');
    expect(user[0]).toInclude({
      id:'1',
      name:'AB',
      room:'node'
    });
  });

  it('should not find user', () => {
    var user = users.getUser('38');
    expect(user.length).toBe(0);
  });

  it('should return names for node coures', () => {
    var userList = users.getUserList('node');

    expect(userList).toEqual(['AB','DB']);
  });

  it('should return names for react coures', () => {
    var userList = users.getUserList('react');

    expect(userList).toEqual(['QEB']);
  });
})
