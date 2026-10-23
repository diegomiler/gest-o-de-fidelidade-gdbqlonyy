import { useEffect } from 'react'

interface PageMeta {
  title: string
  description: string
  image?: string
}

/** Define/restaura uma meta tag e devolve a função de restauração. */
function setMeta(attr: 'name' | 'property', key: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  const created = !el
  const previous = el?.getAttribute('content') ?? null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return () => {
    if (created) el?.remove()
    else if (previous !== null) el?.setAttribute('content', previous)
  }
}

/** SEO básico por página: title, meta description e Open Graph. */
export function usePageMeta({ title, description, image }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const restores = [
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:type', 'website'),
      setMeta('property', 'og:locale', 'pt_BR'),
    ]
    if (image) restores.push(setMeta('property', 'og:image', image))

    return () => {
      document.title = previousTitle
      restores.forEach((restore) => restore())
    }
  }, [title, description, image])
}
