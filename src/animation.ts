import { PlayerObject } from './model.js'
import { easeOut, easeInOutQuad } from './utils.js'

/**
 * An animation which can be played on a {@link PlayerObject}.
 *
 * This is an abstract class. Subclasses of this class would implement
 * particular animations.
 */
export abstract class PlayerAnimation {
	/**
	 * The speed of the animation.
	 *
	 * @defaultValue `1.0`
	 */
	speed: number = 1.0

	/**
	 * Whether the animation is paused.
	 *
	 * @defaultValue `false`
	 */
	paused: boolean = false

	/**
	 * The current progress of the animation.
	 */
	progress: number = 0

	/**
	 * Plays the animation.
	 *
	 * @param player - the player object
	 * @param delta - progress difference since last call
	 */
	protected abstract animate(player: PlayerObject, delta: number): void

	/**
	 * Plays the animation, and update the progress.
	 *
	 * The elapsed time `deltaTime` will be scaled by {@link speed}.
	 * If {@link paused} is `true`, this method will do nothing.
	 *
	 * @param player - the player object
	 * @param deltaTime - time elapsed since last call
	 */
	update(player: PlayerObject, deltaTime: number): void {
		if (this.paused) {
			return
		}
		const delta = deltaTime * this.speed
		this.animate(player, delta)
		this.progress += delta
	}
}

/**
 * A class that helps you create an animation from a function.
 *
 * @example
 * To create an animation that rotates the player:
 * ```
 * new FunctionAnimation((player, progress) => player.rotation.y = progress)
 * ```
 */
export class FunctionAnimation extends PlayerAnimation {
	fn: (player: PlayerObject, progress: number, delta: number) => void

	constructor(
		fn: (player: PlayerObject, progress: number, delta: number) => void,
	) {
		super()
		this.fn = fn
	}

	protected animate(player: PlayerObject, delta: number): void {
		this.fn(player, this.progress, delta)
	}
}

export class IdleAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 2

		// Arm swing
		const basicArmRotationZ = Math.PI * 0.02
		player.skin.leftArm.rotation.z = Math.cos(t) * 0.03 + basicArmRotationZ
		player.skin.rightArm.rotation.z =
			Math.cos(t + Math.PI) * 0.03 - basicArmRotationZ
	}
}

export class WavingAnimation extends PlayerAnimation {
	private w = 0
	private t = this.progress * 1.8

	protected animate(player: PlayerObject): void {
		const l = Math.PI / -1.15
		const t = this.t

		if (this.w < 5) {
			player.cape.visible = false
			player.elytra.visible = false

			if (t <= 1) {
				player.skin.head.rotation.z = (easeOut(t) * l) / 18

				player.skin.torso.position.x = (easeOut(t) * -l) / 1.5
				player.skin.torso.rotation.z = (easeOut(t) * l) / 20

				player.skin.rightArm.rotation.z = easeOut(t) * l
				player.skin.leftArm.rotation.z = (easeOut(t) * -l) / 8

				player.skin.rightLeg.rotation.z = (easeOut(t) * l) / 10
			} else if (t <= 2) {
				player.skin.head.rotation.z =
					l / 18 - (easeInOutQuad(t - 1) * l) / 18

				player.skin.torso.position.x =
					-l / 1.5 - (easeInOutQuad(t - 1) * -l) / 1.5
				player.skin.torso.rotation.z =
					l / 20 - (easeInOutQuad(t - 1) * l) / 20

				player.skin.rightArm.rotation.z = l - easeOut(t - 1) * l
				player.skin.leftArm.rotation.z =
					-l / 8 - (easeOut(t - 1) * -l) / 8

				player.skin.rightLeg.rotation.z =
					l / 10 - (easeInOutQuad(t - 1) * l) / 10
			} else {
				player.skin.rightArm.rotation.z = 0
			}
		} else {
			player.skin.rightArm.rotation.z = 0

			if (player.backEquipment = 'cape') {
				player.cape.visible = true
			} else {
				player.elytra.visible = true
			}
		}

		this.t += 0.016

		if (t >= 2) {
			this.w++
			this.t = 0
		}
	}
}

export class WalkingAnimation extends PlayerAnimation {
	/** multiplier */
	m: number = 0.7

	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 8

		const multiplier = this.m

		// Leg swing
		player.skin.leftLeg.rotation.x = Math.sin(t) * multiplier
		player.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * multiplier

		// Arm swing
		player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * multiplier
		player.skin.rightArm.rotation.x = Math.sin(t) * multiplier

		// Always add an angle for cape around the x axis
		const basicCapeRotationX = Math.PI * 0.15
		player.cape.rotation.x = Math.sin(t) * 0.05 + basicCapeRotationX
	}
}

export class RunningAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 11

		// Leg swing
		player.skin.leftLeg.rotation.x = Math.sin(t) * 1.3
		player.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * 1.3

		// Arm swing
		player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 1.3
		player.skin.rightArm.rotation.x = Math.sin(t) * 1.3

		const basicCapeRotationX = Math.PI * 0.25
		player.cape.rotation.x = Math.sin(t * 0.8) * 0.2 + basicCapeRotationX
	}
}

function clamp(num: number, min: number, max: number): number {
	return num <= min ? min : num >= max ? max : num
}

export class FlyingAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Body rotation finishes in 0.5s
		// Elytra expansion finishes in 3.3s
		const t = this.progress > 0 ? this.progress * 20 : 0
		const startProgress = clamp((t * t) / 100, 0, 1)

		player.rotation.x = (startProgress * Math.PI) / 2
		player.skin.head.rotation.x =
			startProgress > 0.5 ? Math.PI / 4 - player.rotation.x : 0

		const basicArmRotationZ = Math.PI * 0.25 * startProgress
		player.skin.leftArm.rotation.z = basicArmRotationZ
		player.skin.rightArm.rotation.z = -basicArmRotationZ

		const elytraRotationX = 0.34906584
		const elytraRotationZ = Math.PI / 2
		const interpolation = Math.pow(0.9, t)
		player.elytra.leftWing.rotation.x =
			elytraRotationX + interpolation * (0.2617994 - elytraRotationX)
		player.elytra.leftWing.rotation.z =
			elytraRotationZ + interpolation * (0.2617994 - elytraRotationZ)
		player.elytra.updateRightWing()
	}
}
