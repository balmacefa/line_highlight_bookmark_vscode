export const testCase1 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc'],
    markers: [2],
  },
  after: {
    lines: ['aaa', 'bbb', 'ccc'],
    markers: [2],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 1, character: 0 },
    },
    text: '',
  },
}

export const testCase2 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc'],
    markers: [2],
  },
  after: {
    lines: ['aaa', '', 'bbb', 'ccc'],
    markers: [3],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 1, character: 0 },
    },
    text: '\n',
  },
}

export const testCase3 = {
  before: {
    lines: ['aaa', 'bcc', 'ddd'],
    markers: [2],
  },
  after: {
    lines: ['aaa', 'cc', 'ddd'],
    markers: [2],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 1, character: 1 },
    },
    text: '',
  },
}

export const testCase4 = {
  before: {
    lines: ['aaa', 'bbb', 'cddd'],
    markers: [2],
  },
  after: {
    lines: ['aaa', 'ddd'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 1 },
    },
    text: '',
  },
}

export const testCase5 = {
  before: {
    lines: ['aaa', 'bcc', 'deee'],
    markers: [1, 2],
  },
  after: {
    lines: ['aaa', 'beee'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 1 },
      end: { line: 2, character: 1 },
    },
    text: '',
  },
}

export const testCase6 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [1, 2],
  },
  after: {
    lines: ['aaa', 'xxxccc', 'ddd'],
    markers: [1],
  },
  textChange: {
    range: {
      start: {
        line: 1,
        character: 0,
      },
      end: {
        line: 2,
        character: 0,
      },
    },
    text: 'xxx',
  },
}

export const testCase7 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [1, 2],
  },
  after: {
    lines: ['aaa', '', 'xxxccc', 'ddd'],
    markers: [2],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    },
    text: '\nxxx',
  },
}

export const testCase8 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [1, 2],
  },
  after: {
    lines: ['aaa', 'xxx', 'ccc', 'ddd'],
    markers: [2],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    },
    text: 'xxx\n',
  },
}

export const testCase9 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [2],
  },
  after: {
    lines: ['aaa', 'xxxccc', 'ddd'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    },
    text: 'xxx',
  },
}

export const testCase10 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [1],
  },
  after: {
    lines: ['aaa', 'xxxccc', 'ddd'],
    markers: [],
  },
  textChange: {
    range: {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    },
    text: 'xxx',
  },
}

export const testCase11 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd'],
    markers: [1],
  },
  after: {
    lines: ['aaa', 'bxxxccc', 'ddd'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 1 },
      end: { line: 2, character: 0 },
    },
    text: 'xxx',
  },
}

export const testCase12 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'],
    markers: [1, 2, 3],
  },
  after: {
    lines: ['aaa', 'bxxx', 'eee', 'fff'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 1 },
      end: { line: 3, character: 3 },
    },
    text: 'xxx',
  },
}

export const testCase13 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'],
    markers: [2, 3],
  },
  after: {
    lines: ['aaa', 'bxxx', 'eee', 'fff'],
    markers: [1],
  },
  textChange: {
    range: {
      start: { line: 1, character: 1 },
      end: { line: 3, character: 3 },
    },
    text: 'xxx',
  },
}

export const testCase14 = {
  before: {
    lines: ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'],
    markers: [2],
  },
  after: {
    lines: ['aaa', 'bxxx', 'eee', 'fff'],
    markers: [],
  },
  textChange: {
    range: {
      start: { line: 1, character: 1 },
      end: { line: 3, character: 3 },
    },
    text: 'xxx',
  },
}
