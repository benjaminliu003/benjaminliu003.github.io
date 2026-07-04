// Pure fab-data detection predicates, shared by the CI guard
// (verify-no-gerbers.mts) and its golden tests. Kept dependency-free and
// side-effect-free so they can be unit-tested against synthetic fixtures —
// never the real board. See AGENTS.md security invariants.

/** Filename patterns for raw fabrication formats (Gerber/Excellon/Altium). */
export const FAB_EXT: RegExp[] = [
  /\.gtl$/i, /\.gbl$/i, /\.gts$/i, /\.gbs$/i, /\.gto$/i, /\.gbo$/i, /\.gtp$/i, /\.gbp$/i,
  /\.g[0-9]$/i, /\.gp[0-9]$/i, /\.gm$/i, /\.gm[0-9]+$/i, /\.gp[0-9]+$/i, /\.gbr$/i,
  /\.drr$/i, /\.extrep$/i, /\.apr_lib$/i, /\.apr$/i, /\.ldp$/i, /\.rep$/i, /\.cvg$/i,
  /\.pcbdoc$/i, /\.schdoc$/i, /\.prjpcb$/i, /\.pcblib$/i, /\.schlib$/i, /\.cam$/i,
  /\.tx[0-9]+$/i, /-roundholes.*\.txt$/i, /-slotholes.*\.txt$/i, /pick.?place.*\.txt$/i,
]

// Content magic strings that betray fab data regardless of extension. Regexes,
// not bare substrings, so the Excellon header can be line-anchored — otherwise
// SVG path data like `M48,20` would false-positive the drill signature.
export const FAB_SIGNATURES: RegExp[] = [
  /%FSLAX/, // Gerber format spec
  /G04 #@!/, // Altium Gerber X2 attribute comment
  /^M48\r?$/m, // Excellon drill header (on its own line)
  /TF\.FilePolarity/, // Gerber X2 file attribute
]

/** True if a path's filename matches a known fabrication-format extension. */
export const isFabName = (path: string): boolean => FAB_EXT.some((re) => re.test(path))

/** True if a text blob contains a fabrication-format content signature. */
export const hasFabSignature = (text: string): boolean =>
  FAB_SIGNATURES.some((re) => re.test(text))
