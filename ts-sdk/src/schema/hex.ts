import { Effect, ParseResult } from "effect"
import { pipe } from "effect/Function"
import * as S from "effect/Schema"
import { fromHex, toHex } from "viem"

/**
 * Describes `0x${string}` from non-empty string.
 *
 * Note: To be used ineroperably with `viem`.
 */
export const Hex = S.NonEmptyString.pipe(
  S.pattern(/^0x[0-9a-fA-F]+$/), // TODO: remove uppercase
  S.minLength(3),
) as unknown as S.TemplateLiteral<`0x${string}`>
export type Hex = typeof Hex.Type

// TODO: validate ERC55 checksum
// TODO: see `Hex` for type hacking to avoid `TemplateLiteral` incongruency
export const HexChecksum = S.NonEmptyString.pipe(
  S.pattern(/^0x[0-9a-fA-F]+$/),
  S.minLength(3),
) as unknown as S.TemplateLiteral<`0x${string}`>
export type HexChecksum = typeof HexChecksum.Type

export const HexFromString = S.transform(S.String, Hex, {
  strict: true,
  decode: s => toHex(s),
  encode: hex => fromHex(hex, "string"),
})
export type HexFromString = typeof HexFromString.Type

/**
 * TODO: handle signed hex?
 */
export const NumberFromHexString = S.transformOrFail(
  Hex,
  S.Positive,
  {
    decode: (fromA, _, ast) =>
      pipe(
        Effect.try({
          try: () => Number.parseInt(fromA, 16),
          catch: (e) => new Error(String(e)),
        }),
        Effect.mapError((e) => new ParseResult.Type(ast, fromA, e.message)),
      ),
    encode: (toI) => Effect.succeed(`0x${toI.toString(16)}` as const),
    strict: true,
  },
)
export type NumberFromHexString = typeof NumberFromHexString.Type
