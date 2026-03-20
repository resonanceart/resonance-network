interface Props {
  variant: string
  children: React.ReactNode
}

export function Badge({ variant, children }: Props) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}
