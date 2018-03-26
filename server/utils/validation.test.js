const expect = require('expect');

const { isRealString } = require('./validation');

describe('generateMessage',() => {
  it('should reject non-string values', () => {
    var test = 123;
    var ans = isRealString(test);
    expect(ans).toBe(false);
  });

  it('should reject string with only spaces', () => {
    var test = '     ';
    var ans = isRealString(test);
    expect(ans).toBe(false);
  });

  it('should allow string with non-space characters', () => {
    var test = ' 1 3  2';
    var ans = isRealString(test);
    expect(ans).toBe(true);
  });
});
