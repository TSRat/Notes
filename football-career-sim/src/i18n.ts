import zhCN from './data/locales/zh-CN.json'

const dictionary = zhCN as Record<string, string>

export function t(key: string, variables: Record<string, string | number> = {}) {
  const template = dictionary[key] ?? key
  return Object.entries(variables).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  )
}
