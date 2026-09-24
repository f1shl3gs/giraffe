import parseCSV from './index'

describe('parse', () => {
  it('treats the first row as columns and returns the remaining rows', () => {
    expect(parseCSV('a,b\nc,d\ne,f')).toEqual([
      ['a', 'b'],
      [
        ['c', 'd'],
        ['e', 'f'],
      ],
    ])
  })

  it('keeps commas inside quoted fields', () => {
    expect(parseCSV('a,"b,c"\n1,"2,3"')).toEqual([['a', 'b,c'], [['1', '2,3']]])
  })

  it('unescapes doubled quotes', () => {
    expect(parseCSV('a,"b""c"')).toEqual([['a', 'b"c'], []])
  })

  it('keeps newlines inside quoted fields', () => {
    expect(parseCSV('a,"b\nc",d\ne,f')).toEqual([
      ['a', 'b\nc', 'd'],
      [['e', 'f']],
    ])
  })

  it('handles CRLF line endings', () => {
    expect(parseCSV('a,b\r\nc,d\r\n')).toEqual([
      ['a', 'b'],
      [['c', 'd'], ['']],
    ])
  })

  it('emits a final empty row for a trailing newline', () => {
    expect(parseCSV('a,b\nc,d\n')).toEqual([
      ['a', 'b'],
      [['c', 'd'], ['']],
    ])
  })

  it('emits an empty cell for a trailing comma', () => {
    expect(parseCSV('a,b,\nc,d')).toEqual([['a', 'b', ''], [['c', 'd']]])
  })

  it('emits an empty row for a blank line', () => {
    expect(parseCSV('a,b\n\nc,d')).toEqual([
      ['a', 'b'],
      [[''], ['c', 'd']],
    ])
  })

  it('keeps ragged rows at their natural length', () => {
    expect(parseCSV('a,b,c\nd,e')).toEqual([['a', 'b', 'c'], [['d', 'e']]])
  })

  it('returns empty arrays for empty input', () => {
    expect(parseCSV('')).toEqual([[], []])
  })

  it('does not trim cell whitespace', () => {
    expect(parseCSV('  a,b\n  c,d')).toEqual([['  a', 'b'], [['  c', 'd']]])
  })

  it('keeps quotes literally when not at the start of a cell', () => {
    expect(parseCSV('a"b,c')).toEqual([['a"b', 'c'], []])
  })

  it('supports lone carriage returns as line endings', () => {
    expect(parseCSV('a,b\rc,d\r')).toEqual([
      ['a', 'b'],
      [['c', 'd'], ['']],
    ])
  })

  it('handles an unterminated quote at the end of the input', () => {
    expect(parseCSV('a,"b')).toEqual([['a', 'b'], []])
  })

  it('keeps quotes that start mid-cell literal', () => {
    expect(parseCSV('"a"b')).toEqual([['ab'], []])
  })

  it('keeps an unterminated quote pair literal', () => {
    expect(parseCSV('"a""')).toEqual([['a"'], []])
  })

  it('keeps a quote that opens mid-cell literal', () => {
    expect(parseCSV('a,"""b')).toEqual([['a', '"b'], []])
  })

  it('keeps whitespace after a closing quote', () => {
    expect(parseCSV('"a" ,b')).toEqual([['a ', 'b'], []])
  })

  it('handles whitespace-only input', () => {
    expect(parseCSV('  ')).toEqual([['  '], []])
  })

  it('handles escaped quotes and CRLF together in a quoted field', () => {
    expect(parseCSV('a,"b""c",d\r\ne,f')).toEqual([
      ['a', 'b"c', 'd'],
      [['e', 'f']],
    ])
  })
})
