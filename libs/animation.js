import { PlayerObject } from './model.js';
import { easeOut, easeInOutQuad } from './utils.js';
/**
 * An animation which can be played on a {@link PlayerObject}.
 *
 * This is an abstract class. Subclasses of this class would implement
 * particular animations.
 */
export class PlayerAnimation {
    constructor() {
        /**
         * The speed of the animation.
         *
         * @defaultValue `1.0`
         */
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.0
        });
        /**
         * Whether the animation is paused.
         *
         * @defaultValue `false`
         */
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * The current progress of the animation.
         */
        Object.defineProperty(this, "progress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Plays the animation, and update the progress.
     *
     * The elapsed time `deltaTime` will be scaled by {@link speed}.
     * If {@link paused} is `true`, this method will do nothing.
     *
     * @param player - the player object
     * @param deltaTime - time elapsed since last call
     */
    update(player, deltaTime) {
        if (this.paused) {
            return;
        }
        const delta = deltaTime * this.speed;
        this.animate(player, delta);
        this.progress += delta;
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
    constructor(fn) {
        super();
        Object.defineProperty(this, "fn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.fn = fn;
    }
    animate(player, delta) {
        this.fn(player, this.progress, delta);
    }
}
export class IdleAnimation extends PlayerAnimation {
    animate(player) {
        // Multiply by animation's natural speed
        const t = this.progress * 2;
        // Arm swing
        const basicArmRotationZ = Math.PI * 0.02;
        player.skin.leftArm.rotation.z = Math.cos(t) * 0.03 + basicArmRotationZ;
        player.skin.rightArm.rotation.z =
            Math.cos(t + Math.PI) * 0.03 - basicArmRotationZ;
    }
}
export class WavingAnimation extends PlayerAnimation {
    animate(player) {
        const t = this.progress * 12;
        const waveCount = 4;
        const easedT = easeInOutQuad(Math.abs((((t * 1.2) % (2 * waveCount)) - waveCount) / waveCount));
        let rightArmRotationZ = ((Math.PI / 1.2) * (1 - easedT)) % (Math.PI * 4);
        let rightLegRotationZ = 0;
        let leftArmRotationZ = 0;
        let headRotationZ = 0;
        let torsoPositionX = 0;
        let torsoRotationZ = 0;
        if (t >= waveCount * 5) {
            rightArmRotationZ = 0;
        }
        if (t < waveCount * 4) {
            player.cape.visible = false;
            player.elytra.visible = false;
            rightLegRotationZ =
                (Math.PI / 8) * easeOut(Math.min(1, t / 1.1 / (waveCount * 2)));
            leftArmRotationZ =
                (Math.PI / 12) *
                    easeOut(Math.min(1, (t * 1.2) / (waveCount * 2)));
            headRotationZ =
                (Math.PI / 18) * easeOut(Math.min(1, t / 1.3 / (waveCount * 2)));
            torsoPositionX =
                (Math.PI / 1.2) *
                    easeOut(Math.min(1, t / 1.2 / (waveCount * 2)));
            torsoRotationZ =
                (Math.PI / 15) * easeOut(Math.min(1, t / 1.2 / (waveCount * 2)));
        }
        else {
            const ta = t - waveCount * 4;
            player.cape.visible = true;
            rightLegRotationZ =
                (Math.PI / 8) *
                    (1 - easeOut(Math.min(1, (ta * 2) / (waveCount * 2))));
            leftArmRotationZ =
                (Math.PI / 12) *
                    (1 - easeOut(Math.min(1, (ta * 2) / (waveCount * 2))));
            headRotationZ =
                (Math.PI / 18) *
                    (1 - easeInOutQuad(Math.min(1, (ta * 2) / (waveCount * 2))));
            torsoPositionX =
                (Math.PI / 1.2) *
                    (1 - easeInOutQuad(Math.min(1, (ta * 2) / (waveCount * 2))));
            torsoRotationZ =
                (Math.PI / 15) *
                    (1 - easeInOutQuad(Math.min(1, (ta * 2) / (waveCount * 2))));
        }
        player.skin.rightLeg.rotation.z = -rightLegRotationZ;
        player.skin.leftArm.rotation.z = leftArmRotationZ;
        player.skin.head.rotation.z = -headRotationZ;
        player.skin.torso.rotation.z = -torsoRotationZ;
        player.skin.torso.position.x = torsoPositionX;
        player.skin.rightArm.rotation.z = -rightArmRotationZ;
    }
}
export class WalkingAnimation extends PlayerAnimation {
    constructor() {
        super(...arguments);
        /** multiplier */
        Object.defineProperty(this, "m", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.7
        });
    }
    animate(player) {
        // Multiply by animation's natural speed
        const t = this.progress * 8;
        const multiplier = this.m;
        // Leg swing
        player.skin.leftLeg.rotation.x = Math.sin(t) * multiplier;
        player.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * multiplier;
        // Arm swing
        player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * multiplier;
        player.skin.rightArm.rotation.x = Math.sin(t) * multiplier;
        // Always add an angle for cape around the x axis
        const basicCapeRotationX = Math.PI * 0.15;
        player.cape.rotation.x = Math.sin(t) * 0.05 + basicCapeRotationX;
    }
}
export class RunningAnimation extends PlayerAnimation {
    animate(player) {
        // Multiply by animation's natural speed
        const t = this.progress * 11;
        // Leg swing
        player.skin.leftLeg.rotation.x = Math.sin(t) * 1.3;
        player.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * 1.3;
        // Arm swing
        player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 1.3;
        player.skin.rightArm.rotation.x = Math.sin(t) * 1.3;
        const basicCapeRotationX = Math.PI * 0.25;
        player.cape.rotation.x = Math.sin(t * 0.8) * 0.2 + basicCapeRotationX;
    }
}
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}
export class FlyingAnimation extends PlayerAnimation {
    animate(player) {
        // Body rotation finishes in 0.5s
        // Elytra expansion finishes in 3.3s
        const t = this.progress > 0 ? this.progress * 20 : 0;
        const startProgress = clamp((t * t) / 100, 0, 1);
        player.rotation.x = (startProgress * Math.PI) / 2;
        player.skin.head.rotation.x =
            startProgress > 0.5 ? Math.PI / 4 - player.rotation.x : 0;
        const basicArmRotationZ = Math.PI * 0.25 * startProgress;
        player.skin.leftArm.rotation.z = basicArmRotationZ;
        player.skin.rightArm.rotation.z = -basicArmRotationZ;
        const elytraRotationX = 0.34906584;
        const elytraRotationZ = Math.PI / 2;
        const interpolation = Math.pow(0.9, t);
        player.elytra.leftWing.rotation.x =
            elytraRotationX + interpolation * (0.2617994 - elytraRotationX);
        player.elytra.leftWing.rotation.z =
            elytraRotationZ + interpolation * (0.2617994 - elytraRotationZ);
        player.elytra.updateRightWing();
    }
}
//# sourceMappingURL=animation.js.map