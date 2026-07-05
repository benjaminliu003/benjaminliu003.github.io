/* eslint-disable react-hooks/static-components --
   Compiled-MDX must be evaluated at render time in a server component, where
   useMemo is unavailable; per-render evaluation is fine under SSG. */
import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component />
}
