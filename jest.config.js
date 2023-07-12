module.exports = {
	globals: {
	  'ts-jest': {
		tsconfig: 'tsconfig.test.json',
	  },
	},
	moduleFileExtensions: [
	  'js',
	  'ts',
	],
	transform: {
	  '^.+\\.(ts|tsx)$': 'ts-jest',
	},
	testMatch: [
	  '**/__tests__/**/*.spec.(ts|js)',
	],
	testPathIgnorePatterns: [
	  'integrationTests',
	],
	testEnvironment: 'node',
	coverageThreshold: {
	  global: {
		branches: 0,
		functions: 0,
		lines: 0,
		statements: 0,
	  },
	},
	coverageDirectory: './coverage/',
	collectCoverage: true,
	preset: 'ts-jest',
	roots: [
		"<rootDir>"
	],
	modulePaths: [
		"<rootDir>"
	],
	moduleDirectories: [
		"node_modules",
		"src",
		"src/types"
	]
}
