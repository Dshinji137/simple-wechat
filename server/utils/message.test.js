var expect = require('expect');

var { generateMessage, generateLocationMessage} = require('./message.js');

describe('generateMessage',() => {
  it('should generate correct message object', () => {
    var from = "Ddd";
    var text = "Some message";
    var message = generateMessage(from,text);

    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({
      from:from,
      text:text
    });
  });
});

describe('generateLocationMessage', () => {
  it('should generate correct location message object', () => {
    var from = "Dshinji";
    var lat = '1';
    var lng = '1';
    var message = generateLocationMessage(from,lat,lng);

    expect(message.createdAt).toBeA('number');
    expect(message.from).toBe(from);
    expect(message.url).toBe(`https://www.google.com/maps?q=${lat},${lng}`);
  });

});
