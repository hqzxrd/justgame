let progress = document.querySelector(`.progress`);
checkLoad();
/**
 * Multiply your radians by this to convert them to degrees.
 */
export const RAD2DEG = 180 / Math.PI;
/**
 * Multiply your degrees by this to convert them to radians.
 */
export const DEG2RAD = 1 / RAD2DEG;
export class Vector2 {
  constructor(...args) {
    this.set(...args);
  }
  /**
   * @returns {number} alias for 'x'.
   */
  get 0() {
    return this.x;
  }
  set 0(value) {
    this.x = value;
  }
  /**
   * @returns {number} alias for 'y'.
   */
  get 1() {
    return this.y;
  }
  set 1(value) {
    this.y = value;
  }
  /**
   * @returns {number} alias for 'x'.
   */
  get u() {
    return this.x;
  }
  set u(value) {
    this.x = value;
  }
  /**
   * @returns {number} alias for 'y'.
   */
  get v() {
    return this.y;
  }
  set v(value) {
    this.y = value;
  }
  /**
   * @returns {number} the largest of 'x' and 'y'.
   */
  get max() {
    return Math.max(this.x, this.y);
  }
  /**
   * @returns {number} the smallest of 'x' and 'y'.
   */
  get min() {
    return Math.min(this.x, this.y);
  }
  /**
   * @returns {number} the length, squared.
   */
  get sqrMag() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
  }
  /**
   * The length.
   *
   * Note, when setting 'mag' to negative value, both 'x' and 'y' will be set to 0, and the magnitude will be 0.
   */
  get mag() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
  set mag(value) {
    value <= 0 ? this.set() : this.normalize().mult(value);
  }
  /**
   * The signed angle (from -PI to PI radians).
   */
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  set angle(value) {
    this.rotateTo(value);
  }
  set(arg1, arg2) {
    if (arg1 === undefined) {
      this.x = this.y = 0;
    } else if (typeof arg1 === "number") {
      if (arg2 === undefined) {
        this.x = this.y = arg1;
      } else {
        this.x = arg1;
        this.y = arg2;
      }
    } else {
      this.x = arg1.x;
      this.y = arg1.y;
    }
    return this;
  }
  add(...args) {
    switch (args.length) {
      case 1:
        if (typeof args[0] === "number") {
          this.x += args[0];
          this.y += args[0];
        } else {
          this.x += args[0].x;
          this.y += args[0].y;
        }
        break;
      default:
        this.x += args[0];
        this.y += args[1];
        break;
    }
    return this;
  }
  sub(...args) {
    switch (args.length) {
      case 1:
        if (typeof args[0] === "number") {
          this.x -= args[0];
          this.y -= args[0];
        } else {
          this.x -= args[0].x;
          this.y -= args[0].y;
        }
        break;
      default:
        this.x -= args[0];
        this.y -= args[1];
        break;
    }
    return this;
  }
  mult(...args) {
    switch (args.length) {
      case 1:
        if (typeof args[0] === "number") {
          this.x *= args[0];
          this.y *= args[0];
        } else {
          this.x *= args[0].x;
          this.y *= args[0].y;
        }
        break;
      default:
        this.x *= args[0];
        this.y *= args[1];
        break;
    }
    return this;
  }
  div(...args) {
    switch (args.length) {
      case 1:
        if (typeof args[0] === "number") {
          this.x /= args[0];
          this.y /= args[0];
        } else {
          this.x /= args[0].x;
          this.y /= args[0].y;
        }
        break;
      default:
        this.x /= args[0];
        this.y /= args[1];
        break;
    }
    return this;
  }
  setMag(arg) {
    this.mag = typeof arg === "number" ? arg : arg.mag;
    return this;
  }
  rotateTo(arg) {
    arg = typeof arg === "number" ? arg : arg.angle;
    return this.set(Math.cos(arg) * this.mag, Math.sin(arg) * this.mag);
  }
  rotateBy(arg) {
    arg = typeof arg === "number" ? arg : arg.angle;
    return this.set(
      this.x * Math.cos(arg) - this.y * Math.sin(arg),
      this.x * Math.sin(arg) + this.y * Math.cos(arg)
    );
  }
  /**
   * Mangles the length of this instance until it will be 1.
   *
   * Note, if the length of this instance is 0, than it will not be changed.
   */
  normalize() {
    return this.mag > 0 ? this.div(this.mag) : this;
  }
  /**
   * Inverts both 'x' and 'y' (makes them -'x' and -'y').
   */
  negate() {
    return this.set(-this.x, -this.y);
  }
  /**
   * Checks if 'x' and 'y' are strictly equal to 'x' and 'y', respectively.
   */
  isEquals(vec) {
    return this.x === vec.x && this.y === vec.y;
  }
  /**
   * @returns {Vector2} a copy of this instance.
   */
  copy() {
    return new Vector2(this.x, this.y);
  }
  clamp(...args) {
    /* istanbul ignore next */ // idk why it's not showing up as completed branch under test coverage.
    switch (args.length) {
      case 0:
        this.set(
          Math.min(Math.max(this.x, 0), 1),
          Math.min(Math.max(this.y, 0), 1)
        );
        break;
      case 1:
        args[0] >= 0
          ? this.set(
              Math.min(Math.max(this.x, 0), args[0]),
              Math.min(Math.max(this.y, 0), args[0])
            )
          : this.set(
              Math.max(Math.min(this.x, 0), args[0]),
              Math.max(Math.min(this.y, 0), args[0])
            );
        break;
      case 3:
      case 2:
        args[1] >= args[0]
          ? this.set(
              Math.min(Math.max(this.x, args[0]), args[1]),
              Math.min(Math.max(this.y, args[0]), args[1])
            )
          : this.set(
              Math.min(Math.max(this.x, args[1]), args[0]),
              Math.min(Math.max(this.y, args[1]), args[0])
            );
        break;
      default:
        this.set(
          args[1] >= args[0]
            ? Math.min(Math.max(this.x, args[0]), args[1])
            : Math.min(Math.max(this.x, args[1]), args[0]),
          args[3] >= args[2]
            ? Math.min(Math.max(this.y, args[2]), args[3])
            : Math.min(Math.max(this.y, args[3]), args[2])
        );
        break;
    }
    return this;
  }
  /**
   * Does the rounding to the nearest integer.
   */
  round() {
    return this.set(Math.round(this.x), Math.round(this.y));
  }
  /**
   * Does the rounding to the nearest larger integer.
   */
  ceil() {
    return this.set(Math.ceil(this.x), Math.ceil(this.y));
  }
  /**
   * Does the rounding to the nearest smaller integer.
   */
  floor() {
    return this.set(Math.floor(this.x), Math.floor(this.y));
  }
  mod(...args) {
    if (args.length === 1) {
      this.set(this.x % args[0], this.y % args[0]);
    } else {
      this.set(this.x % args[0], this.y % args[1]);
    }
    return this;
  }
  /**
   * Linearly interpolates between 'vec1' and 'vec2' by 't', setting this instance to result.
   */
  lerp(vec1, vec2, t) {
    return Vector2.lerp(this, vec1, vec2, t);
  }
  /**
   * Adds 'vecs' together.
   */
  static add(...vecs) {
    return vecs
      .slice(1)
      .reduce((accum, vector) => accum.add(vector), vecs[0].copy());
  }
  /**
   * Sequentially subtracts 'vecs', one by one.
   */
  static sub(...vecs) {
    return vecs
      .slice(1)
      .reduce((accum, vector) => accum.sub(vector), vecs[0].copy());
  }
  /**
   * Multiplies 'vecs' together.
   */
  static mult(...vecs) {
    return vecs
      .slice(1)
      .reduce((accum, vector) => accum.mult(vector), vecs[0].copy());
  }
  /**
   * Sequentially divides 'vecs', one by one.
   */
  static div(...vectors) {
    return vectors
      .slice(1)
      .reduce((accum, vector) => accum.div(vector), vectors[0].copy());
  }
  /**
   * @returns {number} the distance between 'vec1' and 'vec2'.
   */
  static dist(vec1, vec2) {
    return Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
  }
  /**
   * @returns {Vector2} a new instance with angle 'angleOfRadians' radians and length 'length'.
   */
  static fromAngle(angleOfRadians, length = 1) {
    return length <= 0
      ? new Vector2()
      : new Vector2(
          Math.cos(angleOfRadians) * length,
          Math.sin(angleOfRadians) * length
        );
  }
  /**
   * @returns {number} an unsigned angle (from 0 to PI radians) between 'vec1' and 'vec2'.
   */
  static angleBetween(vec1, vec2) {
    return Math.acos(
      (vec1.x * vec2.x + vec1.y * vec2.y) /
        (Math.sqrt(Math.pow(vec1.x, 2) + Math.pow(vec1.y, 2)) *
          Math.sqrt(Math.pow(vec2.x, 2) + Math.pow(vec2.y, 2)))
    );
  }
  /**
   * @returns {number} the smallest signed angle (from -PI to PI radians) between 'vec1' and 'vec2'.
   *
   * Note, that the resulting angle is the angle that, if applied as a rotation to 'vec1', will result in 'vec2'.
   */
  static angleBetweenSigned(vec1, vec2) {
    const tempMess = vec2.angle - vec1.angle;
    return Math.abs(tempMess) > Math.PI
      ? (Math.PI * 2 - Math.abs(tempMess)) * -Math.sign(tempMess)
      : tempMess;
  }
  /**
   * @returns {number} the dot product of 'vec1' and 'vec2'.
   */
  static dot(vec1, vec2) {
    return vec1.mag * vec2.mag * Math.cos(Vector2.angleBetween(vec1, vec2));
  }
  /**
   * Linearly interpolates between 'vec1' and 'vec2' by 't', setting 'vecOut' to result.
   *
   * @returns {Vector2} 'vecOut'.
   */
  static lerp(vecOut, vec1, vec2, t) {
    return vecOut.set(
      vec1.x + (vec2.x - vec1.x) * t,
      vec1.y + (vec2.y - vec1.y) * t
    );
  }
  /**
   * @returns {Vector2} a new instance with both 'x' and 'y' set to 0.
   */
  static zero() {
    return new Vector2();
  }
  /**
   * @returns {Vector2} a new instance with 'x' and 'y' individually set to some random value in such a way that the length of the new instance will be 'length'.
   */
  static randomWithLength(length = 1) {
    return Vector2.fromAngle(Math.random() * Math.PI * 2, length);
  }
  /**
   * @returns {Vector2} a new instance with 'x' and 'y' individually set to some random value from -1 to below 1, multiplied by 'multiplier'.
   */
  static random(multiplier = 1) {
    return new Vector2(
      (Math.random() * 2 - 1) * multiplier,
      (Math.random() * 2 - 1) * multiplier
    );
  }
}
progress.value = 20;

function checkLoad() {
  progress.classList.add(`show`);
}
