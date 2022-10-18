import { MigrationContextShowStyle, MigrationStepShowStyle } from 'blueprints-integration'
import { literal } from 'tv2-common'
import { TableConfigItemAdLibTransitions } from '../blueprintConfig'

export function SetShowstyleTransitionMigrationStep(versionStr: string, newValue: string): MigrationStepShowStyle {
	return {
		id: `${versionStr}.setShowstyleTransition`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const transition = context.getBaseConfig('ShowstyleTransition')

			if (!transition) {
				return `Transition setting does not exists`
			}

			return transition !== newValue
		},
		migrate: (context: MigrationContextShowStyle) => {
			context.setBaseConfig('ShowstyleTransition', newValue)
		}
	}
}

type TransitionsTableValue = TableConfigItemAdLibTransitions & { _id: string; [key: string]: string }

export function UpsertValuesIntoTransitionTable(
	versionStr: string,
	values: TableConfigItemAdLibTransitions[]
): MigrationStepShowStyle[] {
	const steps: MigrationStepShowStyle[] = []

	values.forEach(val => {
		steps.push({
			id: `${versionStr}.insertTransition.${val.Transition.replace(/[\s\W]/g, '_')}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const table = (context.getBaseConfig('Transitions') as unknown) as TransitionsTableValue[] | undefined

				if (!table) {
					return `Transitions table does not exists`
				}

				const existingVal = table.find(v => v.Transition === val.Transition)

				if (!existingVal) {
					return `Transition "${val.Transition}" does not exist`
				}

				return existingVal.Transition !== val.Transition
			},
			migrate: (context: MigrationContextShowStyle) => {
				const table = (context.getBaseConfig('Transitions') as unknown) as TransitionsTableValue[] | undefined

				if (!table) {
					context.setBaseConfig('Transitions', [
						literal<TransitionsTableValue>({
							_id: val.Transition.replace(/\W\s/g, '_'),
							Transition: val.Transition
						})
					])
				} else {
					table.push(
						literal<TransitionsTableValue>({
							_id: val.Transition.replace(/\W\s/g, '_'),
							Transition: val.Transition
						})
					)

					context.setBaseConfig('Transitions', table)
				}
			}
		})
	})

	return steps
}
