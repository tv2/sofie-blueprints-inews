module.exports = {
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	},
	moduleFileExtensions: ['ts', 'js'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: ['**/__tests__/**/*.spec.ts'],
	testPathIgnorePatterns: ['integrationTests'],
	testEnvironment: 'node',
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0
		}
	},
	coverageDirectory: './coverage/',
	collectCoverage: true,
	preset: 'ts-jest',
	roots: ['<rootDir>/src'],
	modulePaths: ['<rootDir>'],
	moduleDirectories: ['node_modules', 'src', 'src/types']
}
