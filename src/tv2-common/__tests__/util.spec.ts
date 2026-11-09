import { assertUnreachable, joinAssetToFolder, joinAssetToNetworkPath } from '../util'

const JOIN_ASSET_FOLDER_TESTS: Array<{
	name: string
	folder: string | undefined
	assetFile: string
	result: string
}> = [
	{
		name: 'Handles undefined folder',
		folder: undefined,
		assetFile: 'amb',
		result: 'amb'
	},
	{
		name: 'Handles folder with trailing slash',
		folder: '/sofie/media/',
		assetFile: 'amb',
		result: '/sofie/media/amb'
	},
	{
		name: 'Handles assetFile with leading slash',
		folder: '/sofie/media',
		assetFile: '/amb',
		result: '/sofie/media/amb'
	},
	{
		name: 'Handles assetFile with folder',
		folder: '/sofie/media',
		assetFile: '/clips/amb',
		result: '/sofie/media/clips/amb'
	},
	{
		name: 'Handles folder with trailing slash and assetFile with leading slash',
		folder: '/sofie/media/',
		assetFile: '/amb',
		result: '/sofie/media/amb'
	},
	{
		name: 'Handles folder with windows paths',
		folder: '\\sofie\\media\\',
		assetFile: 'amb',
		result: '/sofie/media/amb'
	},
	{
		name: 'Handles assetFile with windows paths',
		folder: '\\sofie\\media\\',
		assetFile: '\\clips\\amb',
		result: '/sofie/media/clips/amb'
	}
]

const JOIN_ASSET_NETWORK_PATH_TESTS: Array<{
	name: string
	networkPath: string
	folder: string | undefined
	assetFile: string
	extensiton: string
	result: string
}> = [
	{
		name: 'Joins correctly',
		networkPath: 'S:\\Sofie',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\amb.mp4'
	},
	{
		name: 'Handles network path with trailing slash',
		networkPath: 'S:\\Sofie\\',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\amb.mp4'
	},
	{
		name: 'Handles double-slashed network path',
		networkPath: 'S:\\\\Sofie\\\\',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\amb.mp4'
	},
	{
		name: 'Handles undefined folder',
		networkPath: 'S:\\Sofie\\',
		folder: undefined,
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\amb.mp4'
	},
	{
		name: 'Handles folder with leading slash',
		networkPath: 'S:\\Sofie\\',
		folder: '\\assets',
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\amb.mp4'
	},
	{
		name: 'Handles folder with unix-like paths',
		networkPath: 'S:\\Sofie\\',
		folder: 'assets/clips',
		assetFile: 'amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\clips\\amb.mp4'
	},
	{
		name: 'Handles assetFile with unix-like paths ',
		networkPath: 'S:\\Sofie\\',
		folder: 'assets',
		assetFile: 'clips/amb',
		extensiton: 'mp4',
		result: 'S:\\Sofie\\assets\\clips\\amb.mp4'
	},
	{
		name: 'Handles extension with leading dot',
		networkPath: 'S:\\Sofie\\',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: '.mp4',
		result: 'S:\\Sofie\\assets\\amb.mp4'
	},
	{
		name: 'Handles multi-part extension',
		networkPath: 'S:\\Sofie\\',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: '.asset.mp4',
		result: 'S:\\Sofie\\assets\\amb.asset.mp4'
	},
	{
		name: 'Handles win shares',
		networkPath: '\\\\Sofie\\\\share',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: '.asset.mp4',
		result: '\\\\Sofie\\share\\assets\\amb.asset.mp4'
	},
	{
		name: 'Handles win shares #2',
		networkPath: '\\\\\\Sofie\\share\\',
		folder: 'assets',
		assetFile: 'amb',
		extensiton: '.asset.mp4',
		result: '\\\\Sofie\\share\\assets\\amb.asset.mp4'
	}
]

describe('util', () => {
	it('Asserts Unreachable', () => {
		expect(() => {
			// @ts-ignore
			assertUnreachable({})
		}).toThrowError()
	})

	for (const test of JOIN_ASSET_FOLDER_TESTS) {
		it(test.name, () => {
			expect(joinAssetToFolder(test.folder, test.assetFile)).toBe(test.result)
		})
	}

	for (const test of JOIN_ASSET_NETWORK_PATH_TESTS) {
		it(test.name, () => {
			expect(joinAssetToNetworkPath(test.networkPath, test.folder, test.assetFile, test.extensiton)).toBe(test.result)
		})
	}
})
