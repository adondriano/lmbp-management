import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // This app intentionally syncs externally requested routes and loaded data into view state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
