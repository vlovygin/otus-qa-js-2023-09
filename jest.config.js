/** @type {import('jest').Config} */

const config = {
  coverageProvider: 'v8',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-report',
        filename: 'report.html'
      }
    ]
  ]
}

export default config
