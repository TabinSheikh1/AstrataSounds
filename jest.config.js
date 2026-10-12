module.exports = {
  preset: 'react-native',
  // The RN preset only transforms .js/.ts/.tsx; this app's components are .jsx
  transform: {
    '^.+\\.jsx$': 'babel-jest',
  },
};
