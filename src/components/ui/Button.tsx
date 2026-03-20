interface Props {
  href: string
  variant?: 'primary' | 'outline'
  size?: 'large' | 'full'
  children: React.ReactNode
  target?: string
  rel?: string
}

export function Button({ href, variant = 'primary', size, children, target, rel }: Props) {
  const classes = ['btn', `btn--${variant}`, size ? `btn--${size}` : ''].filter(Boolean).join(' ')
  return (
    <a href={href} className={classes} target={target} rel={rel}>
      {children}
    </a>
  )
}
