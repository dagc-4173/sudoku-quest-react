import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  variant?: ButtonVariant
}

function Button({
  children,
  className = '',
  icon,
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) {
  const buttonClassName = ['app-button', `app-button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={buttonClassName} type={type} {...buttonProps}>
      {icon ? <span className="app-button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}

export default Button
